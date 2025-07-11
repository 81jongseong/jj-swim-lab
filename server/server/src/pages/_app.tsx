// src/pages/_app.tsx
import "@/styles/globals.css"; // ✅ 이 위치에서만 import해야 함

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
