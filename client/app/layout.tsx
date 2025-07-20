import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'JJ Swim Lab',
  description: '스윔 교육 플랫폼',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
