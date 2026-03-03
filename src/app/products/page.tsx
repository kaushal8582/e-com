'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { Product } from '@/types';

const LIMIT = 20;

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(LIMIT));
      params.set('skip', String(page * LIMIT));
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const res = await apiGet<{ success: boolean; data: { products: Product[]; total: number } }>(
        `/products?${params.toString()}`
      );
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Products</h1>

      <div className="flex flex-wrap gap-4">
        <form
          method="get"
          className="flex flex-1 flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const q = (form.querySelector('[name=search]') as HTMLInputElement)?.value ?? '';
            const c = (form.querySelector('[name=category]') as HTMLInputElement)?.value ?? '';
            window.location.href = `/products?${new URLSearchParams({ search: q, category: c }).toString()}`;
          }}
        >
          <input
            name="search"
            type="search"
            placeholder="Search..."
            defaultValue={search}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
          />
          <input
            name="category"
            type="text"
            placeholder="Category"
            defaultValue={category}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
          />
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
            Filter
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          No products found. Try different filters or run the backend seed.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-6">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-slate-600">
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-8 w-48 animate-pulse rounded bg-slate-200" /><div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 animate-pulse rounded-xl bg-slate-200" />)}</div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
