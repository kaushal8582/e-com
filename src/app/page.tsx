import Link from 'next/link';
import Image from 'next/image';
import { apiGet } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

// Luxury jewelry hero – sparkling diamonds (Pexels, free to use)
const HERO_IMAGE = 'https://images.pexels.com/photos/3715989/pexels-photo-3715989.jpeg?auto=compress&cs=tinysrgb&w=1400';

async function getFeatured(): Promise<Product[]> {
  try {
    const res = await apiGet<{ success: boolean; data: { products: Product[] } }>(
      '/products?limit=8&skip=0'
    );
    return res.data?.products ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeatured();

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-2xl bg-[#1a1510]">
        <div className="relative aspect-[1400/520] w-full min-h-[280px] sm:min-h-[340px]">
          <Image
            src={HERO_IMAGE}
            alt="Modern Riwaaz – Fine Jewelry"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 py-12 sm:px-12 md:px-16">
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl">
              Welcome to Modern Riwaaz
            </h1>
            <p className="mt-4 max-w-xl text-lg text-amber-100/95 drop-shadow">
              Timeless jewelry for every moment. Explore handpicked rings, necklaces, earrings and more.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-block w-fit rounded-lg bg-amber-600 px-6 py-3 font-medium text-white transition hover:bg-amber-500"
            >
              Shop all products
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">Featured products</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.length === 0 ? (
            <p className="col-span-full text-slate-500">No products yet. Run the backend seed.</p>
          ) : (
            products.map((p) => <ProductCard key={p._id} product={p} />)
          )}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-slate-700 hover:bg-slate-50"
          >
            View all products
          </Link>
        </div>
      </section>
    </div>
  );
}
