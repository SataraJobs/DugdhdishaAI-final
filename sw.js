const CACHE_NAME = "dugdhdisha-pwa-v1";

// ॲप इन्स्टॉल होण्यासाठी आवश्यक असलेल्या मूळ फाईल्स
const urlsToCache = [
    "./",
    "./index.html",
    "./login.html",
    "./logo.png",
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

// ३. Network-First Strategy (नेहमी आधी इंटरनेट तपासेल, नसेल तर Cache मधून डेटा देईल)
self.addEventListener("fetch", (event) => {
    // API किंवा Firebase च्या लिंक्स कॅश करू नका (ते लाईव्ह असावे)
    if (event.request.url.includes("firestore") || event.request.url.includes("firebase")) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // इंटरनेट सुरू असल्यास नवीन पेज दाखवा आणि कॅश अपडेट करा
                let responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // इंटरनेट बंद असल्यास कॅश केलेला डेटा (Offline) दाखवा
                return caches.match(event.request);
            })
    );
});
