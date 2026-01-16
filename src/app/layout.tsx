import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getGlobalSettings } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGlobalSettings();
  return {
    title: {
      template: `%s | ${settings.general.siteTitle}`,
      default: settings.general.siteTitle,
    },
    description: settings.general.metaDescription,
    keywords: settings.general.metaKeywords,
    icons: {
      icon: settings.general.favicon || '/favicon.ico',
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
  return (
    <html lang="vi">
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
