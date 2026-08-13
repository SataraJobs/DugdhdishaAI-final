// firebase_config.js

// 🔥 १. Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBiqbXWMpD19u-RaYZEUicHmxO8JRk_Glo",
  authDomain: "dugdhdishaai.firebaseapp.com",
  projectId: "dugdhdishaai",
  storageBucket: "dugdhdishaai.firebasestorage.app",
  messagingSenderId: "1059551640041",
  appId: "1:1059551640041:web:3fc95210b95b1319c6b378",
  measurementId: "G-6TFEJKBVFL"
};

// 🔥 २. फायरबेस Initialize करणे (जर आधीच केले नसेल तर)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 🔥 ३. संपूर्ण ॲपसाठी ग्लोबल व्हेरिएबल्स (Global Variables)
// (var वापरल्यामुळे इतर पेजेसवर एरर येणार नाही)
var auth = firebase.auth();
var db = firebase.firestore();

// 🔥 ४. युजर लॉगिन आहे की नाही ते बॅकग्राउंडला तपासणे
auth.onAuthStateChanged((user) => {
    if (user) {
        localStorage.setItem("is_logged_in", "true");
        if(user.phoneNumber) {
            let mobileOnly = user.phoneNumber.replace("+91", "");
            localStorage.setItem("current_user_mobile", mobileOnly);
        }
    } else {
        localStorage.setItem("is_logged_in", "false");
    }
});
