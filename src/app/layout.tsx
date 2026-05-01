
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { AuthSync } from "@/components/auth-sync";
import { FontSizeSync } from "@/components/font-size-sync";
import { PwaHandler } from "@/components/pwa-handler";
import { NotificationHandler } from "@/components/notifications/NotificationHandler";

export const metadata: Metadata = {
  metadataBase: new URL('https://thewiselyapp.com'),
  title: 'Split Expenses Easily | Wisely App for Groups & Personal Budgeting',
  description: 'Track expenses, split bills, and manage money easily with Wisely. The ultimate financial ledger for individuals and shared groups.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wisely',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Split Expenses Easily | Wisely App',
    description: 'Track expenses, split bills, and manage money easily with Wisely.',
    url: 'https://thewiselyapp.com',
    siteName: 'Wisely',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wisely – Expense Splitting App',
    description: 'Split expenses with friends and track budgets easily.',
    images: ['/icon.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
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
              "creator": {
                "@type": "Organization",
                "name": "Wisely"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "120"
              }
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
