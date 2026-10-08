// Minimal service worker: lets reminders show as system notifications and opens the app when one is clicked.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Web Push: the server sends { title, body, url, tag } even when the app is closed.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { /* plain text payload */ }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Play Perform', {
      body: data.body || '', tag: data.tag, icon: '/favicon.ico', data: { url: data.url || '/competences' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/competences';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const open = clients.find((c) => 'focus' in c);
      return open ? open.focus() : self.clients.openWindow(url);
    }),
  );
});
