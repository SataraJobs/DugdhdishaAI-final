// fcm_setup.js (Final Fix for Active Service Worker)

document.addEventListener("DOMContentLoaded", function() {
    // आपण पेज लोड झाल्यावर काहीही करणार नाही. सर्व काम बटणावर होईल.
});

function manualNotificationRequest() {
    if (typeof firebase !== 'undefined' && firebase.messaging) {
        
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                alert("✅ परवानगी मिळाली! सिस्टीम तयार होत आहे, कृपया २ सेकंद थांबा...");
                
                // फाईलची लिंक (आता 404 एरर नाहीये, त्यामुळे हे काम करेल)
                const swUrl = './firebase-messaging-sw.js';
                
                navigator.serviceWorker.register(swUrl)
                .then((registration) => {
                    console.log('Service Worker Registered.');
                    
                    // 🔥 सर्वात महत्त्वाची ओळ: वर्कर पूर्णपणे 'Active' होण्याची वाट पाहणे 🔥
                    return navigator.serviceWorker.ready;
                })
                .then((activeRegistration) => {
                    console.log('Service Worker is now ACTIVE!');
                    const messaging = firebase.messaging();
                    
                    // आता फायरबेसला सांगणे की हा ॲक्टिव्ह वर्कर वापर
                    messaging.useServiceWorker(activeRegistration);
                    
                    // आता वर्कर ॲक्टिव्ह असल्यामुळे टोकन मागणे
                    return messaging.getToken({ 
                        vapidKey: 'BD_Yh5b8O50dK9N7X7v3U6rYnZk-4H2g-9Vq-2X2k3E1t3H8h0n_8Zz3XjXQv5b8O50dK9N7X7v3U6rYnZk'
                    });
                })
                .then((currentToken) => {
                    if (currentToken) {
                        localStorage.setItem('fcm_device_token', currentToken);
                        let userMobile = localStorage.getItem('current_user_mobile');
                        
                        if (userMobile && typeof db !== 'undefined') {
                            db.collection("users").doc(userMobile).set({
                                fcmToken: currentToken, 
                                role: localStorage.getItem('current_logged_in_role') || 'unknown',
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            }, { merge: true })
                            .then(() => {
                                alert("🎉 फायनल सक्सेस! FCM Token डेटाबेसमध्ये सेव्ह झाले! 🚀");
                            })
                            .catch(err => alert("❌ डेटाबेस एरर: " + err.message));
                        } else {
                            alert("⚠️ टोकन मिळाले पण मोबाईल नंबर सापडला नाही. एकदा लॉग-आऊट करून पुन्हा लॉग-इन करा.");
                        }
                    } else {
                        alert("⚠️ टोकन जनरेट झाले नाही.");
                    }
                })
                .catch((err) => {
                    alert("❌ Token Error: " + err.message);
                });
                
            } else {
                alert("⚠️ तुम्ही नोटिफिकेशनची परवानगी नाकारली आहे.");
            }
        });
    } else {
        alert("⚠️ इंटरनेट कनेक्शन किंवा फायरबेसमध्ये अडचण आहे.");
    }
}

// ॲपमध्ये असताना नोटिफिकेशन दाखवण्याचे फंक्शन
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
