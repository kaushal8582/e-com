'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';

const PLACEHOLDER = 'https://placehold.co/400x300?text=Product';

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0]?.url || PLACEHOLDER;
  const price = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice != null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        <Image
          src={img}
          alt={product.title}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
          unoptimized={img.startsWith('https://placehold')}
        />
        {hasDiscount && (
          <span className="absolute right-2 top-2 rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
            Sale
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium text-slate-900 line-clamp-2">{product.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{product.category}</p>
        <div className="mt-auto flex items-center gap-2 pt-3">
          <span className="text-lg font-semibold text-slate-900">₹{price}</span>
          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">₹{product.price}</span>
          )}
        </div>
        {product.stock === 0 && (
          <p className="mt-2 text-sm text-amber-600">Out of stock</p>
        )}
      </div>
    </Link>
  );
}
