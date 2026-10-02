/* オフライン対応：同じサイトのファイルだけを扱う。ページと配信データ（.json）は常にネットの最新（ブラウザの一時保存も使わない），画像などは保存版優先 */
const CACHE='tanto-v5';
const CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','maskable-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>r.ok&&c.put(u,r)).catch(()=>{}))))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const u=new URL(req.url); if(u.origin!==location.origin) return;
  const fresh=req.mode==='navigate'||/\.(html|json|js)$/.test(u.pathname)||u.pathname.endsWith('/');
  if(fresh){ e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); } return r; }).catch(()=>caches.match(req).then(h=>h||caches.match('index.html')))); return; }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{ if(r&&r.ok){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); } return r; })));
});
