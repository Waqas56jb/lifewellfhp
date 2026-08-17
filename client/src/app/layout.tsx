import type { Metadata, Viewport } from 'next';
import { Lora, Source_Sans_3 } from 'next/font/google';
import '@/styles/globals.css';

import { site } from '@/data/site';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SkipLink } from '@/components/layout/SkipLink';
import { JsonLd } from '@/components/seo/JsonLd';
import { homeGraph } from '@/lib/schema';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';

/* Self-hosted via next/font — no runtime request to Google. Only the weights
   the design system actually uses are loaded. */
const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-lora',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700'],
  variable: '--font-source-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Telehealth Mental Health Care | PMHNP Online Therapy & Medication Management',
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: 'Lourdie Chachoute, PMHNP-BC' }],
  creator: site.name,
  publisher: site.name,
  formatDetection: { telephone: true, address: false, email: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: 'summary_large_image' },
  // Icons resolve from app/icon.png and app/apple-icon.png via file convention.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Not capped — users must be able to zoom (WCAG 1.4.4).
  themeColor: '#3e7fb1',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={`${lora.variable} ${sourceSans.variable}`}>
      <body>
        <JsonLd data={homeGraph()} id="site-schema" />
        <SkipLink />
        <Header />
        <main id="main-content" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
