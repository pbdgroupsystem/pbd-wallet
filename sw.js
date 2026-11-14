/* PBD Wallet — service worker
 * หน้าเว็บ (index.html): ดึงใหม่จากเน็ตก่อนเสมอ (เห็นเวอร์ชันล่าสุดทันทีที่อัปโหลด) · ไม่มีเน็ต → ใช้ฉบับที่เก็บไว้
 * ไอคอน/เสียง/manifest: เก็บไว้ในเครื่อง
 * ไม่แตะคำขอไปที่อื่น (ระบบหลังบ้าน GAS, LINE, CDN) → ข้อมูลยอดเงิน/คูปองไม่ถูกเก็บโดย service worker
 * แจ้งเตือน "เงินเข้าแล้ว": รับจาก Firebase Cloud Messaging (ข้อความแบบ data) แล้วแสดงเอง · กดแล้วเปิดแอป + เล่นเสียง
 * แก้ไฟล์นี้หรือเปลี่ยนไฟล์เสียงเมื่อไร ให้เปลี่ยน VERSION เพื่อล้างของเก่า */
const VERSION = 'pbd-wallet-v3';
const SHELL = ['./', './index.html', './manifest.json', './firebase-config.js', './sounds/cash.mp3', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

try { importScripts('./firebase-config.js'); } catch (e) { }
if (self.PBD_FIREBASE && self.PBD_FIREBASE.config) {
  try {
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
    firebase.initializeApp(self.PBD_FIREBASE.config);
    firebase.messaging().onBackgroundMessage(p => {
      const d = (p && p.data) || {};
      if (d.kind !== 'commission') return;
      return self.registration.showNotification(d.title || 'เงินเข้าแล้ว', {
        body: d.body || '', icon: './icons/icon-192.png', badge: './icons/icon-192.png', tag: 'pbd-cash', renotify: true,
        vibrate: [200, 100, 200, 100, 300], data: { amount: d.amount || '', total: d.total || '' } });
    });
  } catch (e) { }
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const d = e.notification.data || {}, url = new URL('./?cash=' + encodeURIComponent(d.amount || ''), self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => x.url.indexOf(self.registration.scope) === 0);
    if (c) { c.postMessage({ type: 'cash', amount: d.amount, total: d.total }); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});

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
      if (res.ok) { const cp = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', cp)); }
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  if (/\/firebase-config\.js$/.test(url.pathname)) { e.respondWith(fetch(req).catch(() => caches.match(req))); return; }   // ค่าตั้งค่า: เอาใหม่ก่อน
  if (/\/(icons\/|sounds\/|manifest\.json)/.test(url.pathname)) e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
