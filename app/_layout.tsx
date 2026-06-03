import { useEffect } from "react";
import { Stack } from "expo-router";

import { registerSavedPlaceGeofences } from "@/utils/backgroundGeofencing";
import { useFieldSeedDeepLinkImport } from "@/utils/fieldSeedDeepLinkBridge";

export default function RootLayout() {
  useFieldSeedDeepLinkImport();

  useEffect(() => {
    registerSavedPlaceGeofences().catch((error) => {
      console.log("Could not register background geofences:", error);
    });
  }, []);

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