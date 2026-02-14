/**
 * Firebase Configuration and Initialization
 * Initializes Firebase App, Firestore, and Authentication
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCPFaNfzt86Z5BUmygw5UW-3qq5YENsjg",
  authDomain: "broubook.firebaseapp.com",
  projectId: "broubook",
  storageBucket: "broubook.firebasestorage.app",
  messagingSenderId: "78971303279",
  appId: "1:78971303279:web:96048ecefe0f8c89a9249a",
  measurementId: "G-LMY1XF3R70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Enable offline persistence for PWA support
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.warn('Firebase persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser does not support offline persistence
    console.warn('Firebase persistence not supported in this browser');
  }
});

export { app, db, auth };
