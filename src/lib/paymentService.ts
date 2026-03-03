import { apiPost } from '@/lib/api';
import { toast } from 'sonner';

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOrderData {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export async function createRazorpayOrder(
  orderId: string,
  token: string | null
): Promise<RazorpayOrderData> {
  const res = await apiPost<{ success: boolean; data: RazorpayOrderData }>(
    '/payments/razorpay-order',
    { orderId },
    token
  );
  if (!res.success || !res.data) throw new Error('Failed to create payment order');
  return res.data;
}

export async function verifyPayment(
  paymentId: string,
  orderId: string,
  signature: string,
  token: string | null
): Promise<{ orderId?: string }> {
  const res = await apiPost<{ success: boolean; data?: { orderId?: string } }>(
    '/payments/verify',
    {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
    },
    token
  );
  if (!res.success) throw new Error('Payment verification failed');
  return res.data ?? {};
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (r: unknown) => void) => void;
    };
  }
}

export function openRazorpay(
  options: {
    orderId: string;
    amount: number;
    key: string;
    name: string;
    prefillName: string;
    prefillEmail: string;
    prefillContact: string;
  },
  onSuccess: (response: RazorpayResponse) => void,
  onFailure: (error: unknown) => void
): void {
  if (typeof window === 'undefined' || !window.Razorpay) {
    toast.error('Razorpay SDK failed to load');
    onFailure(new Error('Razorpay not loaded'));
    return;
  }
  const razorpay = new window.Razorpay({
    key: options.key,
    amount: options.amount,
    currency: 'INR',
    name: options.name,
    description: 'Order Payment',
    order_id: options.orderId,
    handler: (response: RazorpayResponse) => onSuccess(response),
    prefill: {
      name: options.prefillName,
      email: options.prefillEmail,
      contact: options.prefillContact,
    },
    theme: { color: '#0f172a' },
    modal: {
      ondismiss: () => {
        toast.error('Payment cancelled');
        onFailure(new Error('Cancelled'));
      },
    },
  });
  razorpay.on('payment.failed', (response: unknown) => {
    const err = response as { error?: { description?: string } };
    toast.error(err?.error?.description || 'Payment failed');
    onFailure(response);
  });
  razorpay.open();
}
