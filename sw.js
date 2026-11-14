/* PBD Wallet — service worker
 * หน้าเว็บ (index.html): ดึงใหม่จากเน็ตก่อนเสมอ (เห็นเวอร์ชันล่าสุดทันทีที่อัปโหลด) · ไม่มีเน็ต → ใช้ฉบับที่เก็บไว้
 * ไอคอน/manifest: เก็บไว้ในเครื่อง
 * ไม่แตะคำขอไปที่อื่น (ระบบหลังบ้าน GAS, LINE, CDN) → ข้อมูลยอดเงิน/คูปองไม่ถูกเก็บโดย service worker
 * แก้ไฟล์นี้เมื่อไรให้เปลี่ยน VERSION เพื่อล้างของเก่า */
const VERSION = 'pbd-wallet-v1';
const SHELL = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // ปล่อยให้เบราว์เซอร์จัดการเอง
  if (req.mode === 'navigate' && /\/(index\.html)?$/.test(url.pathname)) {
    e.respondWith(fetch(req).then(res => {
      if (res.ok && /\/(index\.html)?$/.test(url.pathname)) { const cp = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', cp)); }
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  if (/\/(icons\/|manifest\.json)/.test(url.pathname)) e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
