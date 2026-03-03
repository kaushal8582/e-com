'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost } from '@/lib/api';
import {
  createRazorpayOrder,
  verifyPayment,
  openRazorpay,
  type RazorpayResponse,
} from '@/lib/paymentService';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(20),
  addressLine1: z.string().min(1, 'Address line 1 is required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  pincode: z.string().min(1, 'Pincode is required').max(20),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { cart, guestItems, syncGuestCart } = useCart();
  const [paymentStep, setPaymentStep] = useState<'idle' | 'order' | 'razorpay' | 'verify'>('idle');

  const count = token
    ? (cart?.items?.reduce((s, i) => s + i.qty, 0) ?? 0)
    : guestItems.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    if (!token && guestItems.length > 0) {
      router.replace('/login?redirect=/checkout');
      return;
    }
    if (token && guestItems.length > 0) {
      syncGuestCart();
    }
  }, [token, guestItems.length, syncGuestCart, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Please log in to checkout');
      router.push('/login?redirect=/checkout');
      return;
    }
    try {
      setPaymentStep('order');
      const orderRes = await apiPost<{
        success: boolean;
        data: { order: { _id: string; totalAmount: number }; message?: string };
      }>(
        '/orders',
        {
          address: {
            name: data.name,
            phone: data.phone,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 || undefined,
            city: data.city,
            pincode: data.pincode,
          },
        },
        token
      );
      if (!orderRes.success || !orderRes.data?.order?._id) {
        toast.error('Failed to place order');
        setPaymentStep('idle');
        return;
      }
      const orderId = orderRes.data.order._id;

      setPaymentStep('razorpay');
      const razorpayData = await createRazorpayOrder(orderId, token);
      if (!razorpayData.key) {
        toast.error('Razorpay is not configured. Please try again later.');
        setPaymentStep('idle');
        return;
      }

      openRazorpay(
        {
          orderId: razorpayData.razorpayOrderId,
          amount: razorpayData.amount,
          key: razorpayData.key,
          name: 'Modern Riwaaz',
          prefillName: data.name,
          prefillEmail: (user as { email?: string })?.email ?? '',
          prefillContact: data.phone,
        },
        async (response: RazorpayResponse) => {
          setPaymentStep('verify');
          try {
            await verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              token
            );
            toast.success('Payment successful');
            router.push(`/order-success?orderId=${orderId}`);
          } catch {
            toast.error('Payment verification failed');
            setPaymentStep('idle');
          }
        },
        () => {
          setPaymentStep('idle');
        }
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to place order');
      setPaymentStep('idle');
    }
  };

  const isBusy = isSubmitting || paymentStep !== 'idle';
  const buttonLabel =
    paymentStep === 'order'
      ? 'Placing order...'
      : paymentStep === 'razorpay'
        ? 'Opening payment...'
        : paymentStep === 'verify'
          ? 'Verifying...'
          : 'Place order & pay';

  if (count === 0 && token) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-600">Your cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block text-slate-900 underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-2 sm:px-0">
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Checkout</h1>
      <p className="mt-1 text-slate-600">Enter your delivery address and pay with Razorpay.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            {...register('name')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <input
            {...register('phone')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Address line 1</label>
          <input
            {...register('addressLine1')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
          />
          {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Address line 2 (optional)</label>
          <input
            {...register('addressLine2')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">City</label>
            <input
              {...register('city')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Pincode</label>
            <input
              {...register('pincode')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
            />
            {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>}
          </div>
        </div>
        <button
          type="submit"
          disabled={isBusy}
          className="w-full rounded-lg bg-slate-900 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}
