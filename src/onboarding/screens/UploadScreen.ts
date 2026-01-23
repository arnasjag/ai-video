import type { OnboardingCallbacks } from '../../app/types';
import { readFileAsDataUrl } from '../../utils/imageUtils';

export function render(imageData: string | null): string {
  return `
    <div class="screen">
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
      </div>
    </div>
  `;
}

export function init(callbacks: OnboardingCallbacks): void {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('image-input') as HTMLInputElement;
  const continueBtn = document.getElementById('continue-btn') as HTMLButtonElement;

  uploadArea?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        callbacks.onSetImage(dataUrl);
      } catch (err) {
        console.error('Failed to read image:', err);
      }
    }
  });

  continueBtn?.addEventListener('click', () => {
    if (callbacks.getImage()) {
      callbacks.onNavigate('payment');
    }
  });
}
