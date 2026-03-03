'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiGet } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';

const PLACEHOLDER = 'https://placehold.co/600x400?text=Product';

const addToCartSchema = z.object({
  qty: z.coerce.number().int().min(1).max(999),
});

type AddToCartForm = z.infer<typeof addToCartSchema>;

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const router = useRouter();
  const { addItem } = useCart();

  const { register, handleSubmit, watch } = useForm<AddToCartForm>({
    resolver: zodResolver(addToCartSchema),
    defaultValues: { qty: 1 },
  });
  const qty = watch('qty');

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ success: boolean; data: Product }>(`/products/${encodeURIComponent(slug)}`);
      setProduct(res.data);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const onSubmit = async (data: AddToCartForm) => {
    if (!product) return;
    try {
      await addItem(product._id, data.qty, product);
      toast.success('Added to cart');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add to cart');
    }
  };

  const onBuyNow = async (data: AddToCartForm) => {
    if (!product) return;
    try {
      await addItem(product._id, data.qty, product);
      toast.success('Proceeding to checkout');
      router.push('/checkout');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
            <div className="h-24 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Product not found.
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: PLACEHOLDER, publicId: '' }];
  const price = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice != null;
  const specs = product.specs && typeof product.specs === 'object' ? product.specs : {};

  return (
    <div className="mx-auto max-w-4xl px-2 sm:px-0">
      <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
        <div className="space-y-2">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={images[imageIndex]?.url ?? PLACEHOLDER}
              alt={product.title}
              fill
              className="object-cover"
              priority
              unoptimized={images[imageIndex]?.url?.includes('placehold')}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    i === imageIndex ? 'border-slate-900' : 'border-slate-200'
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="64px" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{product.title}</h1>
          <p className="mt-1 text-slate-500">{product.category}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold text-slate-900">₹{price}</span>
            {hasDiscount && (
              <span className="text-lg text-slate-400 line-through">₹{product.price}</span>
            )}
          </div>
          <p className="mt-4 text-slate-600">{product.description}</p>
          {product.stock > 0 ? (
            <p className="mt-2 text-sm text-slate-500">In stock: {product.stock}</p>
          ) : (
            <p className="mt-2 text-sm text-amber-600">Out of stock</p>
          )}

          {Object.keys(specs).length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-slate-900">Specifications</h3>
              <table className="mt-2 w-full border-collapse border border-slate-200">
                <tbody>
                  {Object.entries(specs).map(([k, v]) => (
                    <tr key={k}>
                      <td className="border border-slate-200 px-3 py-2 font-medium text-slate-700">{k}</td>
                      <td className="border border-slate-200 px-3 py-2 text-slate-600">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {product.stock > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Qty</span>
                  <input
                    type="number"
                    min={1}
                    max={product.stock}
                    {...register('qty')}
                    className="w-20 rounded border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-white hover:bg-slate-800"
                >
                  Add to cart
                </button>
              </form>
              <button
                type="button"
                onClick={handleSubmit(onBuyNow)}
                className="rounded-lg border-2 border-emerald-600 bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700"
              >
                Buy now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
