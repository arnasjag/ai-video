import type { OnboardingCallbacks } from '../../app/types';
import { readFileAsDataUrl } from '../../utils/imageUtils';
import { haptic, hapticSuccess } from '../../utils/haptic';

export function render(imageData: string | null): string {
  return `
    <div class="screen">
      <button class="back-btn floating" id="back-btn">←</button>
      <div class="screen-content">
        <h1 class="title-large">Upload Your Photo</h1>
        <p class="body-text">Choose a photo to transform into an AI video</p>
        
        <div style="margin-top: 32px;">
          <input type="file" accept="image/*" id="image-input" hidden>
          <div class="upload-area ${imageData ? 'has-image' : ''}" id="upload-area">
            ${imageData ? `
              <img src="${imageData}" alt="Selected" class="image-preview">
            ` : `
              <span class="upload-icon">📷</span>
              <span class="upload-text">Tap to select photo</span>
            `}
          </div>
        </div>
      </div>
      <div class="screen-footer">
        <button class="button-primary" id="continue-btn" ${imageData ? '' : 'disabled'}>Continue</button>
        <button class="button-secondary" id="back-btn-footer">Go Back</button>
      </div>
    </div>
  `;
}

export function init(callbacks: OnboardingCallbacks): void {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('image-input') as HTMLInputElement;
  const continueBtn = document.getElementById('continue-btn') as HTMLButtonElement;
  const backBtn = document.getElementById('back-btn');
  const backBtnFooter = document.getElementById('back-btn-footer');

  // Back navigation with haptic
  const goBack = () => {
    haptic('light');
    callbacks.onNavigate('intro');
  };
  backBtn?.addEventListener('click', goBack);
  backBtnFooter?.addEventListener('click', goBack);

  uploadArea?.addEventListener('click', () => {
    haptic('light');
    fileInput?.click();
  });

  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        hapticSuccess();
        callbacks.onSetImage(dataUrl);
      } catch (err) {
        console.error('Failed to read image:', err);
      }
    }
  });

  continueBtn?.addEventListener('click', () => {
    if (callbacks.getImage()) {
      haptic('medium');
      callbacks.onNavigate('payment');
    }
  });
}
