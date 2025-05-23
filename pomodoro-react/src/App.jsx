import { useState, useEffect } from 'react'
import { Theme, Button, Flex, Text } from "@radix-ui/themes";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PomodoroTimer from './PomodoroTimer'

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
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
      <PomodoroTimer />
    </Theme>
  )
}

export default App
