export interface VideoService {
  generate(
    imageData: string,
    options?: { signal?: AbortSignal }
  ): Promise<{ videoUrl: string; videoId: string }>;
  checkHealth(): Promise<boolean>;
}
