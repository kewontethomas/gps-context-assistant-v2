import AsyncStorage from "@react-native-async-storage/async-storage";
import { TravelMode } from "@/types/place";

const APP_SETTINGS_KEY = "gps-context-assistant:app-settings";

export type AppSettings = {
  defaultRadiusMeters: number;
  notificationCooldownMinutes: number;
  normalStayReminderMinutes: number;
  persistentStayReminderMinutes: number;
  defaultTravelMode: TravelMode;
};

export const defaultAppSettings: AppSettings = {
  defaultRadiusMeters: 150,
  notificationCooldownMinutes: 15,
  normalStayReminderMinutes: 30,
  persistentStayReminderMinutes: 15,
  defaultTravelMode: "driving",
};

export async function getAppSettings(): Promise<AppSettings> {
  const storedSettings = await AsyncStorage.getItem(APP_SETTINGS_KEY);

  if (!storedSettings) {
    return defaultAppSettings;
  }

  return {
    ...defaultAppSettings,
    ...JSON.parse(storedSettings),
  };
}

export async function saveAppSettings(settings: AppSettings) {
  await AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));

  return settings;
}

export async function updateAppSettings(updates: Partial<AppSettings>) {
  const currentSettings = await getAppSettings();

  const updatedSettings: AppSettings = {
    ...currentSettings,
    ...updates,
  };

  await saveAppSettings(updatedSettings);

  return updatedSettings;
}