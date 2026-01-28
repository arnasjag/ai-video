/**
 * Video Generation API Client
 * Communicates with the LTX-Video backend
 */

const API_URL = 'http://100.71.249.98:8001';

export interface GenerateVideoResponse {
  video_url: string;
  video_id: string;
}

/**
 * Generate a video from an image using LTX-Video
 * @param imageData - Base64 data URL of the image
 * @param filterId - ID of the filter being used
 * @returns Full URL to the generated video
 */
export async function generateVideo(
  imageData: string,
  filterId: string
): Promise<string> {
  const response = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageData,
      filter_id: filterId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  const data: GenerateVideoResponse = await response.json();
  return `${API_URL}${data.video_url}`;
}

/**
 * Check if the video generation backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
