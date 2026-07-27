// sw.js (Service Worker)

const CACHE_NAME = "dugdha-disha-cache-v1";

// ॲप पहिल्यांदा उघडल्यावर इन्स्टॉल होणे
self.addEventListener('install', (event) => {
    console.log('✅ Service Worker इन्स्टॉल झाला आहे.');
});

// इंटरनेट नसताना डेटा कॅशे (Cache) मधून दाखवणे
self.addEventListener('fetch', (event) => {
    // सध्या आपण फक्त बेसिक कोड ठेवला आहे, नंतर यात ऑफलाईन पेजेस ॲड करू
    event.respondWith(fetch(event.request));
});
