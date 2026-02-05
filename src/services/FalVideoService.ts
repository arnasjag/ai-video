import type { VideoService } from './VideoService';
import { checkBackendHealth, generateVideoKling } from '../utils/videoApi';

export class FalVideoService implements VideoService {
  async generate(
    imageData: string,
    options: { signal?: AbortSignal } = {}
  ): Promise<{ videoUrl: string; videoId: string }> {
    const { videoUrl, videoId } = await generateVideoKling(imageData, options);
    return { videoUrl, videoId };
  }

  async checkHealth(): Promise<boolean> {
    const health = await checkBackendHealth();
    return health !== null;
  }
}
