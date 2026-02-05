import type { PaymentService } from './PaymentService';

const PAYMENT_DELAY_MS = 1500;

export class MockPaymentService implements PaymentService {
  async processPayment(_amount: string): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, PAYMENT_DELAY_MS));
    return { success: true };
  }

  getCredits(): number {
    return 0;
  }
}
