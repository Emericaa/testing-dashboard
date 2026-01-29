import './globals.css';
import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { BrandingProvider } from '@/components/BrandingProvider';

export const metadata: Metadata = {
  title: 'VC Dashboard',
  description: 'Self-hosted VC portfolio intelligence dashboard.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BrandingProvider>
          <AppShell>{children}</AppShell>
        </BrandingProvider>
      </body>
    </html>
  );
}
