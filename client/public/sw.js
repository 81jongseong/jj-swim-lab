const CACHE_NAME = 'jj-swim-lab-v2.1.0';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/manifest-icon-192.maskable.png',
  '/icons/manifest-icon-512.maskable.png',
  '/icons/favicon-196.png',
  '/icons/apple-icon-180.png'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에서 찾은 경우 반환
        if (response) {
          return response;
        }
        
        // 네트워크에서 가져오기
        return fetch(event.request).then(
          (response) => {
            // 유효한 응답이 아닌 경우
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 응답을 복제하여 캐시에 저장 (완전 비활성화)
            // const responseToCache = response.clone();
            // caches.open(CACHE_NAME)
            //   .then((cache) => {
            //     cache.put(event.request, responseToCache);
            //   });
            console.log('Service Worker 캐시 비활성화됨');

            return response;
          }
        ).catch(() => {
          // Network failed, return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
        });
      })
  );
});

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 백그라운드 동기화 작업
async function doBackgroundSync() {
  try {
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getOfflineData() {
  // IndexedDB에서 오프라인 데이터 가져오기 (Placeholder for now, actual implementation in useOffline hook)
  return [];
}

async function syncOfflineData(data) {
  // 서버에 데이터 동기화 (Placeholder for now, actual implementation in useOffline hook)
  console.log('Syncing offline data:', data);
}

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다!',
    icon: '/icons/manifest-icon-192.maskable.png',
    badge: '/icons/favicon-196.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icons/manifest-icon-192.maskable.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icons/favicon-196.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('JJ Swim Lab', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});
