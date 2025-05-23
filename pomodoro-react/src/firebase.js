// src/firebase.js
// Configuración e inicialización de Firebase para React
// Reemplaza los valores de firebaseConfig con los de tu proyecto en la consola de Firebase

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBt35uHRMeDfoQ7a_QYrl2U-D4qQ5TV4Qo",
  authDomain: "on-focus-ea7e1.firebaseapp.com",
  projectId: "on-focus-ea7e1",
  storageBucket: "on-focus-ea7e1.firebasestorage.app",
  messagingSenderId: "749176608019",
  appId: "1:749176608019:web:dbb617276d145b4a6a36e6",
  measurementId: "G-6GDN3Z8D6T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
