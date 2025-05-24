import { useState, useEffect } from 'react'
import { Theme, Button, Flex, Text } from "@radix-ui/themes";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import resetLocalConfigAndState from "./userStorage";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PomodoroTimer from './PomodoroTimer'
import TaskList from './TaskList'

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let lastUser = null;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Solo recarga si el usuario pasó de logueado a deslogueado
      if (lastUser && !firebaseUser) {
        resetLocalConfigAndState();
        window.location.reload();
      }
      setUser(firebaseUser);
      lastUser = firebaseUser;
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // No es necesario llamar aquí a resetLocalConfigAndState, ya que se llama en el useEffect de arriba
    } catch (error) {
      alert("Error al cerrar sesión: " + error.message);
    }
  };

  return (
    <Theme appearance="light" accentColor="green">
      <Flex direction="column" align="center" gap="3" style={{ marginBottom: 16 }}>
        {user ? (
          <>
            <Text size="3">Hola, {user.displayName || user.email}</Text>
            <Button size="1" color="red" onClick={handleLogout}>Cerrar sesión</Button>
          </>
        ) : (
          <Button size="1" color="green" onClick={handleLogin}>Iniciar sesión con Google</Button>
        )}
      </Flex>
      {user && <TaskList user={user} />}
      <PomodoroTimer user={user} />
    </Theme>
  )
}

export default App
