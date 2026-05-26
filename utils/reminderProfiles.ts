import { ReminderProfile } from "@/types/task";
import { LocationTask } from "@/types/task";

export function getStrongestReminderProfile(
  tasks: LocationTask[]
): ReminderProfile {
  if (
    tasks.some((task) => task.reminderProfile === "persistent")
  ) {
    return "persistent";
  }

  if (
    tasks.some((task) => task.reminderProfile === "normal")
  ) {
    return "normal";
  }

  return "gentle";
}

export function getReminderProfileLabel(
  profile: ReminderProfile
) {
  if (profile === "persistent") {
    return "Persistent";
  }

  if (profile === "normal") {
    return "Normal";
  }

  return "Gentle";
}

export function getReminderProfileDescription(
  profile: ReminderProfile
) {
  if (profile === "persistent") {
    return "Frequent reminders while tasks remain unfinished.";
  }

  if (profile === "normal") {
    return "Balanced reminders while you are at the place.";
  }

  return "Arrival and departure reminders only.";
}