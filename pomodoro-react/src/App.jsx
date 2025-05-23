import { useState } from 'react'
import { Theme } from "@radix-ui/themes";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PomodoroTimer from './PomodoroTimer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Theme appearance="light" accentColor="green">
      <PomodoroTimer />
    </Theme>
  )
}

export default App
