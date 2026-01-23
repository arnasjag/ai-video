export interface PaymentModalOptions {
  amount: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function showPaymentModal(options: PaymentModalOptions): void {
  const { amount, onComplete, onCancel } = options;

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <button class="modal-cancel">Cancel</button>
        <span class="modal-title">Apple Pay</span>
        <span class="modal-spacer"></span>
      </div>
      
      <div class="modal-body">
        <div class="modal-amount">${amount}</div>
        <div class="modal-merchant">AI Video App</div>
        
        <div class="modal-card">
          <div class="modal-card-icon"></div>
          <div class="modal-card-details">
            <div class="modal-card-type">Apple Pay</div>
            <div class="modal-card-number">Visa ****4242</div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="modal-pay-button">
          <svg width="20" height="24" viewBox="0 0 20 24" fill="white">
            <path d="M17.05 12.54c-.05-4.22 3.46-6.25 3.62-6.35-1.97-2.88-5.04-3.27-6.13-3.32-2.61-.27-5.1 1.54-6.43 1.54-1.32 0-3.37-1.5-5.54-1.46-2.85.04-5.48 1.66-6.95 4.21-2.96 5.14-.76 12.76 2.13 16.93 1.41 2.04 3.1 4.33 5.31 4.25 2.13-.08 2.94-1.38 5.52-1.38 2.58 0 3.31 1.38 5.56 1.34 2.29-.04 3.76-2.08 5.15-4.13 1.62-2.37 2.29-4.66 2.33-4.78-.05-.02-4.47-1.72-4.52-6.8l-.05-.05z"/>
          </svg>
          Pay with Face ID
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeModal = () => {
    document.body.style.overflow = '';
    overlay.remove();
  };

  // Cancel button
  overlay.querySelector('.modal-cancel')?.addEventListener('click', () => {
    closeModal();
    onCancel();
  });

  // Pay button
  const payButton = overlay.querySelector('.modal-pay-button') as HTMLButtonElement;
  payButton?.addEventListener('click', () => {
    payButton.disabled = true;
    payButton.innerHTML = 'Processing...';

    // Simulate payment processing
    setTimeout(() => {
      closeModal();
      onComplete();
    }, 1500);
  });

  // Close on overlay tap
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
      onCancel();
    }
  });
}
