'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { cart, guestItems } = useCart();
  const { user, logout, token } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const count = token
    ? (cart?.items?.length ? cart.items.reduce((s, i) => s + i.qty, 0) : 0)
    : guestItems.reduce((s, i) => s + i.qty, 0);

  const navLinks = (
    <>
      <Link href="/products" className="text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>
        Products
      </Link>
      <Link href="/cart" className="relative flex items-center gap-1 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>
        Cart
        {count > 0 && (
          <span className="absolute -right-2 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-medium text-white">
            {count}
          </span>
        )}
      </Link>
      {user ? (
        <>
          <Link href="/orders" className="text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>
            Orders
          </Link>
          <span className="text-slate-500">{user.name}</span>
          <button
            type="button"
            onClick={() => { logout(); setMobileMenuOpen(false); }}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200" onClick={() => setMobileMenuOpen(false)}>
            Login
          </Link>
          <Link href="/register" className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800" onClick={() => setMobileMenuOpen(false)}>
            Register
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 min-h-[3.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-slate-900 sm:text-xl">
          Modern Riwaaz
        </Link>

        <nav className="hidden items-center gap-4 md:flex md:gap-6">
          {navLinks}
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile overlay - tap to close */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden ${mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden
        onClick={() => setMobileMenuOpen(false)}
      />
      {/* Mobile sidebar - full height, slides in from right */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col border-l border-slate-200 bg-white shadow-xl transition-[transform] duration-200 ease-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="font-semibold text-slate-800">Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            className="rounded p-2 text-slate-500 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-0 overflow-y-auto px-3 py-4 [&>a]:block [&>a]:rounded-lg [&>a]:px-3 [&>a]:py-3 [&>a]:text-base [&>button]:mt-2 [&>button]:block [&>button]:w-full [&>button]:rounded-lg [&>button]:py-3 [&>button]:text-left [&>button]:px-3">
          {navLinks}
        </nav>
      </div>
    </header>
  );
}
