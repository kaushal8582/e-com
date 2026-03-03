'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { cart, guestItems } = useCart();
  const { user, logout, token } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            aria-hidden
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 flex h-full w-64 flex-col gap-4 border-l border-slate-200 bg-white p-6 shadow-xl md:hidden">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                className="rounded p-2 text-slate-500 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-3">
              {navLinks}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
