import './globals.css';
import type { Metadata } from 'next';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import { BrandingProvider } from '@/components/BrandingProvider';

const plex = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans' });
const space = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'VC Dashboard',
  description: 'Self-hosted VC portfolio intelligence dashboard.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plex.variable} ${space.variable}`}>
      <body>
        <BrandingProvider>
          <AppShell>{children}</AppShell>
        </BrandingProvider>
      </body>
    </html>
  );
}
