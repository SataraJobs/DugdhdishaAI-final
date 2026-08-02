// Firebase लायब्ररी इंपोर्ट करणे
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// तुमचे Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBiqbXWMpD19u-RaYZEUicHmxO8JRk_Glo",
    authDomain: "dugdhdishaai.firebaseapp.com",
    projectId: "dugdhdishaai",
    storageBucket: "dugdhdishaai.firebasestorage.app",
    messagingSenderId: "1059551640041",
    appId: "1:1059551640041:web:3fc95210b95b1319c6b378",
    measurementId: "G-6TFEJKBVFL"
};

// Firebase Initialize
firebase.initializeApp(firebaseConfig);

// Messaging सर्विस चालू करणे
const messaging = firebase.messaging();

// ॲप बंद असताना (Background) येणारे नोटिफिकेशन्स हँडल करणे
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    const notificationTitle = payload.notification ? payload.notification.title : 'दुग्ध दिशा AI';
    const notificationOptions = {
        body: payload.notification ? payload.notification.body : 'तुम्हाला एक नवीन सूचना आहे.',
        icon: 'logo.png',
        badge: 'logo.png',
        vibrate: [200, 100, 200, 100, 200], // मोबाईल व्हायब्रेट होण्यासाठी
        data: payload.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// नोटिफिकेशनवर क्लिक केल्यावर ॲप उघडण्यासाठी
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    // जेव्हा युजर नोटिफिकेशनवर क्लिक करेल तेव्हा ॲप (index.html) ओपन होईल
    event.waitUntil(
        clients.openWindow('index.html')
    );
});
