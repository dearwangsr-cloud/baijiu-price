// ===== 自动更新版 service-worker.js =====
// 每次你更新 index.html 并上传后，手机 App 会自动拉取新版本

const CACHE_NAME = "liquor-app-v20260428"; // 每次大更新可改日期
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.svg",
  "./icon-512.svg"
];

// 安装时预缓存
self.addEventListener("install", event => {
  self.skipWaiting(); // 新 SW 立即进入 waiting->active
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

// 激活时清理旧缓存
self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      clients.claim(), // 立即接管页面
      caches.keys().then(keys =>
        Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
    ])
  );
});

// 请求策略：
// HTML 永远走网络优先（确保页面实时更新）
// 其他静态资源 缓存优先 + 后台更新
self.addEventListener("fetch", event => {
  const req = event.request;

  // 只处理 GET
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // HTML / 导航请求：网络优先
  if (
    req.mode === "navigate" ||
    req.destination === "document" ||
    url.pathname.endsWith(".html") ||
    url.pathname === "/"
  ) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then(r => r || caches.match("./index.html"))
        )
    );
    return;
  }

  // 其他资源：缓存优先，后台刷新
  event.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});