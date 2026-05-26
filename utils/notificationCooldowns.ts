import AsyncStorage from "@react-native-async-storage/async-storage";

const COOLDOWN_KEY = "gps-context-assistant:notification-cooldowns";

type CooldownMap = {
  [placeId: string]: string;
};

const DEFAULT_COOLDOWN_MINUTES = 15;

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
  const cooldowns = await getCooldowns();
  const lastNotifiedAt = cooldowns[placeId];

  if (!lastNotifiedAt) {
    return true;
  }

  const lastTime = new Date(lastNotifiedAt).getTime();
  const now = Date.now();

  const minutesSinceLastNotification = (now - lastTime) / 1000 / 60;

  return minutesSinceLastNotification >= DEFAULT_COOLDOWN_MINUTES;
}

export async function markPlaceNotified(placeId: string) {
  const cooldowns = await getCooldowns();

  const updatedCooldowns: CooldownMap = {
    ...cooldowns,
    [placeId]: new Date().toISOString(),
  };

  await saveCooldowns(updatedCooldowns);
}