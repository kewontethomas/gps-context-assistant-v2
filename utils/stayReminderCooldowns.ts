import AsyncStorage from "@react-native-async-storage/async-storage";

import { getAppSettings } from "@/storage/appSettingsStorage";
import { ReminderProfile } from "@/types/task";

const STAY_REMINDER_KEY = "gps-context-assistant:stay-reminder-cooldowns";

type StayReminderCooldownMap = {
  [placeId: string]: string;
};

async function getCooldownMinutes(profile: ReminderProfile) {
  const settings = await getAppSettings();

  if (profile === "persistent") {
    return settings.persistentStayReminderMinutes;
  }

  if (profile === "normal") {
    return settings.normalStayReminderMinutes;
  }

  return Number.POSITIVE_INFINITY;
}

async function getCooldowns(): Promise<StayReminderCooldownMap> {
  const storedCooldowns = await AsyncStorage.getItem(STAY_REMINDER_KEY);

  if (!storedCooldowns) {
    return {};
  }

  return JSON.parse(storedCooldowns);
}

async function saveCooldowns(cooldowns: StayReminderCooldownMap) {
  await AsyncStorage.setItem(STAY_REMINDER_KEY, JSON.stringify(cooldowns));
}

export async function canSendStayReminder(
  placeId: string,
  profile: ReminderProfile
) {
  if (profile === "gentle") {
    return false;
  }

  const cooldowns = await getCooldowns();
  const lastReminderAt = cooldowns[placeId];

  if (!lastReminderAt) {
    return true;
  }

  const lastTime = new Date(lastReminderAt).getTime();
  const now = Date.now();

  const minutesSinceLastReminder = (now - lastTime) / 1000 / 60;
  const cooldownMinutes = await getCooldownMinutes(profile);

  return minutesSinceLastReminder >= cooldownMinutes;
}

export async function markStayReminderSent(placeId: string) {
  const cooldowns = await getCooldowns();

  await saveCooldowns({
    ...cooldowns,
    [placeId]: new Date().toISOString(),
  });
}