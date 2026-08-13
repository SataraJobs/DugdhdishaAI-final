// fcm_setup.js (Final Fix for Firebase v8 Race Condition)

let customMessaging = null;

document.addEventListener("DOMContentLoaded", function() {
    if (typeof firebase !== 'undefined' && firebase.messaging && 'serviceWorker' in navigator) {
        
        // १. सर्वात आधी आपला अचूक सर्व्हिस वर्कर रजिस्टर करा (दुसरे काहीही करण्याआधी)
        navigator.serviceWorker.register('./firebase-messaging-sw.js')
        .then(function(registration) {
            console.log('✅ Service Worker Registered. Scope:', registration.scope);
            
            // २. सर्व्हिस वर्कर रजिस्टर झाल्यावरच Firebase Messaging सुरु करा
            customMessaging = firebase.messaging();
            
            // ३. फायरबेसला सक्तीने सांगा की हाच नवीन वर्कर वापरायचा आहे (डिफॉल्ट नाही)
            customMessaging.useServiceWorker(registration);
            
            // ४. आता Background मेसेज (onMessage) सुरु करा 
            customMessaging.onMessage((payload) => {
                if (payload.notification) {
                    showInAppNotification(payload.notification.title, payload.notification.body);
                }
            });
            
        }).catch(function(err) {
            console.error('Service Worker Error:', err);
        });
    }
});

// बटण दाबल्यावर चालणारे फंक्शन
function manualNotificationRequest() {
    // जर पेज लोड होऊन सर्व्हिस वर्कर सेट झाला नसेल, तर युजरला २ सेकंद थांबायला सांगणे
    if (!customMessaging) {
        alert("⚠️ कृपया पेज एकदा रिफ्रेश करा. बॅकग्राउंड सर्व्हिस अजून लोड होत आहे.");
        return;
    }

    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            alert("✅ परवानगी मिळाली! आता फायरबेस टोकन जनरेट होत आहे...");
            
            // आता थेट getToken वापरा (कारण आपण आधीच useServiceWorker सेट केले आहे)
            customMessaging.getToken({ 
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
            
        } else {
            alert("⚠️ तुम्ही नोटिफिकेशनची परवानगी नाकारली आहे.");
        }
    });
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
