// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBiqbXWMpD19u-RaYZEUicHmxO8JRk_Glo",
  authDomain: "dugdhdishaai.firebaseapp.com",
  projectId: "dugdhdishaai",
  storageBucket: "dugdhdishaai.firebasestorage.app",
  messagingSenderId: "1059551640041",
  appId: "1:1059551640041:web:3fc95210b95b1319c6b378",
  measurementId: "G-6TFEJKBVFL"
};

// फायरबेस Initialize करणे (जर आधीच केले नसेल तर)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
