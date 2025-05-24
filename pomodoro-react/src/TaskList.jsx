import { Card, Heading, Text } from "@radix-ui/themes";

function TaskList({ user }) {
  return (
    <Card style={{ width: 340, margin: "0 auto 2rem auto", padding: 20 }}>
      <Heading size="4" mb="2">Tus tareas</Heading>
      <Text size="3" color="gray">Aquí podrás ver y gestionar tus tareas (próximamente).</Text>
    </Card>
  );
}

export default TaskList;
