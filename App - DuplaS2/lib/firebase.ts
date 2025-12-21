import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase Configuration for DuplaS2 Mobile
const firebaseConfig = {
    apiKey: "AIzaSyC04yR8gk8mMGVKGB5L-1_-VJBhhDyEEfo",
    authDomain: "duplas2-app-v1.firebaseapp.com",
    projectId: "duplas2-app-v1",
    storageBucket: "duplas2-app-v1.firebasestorage.app",
    messagingSenderId: "430379674828",
    appId: "1:430379674828:web:97ed20140b7049e01ea669"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

// Initialize Auth (persistence handled automatically in Expo)
const auth = getAuth(app);

export { app, auth };
