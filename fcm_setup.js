// fcm_setup.js

document.addEventListener("DOMContentLoaded", function() {
    if (typeof firebase !== 'undefined' && firebase.messaging) {
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('firebase-messaging-sw.js')
            .then(function(registration) {
                console.log('Service Worker Registered');
            }).catch(function(err) {
                alert('❌ Service Worker Error: ' + err.message);
            });
        }

        const messaging = firebase.messaging();
        
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                
                messaging.getToken({ vapidKey: 'BD_Yh5b8O50dK9N7X7v3U6rYnZk-4H2g-9Vq-2X2k3E1t3H8h0n_8Zz3XjXQv5b8O50dK9N7X7v3U6rYnZk' })
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
                                // 🔥 यश मिळाले की हा मेसेज स्क्रीनवर येईल 🔥
                                alert("🎉 अभिनंदन! FCM Token यशस्विरित्या डेटाबेसमध्ये सेव्ह झाले आहे!");
                            })
                            .catch(err => alert("❌ डेटाबेस एरर: " + err.message));

                        } else {
                            alert("⚠️ युजरचा मोबाईल नंबर LocalStorage मध्ये सापडला नाही! कृपया एकदा लॉग-आऊट करून पुन्हा लॉग-इन करा.");
                        }
                    } else {
                        alert("⚠️ टोकन जनरेट झाले नाही. कृपया पुन्हा प्रयत्न करा.");
                    }
                }).catch((err) => {
                    alert("❌ Token Error: " + err.message);
                });
            } else {
                alert("⚠️ तुम्ही नोटिफिकेशनची परवानगी (Permission) दिलेली नाही!");
            }
        });
        
        messaging.onMessage((payload) => {
            if (payload.notification) {
                showInAppNotification(payload.notification.title, payload.notification.body);
            }
        });
    }
});

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
    
    notifBox.innerHTML = `
        <div style="font-size: 14px; font-weight: 900; margin-bottom: 4px; display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">🔔</span> ${title}
        </div>
        <div style="font-size: 12px; font-weight: 600; opacity:0.95;">${body}</div>
    `;
    
    document.body.appendChild(notifBox);

    setTimeout(() => {
        notifBox.remove();
    }, 5000);
}
