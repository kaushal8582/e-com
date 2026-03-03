import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-2xl font-bold text-slate-900">Terms &amp; Conditions</h1>
      <p className="mt-4 text-slate-600">
        Welcome to Modern Riwaaz. By using this website, you agree to these terms. Please read them carefully.
      </p>
      <div className="mt-6 space-y-4 text-slate-600">
        <section>
          <h2 className="font-semibold text-slate-900">1. Use of Service</h2>
          <p>You may use our service for lawful purposes only. You are responsible for the accuracy of information you provide.</p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">2. Orders &amp; Payment</h2>
          <p>Orders are subject to availability. Payment is processed securely through our payment provider. Prices are in INR unless stated otherwise.</p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">3. Returns &amp; Refunds</h2>
          <p>Please contact us for return and refund policies. We aim to resolve any issues promptly.</p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">4. Contact</h2>
          <p>For questions about these terms, contact us via the WhatsApp link on this site or through our support channels.</p>
        </section>
      </div>
      <p className="mt-8 text-sm text-slate-500">Last updated: March 2025.</p>
      <Link href="/" className="mt-6 inline-block text-slate-900 underline hover:no-underline">
        ← Back to home
      </Link>
    </div>
  );
}
