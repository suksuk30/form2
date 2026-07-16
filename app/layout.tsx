import './globals.css';
import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';

import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = { className: '' };


export const metadata: Metadata = {
  title: 'Melemporr',
  description: 'Bersponsor Resmi',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}