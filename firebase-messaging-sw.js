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
        
        // GitHub ची पूर्ण (Absolute) लिंक
        icon: 'https://satarajobs.github.io/DugdhdishaAI-final/logo-192x192.png',
        badge: 'https://satarajobs.github.io/DugdhdishaAI-final/logo-192x192.png',
        
        vibrate: [200, 100, 200, 100, 200], 
        data: payload.data || {}
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🔥 अपडेटेड: नोटिफिकेशनवर क्लिक केल्यावर 404 Error येऊ नये म्हणून (Smart Click)
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    // तुमची GitHub ची अचूक लिंक
    const targetUrl = 'https://satarajobs.github.io/DugdhdishaAI-final/';

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // जर ॲप आधीच बॅकग्राउंडला चालू असेल, तर तेच पेज समोर आणा (१०-१२ नवीन टॅब उघडणार नाहीत)
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url.indexOf(targetUrl) !== -1 && 'focus' in client) {
                    return client.focus();
                }
            }
            // जर ॲप पूर्णपणे बंद असेल, तर नवीन टॅबमध्ये ॲप उघडा
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
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

// ३. Network-First Strategy
self.addEventListener("fetch", (event) => {
    
    // फक्त http किंवा https च्या रिक्वेस्ट्स कॅश करा
    if (!event.request.url.startsWith('http')) {
        return;
    }

    // API, Firebase किंवा Google च्या लिंक्स कॅश करू नका (ते लाईव्ह असावे)
    if (event.request.url.includes("firestore") || 
        event.request.url.includes("firebase") || 
        event.request.url.includes("googleapis")) {
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
