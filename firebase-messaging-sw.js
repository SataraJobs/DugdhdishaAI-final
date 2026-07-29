// firebase-messaging-sw.js
// Firebase Cloud Messaging Service Worker for Dugdha Disha AI

importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBiqbXWMpD19u-RaYZEUicHmxO8JRk_Glo",
  authDomain: "dugdhdishaai.firebaseapp.com",
  projectId: "dugdhdishaai",
  storageBucket: "dugdhdishaai.firebasestorage.app",
  messagingSenderId: "1059551640041",
  appId: "1:1059551640041:web:3fc95210b95b1319c6b378",
  measurementId: "G-6TFEJKBVFL"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Background Message Received: ', payload);
  
  const notificationTitle = payload.notification.title || "दुग्ध दिशा AI कडून सूचना";
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo-192x192.png', // ✅ CORRECTION: Updated to match your manifest icon
    badge: '/logo-192x192.png', // ✅ CORRECTION: Updated badge path
    data: payload.data
  };
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle Notification Click Event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.indexOf(self.registration.scope) !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        // ✅ CORRECTION: Redirect to index.html on click
        return clients.openWindow('/index.html');
      }
    })
  );
});