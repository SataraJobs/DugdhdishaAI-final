// fcm_setup.js (Corrected for Firebase v8)

const SW_URL = './firebase-messaging-sw.js';

document.addEventListener("DOMContentLoaded", function() {
    if (typeof firebase !== 'undefined' && firebase.messaging) {
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register(SW_URL)
            .then(function(registration) {
                console.log('✅ Service Worker Registered. Scope:', registration.scope);
                // 🔥 ही आहे ती सर्वात महत्त्वाची ओळ (Firebase v8 साठी) 🔥
                firebase.messaging().useServiceWorker(registration);
            }).catch(function(err) {
                console.error('Service Worker Registration Failed:', err);
            });
        }

        const messaging = firebase.messaging();
        
        messaging.onMessage((payload) => {
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
                alert("✅ परवानगी मिळाली! आता फायरबेस टोकन जनरेट होत आहे...");
                
                navigator.serviceWorker.register(SW_URL).then((registration) => {
                    // 🔥 टोकन मागण्याआधी फायरबेसला सर्व्हिस वर्कर वापरण्याची सक्ती करणे 🔥
                    messaging.useServiceWorker(registration);
                    
                    messaging.getToken({ 
                        vapidKey: 'BD_Yh5b8O50dK9N7X7v3U6rYnZk-4H2g-9Vq-2X2k3E1t3H8h0n_8Zz3XjXQv5b8O50dK9N7X7v3U6rYnZk'
                    })
                    .then((currentToken) => {
                        if (currentToken) {
                            localStorage.setItem('fcm_device_token', currentToken);
                            let userMobile = localStorage.getItem('current_user_mobile');
                            
                            if (userMobile && userMobile !== "+91 9XXXX XXXX" && typeof db !== 'undefined') {
                                db.collection("users").doc(userMobile).set({
                                    fcmToken: currentToken, 
                                    role: localStorage.getItem('current_logged_in_role') || 'unknown',
                                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                                }, { merge: true })
                                .then(() => {
                                    alert("🎉 सक्सेस! FCM Token डेटाबेसमध्ये सेव्ह झाले!");
                                })
                                .catch(err => alert("❌ डेटाबेस एरर: " + err.message));
                            } else {
                                alert("⚠️ मोबाईल नंबर सापडला नाही. एकदा लॉग-आऊट करून पुन्हा लॉग-इन करा.");
                            }
                        } else {
                            alert("⚠️ टोकन जनरेट झाले नाही.");
                        }
                    }).catch((err) => {
                        alert("❌ Token Error: " + err.message);
                    });
                }).catch(err => alert("❌ Service Worker Load Error: " + err.message));
                
            } else {
                alert("⚠️ तुम्ही नोटिफिकेशनची परवानगी नाकारली आहे.");
            }
        });
    } else {
        alert("⚠️ इंटरनेट कनेक्शन किंवा फायरबेसमध्ये अडचण आहे.");
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
    
    notifBox.innerHTML = `
        <div style="font-size: 14px; font-weight: 900; margin-bottom: 4px; display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">🔔</span> ${title}
        </div>
        <div style="font-size: 12px; font-weight: 600; opacity:0.95;">${body}</div>
    `;
    
    document.body.appendChild(notifBox);
    setTimeout(() => notifBox.remove(), 5000);
}
