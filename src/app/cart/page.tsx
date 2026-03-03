'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Product } from '@/types';

const PLACEHOLDER = 'https://placehold.co/100x100?text=Product';

interface CartRow {
  productId: string;
  product?: Product;
  qty: number;
  priceSnapshot: number;
}

export default function CartPage() {
  const { cart, guestItems, updateQty, removeItem, refreshCart } = useCart();
  const { user, token } = useAuth();
  const [rows, setRows] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRows = useCallback(async () => {
    if (token && cart?.items?.length) {
      setLoading(true);
      const out: CartRow[] = [];
      for (const item of cart.items) {
        const pid = typeof item.productId === 'object' && item.productId && '_id' in item.productId
          ? (item.productId as { _id: string })._id
          : String(item.productId);
        let product: Product | undefined =
          typeof item.productId === 'object' && item.productId && '_id' in item.productId && (item.productId as unknown as Product).title
            ? (item.productId as unknown as Product)
            : undefined;
        if (!product?.title) {
          try {
            const res = await apiGet<{ success: boolean; data: Product }>(`/products/${pid}`);
            product = res.data;
          } catch {
            product = undefined;
          }
        }
        out.push({ productId: pid, product, qty: item.qty, priceSnapshot: item.priceSnapshot });
      }
      setRows(out);
      setLoading(false);
    } else if (!token && guestItems.length > 0) {
      setLoading(true);
      const out: CartRow[] = [];
      for (const gi of guestItems) {
        try {
          const res = await apiGet<{ success: boolean; data: Product }>(`/products/${gi.productId}`);
          const product = res.data;
          if (product) {
            out.push({
              productId: gi.productId,
              product,
              qty: gi.qty,
              priceSnapshot: product.discountPrice ?? product.price,
            });
          }
        } catch {
          // skip
        }
      }
      setRows(out);
      setLoading(false);
    } else {
      setRows([]);
      setLoading(false);
    }
  }, [token, cart?.items, guestItems]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const subtotal = rows.reduce((s, r) => s + r.priceSnapshot * r.qty, 0);

  const items = token ? cart?.items ?? [] : guestItems;
  if (items.length === 0 && !loading) {
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Cart</h1>
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-slate-200" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[500px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Qty</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Total</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.productId} className="border-t border-slate-200">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <Image
                          src={r.product?.images?.[0]?.url ?? PLACEHOLDER}
                          alt={r.product?.title ?? ''}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="font-medium text-slate-900">{r.product?.title ?? r.productId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">₹{r.priceSnapshot}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.qty}
                      onChange={(e) => updateQty(r.productId, Number(e.target.value))}
                      className="rounded border border-slate-300 px-2 py-1 text-slate-900"
                    >
                      {Array.from({ length: Math.min(20, r.product?.stock ?? 99) }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">₹{r.priceSnapshot * r.qty}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => removeItem(r.productId)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-900">Subtotal: ₹{subtotal}</p>
              <Link
                href="/checkout"
                className="mt-3 inline-block rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-white hover:bg-slate-800"
              >
                Proceed to checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
