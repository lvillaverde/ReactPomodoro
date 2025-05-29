import { useState, useRef, useEffect } from 'react'
import "@radix-ui/themes/styles.css";
import { Button, Flex, Card, Heading, Text, Progress, Skeleton } from "@radix-ui/themes";
import ConfigDialog from "./ConfigDialog";
import DingSound from "./assets/ding.wav";
import { saveTimerState, loadTimerState, saveConfig, loadConfig } from "./userStorage";
import { PlayIcon, ReloadIcon, PauseIcon, TrackNextIcon, GearIcon } from "@radix-ui/react-icons"

function PomodoroTimer({ user }) {
    // Inicializa los valores como null para evitar mostrar datos hasta que se cargue Firestore/localStorage
    const [mode, setMode] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [focusMinutes, setFocusMinutes] = useState(null);
    const [breakMinutes, setBreakMinutes] = useState(null);
    const [longBreakMinutes, setLongBreakMinutes] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [openConfig, setOpenConfig] = useState(false)
    const [loading, setLoading] = useState(true);
    const [intervals, setIntervals] = useState(null);
    const [cycleCount, setCycleCount] = useState(0); // Nuevo: cuenta de ciclos focus/break
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
                // --- Lógica de cambio de modo ---
                if (mode === 'focus') {
                    if (cycleCount < intervals - 1) {
                        // Break normal
                        setMode('break');
                        setTimeLeft(breakMinutes * 60);
                        setIsRunning(true);
                        endTimeRef.current = Date.now() + breakMinutes * 60 * 1000;
                        setCycleCount(cycleCount + 1);
                        saveTimerStateWrapper({
                            mode: 'break',
                            isRunning: true,
                            timeLeft: breakMinutes * 60,
                            endTime: endTimeRef.current,
                            cycleCount: cycleCount + 1
                        });
                    } else {
                        // Long break
                        setMode('longBreak');
                        setTimeLeft(longBreakMinutes * 60);
                        setIsRunning(true);
                        endTimeRef.current = Date.now() + longBreakMinutes * 60 * 1000;
                        setCycleCount(0);
                        saveTimerStateWrapper({
                            mode: 'longBreak',
                            isRunning: true,
                            timeLeft: longBreakMinutes * 60,
                            endTime: endTimeRef.current,
                            cycleCount: 0
                        });
                    }
                } else if (mode === 'break') {
                    // Después de break normal, vuelve a focus
                    setMode('focus');
                    setTimeLeft(focusMinutes * 60);
                    setIsRunning(true);
                    endTimeRef.current = Date.now() + focusMinutes * 60 * 1000;
                    saveTimerStateWrapper({
                        mode: 'focus',
                        isRunning: true,
                        timeLeft: focusMinutes * 60,
                        endTime: endTimeRef.current,
                        cycleCount
                    });
                } else if (mode === 'longBreak') {
                    // Después de longBreak, vuelve a focus y ciclo 0
                    setMode('focus');
                    setTimeLeft(focusMinutes * 60);
                    setIsRunning(true);
                    endTimeRef.current = Date.now() + focusMinutes * 60 * 1000;
                    setCycleCount(0);
                    saveTimerStateWrapper({
                        mode: 'focus',
                        isRunning: true,
                        timeLeft: focusMinutes * 60,
                        endTime: endTimeRef.current,
                        cycleCount: 0
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
                if (dingRef.current) {
                    dingRef.current.currentTime = 0;
                    dingRef.current.play();
                }
                if (mode === 'focus') {
                    if (cycleCount < intervals - 1) {
                        setMode('break');
                        setTimeLeft(breakMinutes * 60);
                        setIsRunning(true);
                        endTimeRef.current = Date.now() + breakMinutes * 60 * 1000;
                        setCycleCount(cycleCount + 1);
                        saveTimerStateWrapper({
                            mode: 'break',
                            isRunning: true,
                            timeLeft: breakMinutes * 60,
                            endTime: endTimeRef.current,
                            cycleCount: cycleCount + 1
                        });
                    } else {
                        setMode('longBreak');
                        setTimeLeft(longBreakMinutes * 60);
                        setIsRunning(true);
                        endTimeRef.current = Date.now() + longBreakMinutes * 60 * 1000;
                        setCycleCount(0);
                        saveTimerStateWrapper({
                            mode: 'longBreak',
                            isRunning: true,
                            timeLeft: longBreakMinutes * 60,
                            endTime: endTimeRef.current,
                            cycleCount: 0
                        });
                    }
                } else if (mode === 'break') {
                    setMode('focus');
                    setTimeLeft(focusMinutes * 60);
                    setIsRunning(true);
                    endTimeRef.current = Date.now() + focusMinutes * 60 * 1000;
                    saveTimerStateWrapper({
                        mode: 'focus',
                        isRunning: true,
                        timeLeft: focusMinutes * 60,
                        endTime: endTimeRef.current,
                        cycleCount
                    });
                } else if (mode === 'longBreak') {
                    setMode('focus');
                    setTimeLeft(focusMinutes * 60);
                    setIsRunning(true);
                    endTimeRef.current = Date.now() + focusMinutes * 60 * 1000;
                    setCycleCount(0);
                    saveTimerStateWrapper({
                        mode: 'focus',
                        isRunning: true,
                        timeLeft: focusMinutes * 60,
                        endTime: endTimeRef.current,
                        cycleCount: 0
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
    }, [isRunning, mode, focusMinutes, breakMinutes, longBreakMinutes, intervals, cycleCount])

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
        if (loading) return;
        if (mode === 'focus' && !isRunning) {
            setTimeLeft(focusMinutes * 60);
        }
        // eslint-disable-next-line
    }, [focusMinutes, loading]);

    // Sincronizar timeLeft cuando breakMinutes cambia y el modo es break y no está corriendo
    useEffect(() => {
        if (loading) return;
        if (mode === 'break' && !isRunning) {
            setTimeLeft(breakMinutes * 60);
        }
        // eslint-disable-next-line
    }, [breakMinutes, loading]);

    // Guardar valores en storage cuando cambian
    useEffect(() => {
        if (loading) return;
        saveConfig({ focusMinutes, breakMinutes, longBreakMinutes, intervals });
    }, [focusMinutes, breakMinutes, longBreakMinutes, intervals, loading]);

    // --- PERSISTENCIA DE ESTADO DEL TIMER ---
    async function saveTimerStateWrapper({ mode, isRunning, timeLeft, endTime, cycleCount: cc }) {
        await saveTimerState({
            mode,
            isRunning,
            timeLeft,
            endTime: isRunning ? endTime : null,
            cycleCount: typeof cc === "number" ? cc : cycleCount
        });
    }

    // Al montar o cuando cambia el usuario, cargar configuración y estado del timer
    useEffect(() => {
        async function loadAll() {
            setLoading(true);

            // Detener cualquier timer en curso al cambiar usuario y guardar el estado detenido
            setIsRunning(false);
            endTimeRef.current = null;
            lastTimestampRef.current = null;
            // Guarda el timer detenido en la base o localStorage
            await saveTimerState({
                mode: mode ?? 'focus',
                isRunning: false,
                timeLeft: timeLeft ?? 15 * 60,
                endTime: null,
                cycleCount: 0
            });

            const config = await loadConfig();
            let loadedFocus = config?.focusMinutes ?? 15;
            let loadedBreak = config?.breakMinutes ?? 5;
            let loadedLongBreak = config?.longBreakMinutes ?? 15;
            let loadedIntervals = config?.intervals ?? 4;
            setFocusMinutes(loadedFocus);
            setBreakMinutes(loadedBreak);
            setLongBreakMinutes(loadedLongBreak);
            setIntervals(loadedIntervals);

            const saved = await loadTimerState();
            if (saved) {
                const { mode: savedMode, isRunning: savedIsRunning, timeLeft: savedTimeLeft, endTime, cycleCount: savedCycleCount } = saved;
                setMode(savedMode || 'focus');
                setCycleCount(typeof savedCycleCount === "number" ? savedCycleCount : 0);
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
                    setTimeLeft((savedMode === 'break' ? loadedBreak : loadedFocus) * 60);
                    endTimeRef.current = null;
                    setIsRunning(false);
                }
            } else {
                setMode('focus');
                setTimeLeft(loadedFocus * 60);
                setCycleCount(0);
                endTimeRef.current = null;
                setIsRunning(false);
            }
            setLoading(false);
        }
        loadAll();
        // eslint-disable-next-line
    }, [user]);

    // Reiniciar
    function handleReset() {
        setIsRunning(false)
        setMode('focus')
        setTimeLeft(focusMinutes * 60)
        setCycleCount(0)
        lastTimestampRef.current = null
        endTimeRef.current = null
        saveTimerStateWrapper({
            mode: 'focus',
            isRunning: false,
            timeLeft: focusMinutes * 60,
            endTime: null,
            cycleCount: 0
        });
    }

    // Play
    function handlePlay() {
        if (!isRunning) {
            endTimeRef.current = Date.now() + timeLeft * 1000;
            setIsRunning(true);
            saveTimerStateWrapper({
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
            saveTimerStateWrapper({
                mode,
                isRunning: false,
                timeLeft: secondsLeft,
                endTime: null
            });
        } else {
            saveTimerStateWrapper({
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
            if (cycleCount < intervals - 1) {
                setMode('break');
                setTimeLeft(breakMinutes * 60);
                setIsRunning(false);
                endTimeRef.current = null;
                setCycleCount(cycleCount + 1);
                saveTimerStateWrapper({
                    mode: 'break',
                    isRunning: false,
                    timeLeft: breakMinutes * 60,
                    endTime: null,
                    cycleCount: cycleCount + 1
                });
            } else {
                setMode('longBreak');
                setTimeLeft(longBreakMinutes * 60);
                setIsRunning(false);
                endTimeRef.current = null;
                setCycleCount(0);
                saveTimerStateWrapper({
                    mode: 'longBreak',
                    isRunning: false,
                    timeLeft: longBreakMinutes * 60,
                    endTime: null,
                    cycleCount: 0
                });
            }
        } else if (mode === 'break') {
            setMode('focus');
            setTimeLeft(focusMinutes * 60);
            setIsRunning(false);
            endTimeRef.current = null;
            saveTimerStateWrapper({
                mode: 'focus',
                isRunning: false,
                timeLeft: focusMinutes * 60,
                endTime: null,
                cycleCount
            });
        } else if (mode === 'longBreak') {
            setMode('focus');
            setTimeLeft(focusMinutes * 60);
            setIsRunning(false);
            endTimeRef.current = null;
            setCycleCount(0);
            saveTimerStateWrapper({
                mode: 'focus',
                isRunning: false,
                timeLeft: focusMinutes * 60,
                endTime: null,
                cycleCount: 0
            });
        }
    }

    // Calcula el progreso (0 a 1)
    const totalTime =
        mode === 'focus'
            ? focusMinutes * 60
            : mode === 'break'
            ? breakMinutes * 60
            : longBreakMinutes * 60;
    const progressRaw = timeLeft && totalTime ? (timeLeft / totalTime) : 0;
    const progressValue = Number.isFinite(progressRaw) ? Math.max(0, Math.min(100, progressRaw * 100)) : 0;

    if (loading || mode === null || focusMinutes === null || breakMinutes === null || timeLeft === null) {
        return (
            <Flex direction="column" align="center" justify="center">
                <Card style={{ width: '100%', padding: 24 }}>
                    <div style={{ background: "#eee", borderRadius: 8, height: 32, width: 180, margin: "0 auto", marginBottom: 16 }} />
                    <div style={{ background: "#eee", borderRadius: 8, height: 56, width: 120, margin: "1.5rem auto" }} />
                    <div style={{ background: "#eee", borderRadius: 8, height: 16, width: "100%", margin: "1rem 0" }} />
                    <Flex gap="3" justify="center" style={{ marginTop: 24 }}>
                        <div style={{ background: "#eee", borderRadius: 8, height: 32, width: 60 }} />
                        <div style={{ background: "#eee", borderRadius: 8, height: 32, width: 60 }} />
                        <div style={{ background: "#eee", borderRadius: 8, height: 32, width: 60 }} />
                        <div style={{ background: "#eee", borderRadius: 8, height: 32, width: 60 }} />
                        <div style={{ background: "#eee", borderRadius: 8, height: 32, width: 90 }} />
                    </Flex>
                </Card>
            </Flex>
        );
    }

    return (
        <Card style={{ width: '100%' }}>
            <Flex direction="column">
                <Heading>
                    Pomodoro Timer
                </Heading>
                <Text as="div" align="center" size="8" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, margin: '1.5rem 0' }}>
                    {formatTime(timeLeft)}
                </Text>
                <Text as="div" align="center" size="3" style={{ marginBottom: '1rem' }}>
                    {mode === 'focus'
                        ? 'Modo concentración'
                        : mode === 'break'
                        ? 'Descanso corto'
                        : 'Descanso largo'}
                </Text>
                <Text as="div" align="center" size="2" style={{ marginBottom: '0.5rem', color: '#888' }}>
                    Ciclo: {mode === 'longBreak' ? intervals : cycleCount + (mode === 'break' ? 0 : 1)} / {intervals}
                </Text>
                <Progress value={progressValue} max={100} size="3" style={{ margin: '1rem 0' }} />
                <audio ref={dingRef} src={DingSound} preload="auto" />
                <Flex gap="3" justify="center">
                    <Button onClick={handlePlay} disabled={isRunning} variant="solid"><PlayIcon /></Button>
                    <Button onClick={handlePause} disabled={!isRunning} variant="solid"><PauseIcon /></Button>
                    <Button onClick={handleReset} variant="soft"><ReloadIcon /></Button>
                    <Button onClick={handleNext} variant="soft"><TrackNextIcon /></Button>
                    <Button variant="soft" onClick={() => setOpenConfig(true)}><GearIcon /></Button>
                </Flex>
                <ConfigDialog
                    open={openConfig}
                    onOpenChange={setOpenConfig}
                    focusMinutes={focusMinutes}
                    breakMinutes={breakMinutes}
                    setFocusMinutes={setFocusMinutes}
                    setBreakMinutes={setBreakMinutes}
                    longBreakMinutes={longBreakMinutes}
                    setLongBreakMinutes={setLongBreakMinutes}
                    intervals={intervals}
                    setIntervals={setIntervals}
                />
            </Flex>
        </Card>
    )
}

export default PomodoroTimer
