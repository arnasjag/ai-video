import type { OnboardingCallbacks } from '../../app/types';
import { showPaymentModal } from '../../components/PaymentModal';
import { store } from '../../app/Store';
import { haptic, hapticSuccess } from '../../utils/haptic';

export function render(imageData: string | null, isPaid: boolean): string {
  const applePaySupported = CSS.supports('-webkit-appearance', '-apple-pay-button');

  return `
    <div class="screen">
      ${!isPaid ? `<button class="back-btn floating" id="back-btn">←</button>` : ''}
      <div class="screen-content">
        ${isPaid ? `
          <div class="success-checkmark">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L19 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="title-large">Payment Successful!</h1>
          <p class="body-text">You now have 15 credits!</p>
          <div style="margin-top: 32px;">
            <img src="${imageData}" alt="Your photo" class="image-preview image-clear">
          </div>
        ` : `
          <h1 class="title-large">Unlock Your Creation</h1>
          <p class="body-text">Pay $9.99 to continue</p>
          <div style="margin-top: 32px;">
            <img src="${imageData}" alt="Preview" class="image-preview image-blurred">
          </div>
        `}
      </div>
      <div class="screen-footer">
        ${isPaid ? `
          <button class="button-primary" id="done-btn">Continue to Home</button>
        ` : `
          ${applePaySupported ? `
            <button class="apple-pay-button" id="pay-btn"></button>
          ` : `
            <button class="apple-pay-fallback" id="pay-btn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="24">
                <path d="M17.05 12.54c-.05-4.22 3.46-6.25 3.62-6.35-1.97-2.88-5.04-3.27-6.13-3.32-2.61-.27-5.1 1.54-6.43 1.54-1.32 0-3.37-1.5-5.54-1.46-2.85.04-5.48 1.66-6.95 4.21-2.96 5.14-.76 12.76 2.13 16.93 1.41 2.04 3.1 4.33 5.31 4.25 2.13-.08 2.94-1.38 5.52-1.38 2.58 0 3.31 1.38 5.56 1.34 2.29-.04 3.76-2.08 5.15-4.13 1.62-2.37 2.29-4.66 2.33-4.78-.05-.02-4.47-1.72-4.52-6.8z"/>
              </svg>
              Pay $9.99
            </button>
          `}
          <button class="button-secondary" id="back-btn-footer">Go Back</button>
        `}
      </div>
    </div>
  `;
}

export function init(callbacks: OnboardingCallbacks): void {
  const payBtn = document.getElementById('pay-btn');
  const doneBtn = document.getElementById('done-btn');
  const backBtn = document.getElementById('back-btn');
  const backBtnFooter = document.getElementById('back-btn-footer');

  // Back navigation with haptic
  const goBack = () => {
    haptic('light');
    callbacks.onNavigate('upload');
  };
  backBtn?.addEventListener('click', goBack);
  backBtnFooter?.addEventListener('click', goBack);

  payBtn?.addEventListener('click', () => {
    haptic('medium');
    showPaymentModal({
      amount: '$9.99',
      onComplete: () => {
        hapticSuccess();
        store.addCredits(15);
        callbacks.onNavigate('success');
      },
      onCancel: () => {
        haptic('light');
      }
    });
  });

  doneBtn?.addEventListener('click', () => {
    haptic('medium');
    callbacks.onComplete();
  });
}
