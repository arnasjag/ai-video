/**
 * Video Generation API Client
 * Communicates with the fal.ai-powered backend
 */

const API_URL = 'http://100.71.249.98:8001';

// Available video generation models
export type VideoModel = 'ltx-2' | 'veo3' | 'wan-25';

export interface VideoModelInfo {
  id: VideoModel;
  name: string;
  price: string;
}

export interface GenerateVideoRequest {
  image: string;  // base64 data URL or URL
  prompt?: string;
  filter_id?: string;
  model?: VideoModel;
  duration?: number;
  resolution?: string;
}

export interface GenerateVideoResponse {
  video_url: string;
  video_id: string;
  model: string;
}

export interface HealthResponse {
  status: string;
  fal_configured: boolean;
  available_models: string[];
}

export interface ModelsResponse {
  models: VideoModelInfo[];
}

/**
 * Generate a video from an image using fal.ai
 */
export async function generateVideo(
  imageData: string,
  options: {
    filterId?: string;
    prompt?: string;
    model?: VideoModel;
    duration?: number;
    resolution?: string;
  } = {}
): Promise<{ videoUrl: string; videoId: string; model: string }> {
  const {
    filterId = 'default',
    prompt = 'Animate this image with natural, cinematic motion',
    model = 'ltx-2',
    duration,
    resolution,
  } = options;

  const body: GenerateVideoRequest = {
    image: imageData,
    prompt,
    filter_id: filterId,
    model,
  };

  if (duration) body.duration = duration;
  if (resolution) body.resolution = resolution;

  const response = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  const data: GenerateVideoResponse = await response.json();
  return {
    videoUrl: `${API_URL}${data.video_url}`,
    videoId: data.video_id,
    model: data.model,
  };
}

/**
 * Check if the video generation backend is available
 */
export async function checkBackendHealth(): Promise<HealthResponse | null> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

/**
 * Get list of available video generation models
 */
export async function getAvailableModels(): Promise<VideoModelInfo[]> {
  try {
    const response = await fetch(`${API_URL}/models`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];
    const data: ModelsResponse = await response.json();
    return data.models;
  } catch {
    return [];
  }
}

/**
 * Delete a generated video
 */
export async function deleteVideo(videoId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/videos/${videoId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Export API URL for direct video access
export { API_URL };
