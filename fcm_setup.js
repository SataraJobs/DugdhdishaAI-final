// fcm_setup.js

document.addEventListener("DOMContentLoaded", function() {
    // फक्त Firebase उपलब्ध असेल तरच पुढे जा
    if (typeof firebase !== 'undefined' && firebase.messaging) {
        
        // PWA Service Worker रजिस्टर करणे
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('firebase-messaging-sw.js')
            .then(function(registration) {
                console.log('Service Worker Registration Successful with scope:', registration.scope);
            }).catch(function(err) {
                console.log('Service Worker Registration Failed:', err);
            });
        }

        const messaging = firebase.messaging();
        
        // १. नोटिफिकेशनसाठी परवानगी (Permission) मागणे
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                
                // २. FCM Registration Token मिळवणे (🔥 सुधारित Vapid Key इथे टाकली आहे)
                messaging.getToken({ vapidKey: 'BD_Yh5b8O50dK9N7X7v3U6rYnZk-4H2g-9Vq-2X2k3E1t3H8h0n_8Zz3XjXQv5b8O50dK9N7X7v3U6rYnZk' })
                .then((currentToken) => {
                    if (currentToken) {
                        console.log('FCM Token:', currentToken);
                        localStorage.setItem('fcm_device_token', currentToken);
                        
                        // Cloud Firestore मध्ये टोकन सेव्ह करणे (युजर लॉगिन असेल तर)
                        let userMobile = localStorage.getItem('current_user_mobile');
                        if (userMobile && userMobile !== "+91 9XXXX XXXX" && typeof db !== 'undefined') {
                            
                            // 🔥 'users' कलेक्शन आणि 'fcmToken' फिल्ड वापरले 🔥
                            db.collection("users").doc(userMobile).set({
                                fcmToken: currentToken, 
                                role: localStorage.getItem('current_logged_in_role') || 'unknown',
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            }, { merge: true })
                            .then(() => console.log("FCM Token saved to users collection!"))
                            .catch(err => console.error("Error saving token to firestore:", err));
                        }
                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                    }
                }).catch((err) => {
                    console.log('An error occurred while retrieving token. ', err);
                });
            } else {
                console.log('Unable to get permission to notify.');
            }
        });
        
        // ३. ॲप चालू असताना (Foreground) मेसेज आल्यास स्क्रीनवर दाखवणे
        messaging.onMessage((payload) => {
            console.log('Message received in foreground. ', payload);
            if (payload.notification) {
                showInAppNotification(payload.notification.title, payload.notification.body);
            }
        });
    }
});

// ॲपमध्ये असताना वरून येणारा सुंदर नोटिफिकेशन पॉप-अप
function showInAppNotification(title, body) {
    let notifBox = document.createElement('div');
    notifBox.style.position = 'fixed';
    notifBox.style.top = '20px';
    notifBox.style.left = '50%';
    notifBox.style.transform = 'translateX(-50%)';
    notifBox.style.background = 'linear-gradient(145deg, #1b5e20, #2e7d32)';
    notifBox.style.color = 'white';
    notifBox.style.padding = '12px 20px';
    notifBox.style.borderRadius = '12px';
    notifBox.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    notifBox.style.zIndex = '99999';
    notifBox.style.minWidth = '280px';
    notifBox.style.maxWidth = '90%';
    notifBox.style.border = '2px solid #4caf50';
    notifBox.style.animation = 'slideDownNotif 0.5s ease-out';
    
    notifBox.innerHTML = `
        <div style="font-size: 14px; font-weight: 900; margin-bottom: 4px; display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">🔔</span> ${title}
        </div>
        <div style="font-size: 12px; font-weight: 600; opacity:0.95;">${body}</div>
    `;
    
    document.body.appendChild(notifBox);

    // CSS Animation Add करणे
    if (!document.getElementById('notif-animation-style')) {
        let style = document.createElement('style');
        style.id = 'notif-animation-style';
        style.innerHTML = `@keyframes slideDownNotif { from { top: -50px; opacity: 0; } to { top: 20px; opacity: 1; } }`;
        document.head.appendChild(style);
    }

    // ५ सेकंदांनंतर नोटिफिकेशन आपोआप गायब होईल
    setTimeout(() => {
        notifBox.style.transition = "opacity 0.5s, top 0.5s";
        notifBox.style.opacity = "0";
        notifBox.style.top = "-50px";
        setTimeout(() => notifBox.remove(), 500);
    }, 5000);
}
