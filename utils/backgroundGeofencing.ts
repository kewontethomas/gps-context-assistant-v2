import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { getSavedPlaces } from "@/storage/placeStorage";
import { getSavedTasks } from "@/storage/taskStorage";
import { SavedPlace } from "@/types/place";
import { LocationTask } from "@/types/task";
import {
  canNotifyForPlace,
  markPlaceNotified,
} from "@/utils/notificationCooldowns";
import { sendPlaceEventNotification } from "@/utils/notifications";
import { updatePlacePresence } from "@/utils/placePresence";

export const BACKGROUND_GEOFENCING_TASK =
  "gps-context-assistant:background-geofencing";

export type GeofenceSyncResult = {
  enabled: boolean;
  registeredRegions: number;
  message: string;
};

function getGeofenceReadyPlaces(places: SavedPlace[]) {
  return places.filter((place) => {
    return (
      !place.archivedAt &&
      typeof place.latitude === "number" &&
      typeof place.longitude === "number" &&
      place.radiusMeters > 0
    );
  });
}

function getActiveTasksForPlace(tasks: LocationTask[], placeId: string) {
  return tasks.filter(
    (task) => task.placeId === placeId && task.status === "active"
  );
}

async function handleBackgroundGeofenceEvent(
  eventType: Location.GeofencingEventType,
  region: Location.LocationRegion
) {
  const places = await getSavedPlaces();
  const tasks = await getSavedTasks();

  const place = places.find((savedPlace) => savedPlace.id === region.identifier);

  if (!place) {
    return;
  }

  const activeTasks = getActiveTasksForPlace(tasks, place.id);

  if (activeTasks.length === 0) {
    return;
  }

  const isArrival = eventType === Location.GeofencingEventType.Enter;
  const isDeparture = eventType === Location.GeofencingEventType.Exit;

  if (!isArrival && !isDeparture) {
    return;
  }

  const presenceChange = await updatePlacePresence(place.id, isArrival);

  if (presenceChange.eventType === "none") {
    return;
  }

  const canNotify = await canNotifyForPlace(place.id);

  if (!canNotify) {
    return;
  }

  await sendPlaceEventNotification(
    place.name,
    presenceChange.eventType,
    activeTasks.length
  );

  await markPlaceNotified(place.id);
}

if (!TaskManager.isTaskDefined(BACKGROUND_GEOFENCING_TASK)) {
  TaskManager.defineTask(BACKGROUND_GEOFENCING_TASK, async ({ data, error }) => {
    if (error) {
      console.log("Background geofencing error:", error.message);
      return;
    }

    const geofenceData = data as {
      eventType: Location.GeofencingEventType;
      region: Location.LocationRegion;
    };

    if (!geofenceData?.region) {
      return;
    }

    await handleBackgroundGeofenceEvent(
      geofenceData.eventType,
      geofenceData.region
    );
  });
}

export async function requestBackgroundLocationPermissions() {
  const foregroundPermission = await Location.requestForegroundPermissionsAsync();

  if (foregroundPermission.status !== "granted") {
    return false;
  }

  const backgroundPermission = await Location.requestBackgroundPermissionsAsync();

  return backgroundPermission.status === "granted";
}

export async function registerSavedPlaceGeofences(): Promise<GeofenceSyncResult> {
  const hasPermission = await requestBackgroundLocationPermissions();

  if (!hasPermission) {
    return {
      enabled: false,
      registeredRegions: 0,
      message: "Background location permission was not granted.",
    };
  }

  const places = await getSavedPlaces();
  const readyPlaces = getGeofenceReadyPlaces(places);

  if (readyPlaces.length === 0) {
    await Location.stopGeofencingAsync(BACKGROUND_GEOFENCING_TASK).catch(
      () => {}
    );

    return {
      enabled: false,
      registeredRegions: 0,
      message: "No saved places have coordinates yet.",
    };
  }

  const regions = readyPlaces.map((place) => ({
    identifier: place.id,
    latitude: place.latitude as number,
    longitude: place.longitude as number,
    radius: Math.max(place.radiusMeters, 100),
    notifyOnEnter: true,
    notifyOnExit: true,
  }));

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_GEOFENCING_TASK
  );

  if (isRegistered) {
    await Location.stopGeofencingAsync(BACKGROUND_GEOFENCING_TASK);
  }

  await Location.startGeofencingAsync(BACKGROUND_GEOFENCING_TASK, regions);

  return {
    enabled: true,
    registeredRegions: regions.length,
    message: `Monitoring ${regions.length} saved place${
      regions.length === 1 ? "" : "s"
    }.`,
  };
}

export async function stopSavedPlaceGeofences(): Promise<GeofenceSyncResult> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_GEOFENCING_TASK
  );

  if (isRegistered) {
    await Location.stopGeofencingAsync(BACKGROUND_GEOFENCING_TASK);
  }

  return {
    enabled: false,
    registeredRegions: 0,
    message: "Background place monitoring stopped.",
  };
}

export async function getBackgroundGeofenceStatus(): Promise<GeofenceSyncResult> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_GEOFENCING_TASK
  );

  const places = await getSavedPlaces();
  const readyPlaces = getGeofenceReadyPlaces(places);

  return {
    enabled: isRegistered,
    registeredRegions: isRegistered ? readyPlaces.length : 0,
    message: isRegistered
      ? `Background monitoring is active for ${readyPlaces.length} place${
          readyPlaces.length === 1 ? "" : "s"
        }.`
      : "Background monitoring is not active.",
  };
}

export async function isBackgroundGeofencingRegistered() {
  return TaskManager.isTaskRegisteredAsync(BACKGROUND_GEOFENCING_TASK);
}
