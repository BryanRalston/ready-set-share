import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";
import DarkModeInit from "@/components/layout/DarkModeInit";
import InstallPrompt from "@/components/layout/InstallPrompt";
import ServiceWorkerRegistrar from "@/components/layout/ServiceWorkerRegistrar";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Ready Set Share",
  description: "Your AI-powered social media assistant for small business",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ready Set Share",
  },
  openGraph: {
    title: "Ready Set Share",
    description: "AI-powered social media for your small business. Upload a photo, get captions, hashtags, and a posting schedule.",
    siteName: "Ready Set Share",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ready Set Share",
    description: "AI-powered social media for your small business",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C9A6E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased min-h-screen bg-cream-100">
        <DarkModeInit />
        <ServiceWorkerRegistrar />
        <UserProvider>
          <ToastProvider>
            {children}
            <InstallPrompt />
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
