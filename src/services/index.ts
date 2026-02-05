import { FalVideoService } from './FalVideoService';
import { MockPaymentService } from './MockPaymentService';

export const videoService = new FalVideoService();
export const paymentService = new MockPaymentService();

export type { VideoService } from './VideoService';
export type { PaymentService } from './PaymentService';
