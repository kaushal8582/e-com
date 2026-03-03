'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Order } from '@/types';
import { toast } from 'sonner';

export default function OrdersPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace('/login?redirect=/orders');
      return;
    }
    if (!token) return;
    setLoadError(null);
    apiGet<{ success: boolean; data: Order[] }>('/orders', token)
      .then((res) => {
        setOrders(res.data ?? []);
      })
      .catch(() => {
        setOrders([]);
        setLoadError('Failed to load orders.');
        toast.error('Failed to load orders.');
      })
      .finally(() => setLoading(false));
  }, [token, authLoading, router]);

  if (authLoading || (token && loading)) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-24 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-24 animate-pulse rounded-lg bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My orders</h1>
      {loadError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      )}
      {orders.length === 0 && !loadError ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          No orders yet.
          <Link href="/products" className="mt-2 block text-slate-900 underline">Browse products</Link>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-slate-900">Order #{order._id.slice(-8)}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm text-slate-700">
                    {order.status}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-sm ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : order.paymentStatus === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.paymentStatus || 'PENDING'}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                ₹{order.totalAmount} · {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
