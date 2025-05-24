import { useEffect, useState } from "react";
import { Dialog, Button, Flex, Text } from "@radix-ui/themes";

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
        <Text as="div" size="4" mb="4">Configurar tiempos</Text>
        <Flex direction="column" gap="3" mb="4">
          <label>
            <Text as="span" size="3">Tiempo de concentración (minutos)</Text>
            <input
              type="number"
              min={1}
              value={localFocus}
              onChange={e => setLocalFocus(Number(e.target.value))}
              style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </label>
          <label>
            <Text as="span" size="3">Tiempo de descanso (minutos)</Text>
            <input
              type="number"
              min={1}
              value={localBreak}
              onChange={e => setLocalBreak(Number(e.target.value))}
              style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </label>
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
