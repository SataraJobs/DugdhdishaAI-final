// 🔥 FCM Setup & Initialization
document.addEventListener("DOMContentLoaded", function() {
  if (typeof firebase !== 'undefined' && firebase.messaging) {
    const messaging = firebase.messaging();
    
    // 1. Ask for Notification Permission
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        
        // 2. Get Registration Token
        messaging.getToken({ vapidKey: 'BD-7KyWdmNApZMLjzXAU46ImxoWcliNdJwKtpmwRPPuzpLz2en0mQ-fNcHMxM8WGONN2UnSOj6MPhTS4uJyWn2s' }).then((currentToken) => {
          if (currentToken) {
            console.log('FCM Token:', currentToken);
            // Save token to LocalStorage or Firebase for targeted notifications
            localStorage.setItem('fcm_device_token', currentToken);
            
            // Optional: Save token to Firestore if user is logged in
            let userMobile = localStorage.getItem('current_user_mobile');
            if (userMobile && typeof db !== 'undefined') {
              db.collection("fcm_tokens").doc(userMobile).set({
                token: currentToken,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
              }, { merge: true }).catch(err => console.error("Error saving token to firestore:", err));
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
    
    // 3. Handle Incoming Messages while App is in Foreground
    messaging.onMessage((payload) => {
      console.log('Message received in foreground. ', payload);
      if (payload.notification) {
        alert(`📢 ${payload.notification.title}\n${payload.notification.body}`);
      }
    });
  }
});