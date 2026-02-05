import type { OnboardingCallbacks } from '../../app/types';
import { videoService } from '../../services';
import { hapticSuccess } from '../../utils/haptic';

const TIMEOUT_MS = 120000; // 2 minutes

const STATUS_MESSAGES = [
  'Connecting to AI...',
  'Uploading your image...',
  'Generating video frames...',
  'Processing motion effects...',
  'Rendering final video...',
  'Almost there...',
];

export function render(): string {
  return `
    <div class="screen">
      <div class="screen-content centered">
        <div class="generating-animation">
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay-1"></div>
          <div class="pulse-ring delay-2"></div>
          <span class="generating-icon">🎬</span>
        </div>
        <h1 class="title-large">Creating Your Video</h1>
        <p class="body-text" id="status-text">Preparing...</p>
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill"></div>
        </div>
        <div id="error-container" class="error-container" style="display: none;">
          <p class="error-text" id="error-text"></p>
          <button class="button-primary" id="retry-btn">Try Again</button>
        </div>
      </div>
    </div>
  `;
}

export async function init(callbacks: OnboardingCallbacks): Promise<void> {
  const statusText = document.getElementById('status-text');
  const progressFill = document.getElementById('progress-fill');
  const errorContainer = document.getElementById('error-container');
  const errorText = document.getElementById('error-text');
  const retryBtn = document.getElementById('retry-btn');
  
  const imageData = callbacks.getImage();
  if (!imageData) {
    callbacks.onNavigate('upload');
    return;
  }

  let progressInterval: number | undefined;
  let statusInterval: number | undefined;
  let abortController: AbortController | undefined;

  const startGeneration = async () => {
    // Reset UI
    if (errorContainer) errorContainer.style.display = 'none';
    if (progressFill) progressFill.style.width = '0%';
    if (statusText) statusText.textContent = 'Preparing...';
    
    // Create new abort controller
    abortController = new AbortController();
    
    // Animate progress bar slowly (real processing takes 30-60s)
    let progress = 0;
    progressInterval = window.setInterval(() => {
      progress += Math.random() * 3;
      if (progress > 85) progress = 85; // Cap at 85% until done
      if (progressFill) progressFill.style.width = `${progress}%`;
    }, 1000);

    // Cycle through status messages
    let msgIndex = 0;
    statusInterval = window.setInterval(() => {
      if (statusText && msgIndex < STATUS_MESSAGES.length) {
        statusText.textContent = STATUS_MESSAGES[msgIndex];
        msgIndex++;
      }
    }, 5000);

    // Timeout
    const timeoutId = setTimeout(() => abortController?.abort(), TIMEOUT_MS);

    try {
      const result = await videoService.generate(imageData, { 
        signal: abortController.signal 
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      
      if (progressFill) progressFill.style.width = '100%';
      if (statusText) statusText.textContent = 'Done!';
      
      hapticSuccess();
      
      if (callbacks.onSetVideo) {
        callbacks.onSetVideo(result.videoUrl, result.videoId);
      }
      
      // Short delay before navigating
      setTimeout(() => {
        callbacks.onNavigate('result');
      }, 500);
      
    } catch (error) {
      clearTimeout(timeoutId);
      if (progressInterval) clearInterval(progressInterval);
      if (statusInterval) clearInterval(statusInterval);
      
      const message = error instanceof Error ? error.message : 'Generation failed';
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      
      if (errorText) {
        errorText.textContent = isTimeout 
          ? 'Request timed out. Please try again.' 
          : `Error: ${message}`;
      }
      if (errorContainer) errorContainer.style.display = 'block';
      if (statusText) statusText.textContent = 'Generation failed';
      if (progressFill) progressFill.style.width = '0%';
    }
  };

  // Start generation
  await startGeneration();

  // Retry handler
  retryBtn?.addEventListener('click', async () => {
    await startGeneration();
  });
}
