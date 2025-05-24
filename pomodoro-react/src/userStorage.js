// src/userStorage.js
// Utilidad para guardar y leer configuraciones y estado del timer
// de localStorage o Firebase según el usuario esté logueado o no.

import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import "./firebase"; // Asegúrate de inicializar Firebase en este archivo

const auth = getAuth();
const db = getFirestore();

// Guarda el estado del timer
export async function saveTimerState(state) {
  const user = auth.currentUser;
  if (user) {
    await setDoc(doc(db, "pomodoroTimerState", user.uid), state);
  } else {
    localStorage.setItem("pomodoro-timer-state", JSON.stringify(state));
  }
}

// Lee el estado del timer
export async function loadTimerState() {
  const user = auth.currentUser;
  if (user) {
    const snap = await getDoc(doc(db, "pomodoroTimerState", user.uid));
    return snap.exists() ? snap.data() : null;
  } else {
    const saved = localStorage.getItem("pomodoro-timer-state");
    return saved ? JSON.parse(saved) : null;
  }
}

// Guarda la configuración (focusMinutes, breakMinutes)
export async function saveConfig(config) {
  const user = auth.currentUser;
  if (user) {
    await setDoc(doc(db, "pomodoroConfig", user.uid), config);
  } else {
    localStorage.setItem("focusMinutes", config.focusMinutes);
    localStorage.setItem("breakMinutes", config.breakMinutes);
  }
}

// Lee la configuración
export async function loadConfig() {
  const user = auth.currentUser;
  if (user) {
    const snap = await getDoc(doc(db, "pomodoroConfig", user.uid));
    return snap.exists() ? snap.data() : null;
  } else {
    const focus = localStorage.getItem("focusMinutes");
    const brk = localStorage.getItem("breakMinutes");
    return {
      focusMinutes: focus !== null && !isNaN(Number(focus)) ? Number(focus) : 15,
      breakMinutes: brk !== null && !isNaN(Number(brk)) ? Number(brk) : 5,
    };
  }
}

// Limpia y resetea localStorage a valores por defecto al desloguear
export default function resetLocalConfigAndState() {
  localStorage.setItem("focusMinutes", 15);
  localStorage.setItem("breakMinutes", 5);
  localStorage.setItem("pomodoro-timer-state", JSON.stringify({
    mode: 'focus',
    isRunning: false,
    timeLeft: 15 * 60,
    endTime: null
  }));
}