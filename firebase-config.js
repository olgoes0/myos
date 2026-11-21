// === KONFIGURACJA FIREBASE (publiczna, to nie jest sekret) ===
// Bezpieczeństwo danych zapewniają reguły Firestore, a nie ten klucz.
// Nie wpisuj tutaj kluczy Admin SDK ani plików serviceAccount.json.
export const firebaseConfig = {
  apiKey: "AIzaSyBP6hR00EcDnnC0CJRA6aSQqV3LE3UXlk0",
  authDomain: "my-os-2c0bf.firebaseapp.com",
  projectId: "my-os-2c0bf",
  storageBucket: "my-os-2c0bf.firebasestorage.app",
  messagingSenderId: "755770625728",
  appId: "1:755770625728:web:04fe72b298a72811a1a725",
  measurementId: "G-Y5HNVY2SF7"
};

// Public VAPID key from Firebase Console → Project settings → Cloud Messaging.
// Fill this in before enabling web push on Android; it is not a private server key.
export const webPushVapidKey = "";

// Set true only after the scheduled Cloud Function is deployed to this Firebase project.
export const pushBackendDeployed = false;
