import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { SiteFooter } from '@/shared/ui/SiteFooter';
import { ReminderRunner } from '@/modules/skills';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export const metadata: Metadata = {
  title: ' Play Perform',
  description: 'Apprends en jouant',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${geist.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <ReminderRunner />
      </body>
    </html>
  );
}
