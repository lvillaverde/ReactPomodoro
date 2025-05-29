import { useEffect, useState } from "react";
import { Dialog, Button, Flex, Text, TextField } from "@radix-ui/themes";

function ConfigDialog({ open, onOpenChange, focusMinutes, breakMinutes, setFocusMinutes, setBreakMinutes }) {
  // Estados locales para los inputs
  const [localFocus, setLocalFocus] = useState(focusMinutes);
  const [localBreak, setLocalBreak] = useState(breakMinutes);

  // Al abrir el dialog, sincroniza los valores locales con los actuales
  useEffect(() => {
    if (open) {
      setLocalFocus(focusMinutes);
      setLocalBreak(breakMinutes);
    }
  }, [open, focusMinutes, breakMinutes]);

  // Al guardar, propaga los valores locales y deja que el componente padre los persista (no guardes en localStorage aquí)
  function handleSave() {
    setFocusMinutes(localFocus);
    setBreakMinutes(localBreak);
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
