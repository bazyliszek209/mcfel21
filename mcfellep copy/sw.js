// sw.js
self.addEventListener('install', event => {
  console.log('✅ Service Worker zainstalowany');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('✅ Service Worker aktywowany');
});

self.addEventListener('fetch', event => {
  // Możesz dodać cache lub inne rzeczy tutaj
});
