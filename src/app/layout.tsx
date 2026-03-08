import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";
import DarkModeInit from "@/components/layout/DarkModeInit";
import InstallPrompt from "@/components/layout/InstallPrompt";

export const metadata: Metadata = {
  title: "Wreath Social",
  description: "Your AI-powered social media assistant for your wreath business",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wreath Social",
  },
  openGraph: {
    title: "Wreath Social",
    description: "AI-powered social media for your wreath business. Upload a photo, get captions, hashtags, and a posting schedule.",
    siteName: "Wreath Social",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wreath Social",
    description: "AI-powered social media for your wreath business",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
        <UserProvider>
          {children}
          <InstallPrompt />
        </UserProvider>
      </body>
    </html>
  );
}
