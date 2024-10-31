import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getReactNativePersistence,initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2y58-gP85Rs_owDGS2FxYe1KMJkJntes",
  authDomain: "metroti-cfc7c.firebaseapp.com",
  projectId: "metroti-cfc7c",
  storageBucket: "metroti-cfc7c.appspot.com",
  messagingSenderId: "1092468547300",
  appId: "1:1092468547300:web:a8a72dae2b6ad75a1e56f1",
  measurementId: "G-WMGPDCWFZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);