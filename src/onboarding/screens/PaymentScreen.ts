import type { OnboardingCallbacks } from '../../app/types';
import { showPaymentModal } from '../../components/PaymentModal';
import { haptic, hapticSuccess } from '../../utils/haptic';

export function render(): string {
  const applePaySupported = CSS.supports('-webkit-appearance', '-apple-pay-button');

  return `
    <div class="screen">
      <button class="back-btn floating" id="back-btn">←</button>
      <div class="screen-content centered">
        <h1 class="title-large">Complete Purchase</h1>
        <p class="body-text">One-time payment of $0.99</p>
        
        <div class="payment-summary">
          <div class="payment-item">
            <span>AI Video Generation</span>
            <span>$0.99</span>
          </div>
        </div>
        
        <div class="payment-secure">
          <span>🔒</span> Secure payment
        </div>
      </div>
      <div class="screen-footer">
        ${applePaySupported ? `
          <button class="apple-pay-button" id="pay-btn"></button>
        ` : `
          <button class="apple-pay-fallback" id="pay-btn">
            Pay $0.99
          </button>
        `}
        <button class="button-secondary" id="back-btn-footer">Cancel</button>
      </div>
    </div>
  `;
}

export function init(callbacks: OnboardingCallbacks): void {
  const payBtn = document.getElementById('pay-btn');
  const backBtn = document.getElementById('back-btn');
  const backBtnFooter = document.getElementById('back-btn-footer');

  const goBack = () => {
    haptic('light');
    callbacks.onNavigate('preview');
  };

  backBtn?.addEventListener('click', goBack);
  backBtnFooter?.addEventListener('click', goBack);

  payBtn?.addEventListener('click', () => {
    haptic('medium');
    showPaymentModal({
      amount: '$0.99',
      onComplete: () => {
        hapticSuccess();
        // Navigate directly to real processing
        callbacks.onNavigate('processing');
      },
      onCancel: () => {
        haptic('light');
      }
    });
  });
}
