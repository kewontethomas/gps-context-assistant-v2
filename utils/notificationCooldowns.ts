import AsyncStorage from "@react-native-async-storage/async-storage";

import { getAppSettings } from "@/storage/appSettingsStorage";

const COOLDOWN_KEY = "gps-context-assistant:notification-cooldowns";

type CooldownMap = {
  [placeId: string]: string;
};

async function getCooldowns(): Promise<CooldownMap> {
  const storedCooldowns = await AsyncStorage.getItem(COOLDOWN_KEY);

  if (!storedCooldowns) {
    return {};
  }

  return JSON.parse(storedCooldowns);
}

async function saveCooldowns(cooldowns: CooldownMap) {
  await AsyncStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
}

export async function canNotifyForPlace(placeId: string) {
  const settings = await getAppSettings();
  const cooldownMinutes = settings.notificationCooldownMinutes;

  const cooldowns = await getCooldowns();
  const lastNotifiedAt = cooldowns[placeId];

  if (!lastNotifiedAt) {
    return true;
  }

  const lastTime = new Date(lastNotifiedAt).getTime();
  const now = Date.now();

  const minutesSinceLastNotification = (now - lastTime) / 1000 / 60;

  return minutesSinceLastNotification >= cooldownMinutes;
}

export async function markPlaceNotified(placeId: string) {
  const cooldowns = await getCooldowns();

  const updatedCooldowns: CooldownMap = {
    ...cooldowns,
    [placeId]: new Date().toISOString(),
  };

  await saveCooldowns(updatedCooldowns);
}