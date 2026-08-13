// firebase.js

// 🔥 १. तुझी फायरबेसची सिक्रेट माहिती (Firebase Config)
const firebaseConfig = {
    apiKey: "AIzaSyBiqbXWMpD19u-RaYZEUicHmxO8JRk_Glo",
    authDomain: "dugdhdishaai.firebaseapp.com",
    projectId: "dugdhdishaai",
    storageBucket: "dugdhdishaai.firebasestorage.app",
    messagingSenderId: "1059551640041",
    appId: "1:1059551640041:web:3fc95210b95b1319c6b378",
    measurementId: "G-6TFEJKBVFL"
};

// 🔥 २. फायरबेस आधीच चालू असेल तर पुन्हा चालू करू नये म्हणून ही अट आहे
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 🔥 ३. शॉर्टकट व्हेरिएबल्स (इतर सर्व पेजेसवर वापरण्यासाठी)
const appAuth = firebase.auth();
const db = firebase.firestore();

// 🔥 ४. युजर ॲपमध्ये लॉगिन आहे की नाही, हे सतत चेक करणारा कोड
appAuth.onAuthStateChanged((user) => {
    if (user) {
        // जर युजर फायरबेसच्या सिस्टीममध्ये लॉगिन असेल
        console.log("✅ युजर लॉगिन आहे: ", user.phoneNumber);
        localStorage.setItem("is_logged_in", "true");
        // जर मोबाईल नंबर असेल (उदा. +919876543210), तर तो सेव्ह करा
        if(user.phoneNumber) {
            // आपण +91 काढून फक्त १० अंकी नंबर सेव्ह करू शकतो
            let mobileOnly = user.phoneNumber.replace("+91", "");
            localStorage.setItem("current_user_mobile", mobileOnly);
        }
    } else {
        // जर युजरने लॉग-आऊट केले असेल
        console.log("❌ युजर लॉगिन नाही.");
        localStorage.setItem("is_logged_in", "false");
    }
});
