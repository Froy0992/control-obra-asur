// Guarda la app en el teléfono para que abra sin señal.
// La página se pide primero a internet (para tener siempre la última versión)
// y solo si no hay señal se usa la copia guardada.
const CACHE='control-obras-v32';
const FILES=['./','./index.html','./manifest.json','./icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('control-obras')&&x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
const guardar=(req,res)=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return res};
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=e.request.url;
  // Datos de Supabase siempre en vivo, nunca desde caché
  if(u.includes('supabase.co'))return;
  const pagina=e.request.mode==='navigate'||(u.startsWith(self.location.origin)&&/(\/|\.html)(\?.*)?$/.test(u));
  if(pagina){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>guardar('./index.html',r)).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
    return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(u.startsWith(self.location.origin)||u.includes('fonts.g')||u.includes('cdn.jsdelivr.net')||u.includes('cdnjs.cloudflare.com'))guardar(e.request,res);return res}).catch(()=>caches.match('./index.html'))))});
// Al tocar una notificación, abre (o trae al frente) la app.
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c)return c.focus()}return self.clients.openWindow('./')}))});
// Listo para recibir push del servidor (cuando se conecte Supabase).
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={title:'Control de obras',body:e.data?e.data.text():''}}e.waitUntil(self.registration.showNotification(d.title||'Control de obras',{body:d.body||'',tag:d.tag,icon:'icon.svg',badge:'icon.svg'}))});
