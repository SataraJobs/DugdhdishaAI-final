// fcm_setup.js (Strict Registration to block 404 Error)

document.addEventListener("DOMContentLoaded", function() {
    // आपण पेज लोड झाल्यावर फायरबेसला काहीही करू देणार नाही. 
    // सगळं कंट्रोल मॅन्युअल बटणावर ठेवू.
});

function manualNotificationRequest() {
    if (typeof firebase !== 'undefined' && firebase.messaging) {
        
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                alert("✅ परवानगी मिळाली! आता फायरबेस टोकन जनरेट होत आहे...");
                
                // स्टेप १: सर्वात आधी आपण स्वतः ब्राउझरला अचूक लिंक देऊन वर्कर रजिस्टर करणार
                const swUrl = 'https://satarajobs.github.io/DugdhdishaAI-final/firebase-messaging-sw.js';
                
                navigator.serviceWorker.register(swUrl)
                .then((registration) => {
                    console.log('✅ Service Worker Registered Successfully!', registration);
                    
                    const messaging = firebase.messaging();
                    
                    // स्टेप २: 🔥 फायरबेसला सक्तीने सांगणे की हाच नवीन वर्कर वापरायचा! (तो दुसरीकडे जाणार नाही) 🔥
                    messaging.useServiceWorker(registration);
                    
                    // स्टेप ३: आता आपण त्याला टोकन मागायला लावणार
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
                        console.error("Token Error Details:", err);
                        alert("❌ Token Error: " + err.message);
                    });
                    
                }).catch((err) => {
                    console.error("Service Worker Error Details:", err);
                    alert("❌ Service Worker Load Error: " + err.message);
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
