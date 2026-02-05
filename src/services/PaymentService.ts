export interface PaymentService {
  processPayment(amount: string): Promise<{ success: boolean }>;
  getCredits(): number;
}
