self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Suhu Fitness', body: 'Time to check in.' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge.png'
    })
  );
});
