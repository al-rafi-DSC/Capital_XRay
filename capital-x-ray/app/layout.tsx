import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Capital X-Ray | Lombardy Credit & Economic Gap Intelligence',
  description: 'See where money flows. Discover where capital may be missing across provinces and sectors in Lombardy, Italy.',
  openGraph: {
    title: 'Capital X-Ray | Lombardy Credit & Economic Gap Intelligence',
    description: 'See where money flows. Discover where capital may be missing across provinces and sectors in Lombardy, Italy.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Capital X-Ray | Lombardy Credit & Economic Gap Intelligence',
    description: 'See where money flows. Discover where capital may be missing across provinces and sectors in Lombardy, Italy.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
