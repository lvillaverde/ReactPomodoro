import { useState, useRef, useEffect } from 'react'
import "@radix-ui/themes/styles.css";
import { Button, Flex, Card, Heading, Text, Progress } from "@radix-ui/themes";
import ConfigDialog from "./ConfigDialog";
import DingSound from "./assets/ding.wav";


function PomodoroTimer() {
    // Lee los valores iniciales de localStorage SOLO al primer render
    function getInitialFocus() {
        const stored = localStorage.getItem('focusMinutes');
        return stored !== null && !isNaN(Number(stored)) ? Number(stored) : 15;
    }
    function getInitialBreak() {
        const stored = localStorage.getItem('breakMinutes');
        return stored !== null && !isNaN(Number(stored)) ? Number(stored) : 5;
    }
    const [mode, setMode] = useState('focus') // 'focus' o 'break'
    const [isRunning, setIsRunning] = useState(false)
    const [focusMinutes, setFocusMinutes] = useState(getInitialFocus);
    const [breakMinutes, setBreakMinutes] = useState(getInitialBreak);
    const [timeLeft, setTimeLeft] = useState(() => getInitialFocus() * 60);
    const [openConfig, setOpenConfig] = useState(false)
    const lastTimestampRef = useRef(null)
    const rafRef = useRef(null)
    const endTimeRef = useRef(null)
    const pausedTimeRef = useRef(null)
    // Sonido ding
    const dingRef = useRef(null)

    // Formatea segundos a mm:ss
    function formatTime(secs) {
        const m = Math.floor(secs / 60)
        const s = secs % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    // Lógica principal del timer con soporte para segundo plano
    useEffect(() => {
        let intervalId = null;
        let rafId = null;
        let running = true;

        function tick() {
            if (!running) return;
            const now = Date.now();
            const secondsLeft = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
            setTimeLeft(secondsLeft);
            if (secondsLeft <= 0) {
                // Ding!
                if (dingRef.current) {
                    dingRef.current.currentTime = 0;
                    dingRef.current.play();
                }
                if (mode === 'focus') {
                    setMode('break');
                    setTimeLeft(breakMinutes * 60);
                    setIsRunning(true);
                    endTimeRef.current = Date.now() + breakMinutes * 60 * 1000;
                    saveTimerState({
                        mode: 'break',
                        isRunning: true,
                        timeLeft: breakMinutes * 60,
                        endTime: endTimeRef.current
                    });
                } else {
                    setMode('focus');
                    setTimeLeft(focusMinutes * 60);
                    setIsRunning(true);
                    endTimeRef.current = Date.now() + focusMinutes * 60 * 1000;
                    saveTimerState({
                        mode: 'focus',
                        isRunning: true,
                        timeLeft: focusMinutes * 60,
                        endTime: endTimeRef.current
                    });
                }
                return;
            }
            rafId = requestAnimationFrame(tick);
        }

        function tickInterval() {
            if (!running) return;
            const now = Date.now();
            const secondsLeft = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
            setTimeLeft(secondsLeft);
            if (secondsLeft <= 0) {
                // Ding!
                if (dingRef.current) {
                    dingRef.current.currentTime = 0;
                    dingRef.current.play();
                }
                if (mode === 'focus') {
                    setMode('break');
                    setTimeLeft(breakMinutes * 60);
                    setIsRunning(true);
                    endTimeRef.current = Date.now() + breakMinutes * 60 * 1000;
                    saveTimerState({
                        mode: 'break',
                        isRunning: true,
                        timeLeft: breakMinutes * 60,
                        endTime: endTimeRef.current
                    });
                } else {
                    setMode('focus');
                    setTimeLeft(focusMinutes * 60);
                    setIsRunning(true);
                    endTimeRef.current = Date.now() + focusMinutes * 60 * 1000;
                    saveTimerState({
                        mode: 'focus',
                        isRunning: true,
                        timeLeft: focusMinutes * 60,
                        endTime: endTimeRef.current
                    });
                }
            }
        }

        if (!isRunning) {
            running = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (intervalId) clearInterval(intervalId);
            return;
        }
        running = true;

        function handleVisibility() {
            if (document.visibilityState === 'visible') {
                if (intervalId) clearInterval(intervalId);
                rafId = requestAnimationFrame(tick);
                rafRef.current = rafId;
            } else {
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                intervalId = setInterval(tickInterval, 1000);
            }
        }

        document.addEventListener('visibilitychange', handleVisibility);

        if (document.visibilityState === 'visible') {
            rafId = requestAnimationFrame(tick);
            rafRef.current = rafId;
        } else {
            intervalId = setInterval(tickInterval, 1000);
        }

        return () => {
            running = false;
            document.removeEventListener('visibilitychange', handleVisibility);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (intervalId) clearInterval(intervalId);
        };
    }, [isRunning, mode, focusMinutes, breakMinutes])

    // Actualiza el <title> en tiempo real, incluso en segundo plano
    useEffect(() => {
        let raf;
        let interval;
        function updateTitle() {
            let displayTime = timeLeft;
            if (isRunning && endTimeRef.current) {
                const now = Date.now();
                displayTime = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
            }
            document.title = `${formatTime(displayTime)} - ${mode === 'focus' ? 'Concentración' : 'Descanso'}`;
        }
        function startActive() {
            updateTitle();
            raf = requestAnimationFrame(tickActive);
        }
        function tickActive() {
            updateTitle();
            raf = requestAnimationFrame(tickActive);
        }
        function startInactive() {
            updateTitle();
            interval = setInterval(updateTitle, 1000);
        }
        function handleVisibility() {
            if (document.visibilityState === 'visible') {
                if (interval) clearInterval(interval);
                startActive();
            } else {
                if (raf) cancelAnimationFrame(raf);
                startInactive();
            }
        }
        document.addEventListener('visibilitychange', handleVisibility);
        // Inicializa según el estado actual
        if (document.visibilityState === 'visible') {
            startActive();
        } else {
            startInactive();
        }
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            if (raf) cancelAnimationFrame(raf);
            if (interval) clearInterval(interval);
        };
    }, [isRunning, mode, timeLeft])

    // Sincronizar timeLeft cuando focusMinutes cambia y el modo es focus y no está corriendo
    useEffect(() => {
        if (mode === 'focus' && !isRunning) {
            setTimeLeft(focusMinutes * 60);
        }
        // eslint-disable-next-line
    }, [focusMinutes]);

    // Sincronizar timeLeft cuando breakMinutes cambia y el modo es break y no está corriendo
    useEffect(() => {
        if (mode === 'break' && !isRunning) {
            setTimeLeft(breakMinutes * 60);
        }
        // eslint-disable-next-line
    }, [breakMinutes]);

    // Guardar valores en localStorage cuando cambian
    useEffect(() => {
        localStorage.setItem('focusMinutes', focusMinutes);
        localStorage.setItem('breakMinutes', breakMinutes);
    }, [focusMinutes, breakMinutes]);

    // --- PERSISTENCIA DE ESTADO DEL TIMER ---
    function saveTimerState({
        mode,
        isRunning,
        timeLeft,
        endTime
    }) {
        localStorage.setItem('pomodoro-timer-state', JSON.stringify({
            mode,
            isRunning,
            timeLeft,
            endTime: isRunning ? endTime : null,
        }));
    }

    // Leer estado al iniciar
    useEffect(() => {
        const saved = localStorage.getItem('pomodoro-timer-state');
        if (saved) {
            try {
                const { mode: savedMode, isRunning: savedIsRunning, timeLeft: savedTimeLeft, endTime } = JSON.parse(saved);
                setMode(savedMode || 'focus');
                if (savedIsRunning && endTime) {
                    const now = Date.now();
                    const left = Math.max(0, Math.round((endTime - now) / 1000));
                    setTimeLeft(left);
                    if (left > 0) {
                        endTimeRef.current = now + left * 1000;
                        setIsRunning(true);
                    } else {
                        endTimeRef.current = null;
                        setIsRunning(false);
                    }
                } else if (typeof savedTimeLeft === 'number') {
                    setTimeLeft(savedTimeLeft);
                    endTimeRef.current = null;
                    setIsRunning(false);
                } else {
                    setTimeLeft(savedMode === 'break' ? breakMinutes * 60 : focusMinutes * 60);
                    endTimeRef.current = null;
                    setIsRunning(false);
                }
            } catch {}
        }
        // eslint-disable-next-line
    }, []);

    // Reiniciar
    function handleReset() {
        setIsRunning(false)
        setMode('focus')
        setTimeLeft(focusMinutes * 60)
        lastTimestampRef.current = null
        endTimeRef.current = null
        saveTimerState({
            mode: 'focus',
            isRunning: false,
            timeLeft: focusMinutes * 60,
            endTime: null
        });
    }

    // Play
    function handlePlay() {
        if (!isRunning) {
            endTimeRef.current = Date.now() + timeLeft * 1000;
            setIsRunning(true);
            saveTimerState({
                mode,
                isRunning: true,
                timeLeft,
                endTime: endTimeRef.current
            });
        }
    }

    // Pausa
    function handlePause() {
        if (isRunning && endTimeRef.current) {
            const now = Date.now();
            const secondsLeft = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
            setTimeLeft(secondsLeft);
            saveTimerState({
                mode,
                isRunning: false,
                timeLeft: secondsLeft,
                endTime: null
            });
        } else {
            saveTimerState({
                mode,
                isRunning: false,
                timeLeft,
                endTime: null
            });
        }
        setIsRunning(false);
    }

    // Next: cambia de modo manualmente
    function handleNext() {
        if (mode === 'focus') {
            setMode('break');
            setTimeLeft(breakMinutes * 60);
            setIsRunning(false);
            endTimeRef.current = null;
            saveTimerState({
                mode: 'break',
                isRunning: false,
                timeLeft: breakMinutes * 60,
                endTime: null
            });
        } else {
            setMode('focus');
            setTimeLeft(focusMinutes * 60);
            setIsRunning(false);
            endTimeRef.current = null;
            saveTimerState({
                mode: 'focus',
                isRunning: false,
                timeLeft: focusMinutes * 60,
                endTime: null
            });
        }
    }

    // Calcula el progreso (0 a 1)
    const totalTime = mode === 'focus' ? focusMinutes * 60 : breakMinutes * 60;
    const progress = timeLeft / totalTime;

    return (
        <Flex direction="column" align="center" justify="center" style={{ margin: '2rem auto', minHeight: 320 }}>
            <Card style={{ width: '100%', padding: 24 }}>
                <Heading align="center" size="4" mb="3">
                    {mode === 'focus' ? 'Modo concentración' : 'Descanso'}
                </Heading>
                <Text as="div" align="center" size="8" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, margin: '1.5rem 0' }}>
                    {formatTime(timeLeft)}
                </Text>
                <Progress value={progress * 100} max={100} size="3" style={{ margin: '1rem 0' }} />
                <audio ref={dingRef} src={DingSound} preload="auto" />
                <Flex gap="3" justify="center">
                    <Button size="1" onClick={handlePlay} disabled={isRunning} variant="solid" color="green">Play</Button>
                    <Button size="1" onClick={handlePause} disabled={!isRunning} variant="solid" color="orange">Pausa</Button>
                    <Button size="1" onClick={handleReset} variant="solid" color="red">Reiniciar</Button>
                    <Button size="1" onClick={handleNext} variant="solid" color="blue">Next</Button>
                    <Button size="1" variant="soft" onClick={() => setOpenConfig(true)}>Configurar</Button>
                </Flex>
                <ConfigDialog
                    open={openConfig}
                    onOpenChange={setOpenConfig}
                    focusMinutes={focusMinutes}
                    breakMinutes={breakMinutes}
                    setFocusMinutes={setFocusMinutes}
                    setBreakMinutes={setBreakMinutes}
                />
            </Card>
        </Flex>
    )
}

export default PomodoroTimer
