// src/userStorage.js
// Utilidad para guardar y leer configuraciones y estado del timer
// de localStorage o Firebase según el usuario esté logueado o no.

import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";
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

// Guarda la configuración (focusMinutes, breakMinutes, longBreakMinutes, intervals)
export async function saveConfig(config) {
  const user = auth.currentUser;
  if (user) {
    await setDoc(doc(db, "pomodoroConfig", user.uid), config);
  } else {
    localStorage.setItem("focusMinutes", config.focusMinutes);
    localStorage.setItem("breakMinutes", config.breakMinutes);
    if (config.longBreakMinutes !== undefined) {
      localStorage.setItem("longBreakMinutes", config.longBreakMinutes);
    }
    if (config.intervals !== undefined) {
      localStorage.setItem("intervals", config.intervals);
    }
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
    const longBrk = localStorage.getItem("longBreakMinutes");
    const intervals = localStorage.getItem("intervals");
    return {
      focusMinutes: focus !== null && !isNaN(Number(focus)) ? Number(focus) : 15,
      breakMinutes: brk !== null && !isNaN(Number(brk)) ? Number(brk) : 5,
      longBreakMinutes: longBrk !== null && !isNaN(Number(longBrk)) ? Number(longBrk) : 15,
      intervals: intervals !== null && !isNaN(Number(intervals)) ? Number(intervals) : 4,
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
    endTime: null,
    cycleCount: 0
  }));
}

// Guarda una nueva tarea en Firestore
export async function addTask({ name, detail, pomodoros }) {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");

  // Obtener el mayor taskOrder actual
  const q = query(
    collection(db, "tasks"),
    where("uid", "==", user.uid),
    orderBy("taskOrder", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  let lastOrder = 0;
  if (!snap.empty) {
    lastOrder = snap.docs[0].data().taskOrder || 0;
  }

  // Guardar la nueva tarea con isComplete: false
  await addDoc(collection(db, "tasks"), {
    uid: user.uid,
    name,
    detail,
    pomodoros,
    isComplete: false,
    taskOrder: lastOrder + 1,
    createdAt: Date.now()
  });
}

// Actualiza el estado de completitud de una tarea
export async function setTaskComplete(taskId, isComplete) {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  const taskRef = doc(db, "tasks", taskId);
  await setDoc(taskRef, { isComplete }, { merge: true });
}