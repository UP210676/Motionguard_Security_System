import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      {/* Pantallas de autenticación */}
      <Stack.Screen
        name="login"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="register"
        options={{ headerShown: false }}
      />

      {/* Diseño con pestañas */}
      <Stack.Screen
        name="tabs"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
