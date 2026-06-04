import * as Location from "expo-location";

import { addSavedPlace } from "@/storage/placeStorage";
import { addSavedTask } from "@/storage/taskStorage";
import { SavedPlace } from "@/types/place";
import {
  LocationTask,
  ReminderProfile,
  TaskContextType,
  TaskPriority,
} from "@/types/task";
import { registerSavedPlaceGeofences } from "@/utils/backgroundGeofencing";

export type FieldSeedTaskPayload = {
  externalSourceId?: string;
  title: string;
  notes?: string;
  placeName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
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
      !place.archivedAt &&
      place.name.trim().toLowerCase() === payload.placeName.trim().toLowerCase()
  );
}

async function geocodeAddress(address?: string) {
  if (!address?.trim()) {
    return {};
  }

  try {
    const results = await Location.geocodeAsync(address.trim());

    if (results.length === 0) {
      return {};
    }

    return {
      latitude: results[0].latitude,
      longitude: results[0].longitude,
    };
  } catch (error) {
    console.log("FieldSeed geocoding failed:", error);
    return {};
  }
}

async function createTemporaryPlaceForFieldSeedTask(payload: FieldSeedTaskPayload) {
  const geocodedCoordinates =
    typeof payload.latitude === "number" && typeof payload.longitude === "number"
      ? {
          latitude: payload.latitude,
          longitude: payload.longitude,
        }
      : await geocodeAddress(payload.address);

  const temporaryPlace: SavedPlace = {
    id: `fieldseed-place-${Date.now()}`,
    name: payload.placeName.trim() || "FieldSeed Temporary Site",
    description: "Temporary place created from a FieldSeed work task.",
    address: payload.address?.trim() || payload.placeName.trim(),
    latitude: geocodedCoordinates.latitude,
    longitude: geocodedCoordinates.longitude,
    radiusMeters: payload.radiusMeters ?? 250,
    type: "temporary",
    category: payload.contextType === "work" ? "work" : "custom",
    icon: "🛠️",
    defaultTravelMode: "driving",
    createdAt: new Date().toISOString(),
  };

  await addSavedPlace(temporaryPlace);

  if (
    typeof temporaryPlace.latitude === "number" &&
    typeof temporaryPlace.longitude === "number"
  ) {
    await registerSavedPlaceGeofences().catch((error) => {
      console.log("Could not register FieldSeed temporary place geofence:", error);
    });
  }

  return temporaryPlace;
}

export type FieldSeedTaskImportResult =
  | {
      imported: true;
      task: LocationTask;
      place: SavedPlace;
      createdTemporaryPlace: boolean;
    }
  | {
      imported: false;
      reason: string;
    };

export async function importFieldSeedTask(
  places: SavedPlace[],
  payload: FieldSeedTaskPayload
): Promise<FieldSeedTaskImportResult> {
  if (!payload.title.trim()) {
    return {
      imported: false,
      reason: "FieldSeed task is missing a title.",
    };
  }

  if (!payload.placeName.trim()) {
    return {
      imported: false,
      reason: "FieldSeed task is missing a place name.",
    };
  }

  const existingPlace = resolvePlaceForFieldSeedTask(places, payload);
  const place = existingPlace ?? (await createTemporaryPlaceForFieldSeedTask(payload));

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
    place,
    createdTemporaryPlace: !existingPlace,
  };
}
