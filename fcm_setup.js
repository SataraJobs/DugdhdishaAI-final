// fcm_setup.js (Final Perfected Architecture)

// १. ग्लोबल व्हेरिएबल बनवणे
let myMessaging = null; 

document.addEventListener("DOMContentLoaded", function() {
    // फक्त Firebase असेल तरच पुढे जा
    if (typeof firebase !== 'undefined' && firebase.messaging && 'serviceWorker' in navigator) {
        
        // २. सर्वात आधी आपला स्वतःचा Service Worker रजिस्टर करणे
        navigator.serviceWorker.register('./firebase-messaging-sw.js')
        .then(function(registration) {
            console.log('✅ Service Worker Registered. Scope:', registration.scope);
            
            // ३. वर्कर रजिस्टर झाल्यावरच Firebase Messaging सुरु करणे
            myMessaging = firebase.messaging();
            
            // ४. फायरबेसला सक्तीने सांगणे की हाच नवीन वर्कर वापरायचा आहे (डिफॉल्ट अजिबात नाही!)
            myMessaging.useServiceWorker(registration);
            
            // ५. हे सर्व सेट झाल्यावरच Notification Listener चालू करणे
            myMessaging.onMessage((payload) => {
                if (payload.notification) {
                    showInAppNotification(payload.notification.title, payload.notification.body);
                }
            });
            
        }).catch(function(err) {
            console.error('❌ Service Worker Error:', err);
        });
    }
});

// मॅन्युअल बटण क्लिक केल्यावर चालणारे फंक्शन
function manualNotificationRequest() {
    // जर बॅकग्राउंडला सर्व्हिस वर्कर सेट झाला नसेल, तर थांबवणे
    if (!myMessaging) {
        alert("⚠️ कृपया २ सेकंद थांबा किंवा पेज रिफ्रेश करा. बॅकग्राउंड सर्व्हिस लोड होत आहे.");
        return;
    }

    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            alert("✅ परवानगी मिळाली! आता फायरबेस टोकन जनरेट होत आहे...");
            
            // आता इथे परत रजिस्टर करण्याची गरज नाही, थेट getToken वापरा
            myMessaging.getToken({ 
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
