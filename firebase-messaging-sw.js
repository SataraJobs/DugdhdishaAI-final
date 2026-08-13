// firebase-messaging-sw.js (Corrected for Firebase v8)

importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyBiqbXWMpD19u-RaYZEUicHmxO8JRk_Glo",
    authDomain: "dugdhdishaai.firebaseapp.com",
    projectId: "dugdhdishaai",
    storageBucket: "dugdhdishaai.firebasestorage.app",
    messagingSenderId: "1059551640041",
    appId: "1:1059551640041:web:3fc95210b95b1319c6b378"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 🔥 हा बदल सर्वात महत्वाचा आहे: v8 मध्ये setBackgroundMessageHandler वापरतात 🔥
messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification ? payload.notification.title : 'दुग्ध दिशा AI';
    const notificationOptions = {
        body: payload.notification ? payload.notification.body : 'तुम्हाला एक नवीन सूचना आहे.',
        icon: 'https://cdn-icons-png.flaticon.com/512/3050/3050212.png',
        vibrate: [200, 100, 200, 100, 200]
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});
