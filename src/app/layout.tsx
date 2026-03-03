import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modern Riwaaz – Fine Jewelry",
  description: "Modern Riwaaz – Discover fine jewelry for every occasion.",
  icons: { icon: "/favicon-32x32.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
            <Toaster position="top-right" richColors />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
