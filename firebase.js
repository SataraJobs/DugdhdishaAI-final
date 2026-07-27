// firebase.js

// फायरबेस आधीच चालू असेल तर पुन्हा चालू करू नये म्हणून ही अट आहे
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const appAuth = firebase.auth();

// युजर ॲपमध्ये लॉगिन आहे की नाही, हे सतत चेक करणारा कोड
appAuth.onAuthStateChanged((user) => {
    if (user) {
        console.log("✅ युजर लॉगिन आहे: ", user.phoneNumber);
        localStorage.setItem("is_logged_in", "true");
        localStorage.setItem("current_user_mobile", user.phoneNumber);
    } else {
        console.log("❌ युजर लॉगिन नाही.");
        localStorage.setItem("is_logged_in", "false");
    }
});
