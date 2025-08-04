import './globals.css';
import { ReactNode } from 'react';
import Navigation from '../components/Navigation';

export const metadata = {
  title: 'JJ Swim Lab',
  description: '스윔 교육 플랫폼',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Navigation />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
