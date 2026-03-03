'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center">
      <div className="text-5xl">✅</div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Buy ho gaya ✅</h1>
      <p className="mt-2 text-slate-600">Your order has been placed successfully.</p>
      {orderId && (
        <>
          <p className="mt-1 text-sm text-slate-500">Order ID: {orderId}</p>
          <Link
            href={`/orders/${orderId}`}
            className="mt-2 inline-block text-slate-700 underline hover:text-slate-900"
          >
            View order details
          </Link>
        </>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/orders"
          className="rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-white hover:bg-slate-800"
        >
          View orders
        </Link>
        <Link
          href="/products"
          className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg p-8 text-center text-slate-500">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
