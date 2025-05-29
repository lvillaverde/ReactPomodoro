import { useState, useEffect } from 'react'
import { Theme, Flex, Box, Grid, Container } from "@radix-ui/themes";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import resetLocalConfigAndState from "./userStorage";
import './App.css'
import PomodoroTimer from './PomodoroTimer'
import TaskList from './TaskList'
import UserPanel from "./UserPanel";

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
    <Theme scaling="110%" accentColor="lime" panelBackground="solid" radius="small" style={{ width: "100vw", maxWidth: "100vw", overflowX: "hidden" }} appearance="dark">
      <Flex direction="row" gap="3" mb="4" flexGrow="1" style={{ width: "100vw", maxWidth: "100vw", overflowX: "hidden" }} >
        <Box style={{ width: 240, minWidth: 0, flexShrink: 0 }}>
          <p>Publicidad</p>
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>

          <Container py="4">
            <Grid gap="4" columns="2">
              <Flex gap="4" direction="column">
                <UserPanel user={user} onLogin={handleLogin} onLogout={handleLogout} />
                <PomodoroTimer user={user} />
              </Flex>
              <Box>{user && <TaskList user={user} />}</Box>
            </Grid>
          </Container>
        </Box>
        <Box style={{ width: 240, minWidth: 0, flexShrink: 0 }}>
          <p>Publicidad</p>
        </Box>
      </Flex>
    </Theme >
  )
}

export default App
