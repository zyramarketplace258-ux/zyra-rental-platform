import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your specific Zyra Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLEqbyWTfSVnXtaAwvsVpmhIcQQUV8fJw",
  authDomain: "zyra-rental.firebaseapp.com",
  projectId: "zyra-rental",
  storageBucket: "zyra-rental.firebasestorage.app",
  messagingSenderId: "25135401671",
  appId: "1:25135401671:web:5f06b0f4e28c126b798ce2",
  measurementId: "G-0MK23WXN5R"
};

// Initialize the Firebase App
const app = initializeApp(firebaseConfig);

// Export the tools so we can use them in our pages (Login, Upload, etc.)
export const auth = getAuth(app);      // For OTP/Login
export const db = getFirestore(app);   // For Listings & Chat 
export const storage = getStorage(app); // For CNIC & Item Images 

export default app;