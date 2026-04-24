
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { AuthSync } from "@/components/auth-sync";
import { FontSizeSync } from "@/components/font-size-sync";
import { PwaHandler } from "@/components/pwa-handler";
import { NotificationHandler } from "@/components/notifications/NotificationHandler";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const appIcon = PlaceHolderImages.find(img => img.id === "app-icon")?.imageUrl || 'https://placehold.co/512x512/3D737F/FFFFFF?text=W';

export const metadata: Metadata = {
  title: 'Wisely – Expense Splitting & Budgeting App',
  description: 'Wisely is an expense splitting and budgeting app for individuals and groups. Track expenses, split bills, and manage money easily.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wisely',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: appIcon },
      { url: appIcon, sizes: '32x32', type: 'image/png' },
      { url: appIcon, sizes: '16x16', type: 'image/png' },
    ],
    shortcut: appIcon,
    apple: appIcon,
  }
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
        <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#F7F8FA" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Wisely",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web",
              "url": "https://thewiselyapp.com",
              "description": "Expense splitting and budgeting app for individuals and groups.",
            }),
          }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <NotificationHandler />
            <FontSizeSync />
            <AuthSync />
            <PwaHandler />
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
