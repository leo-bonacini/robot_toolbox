const CACHE_NAME = 'robot-toolbox-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/themes.css',
  './assets/css/main.css',
  './assets/css/tools.css',
  './assets/js/i18n.js',
  './assets/js/storage.js',
  './assets/js/theme.js',
  './assets/js/search.js',
  './assets/js/export.js',
  './assets/js/keyboard.js',
  './assets/js/router.js',
  './assets/js/app.js',
  './assets/components/sidebar.js',
  './assets/components/modals.js',
  './assets/locales/en.js',
  './assets/locales/pt.js',
  './assets/locales/es.js',
  './assets/tools/home.js',
  './assets/tools/rotation-converter.js',
  './assets/tools/quaternion-toolbox.js',
  './assets/tools/rotation-matrix.js',
  './assets/tools/dh-calculator.js',
  './assets/tools/pid-tuner.js',
  './assets/tools/differential-drive.js',
  './assets/tools/ackermann.js',
  './assets/tools/mecanum.js',
  './assets/tools/skid-steer.js',
  './assets/tools/unit-converter.js',
  './assets/tools/matrix-calculator.js',
  './assets/tools/covariance-visualizer.js',
  './assets/tools/coordinate-frame.js',
  './assets/tools/imu-noise.js',
  './assets/tools/camera-fov.js',
  './assets/tools/trajectory-generator.js',
  './assets/tools/motion-profile.js',
  './assets/icons/favicon.svg',
  './assets/js/vendor/chart.min.js'
];

const CDN_ASSETS = [];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin === location.origin || CDN_ASSETS.includes(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});
