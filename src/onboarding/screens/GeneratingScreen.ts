import type { OnboardingCallbacks } from '../../app/types';
import { generateVideo } from '../../utils/videoApi';
import { getFilterById } from '../../data/mockFilters';
import { hapticSuccess } from '../../utils/haptic';

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
        <p class="body-text" id="status-text">Processing with AI...</p>
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill"></div>
        </div>
      </div>
    </div>
  `;
}

export async function init(callbacks: OnboardingCallbacks): Promise<void> {
  const statusText = document.getElementById('status-text');
  const progressFill = document.getElementById('progress-fill');
  
  const filterId = sessionStorage.getItem('currentFilterId') || 'default';
  const filter = getFilterById(filterId);
  const imageData = callbacks.getImage();
  
  if (!imageData) {
    callbacks.onNavigate('upload');
    return;
  }

  // Animate progress bar
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 90) progress = 90;
    if (progressFill) progressFill.style.width = `${progress}%`;
  }, 500);

  const statusMessages = [
    'Analyzing your image...',
    'Applying AI magic...',
    'Generating motion...',
    'Rendering video...',
    'Almost there...',
  ];

  let msgIndex = 0;
  const statusInterval = setInterval(() => {
    if (statusText && msgIndex < statusMessages.length) {
      statusText.textContent = statusMessages[msgIndex];
      msgIndex++;
    }
  }, 2000);

  try {
    const result = await generateVideo(imageData, {
      filterId,
      prompt: filter?.videoPrompt || 'Animate this image with natural, cinematic motion',
      model: filter?.videoModel || 'ltx-2',
      duration: filter?.videoDuration,
      resolution: filter?.videoResolution,
    });

    clearInterval(progressInterval);
    clearInterval(statusInterval);
    
    if (progressFill) progressFill.style.width = '100%';
    if (statusText) statusText.textContent = 'Done!';
    
    hapticSuccess();
    
    // Store video result
    if (callbacks.onSetVideo) {
      callbacks.onSetVideo(result.videoUrl, result.videoId);
    }
    
    // Navigate to result after brief delay
    setTimeout(() => {
      callbacks.onNavigate('result');
    }, 500);
    
  } catch (error) {
    clearInterval(progressInterval);
    clearInterval(statusInterval);
    
    console.error('Video generation failed:', error);
    if (statusText) {
      statusText.textContent = `Error: ${error instanceof Error ? error.message : 'Generation failed'}`;
    }
  }
}
