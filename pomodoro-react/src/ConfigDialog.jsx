import { useEffect, useState } from "react";
import { Dialog, Button, Flex, Text, TextField } from "@radix-ui/themes";
import NumberSelector from "./NumberSelector";

function ConfigDialog({ open, onOpenChange, focusMinutes, breakMinutes, setFocusMinutes, setBreakMinutes, longBreakMinutes, setLongBreakMinutes, intervals, setIntervals }) {
  // Estados locales para los inputs
  const [localFocus, setLocalFocus] = useState(focusMinutes);
  const [localBreak, setLocalBreak] = useState(breakMinutes);
  const [localLongBreak, setLocalLongBreak] = useState(longBreakMinutes ?? 15);
  const [localIntervals, setLocalIntervals] = useState(intervals ?? 4);

  // Al abrir el dialog, sincroniza los valores locales con los actuales
  useEffect(() => {
    if (open) {
      setLocalFocus(focusMinutes);
      setLocalBreak(breakMinutes);
      setLocalLongBreak(longBreakMinutes ?? 15);
      setLocalIntervals(intervals ?? 4);
    }
  }, [open, focusMinutes, breakMinutes, longBreakMinutes, intervals]);

  // Al guardar, propaga los valores locales y deja que el componente padre los persista (no guardes en localStorage aquí)
  function handleSave() {
    setFocusMinutes(localFocus);
    setBreakMinutes(localBreak);
    setLongBreakMinutes && setLongBreakMinutes(localLongBreak);
    setIntervals && setIntervals(Number(localIntervals));
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 340 }}>
        <Dialog.Title>Configurar tiempos</Dialog.Title>
        <Text as="div" size="4" mb="4">Configurar tiempos</Text>
        <Flex direction="column" gap="3" mb="4">
          <Flex direction="column" gap="1">
            <Text as="label" size="3" htmlFor="focus-minutes-input">
              Tiempo de concentración (minutos)
            </Text>
            <TextField.Root
              id="focus-minutes-input"
              type="number"
              min={1}
              value={localFocus}
              onChange={e => setLocalFocus(Number(e.target.value))}
            />
          </Flex>
          <Flex direction="column" gap="1">
            <Text as="label" size="3" htmlFor="break-minutes-input">
              Tiempo de descanso (minutos)
            </Text>
            <TextField.Root
              id="break-minutes-input"
              type="number"
              min={1}
              value={localBreak}
              onChange={e => setLocalBreak(Number(e.target.value))}
            />
          </Flex>
          <Flex direction="column" gap="1">
            <Text as="label" size="3" htmlFor="long-break-minutes-input">
              Descanso largo (minutos)
            </Text>
            <TextField.Root
              id="long-break-minutes-input"
              type="number"
              min={1}
              value={localLongBreak}
              onChange={e => setLocalLongBreak(Number(e.target.value))}
            />
          </Flex>
          <Flex direction="column" gap="1">
            <NumberSelector
              label="Intervalos antes de descanso largo"
              value={localIntervals}
              setValue={setLocalIntervals}
              disabled={false}
            />
          </Flex>
        </Flex>
        <Flex justify="end" gap="3">
          <Dialog.Close>
            <Button variant="soft" color="gray">Cancelar</Button>
          </Dialog.Close>
          <Button variant="solid" color="green" onClick={handleSave}>Guardar</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default ConfigDialog;
