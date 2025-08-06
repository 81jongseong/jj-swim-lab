import type { AppProps } from 'next/app';
import Navigation from '../components/Navigation';
import '../app/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navigation />
      <main className="pt-16">
        <Component {...pageProps} />
      </main>
    </>
  );
} 