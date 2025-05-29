import { Flex, Text, Button, Card, Heading } from "@radix-ui/themes";

function UserPanel({ user, onLogin, onLogout }) {
    console.log(user);
    return (
        <Card>
            <Heading>
                Bienvenido
            </Heading>
            <Flex direction="column" gap="3" mb="4">
                {user ? (
                    <>
                        <Text size="3">Hola, {user.displayName || user.email}</Text>
                        <Button variant="soft" size="1" color="red" onClick={onLogout}>Cerrar sesión</Button>
                    </>
                ) : (
                    <Button size="1" color="green" onClick={onLogin}>Iniciar sesión con Google</Button>
                )}
            </Flex>
        </Card>

    );
}

export default UserPanel;
