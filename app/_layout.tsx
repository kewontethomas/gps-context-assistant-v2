import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen
        name="add-place"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="reschedule-task"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="task-details"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="place-details"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="fieldseed-inbox"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}