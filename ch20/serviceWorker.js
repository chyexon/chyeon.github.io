const staticAssets = [
    './',
    './index.html',
    './script.js',
    './style.css',
    './good.jpg',  // 필요한 이미지 파일들
    './images/icons/icon-192x192.png',  // 아이콘 파일
    './images/icons/icon-310x310.png'
];

self.addEventListener('install', async event => {
    const cache = await caches.open('static-cache');
    cache.addAll(staticAssets);
});

self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);

    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(req));
    } else {
        event.respondWith(networkFirst(req));
    }
});

async function cacheFirst(req) {
    const cachedResponse = await caches.match(req);
    return cachedResponse || fetch(req);
}

async function networkFirst(req) {
    const cache = await caches.open('dynamic-cache');
    try {
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
    } catch (error) {
        return await cache.match(req);
    }
}
