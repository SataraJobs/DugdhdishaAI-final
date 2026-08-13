// fcm_setup.js (Nuclear Cleanup + Auto Registration)

document.addEventListener("DOMContentLoaded", function() {
    console.log("FCM Setup Loaded");
});

function manualNotificationRequest() {
    if (typeof firebase !== 'undefined' && firebase.messaging && 'serviceWorker' in navigator) {
        
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                alert("✅ परवानगी मिळाली! जुना लपलेला डेटा डिलीट करत आहे, कृपया ३ सेकंद थांबा...");
                
                // --- १. जुना कचरा (Old Subscriptions) डिलीट करण्याचे ब्रह्मास्त्र ---
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    let clearPromises = [];
                    for(let registration of registrations) {
                        let p = registration.pushManager.getSubscription().then(function(subscription) {
                            if (subscription) {
                                console.log("Deleting old push subscription...");
                                return subscription.unsubscribe(); // जुनी चुकीची Key डिलीट करणे
                            }
                        }).then(function() {
                            return registration.unregister(); // जुना वर्कर उडवणे
                        });
                        clearPromises.push(p);
                    }
                    return Promise.all(clearPromises);
                })
                .then(function() {
                    console.log("✅ All old data cleared successfully!");
                    
                    // --- २. आता पूर्णपणे फ्रेश सुरुवात करणे ---
                    const swUrl = './firebase-messaging-sw.js';
                    return navigator.serviceWorker.register(swUrl);
                })
                .then((registration) => {
                    return navigator.serviceWorker.ready;
                })
                .then((activeRegistration) => {
                    console.log('✅ Service Worker is Fresh and ACTIVE!');
                    const messaging = firebase.messaging();
                    
                    messaging.useServiceWorker(activeRegistration);
                    
                    // तुझी कालची अचूक Vapid Key
                    return messaging.getToken({ 
                        vapidKey: 'BD-7KyWdmNApZMLjzXAU46ImxoWcliNdJwKtpmwRPPuzpLz2en0mQ-fNcHMxM8WGONN2UnSOj6MPhTS4uJyWn2s'
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
                            alert("⚠️ मोबाईल नंबर सापडला नाही. एकदा लॉग-आऊट करून पुन्हा लॉग-इन करा.");
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
