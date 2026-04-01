import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDkA149q4bq9MohFJYbyAMok_hF_ezXZsE",
  authDomain: "wisely-93688.firebaseapp.com",
  projectId: "wisely-93688",
  storageBucket: "wisely-93688.firebasestorage.app",
  messagingSenderId: "371802334079",
  appId: "1:371802334079:web:914749f196a7626c20b04a",
  measurementId: "G-5WL2L7KTYQ",
};

// ✅ Prevent re-initialization (VERY IMPORTANT for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export default app;
