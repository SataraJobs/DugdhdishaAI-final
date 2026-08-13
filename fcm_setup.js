// fcm_setup.js (Final with Correct Github Absolute Link)

// 🔥 तुझी अचूक Github लिंक इथे टाकली आहे 🔥
const SW_URL = 'https://satarajobs.github.io/DugdhdishaAI-final/firebase-messaging-sw.js';

document.addEventListener("DOMContentLoaded", function() {
    if (typeof firebase !== 'undefined' && firebase.messaging) {
        
        // १. पेज लोड झाल्यावर पहिली नोंदणी (Registration)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register(SW_URL)
            .then(function(registration) {
                console.log('✅ Service Worker Registration Successful with scope:', registration.scope);
            }).catch(function(err) {
                console.error('❌ Service Worker Registration Failed:', err);
            });
        }

        const messaging = firebase.messaging();
        
        messaging.onMessage((payload) => {
            console.log('Message received in foreground. ', payload);
            if (payload.notification) {
                showInAppNotification(payload.notification.title, payload.notification.body);
            }
        });
    }
});

function manualNotificationRequest() {
    if (typeof firebase !== 'undefined' && firebase.messaging) {
        const messaging = firebase.messaging();
        
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                alert("✅ ब्राउझरची परवानगी मिळाली! आता फायरबेस टोकन जनरेट होत आहे...");
                
                // २. बटण दाबल्यावर टोकनसाठी पुन्हा अचूक लिंक वापरणे 🔥
                navigator.serviceWorker.register(SW_URL).then((registration) => {
                    messaging.getToken({ 
                        vapidKey: 'BD_Yh5b8O50dK9N7X7v3U6rYnZk-4H2g-9Vq-2X2k3E1t3H8h0n_8Zz3XjXQv5b8O50dK9N7X7v3U6rYnZk',
                        serviceWorkerRegistration: registration 
                    })
                    .then((currentToken) => {
                        if (currentToken) {
                            console.log('FCM Token:', currentToken);
                            localStorage.setItem('fcm_device_token', currentToken);
                            
                            let userMobile = localStorage.getItem('current_user_mobile');
                            
                            if (userMobile && userMobile !== "+91 9XXXX XXXX" && typeof db !== 'undefined') {
                                db.collection("users").doc(userMobile).set({
                                    fcmToken: currentToken, 
                                    role: localStorage.getItem('current_logged_in_role') || 'unknown',
                                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                                }, { merge: true })
                                .then(() => {
                                    alert("🎉 सक्सेस! FCM Token डेटाबेसमध्ये सेव्ह झाले! आता तुम्हाला नोटिफिकेशन नक्की येईल.");
                                })
                                .catch(err => {
                                    alert("❌ डेटाबेस एरर: " + err.message);
                                });
                            } else {
                                alert("⚠️ टोकन जनरेट झाले, पण तुमचा मोबाईल नंबर LocalStorage मध्ये सापडला नाही. कृपया ॲपमधून एकदा लॉग-आऊट करून पुन्हा लॉग-इन करा.");
                            }
                        } else {
                            alert("⚠️ टोकन जनरेट झाले नाही. कृपया पुन्हा प्रयत्न करा.");
                        }
                    }).catch((err) => {
                        alert("❌ Token Error: " + err.message);
                    });
                }).catch(err => alert("❌ Service Worker Load Error: " + err.message));
                
            } else {
                alert("⚠️ तुम्ही नोटिफिकेशनची परवानगी (Permission) नाकारली आहे. कृपया क्रोमच्या सेटिंग्जमध्ये जाऊन Notifications 'Allow' करा आणि पेज रिफ्रेश करा.");
            }
        });
    } else {
        alert("⚠️ इंटरनेट कनेक्शन किंवा फायरबेसमध्ये अडचण आहे. कृपया पेज रिफ्रेश करा.");
    }
}

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
    notifBox.style.border = '2px solid #4caf50';
    notifBox.style.animation = 'slideDownNotif 0.5s ease-out';
    
    notifBox.innerHTML = `
        <div style="font-size: 14px; font-weight: 900; margin-bottom: 4px; display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">🔔</span> ${title}
        </div>
        <div style="font-size: 12px; font-weight: 600; opacity:0.95;">${body}</div>
    `;
    
    document.body.appendChild(notifBox);

    if (!document.getElementById('notif-animation-style')) {
        let style = document.createElement('style');
        style.id = 'notif-animation-style';
        style.innerHTML = `@keyframes slideDownNotif { from { top: -50px; opacity: 0; } to { top: 20px; opacity: 1; } }`;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        notifBox.style.transition = "opacity 0.5s, top 0.5s";
        notifBox.style.opacity = "0";
        notifBox.style.top = "-50px";
        setTimeout(() => notifBox.remove(), 500);
    }, 5000);
}
