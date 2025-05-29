import { Card, Heading, Text, Flex, Button, Dialog, Separator } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import TaskDetail from "./TaskDetail";
import { setTaskComplete } from "./userStorage";
import { RowsIcon, TrashIcon, LapTimerIcon, Pencil1Icon } from "@radix-ui/react-icons"
import "./firebase";

// dnd-kit imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Componente principal de la lista de tareas
function TaskList({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null); // NUEVO

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const db = getFirestore();
    async function fetchTasks() {
      const q = query(
        collection(db, "tasks"),
        where("uid", "==", user.uid),
        orderBy("taskOrder", "asc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(data);
      setLoading(false);
    }
    fetchTasks();
  }, [user, openDialog]);

  const handleCheck = async (id, checked) => {
    setTasks(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, isComplete: checked } : task
      )
    );
    try {
      await setTaskComplete(id, checked);
    } catch (e) {
      setTasks(tasks =>
        tasks.map(task =>
          task.id === id ? { ...task, isComplete: !checked } : task
        )
      );
      alert("No se pudo actualizar la tarea en la base de datos.");
    }
  };

  const handleDeleteCompleted = async () => {
    if (!user) return;
    setDeleting(true);
    const db = getFirestore();
    const completedTasks = tasks.filter(task => task.isComplete);
    for (const task of completedTasks) {
      await deleteDoc(doc(db, "tasks", task.id));
    }
    setTasks(tasks => tasks.filter(task => !task.isComplete));
    setDeleting(false);
  };

  const handleDeleteTask = async (taskId) => {
    if (!user) return;
    setDeletingTaskId(taskId);
    const db = getFirestore();
    await deleteDoc(doc(db, "tasks", taskId));
    setTasks(tasks => tasks.filter(task => task.id !== taskId));
    setDeletingTaskId(null);
  };

  // dnd-kit setup
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);
    const newTasks = arrayMove(tasks, oldIndex, newIndex);

    // Actualiza el taskOrder localmente
    const updatedTasks = newTasks.map((task, idx) => ({
      ...task,
      taskOrder: idx + 1
    }));
    setTasks(updatedTasks);

    // Actualiza en Firestore en batch
    const db = getFirestore();
    const batch = writeBatch(db);
    updatedTasks.forEach(task => {
      batch.update(doc(db, "tasks", task.id), { taskOrder: task.taskOrder });
    });
    await batch.commit();
  };

  return (
    <Card>
      <Flex direction="column">
        <Heading style={{ width: "100%" }}>Tus tareas</Heading>
        <Flex gap="2" py="4" px="0">
          <TaskDetailDialog
            open={openDialog}
            setOpen={open => {
              setOpenDialog(open);
              if (!open) setEditingTask(null);
            }}
            tasks={tasks}
            editingTask={editingTask}
          />
          <Button
            color="red"
            variant="soft"
            loading={deleting}
            onClick={handleDeleteCompleted}
            disabled={deleting}
          >
            Eliminar completadas
          </Button>
        </Flex>
      </Flex>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <Flex direction="column" gap="2" mb="3">
            {loading ? (
              <Text size="3" color="gray">Cargando tareas...</Text>
            ) : tasks.length === 0 ? (
              <Text size="3" color="gray">No tienes tareas guardadas.</Text>
            ) : (
              tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  id={task.id}
                  task={task}
                  onCheck={handleCheck}
                  deleting={deleting}
                  onDelete={handleDeleteTask}
                  deletingTaskId={deletingTaskId}
                  onEdit={task => {
                    setEditingTask(task);
                    setOpenDialog(true);
                  }}
                />
              ))
            )}
          </Flex>
        </SortableContext>
      </DndContext>
    </Card>
  );
}

// Sortable card using dnd-kit
function SortableTaskCard({ id, task, onCheck, deleting, onDelete, deletingTaskId, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const [isHovered, setIsHovered] = useState(false);

  const style = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: 12,
    opacity: deleting ? 0.5 : 1,
    userSelect: "none",
    background: isDragging ? "#e0ffe0" : undefined,
    boxShadow: isDragging ? "0 4px 16px rgba(0,0,0,0.12)" : undefined,
    zIndex: isDragging ? 100 : undefined,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      variant="surface"
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Flex align="center" gap="2" justify="between">
        <Flex direction="column" style={{ flex: 1 }}>
          <Flex align="center" gap="2">
            <input
              type="checkbox"
              checked={!!task.isComplete}
              onChange={e => onCheck(task.id, e.target.checked)}
              style={{ marginRight: 8 }}
            />
            <Text size="3" style={{ textDecoration: task.isComplete ? "line-through" : "none" }}>
              {task.name}
            </Text>
            <Separator orientation="vertical" />
            <LapTimerIcon />
            <Text size="2">{task.pomodoros}</Text>
          </Flex>

          {task.detail && (
            <Text
              size="2"
              color="gray"
              my="2"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "pre-line"
              }}
            >
              {task.detail}
            </Text>
          )}
          
        </Flex>
        <Flex grow="1" gap="2" px="1" direction="row" style={{ alignItems: "center", justifyContent: "center" }}>
          {/* Botón icono a la izquierda del RowsIcon, solo visible en hover */}
          {isHovered && (
            <>
              <Button
                size="1"
                variant="ghost"
                color="blue"
                style={{ padding: 0, minWidth: 24, minHeight: 24, marginRight: 4 }}
                tabIndex={-1}
                onClick={() => onEdit(task)}
              >
                <Pencil1Icon />
              </Button>
              <Button
                size="1"
                variant="ghost"
                color="red"
                style={{ padding: 0, minWidth: 24, minHeight: 24, marginRight: 4 }}
                tabIndex={-1}
                onClick={() => onDelete(task.id)}
                loading={deletingTaskId === task.id}
                disabled={deletingTaskId === task.id}
              >
                <TrashIcon />
              </Button>
            </>
          )}
          <Button
            size="1"
            variant="ghost"
            style={{ padding: 0, minWidth: 24, minHeight: 24, cursor: "grab" }}
            {...attributes}
            {...listeners}
          >
            <RowsIcon />
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}

// Componente para el Dialog de agregar/editar tarea
function TaskDetailDialog({ open, setOpen, tasks, editingTask }) {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="solid" onClick={() => setOpen(true)}>
          Agregar Tarea
        </Button>
      </Dialog.Trigger>
      <TaskDetail
        onClose={() => setOpen(false)}
        open={open}
        tasks={tasks}
        editingTask={editingTask}
      />
    </Dialog.Root>
  );
}

export default TaskList;
