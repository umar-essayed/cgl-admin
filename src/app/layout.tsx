import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CGL Engineering • Corporate Control Center',
  description: 'Enterprise Administrative Portal for Creative Geotechnical Laboratories',
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#090a0c] text-stone-100 antialiased selection:bg-[#3b76b3]/30 selection:text-white font-['Cairo',sans-serif]">
        {children}
      </body>
    </html>
  );
}
