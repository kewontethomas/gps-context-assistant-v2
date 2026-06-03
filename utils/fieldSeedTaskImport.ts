import { addSavedTask } from "@/storage/taskStorage";
import { SavedPlace } from "@/types/place";
import {
  LocationTask,
  ReminderProfile,
  TaskContextType,
  TaskPriority,
} from "@/types/task";

export type FieldSeedTaskPayload = {
  externalSourceId?: string;
  title: string;
  notes?: string;
  placeName: string;
  priority?: TaskPriority;
  contextType?: TaskContextType;
  reminderProfile?: ReminderProfile;
  dueDate?: string;
  dueTime?: string;
};

export function resolvePlaceForFieldSeedTask(
  places: SavedPlace[],
  payload: FieldSeedTaskPayload
) {
  return places.find(
    (place) =>
      place.name.trim().toLowerCase() === payload.placeName.trim().toLowerCase()
  );
}

export async function importFieldSeedTask(
  places: SavedPlace[],
  payload: FieldSeedTaskPayload
) {
  const place = resolvePlaceForFieldSeedTask(places, payload);

  if (!place) {
    return {
      imported: false,
      reason: "No matching place found for FieldSeed task.",
    };
  }

  const reminderProfile = payload.reminderProfile ?? "persistent";

  const task: LocationTask = {
    id: `fieldseed-task-${Date.now()}`,
    placeId: place.id,
    title: payload.title.trim(),
    notes: payload.notes?.trim() || undefined,
    status: "active",
    dueDate: payload.dueDate ?? "Next arrival",
    dueTime: payload.dueTime,
    arriveByTime: undefined,
    recurrence: "none",
    travelMode: place.defaultTravelMode,
    travelBufferMinutes: 10,
    notifyBeforeLeave: false,
    notifyOnArrival: true,
    notifyWhileThere: reminderProfile !== "gentle",
    notifyEveryMinutes:
      reminderProfile === "persistent"
        ? 15
        : reminderProfile === "normal"
          ? 30
          : undefined,
    notifyOnDeparture: true,
    notifyBeforeDue: false,
    createdAt: new Date().toISOString(),
    reminderProfile,
    source: "fieldseed",
    priority: payload.priority ?? "high",
    contextType: payload.contextType ?? "work",
    externalSourceId: payload.externalSourceId,
  };

  await addSavedTask(task);

  return {
    imported: true,
    task,
  };
}
