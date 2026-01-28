import type { OnboardingCallbacks } from '../../app/types';
import { haptic } from '../../utils/haptic';

export function render(imageData: string | null): string {
  return `
    <div class="screen">
      <button class="back-btn floating" id="back-btn">←</button>
      <div class="screen-content">
        <h1 class="title-large">Your Video is Ready!</h1>
        <p class="body-text">Unlock to download your AI creation</p>
        
        <div class="preview-container">
          ${imageData ? `
            <img src="${imageData}" alt="Preview" class="image-preview image-blurred">
            <div class="preview-lock-overlay">
              <span class="lock-icon">🔒</span>
            </div>
          ` : ''}
        </div>
        
        <div class="preview-features">
          <div class="feature-item">✓ Full HD Video</div>
          <div class="feature-item">✓ No Watermark</div>
          <div class="feature-item">✓ Instant Download</div>
        </div>
      </div>
      <div class="screen-footer">
        <button class="button-primary" id="unlock-btn">Unlock for $0.99</button>
        <button class="button-secondary" id="back-btn-footer">Try Different Photo</button>
      </div>
    </div>
  `;
}

export function init(callbacks: OnboardingCallbacks): void {
  const unlockBtn = document.getElementById('unlock-btn');
  const backBtn = document.getElementById('back-btn');
  const backBtnFooter = document.getElementById('back-btn-footer');

  const goBack = () => {
    haptic('light');
    callbacks.onNavigate('upload');
  };

  backBtn?.addEventListener('click', goBack);
  backBtnFooter?.addEventListener('click', goBack);

  unlockBtn?.addEventListener('click', () => {
    haptic('medium');
    callbacks.onNavigate('payment');
  });
}
