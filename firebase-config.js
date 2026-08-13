// =========================================================
// 🔥 FIREBASE MASTER CONFIGURATION FILE 🔥
// =========================================================

// १. Firebase Config (तुमचे स्वतःचे Credentials)
const firebaseConfig = {
    apiKey: "AIzaSyBiqbXWMpD19u-RaYZEUicHmxO8JRk_Glo",
    authDomain: "dugdhdishaai.firebaseapp.com",
    projectId: "dugdhdishaai",
    storageBucket: "dugdhdishaai.firebasestorage.app",
    messagingSenderId: "1059551640041",
    appId: "1:1059551640041:web:3fc95210b95b1319c6b378",
    measurementId: "G-6TFEJKBVFL"
};

// २. फायरबेस Initialize करणे (जर आधीच केले नसेल तर)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase Initialized Successfully!");
}

// ३. संपूर्ण ॲपसाठी ग्लोबल व्हेरिएबल्स (Global Variables)
// (हे var वापरून बनवले आहेत जेणेकरून ॲपमधील कोणत्याही HTML पेजवरून db आणि auth वापरता येतील)
var auth = firebase.auth();
var db = firebase.firestore();

// ४. युजर लॉगिन आहे की नाही ते बॅकग्राउंडला तपासणे (Auth State Observer)
auth.onAuthStateChanged((user) => {
    if (user) {
        // युजर लॉगिन आहे, त्याचा डेटा LocalStorage मध्ये सेव्ह करा
        localStorage.setItem("is_logged_in", "true");
        if(user.phoneNumber) {
            let mobileOnly = user.phoneNumber.replace("+91", "");
            localStorage.setItem("current_user_mobile", mobileOnly);
            console.log("📱 Logged in Mobile:", mobileOnly);
        }
    } else {
        // युजर लॉगिन नाही
        localStorage.setItem("is_logged_in", "false");
    }
});
