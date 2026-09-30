/* オフライン対応：同じサイトのファイルだけを扱う。ページと配信データ（.json）はネット優先，画像などは保存版優先 */
const CACHE='tanto-v4';
const CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','maskable-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const u=new URL(req.url); if(u.origin!==location.origin) return;
  const fresh=req.mode==='navigate'||/\.(html|json)$/.test(u.pathname)||u.pathname.endsWith('/');
  if(fresh){ e.respondWith(fetch(req).then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); } return r; }).catch(()=>caches.match(req).then(h=>h||caches.match('index.html')))); return; }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{ if(r&&r.ok){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); } return r; })));
});
