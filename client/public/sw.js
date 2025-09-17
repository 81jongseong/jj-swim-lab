/**
 * JJ Swim Lab - 서비스 워커
 * 
 * 📋 **기능**:
 *   - 오프라인 지원
 *   - 캐시 관리
 *   - 백그라운드 동기화
 *   - 푸시 알림 처리
 *   - 네트워크 요청 가로채기
 * 
 * 🔄 **캐시 전략**:
 *   - Cache First: 정적 자산 (CSS, JS, 이미지)
 *   - Network First: API 요청
 *   - Stale While Revalidate: HTML 페이지
 * 
 * ⚠️ **주의사항**:
 *   - 캐시 크기 제한 관리
 *   - 보안 정책 준수
 *   - 브라우저 호환성 확인
 */

const CACHE_NAME = 'jj-swim-lab-v1';
const STATIC_CACHE = 'jj-swim-lab-static-v1';
const DYNAMIC_CACHE = 'jj-swim-lab-dynamic-v1';

// 캐시할 정적 자산 목록
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/favicon-196.png',
  '/icons/manifest-icon-192.maskable.png',
  '/icons/manifest-icon-512.maskable.png',
  '/offline.html',
];

// 캐시할 API 엔드포인트 패턴
const API_PATTERNS = [
  /^\/api\/auth/,
  /^\/api\/users/,
  /^\/api\/centers/,
  /^\/api\/courses/,
];

// 서비스 워커 설치
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 정적 자산 캐시 중...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker 설치 완료');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker 설치 실패:', error);
      })
  );
});

// 서비스 워커 활성화
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker 활성화 중...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ 오래된 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker 활성화 완료');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Service Worker 활성화 실패:', error);
      })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 같은 도메인 요청만 처리
  if (url.origin !== location.origin) {
    return;
  }
  
  // GET 요청만 캐시 처리
  if (request.method !== 'GET') {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// 요청 처리 함수
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // API 요청 처리 (Network First)
    if (isApiRequest(url.pathname)) {
      return await handleApiRequest(request);
    }
    
    // 정적 자산 처리 (Cache First)
    if (isStaticAsset(url.pathname)) {
      return await handleStaticAsset(request);
    }
    
    // HTML 페이지 처리 (Stale While Revalidate)
    if (isHtmlRequest(request)) {
      return await handleHtmlRequest(request);
    }
    
    // 기본 네트워크 요청
    return await fetch(request);
    
  } catch (error) {
    console.error('❌ 요청 처리 실패:', error);
    return await handleOfflineRequest(request);
  }
}

// API 요청 처리 (Network First)
async function handleApiRequest(request) {
  try {
    // 네트워크에서 먼저 시도
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 성공 시 캐시에 저장
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // 네트워크 실패 시 캐시에서 찾기
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 캐시에도 없으면 오프라인 응답
    return new Response(
      JSON.stringify({ 
        error: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.',
        offline: true 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 정적 자산 처리 (Cache First)
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    return new Response('정적 자산을 찾을 수 없습니다.', { status: 404 });
  }
}

// HTML 요청 처리 (Stale While Revalidate)
async function handleHtmlRequest(request) {
  const cachedResponse = await caches.match(request);
  
  // 백그라운드에서 네트워크 요청 시도
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then((c) => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch(() => null);
  
  // 캐시된 응답이 있으면 즉시 반환
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // 캐시된 응답이 없으면 네트워크 응답 대기
  const networkResponse = await networkPromise;
  
  if (networkResponse) {
    return networkResponse;
  }
  
  // 네트워크도 실패하면 오프라인 페이지
  return await handleOfflineRequest(request);
}

// 오프라인 요청 처리
async function handleOfflineRequest(request) {
  const url = new URL(request.url);
  
  // 오프라인 페이지 요청인 경우
  if (url.pathname === '/offline.html') {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>오프라인 - JJ Swim Lab</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
            }
            .container { max-width: 400px; padding: 2rem; }
            h1 { margin-bottom: 1rem; }
            p { margin-bottom: 2rem; opacity: 0.9; }
            button {
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover { background: rgba(255,255,255,0.3); }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🌊 오프라인 상태</h1>
            <p>인터넷 연결을 확인하고 다시 시도해주세요.</p>
            <button onclick="window.location.reload()">새로고침</button>
          </div>
        </body>
      </html>
      `,
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 200
      }
    );
  }
  
  // 다른 요청의 경우 오프라인 페이지로 리다이렉트
  return Response.redirect('/offline.html');
}

// 요청 타입 확인 함수들
function isApiRequest(pathname) {
  return API_PATTERNS.some(pattern => pattern.test(pathname));
}

function isStaticAsset(pathname) {
  return /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(pathname);
}

function isHtmlRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log('🔄 백그라운드 동기화:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 백그라운드 동기화 실행
async function doBackgroundSync() {
  try {
    // 오프라인 중에 저장된 데이터 동기화
    const pendingData = await getPendingData();
    
    for (const data of pendingData) {
      await syncData(data);
    }
    
    console.log('✅ 백그라운드 동기화 완료');
    
  } catch (error) {
    console.error('❌ 백그라운드 동기화 실패:', error);
  }
}

// 대기 중인 데이터 가져오기
async function getPendingData() {
  // IndexedDB에서 대기 중인 데이터 조회
  return [];
}

// 데이터 동기화
async function syncData(data) {
  // 서버로 데이터 전송
  await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  console.log('📱 푸시 알림 수신:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || '새로운 알림이 있습니다.',
      icon: '/icons/manifest-icon-192.maskable.png',
      badge: '/icons/favicon-196.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'JJ Swim Lab', options)
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('👆 알림 클릭:', event);
  
  event.notification.close();
  
  if (event.action) {
    // 특정 액션 처리
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // 기본 클릭 처리
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// 알림 액션 처리
function handleNotificationAction(action, data) {
  switch (action) {
    case 'view':
      clients.openWindow(data?.url || '/');
      break;
    case 'dismiss':
      // 알림 무시
      break;
    default:
      clients.openWindow('/');
  }
}

// 메시지 처리
self.addEventListener('message', (event) => {
  console.log('💬 메시지 수신:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('🚀 JJ Swim Lab Service Worker 로드 완료');