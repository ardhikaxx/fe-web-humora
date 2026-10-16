import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AdminProvider } from '../lib/context/AdminContext';
import { ToastProvider } from '../components/ui/Toast';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'HUMORA Admin Console — CMS & Analytics Dashboard',
  description: 'Portal manajemen konten, series, episode, katalog mobile, dan analitik performa streaming HUMORA.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4B0B7A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8F7FA] text-[#24172B]">
        <AdminProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
