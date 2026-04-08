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
import { KeyboardToolkit } from "@/components/keyboard-toolkit";

const appIcon = PlaceHolderImages.find(img => img.id === "app-icon")?.imageUrl || '/wallet.png';

export const metadata: Metadata = {
  title: 'Wisely',
  description: 'Manage personal and group expenses with ease.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wisely',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: appIcon,
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
        <meta name="theme-color" content="#07161B" />
      </head>
      <body className="font-body antialiased bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <NotificationHandler />
            <FontSizeSync />
            <AuthSync />
            <PwaHandler />
            {children}
            <KeyboardToolkit />
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
