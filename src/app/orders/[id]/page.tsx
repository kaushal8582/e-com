'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Order } from '@/types';
import { toast } from 'sonner';

const PLACEHOLDER_IMAGE = 'https://placehold.co/120x120?text=Product';

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(
      () => {
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      },
      () => toast.error('Failed to copy')
    );
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className="ml-2 rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const res = await apiGet<{ success: boolean; data: Order }>(`/orders/${params.id}`, token);
      setOrder(res.data);
    } catch {
      setOrder(null);
      setError('Failed to load order.');
      toast.error('Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [token, params.id]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace('/login?redirect=/orders');
      return;
    }
    fetchOrder();
  }, [token, authLoading, fetchOrder, router]);

  if (authLoading || (token && loading)) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        {error || 'Order not found.'}
        <Link href="/orders" className="mt-2 block text-slate-900 underline">Back to orders</Link>
      </div>
    );
  }

  const { address, items, totalAmount, status, createdAt } = order;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Order #{order._id.slice(-8)}</h1>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {status}
        </span>
      </div>
      <p className="text-slate-500">Placed on {new Date(createdAt).toLocaleString()}</p>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-medium text-slate-900">Items</h2>
        <ul className="mt-3 space-y-4">
          {items.map((item, i) => (
            <li key={i} className="flex gap-4 rounded-lg border border-slate-100 p-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={item.imageSnapshot || PLACEHOLDER_IMAGE}
                  alt={item.titleSnapshot}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={!item.imageSnapshot || item.imageSnapshot.includes('placehold')}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{item.titleSnapshot}</p>
                <p className="text-sm text-slate-500">
                  ₹{item.priceSnapshot} × {item.qty} = ₹{item.priceSnapshot * item.qty}
                </p>
                {item.slugSnapshot && (
                  <Link
                    href={`/products/${item.slugSnapshot}`}
                    className="mt-1 inline-block text-sm text-slate-600 underline hover:text-slate-900"
                  >
                    View product
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-slate-200 pt-4 font-semibold text-slate-900">
          Total: ₹{totalAmount}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-medium text-slate-900">Payment</h2>
        <div className="mt-2 space-y-2 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-700">Status:</span>{' '}
            <span
              className={`rounded-full px-2 py-0.5 ${
                order.paymentStatus === 'PAID'
                  ? 'bg-green-100 text-green-800'
                  : order.paymentStatus === 'FAILED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.paymentStatus || 'PENDING'}
            </span>
          </p>
          {order.paymentId && (
            <p className="flex flex-wrap items-center gap-1">
              <span className="font-medium text-slate-700">Payment ID:</span>
              <span className="font-mono break-all text-xs">{order.paymentId}</span>
              <CopyButton value={order.paymentId} label="Payment ID" />
            </p>
          )}
          {order.razorpayOrderId && (
            <p className="flex flex-wrap items-center gap-1">
              <span className="font-medium text-slate-700">Razorpay order ID:</span>
              <span className="font-mono break-all text-xs">{order.razorpayOrderId}</span>
              <CopyButton value={order.razorpayOrderId} label="Razorpay order ID" />
            </p>
          )}
          {(order.paymentId || order.razorpayOrderId) && (
            <p className="text-xs text-slate-500">
              Save these IDs for refund or support.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-medium text-slate-900">Delivery address</h2>
        <p className="mt-2 text-slate-600">
          {address.name}<br />
          {address.phone}<br />
          {address.addressLine1}<br />
          {address.addressLine2 && <>{address.addressLine2}<br /></>}
          {address.city}, {address.pincode}
        </p>
      </div>

      <Link href="/orders" className="inline-block text-slate-900 underline">← Back to orders</Link>
    </div>
  );
}
