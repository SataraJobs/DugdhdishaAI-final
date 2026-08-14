// =========================================================
// भाग १: FIREBASE PUSH NOTIFICATIONS (बॅकग्राउंड अलर्ट्स)
// =========================================================
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyBiqbXWMpD19u-RaYZEUicHmxO8JRk_Glo",
    authDomain: "dugdhdishaai.firebaseapp.com",
    projectId: "dugdhdishaai",
    storageBucket: "dugdhdishaai.firebasestorage.app",
    messagingSenderId: "1059551640041",
    appId: "1:1059551640041:web:3fc95210b95b1319c6b378",
    measurementId: "G-6TFEJKBVFL"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification ? payload.notification.title : 'दुग्ध दिशा AI';
    const notificationOptions = {
        body: payload.notification ? payload.notification.body : 'तुम्हाला एक नवीन सूचना आहे.',
        icon: '/logo-192x192.png',
        badge: '/logo-192x192.png',
        vibrate: [200, 100, 200, 100, 200], 
        data: payload.data || {}
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('index.html')
    );
});


// =========================================================
// भाग २: PWA OFFLINE CACHING (ऑफलाईन ॲप चालवणे)
// =========================================================
const CACHE_NAME = "dugdhdisha-pwa-v1";

// ॲप इन्स्टॉल होण्यासाठी आवश्यक असलेल्या मूळ फाईल्स
const urlsToCache = [
    "./",
    "./index.html",
    "./login.html",
    "./logo-192x192.png", 
    "./manifest.json"
];

// १. Service Worker Install करणे
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Caching App Shell");
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// २. जुनी Cache क्लिअर करणे (नवीन अपडेट आल्यावर)
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("[Service Worker] Clearing Old Cache");
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// ३. Network-First Strategy (🔥 UPDATED WITH CHROME-EXTENSION FIX 🔥)
self.addEventListener("fetch", (event) => {
    
    // 🔥 FIX: फक्त http किंवा https च्या रिक्वेस्ट्स कॅश करा (chrome-extension इग्नोर करा)
    if (!event.request.url.startsWith('http')) {
        return;
    }

    // API किंवा Firebase च्या लिंक्स कॅश करू नका (ते लाईव्ह असावे)
    if (event.request.url.includes("firestore") || event.request.url.includes("firebase") || event.request.url.includes("googleapis")) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                let responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
