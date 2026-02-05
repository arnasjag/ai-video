import type { OnboardingCallbacks } from '../../app/types';
import { videoService } from '../../services';
import { VideoApiError } from '../../utils/videoApi';
import { hapticSuccess } from '../../utils/haptic';

const TIMEOUT_MS = 120000; // 2 minutes
const MAX_RETRIES = 2;

const STATUS_MESSAGES = [
  'Sending to AI...',
  'Generating video...',
  'Downloading result...',
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
        <p class="body-text" style="opacity:0.6;font-size:14px;margin-top:8px">This usually takes about 1 minute</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width:100%;animation:indeterminate 1.5s ease-in-out infinite"></div>
        </div>
        <style>
          @keyframes indeterminate { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
        </style>
        <button class="button-secondary" id="cancel-btn" style="margin-top:24px">Cancel</button>
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
  const errorContainer = document.getElementById('error-container');
  const errorText = document.getElementById('error-text');
  const retryBtn = document.getElementById('retry-btn') as HTMLButtonElement | null;
  const cancelBtn = document.getElementById('cancel-btn');
  
  const imageData = callbacks.getImage();
  if (!imageData) {
    callbacks.onNavigate('upload');
    return;
  }

  let statusInterval: number | undefined;
  let abortController: AbortController | undefined;
  let retryCount = 0;

  const showError = (message: string) => {
    if (errorText) errorText.textContent = message;
    if (errorContainer) errorContainer.style.display = 'block';
    if (statusText) statusText.textContent = 'Generation failed';

    if (retryBtn) {
      if (retryCount >= MAX_RETRIES) {
        retryBtn.textContent = 'Go Back';
      } else {
        retryBtn.textContent = 'Try Again';
      }
    }
  };

  const startGeneration = async () => {
    // Network check
    if (!navigator.onLine) {
      showError('No internet connection');
      return;
    }

    // Reset UI
    if (errorContainer) errorContainer.style.display = 'none';
    if (statusText) statusText.textContent = 'Preparing...';
    
    // Create new abort controller
    abortController = new AbortController();
    
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
      clearInterval(statusInterval);
      
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
      if (statusInterval) clearInterval(statusInterval);
      
      retryCount++;

      if (error instanceof VideoApiError) {
        showError(error.message);
      } else {
        const message = error instanceof Error ? error.message : 'Generation failed';
        showError(message);
      }
    }
  };

  // Start generation
  await startGeneration();

  // Retry handler
  retryBtn?.addEventListener('click', async () => {
    if (retryCount >= MAX_RETRIES) {
      callbacks.onNavigate('upload');
    } else {
      await startGeneration();
    }
  });

  cancelBtn?.addEventListener('click', () => {
    abortController?.abort();
    callbacks.onNavigate('upload');
  });
}
