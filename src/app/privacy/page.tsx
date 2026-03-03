import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-4 text-slate-600">
        Modern Riwaaz respects your privacy. This policy describes how we collect, use, and protect your information.
      </p>
      <div className="mt-6 space-y-4 text-slate-600">
        <section>
          <h2 className="font-semibold text-slate-900">1. Information We Collect</h2>
          <p>We collect information you provide when registering, placing orders, or contacting us (e.g. name, email, address, phone).</p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">2. How We Use It</h2>
          <p>We use your information to process orders, communicate with you, and improve our service. We do not sell your data to third parties.</p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">3. Security</h2>
          <p>We use industry-standard measures to protect your data. Payment details are handled by our secure payment provider.</p>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900">4. Contact</h2>
          <p>For privacy-related questions, contact us via the WhatsApp link or support channels on this site.</p>
        </section>
      </div>
      <p className="mt-8 text-sm text-slate-500">Last updated: March 2025.</p>
      <Link href="/" className="mt-6 inline-block text-slate-900 underline hover:no-underline">
        ← Back to home
      </Link>
    </div>
  );
}
