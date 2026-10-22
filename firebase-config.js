// 1) Create a Firebase project at https://console.firebase.google.com/
// 2) Register a Web App and paste its config below.
// 3) Enable Authentication > Email/Password, Firestore Database and Storage.
// 4) Create the admin user in Authentication manually. Never place passwords here.
export const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
export const firebaseReady = !Object.values(firebaseConfig).some(v => v.startsWith("PASTE_"));