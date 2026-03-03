import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link href="/" className="text-lg font-bold text-slate-900 sm:text-xl">
            Modern Riwaaz
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <Link href="/terms" className="hover:text-slate-900 hover:underline">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy" className="hover:text-slate-900 hover:underline">
              Privacy Policy
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500 sm:text-left">
          © {currentYear} Modern Riwaaz. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
