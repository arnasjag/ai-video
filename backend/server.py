"""
AI Video Backend Server
Generates AI videos from images using fal.ai API
"""

import os
import time
import uuid
import logging
import httpx
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# fal.ai API configuration
FAL_KEY = os.environ.get("FAL_KEY")
FAL_API_BASE = "https://fal.run"

# Kling workflow
KLING_WORKFLOW = "workflows/Hyperday/klinglowresdemo"

# Cleanup config
MAX_VIDEOS = 100
MAX_AGE_HOURS = 24

# Available models
MODELS = {
    "ltx-2": {
        "endpoint": "fal-ai/ltx-2/image-to-video",
        "default_duration": 6,
        "default_resolution": "1080p",
    },
    "veo3": {
        "endpoint": "fal-ai/veo3/image-to-video",
        "default_duration": "8s",
        "default_resolution": "720p",
    },
    "wan-25": {
        "endpoint": "fal-ai/wan-25-preview/image-to-video",
        "default_duration": "5",
        "default_resolution": "1080p",
    },
}

# Create app
app = FastAPI(title="AI Video API")

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


def cleanup_videos() -> None:
    """Delete old videos and enforce max count."""
    now = time.time()
    max_age_seconds = MAX_AGE_HOURS * 3600
    videos = sorted(VIDEOS_DIR.glob("*.mp4"), key=lambda p: p.stat().st_mtime)

    # Delete videos older than MAX_AGE_HOURS
    deleted_old = 0
    for video in list(videos):
        age = now - video.stat().st_mtime
        if age > max_age_seconds:
            video.unlink()
            videos.remove(video)
            deleted_old += 1

    if deleted_old:
        logger.info(f"Cleanup: deleted {deleted_old} videos older than {MAX_AGE_HOURS}h")

    # Enforce max count (delete oldest first)
    deleted_excess = 0
    while len(videos) > MAX_VIDEOS:
        oldest = videos.pop(0)
        oldest.unlink()
        deleted_excess += 1

    if deleted_excess:
        logger.info(f"Cleanup: deleted {deleted_excess} excess videos (max {MAX_VIDEOS})")

    if not deleted_old and not deleted_excess:
        logger.info(f"Cleanup: nothing to delete ({len(videos)} videos on disk)")


@app.on_event("startup")
async def startup_cleanup():
    """Run cleanup on server startup."""
    cleanup_videos()


class GenerateRequest(BaseModel):
    image: str
    prompt: str = "Animate this image with natural motion"
    filter_id: str = "default"
    model: str = "ltx-2"
    duration: Optional[int] = None
    resolution: Optional[str] = None


class KlingRequest(BaseModel):
    image: str
    workflow: str = KLING_WORKFLOW


class GenerateResponse(BaseModel):
    video_url: str
    video_id: str
    model: str


async def upload_image_to_fal(image_data: str) -> str:
    """Prepare image for fal.ai - accepts data URLs directly"""
    if image_data.startswith("http"):
        return image_data
    return image_data


async def call_fal_api(endpoint: str, payload: dict) -> dict:
    """Call fal.ai API endpoint"""
    if not FAL_KEY:
        raise HTTPException(status_code=500, detail="FAL_KEY not configured")
    
    url = f"{FAL_API_BASE}/{endpoint}"
    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json",
    }
    
    async with httpx.AsyncClient(timeout=300.0) as client:
        logger.info(f"Calling fal.ai: {endpoint}")
        response = await client.post(url, json=payload, headers=headers)
        
        if response.status_code != 200:
            error_detail = response.text
            logger.error(f"fal.ai error: {response.status_code} - {error_detail}")
            raise HTTPException(status_code=response.status_code, detail=error_detail)
        
        return response.json()


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "fal_configured": FAL_KEY is not None,
        "available_models": list(MODELS.keys()) + ["kling"],
    }


@app.get("/models")
async def list_models():
    """List available video generation models"""
    return {
        "models": [
            {"id": "kling", "name": "Kling (Low Res)", "price": "$0.26/video"},
            {"id": "ltx-2", "name": "LTX Video 2.0 Pro", "price": "$0.06-0.24/sec"},
            {"id": "veo3", "name": "Google Veo 3", "price": "$0.20-0.40/sec"},
            {"id": "wan-25", "name": "Wan 2.5", "price": "$0.05-0.15/sec"},
        ]
    }


@app.post("/generate-kling", response_model=GenerateResponse)
async def generate_kling_video(req: KlingRequest):
    """Generate video using Kling workflow via fal.ai"""
    try:
        logger.info(f"Generating Kling video with workflow: {req.workflow}")
        
        # Prepare image URL
        image_url = await upload_image_to_fal(req.image)
        
        # Call fal.ai Kling workflow
        payload = {
            "image_url": image_url
        }
        
        result = await call_fal_api(req.workflow, payload)
        logger.info(f"Kling result keys: {result.keys()}")
        
        # Extract video URL - handle different response formats
        video_url = None
        if "video" in result:
            video_data = result["video"]
            if isinstance(video_data, dict):
                video_url = video_data.get("url")
            elif isinstance(video_data, str):
                video_url = video_data
        elif "video_url" in result:
            video_url = result["video_url"]
        elif "output" in result:
            video_url = result["output"]
        
        if not video_url:
            logger.error(f"No video URL in Kling response: {result}")
            raise HTTPException(status_code=500, detail="No video URL in Kling response")
        
        # Download and save locally
        video_id = str(uuid.uuid4())
        video_path = VIDEOS_DIR / f"{video_id}.mp4"
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            logger.info(f"Downloading video from: {video_url}")
            video_response = await client.get(video_url)
            video_path.write_bytes(video_response.content)
        
        logger.info(f"Kling video saved: {video_path}")
        
        return GenerateResponse(
            video_url=f"/videos/{video_id}.mp4",
            video_id=video_id,
            model="kling",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Kling generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate", response_model=GenerateResponse)
async def generate_video(req: GenerateRequest):
    """Generate a video from an image using fal.ai models"""
    try:
        if req.model not in MODELS:
            raise HTTPException(status_code=400, detail=f"Unknown model: {req.model}")
        
        model_config = MODELS[req.model]
        logger.info(f"Generating video with {req.model} for filter: {req.filter_id}")
        
        # Prepare image URL
        image_url = await upload_image_to_fal(req.image)
        
        # Build payload based on model
        payload = {
            "image_url": image_url,
            "prompt": req.prompt,
        }
        
        if req.model == "ltx-2":
            payload["duration"] = req.duration or model_config["default_duration"]
            payload["resolution"] = req.resolution or model_config["default_resolution"]
            payload["generate_audio"] = False
        elif req.model == "veo3":
            payload["duration"] = f"{req.duration}s" if req.duration else model_config["default_duration"]
            payload["resolution"] = req.resolution or model_config["default_resolution"]
            payload["generate_audio"] = False
        elif req.model == "wan-25":
            payload["duration"] = str(req.duration) if req.duration else model_config["default_duration"]
            payload["resolution"] = req.resolution or model_config["default_resolution"]
        
        # Call fal.ai
        result = await call_fal_api(model_config["endpoint"], payload)
        
        # Extract video URL from response
        video_data = result.get("video", {})
        fal_video_url = video_data.get("url") if isinstance(video_data, dict) else None
        
        if not fal_video_url:
            raise HTTPException(status_code=500, detail="No video URL in response")
        
        # Download video and save locally
        video_id = str(uuid.uuid4())
        video_path = VIDEOS_DIR / f"{video_id}.mp4"
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            video_response = await client.get(fal_video_url)
            video_path.write_bytes(video_response.content)
        
        logger.info(f"Video saved to: {video_path}")
        
        return GenerateResponse(
            video_url=f"/videos/{video_id}.mp4",
            video_id=video_id,
            model=req.model,
        )

    except HTTPException:
        raise
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
