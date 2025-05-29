import { Dialog, TextField, Button, Flex, TextArea } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { addTask } from "./userStorage";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import NumberSelector from "./NumberSelector";

function TaskDetail({ onClose, open, tasks = [], editingTask }) {
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [pomodoros, setPomodoros] = useState("1");
  const [saving, setSaving] = useState(false);

  // Limpia los campos cada vez que se abre el dialog y setea el nombre por defecto usando las tareas de la base de datos
  useEffect(() => {
    if (open) {
      if (editingTask) {
        setName(editingTask.name || "");
        setDetail(editingTask.detail || "");
        setPomodoros(String(editingTask.pomodoros ?? "0"));
      } else {
        const nextOrder = (tasks && Array.isArray(tasks)) ? tasks.length + 1 : 1;
        setName(`Tarea #${nextOrder}`);
        setDetail("");
        setPomodoros("0");
      }
    }
  }, [open, tasks.length, editingTask]);

  // Nueva función para actualizar tarea
  const updateTask = async (id, data) => {
    const db = getFirestore();
    const ref = doc(db, "tasks", id);
    await updateDoc(ref, data);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          name,
          detail,
          pomodoros: Number(pomodoros)
        });
        onClose();
      } else {
        await addTask({
          name,
          detail,
          pomodoros: Number(pomodoros)
        });
        onClose();
      }
    } catch (e) {
      alert("Error al guardar la tarea: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Content style={{ maxWidth: 360 }}>
      <Dialog.Title>{editingTask ? "Editar tarea" : "Agregar nueva tarea"}</Dialog.Title>
      <Flex direction="column" gap="3" mb="4">
        <TextField.Root
          placeholder="Nombre de la tarea..."
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <TextArea
          placeholder="Detalle de la tarea..."
          value={detail}
          onChange={e => setDetail(e.target.value)}
        />
        <NumberSelector
          label="Pomodoros"
          value={pomodoros}
          setValue={setPomodoros}
          disabled={saving}
        />
      </Flex>
      <Flex justify="end" gap="3">
        <Dialog.Close>
          <Button variant="soft" color="gray" onClick={onClose} disabled={saving}>Cancelar</Button>
        </Dialog.Close>
        <Button
          variant="solid"
          onClick={handleSave}
          disabled={saving || !name}
          loading={saving}
        >
          Guardar
        </Button>
      </Flex>
    </Dialog.Content>
  );
}

export default TaskDetail;
