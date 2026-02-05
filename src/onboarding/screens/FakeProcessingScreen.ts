import type { OnboardingCallbacks } from '../../app/types';
import { hapticSuccess } from '../../utils/haptic';

const FAKE_DURATION = 4000; // 4 seconds

const STATUS_MESSAGES = [
  'Analyzing composition...',
  'Detecting motion paths...',
  'Preparing your style...',
  'Almost ready...',
];

export function render(): string {
  return `
    <div class="screen">
      <div class="screen-content centered">
        <div class="generating-animation">
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay-1"></div>
          <div class="pulse-ring delay-2"></div>
          <span class="generating-icon">🔍</span>
        </div>
        <h1 class="title-large">Analyzing Photo</h1>
        <p class="body-text" id="status-text">Preparing...</p>
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill"></div>
        </div>
      </div>
    </div>
  `;
}

export function init(callbacks: OnboardingCallbacks): void {
  const statusText = document.getElementById('status-text');
  const progressFill = document.getElementById('progress-fill');
  
  const imageData = callbacks.getImage();
  if (!imageData) {
    callbacks.onNavigate('upload');
    return;
  }

  // Animate progress smoothly to 100%
  let progress = 0;
  const startTime = Date.now();
  
  const animateProgress = () => {
    const elapsed = Date.now() - startTime;
    progress = Math.min(100, (elapsed / FAKE_DURATION) * 100);
    
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
    
    if (progress < 100) {
      requestAnimationFrame(animateProgress);
    }
  };
  
  requestAnimationFrame(animateProgress);

  // Cycle through status messages
  let msgIndex = 0;
  const messageInterval = FAKE_DURATION / STATUS_MESSAGES.length;
  
  const statusInterval = setInterval(() => {
    if (statusText && msgIndex < STATUS_MESSAGES.length) {
      statusText.textContent = STATUS_MESSAGES[msgIndex];
      msgIndex++;
    }
  }, messageInterval);

  // Navigate to preview after fake duration
  setTimeout(() => {
    clearInterval(statusInterval);
    hapticSuccess();
    callbacks.onNavigate('preview');
  }, FAKE_DURATION);
}
