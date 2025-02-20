import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARKf53F1gWMLw68YHgCLG36zFL1Kunbv4",
  authDomain: "nutritech-13b33.firebaseapp.com",
  projectId: "nutritech-13b33",
  storageBucket: "nutritech-13b33.firebasestorage.app",
  messagingSenderId: "280634758010",
  appId: "1:280634758010:web:519cbe7079203c1b557cc3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db }; 