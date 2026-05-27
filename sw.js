// 🔴 QUAN TRỌNG: MỖI LẦN SỬA CODE, HÃY ĐỔI SỐ V1 THÀNH V2, V3... ĐỂ APP CẬP NHẬT
const CACHE_NAME = 'study-space-v1'; 

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// BƯỚC 1: Cài đặt và lưu toàn bộ file vào bộ nhớ sâu của điện thoại
self.addEventListener('install', event => {
  self.skipWaiting(); // Ép trình duyệt cài đặt bản mới ngay lập tức
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// BƯỚC 2: Dọn rác (Xóa toàn bộ bộ nhớ cũ khi tên CACHE_NAME bị đổi)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Đã xóa bộ nhớ cũ:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Chiếm quyền điều khiển màn hình ngay lập tức
});

// BƯỚC 3: Chiến thuật "Network First" (Tuyệt chiêu chống kẹt bản cũ)
// - Có mạng: Luôn tải bản code mới nhất từ Internet.
// - Không có mạng: Lấy code lưu trong máy ra chạy (Offline Mode).
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cập nhật ngầm bản mới nhất vào Cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // Rớt mạng -> Lôi từ Cache ra dùng
        return caches.match(event.request);
      })
  );
});
