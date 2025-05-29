import { Dialog, TextField, Button, Flex, Text, Select } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { addTask } from "./userStorage";

function TaskDetail({ onClose, open }) {
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [pomodoros, setPomodoros] = useState("1");
  const [saving, setSaving] = useState(false);

  // Limpia los campos cada vez que se abre el dialog
  useEffect(() => {
    if (open) {
      setName("");
      setDetail("");
      setPomodoros("1");
    }
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await addTask({
        name,
        detail,
        pomodoros: Number(pomodoros)
      });
      onClose();
    } catch (e) {
      alert("Error al guardar la tarea: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Content style={{ maxWidth: 360 }}>
      <Dialog.Title>Agregar nueva tarea</Dialog.Title>
      <Flex direction="column" gap="3" mb="4">
        <TextField.Root
          placeholder="Nombre de la tarea..."
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <TextField.Root
          placeholder="Detalle de la tarea..."
          value={detail}
          onChange={e => setDetail(e.target.value)}
        />
        <Flex direction="column" gap="1">
          <label htmlFor="pomodoros-select" style={{ fontSize: 14, marginBottom: 2 }}>Pomodoros</label>
          <Select.Root value={pomodoros} onValueChange={setPomodoros} id="pomodoros-select">
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="1">1</Select.Item>
              <Select.Item value="2">2</Select.Item>
              <Select.Item value="3">3</Select.Item>
              <Select.Item value="4">4</Select.Item>
              <Select.Item value="5">5</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>
      <Flex justify="end" gap="3">
        <Dialog.Close>
          <Button variant="soft" color="gray" onClick={onClose} disabled={saving}>Cancelar</Button>
        </Dialog.Close>
        <Button variant="solid" color="green" onClick={handleSave} disabled={saving || !name}>
          Guardar
        </Button>
      </Flex>
    </Dialog.Content>
  );
}

export default TaskDetail;
