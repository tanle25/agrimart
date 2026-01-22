import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getGlobalSettings } from "@/lib/settings";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGlobalSettings();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

  return {
    title: {
      template: `%s | ${settings.general.siteTitle}`,
      default: settings.general.siteTitle,
    },
    description: settings.general.metaDescription,
    keywords: settings.general.metaKeywords,
    icons: {
      icon: settings.general.favicon || '/favicon.ico',
    },
    other: {
      'dns-prefetch': backendUrl,
      'preconnect': backendUrl,
    }
  };
}

import { ToastProvider } from "@/contexts/ToastContext";
import { CartProvider } from "@/contexts/CartContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href={backendUrl} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={backendUrl} />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
