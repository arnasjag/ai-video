"""
LTX-Video Backend Server
Generates AI videos from images using LTX-Video model on Apple Silicon (MPS)
"""

import os
import io
import uuid
import base64
import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import torch
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create app
app = FastAPI(title="LTX-Video API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated videos
VIDEOS_DIR = Path(__file__).parent / "generated_videos"
VIDEOS_DIR.mkdir(exist_ok=True)
app.mount("/videos", StaticFiles(directory=str(VIDEOS_DIR)), name="videos")

# Global pipeline (loaded on first request)
pipe = None

def get_pipeline():
    """Lazy load the LTX-Video pipeline"""
    global pipe
    if pipe is None:
        logger.info("Loading LTX-Video pipeline...")
        from diffusers import LTXImageToVideoPipeline
        from diffusers.utils import export_to_video

        # Check for MPS (Apple Silicon) or fall back to CPU
        if torch.backends.mps.is_available():
            device = "mps"
            dtype = torch.float16
            logger.info("Using MPS (Apple Silicon GPU)")
        else:
            device = "cpu"
            dtype = torch.float32
            logger.info("Using CPU (no GPU available)")

        pipe = LTXImageToVideoPipeline.from_pretrained(
            "Lightricks/LTX-Video",
            torch_dtype=dtype,
        )
        pipe = pipe.to(device)
        pipe.enable_attention_slicing()  # Reduce memory usage
        logger.info("Pipeline loaded successfully")

    return pipe


class GenerateRequest(BaseModel):
    image: str  # base64 data URL
    filter_id: str


class GenerateResponse(BaseModel):
    video_url: str
    video_id: str


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "mps_available": torch.backends.mps.is_available()}


@app.post("/generate", response_model=GenerateResponse)
async def generate_video(req: GenerateRequest):
    """Generate a video from an image using LTX-Video"""
    try:
        logger.info(f"Generating video for filter: {req.filter_id}")

        # Decode base64 image
        if "," in req.image:
            # Data URL format: data:image/jpeg;base64,/9j/4AAQ...
            image_data = base64.b64decode(req.image.split(",")[1])
        else:
            # Raw base64
            image_data = base64.b64decode(req.image)

        # Open image
        image = Image.open(io.BytesIO(image_data)).convert("RGB")

        # Resize to optimal dimensions for LTX-Video (must be divisible by 32)
        # LTX-Video works best with 704x480 or similar
        width, height = 704, 480
        image = image.resize((width, height), Image.Resampling.LANCZOS)

        logger.info(f"Image size: {image.size}")

        # Get pipeline
        pipeline = get_pipeline()

        # Generate video
        # LTX-Video parameters
        logger.info("Starting video generation...")
        output = pipeline(
            image=image,
            prompt="",  # No text prompt for image-to-video
            negative_prompt="blurry, distorted, low quality",
            num_frames=25,  # ~1 second at 24fps
            height=height,
            width=width,
            num_inference_steps=30,
            guidance_scale=3.0,
            generator=torch.Generator(device="cpu").manual_seed(42),
        )

        frames = output.frames[0]
        logger.info(f"Generated {len(frames)} frames")

        # Save video
        from diffusers.utils import export_to_video

        video_id = str(uuid.uuid4())
        video_path = VIDEOS_DIR / f"{video_id}.mp4"
        export_to_video(frames, str(video_path), fps=24)

        logger.info(f"Video saved to: {video_path}")

        return GenerateResponse(
            video_url=f"/videos/{video_id}.mp4",
            video_id=video_id
        )

    except Exception as e:
        logger.error(f"Error generating video: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/videos/{video_id}")
async def delete_video(video_id: str):
    """Delete a generated video"""
    video_path = VIDEOS_DIR / f"{video_id}.mp4"
    if video_path.exists():
        video_path.unlink()
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Video not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
