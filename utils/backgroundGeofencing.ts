import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { getSavedPlaces } from "@/storage/placeStorage";
import { getSavedTasks } from "@/storage/taskStorage";
import { SavedPlace } from "@/types/place";
import { LocationTask } from "@/types/task";
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

  await updatePlacePresence(place.id, isArrival);

  await sendPlaceEventNotification(
    place.name,
    isArrival ? "arrival" : "departure",
    activeTasks.length
  );
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
  const geofenceReadyPlaces = getGeofenceReadyPlaces(places);

  if (geofenceReadyPlaces.length === 0) {
    await Location.stopGeofencingAsync(BACKGROUND_GEOFENCING_TASK).catch(() => {
      // Ignore if no task is currently registered.
    });

    return {
      enabled: true,
      registeredRegions: 0,
      message: "No saved places have coordinates yet.",
    };
  }

  const regions: Location.LocationRegion[] = geofenceReadyPlaces.map((place) => ({
    identifier: place.id,
    latitude: place.latitude as number,
    longitude: place.longitude as number,
    radius: Math.max(place.radiusMeters, 100),
    notifyOnEnter: true,
    notifyOnExit: true,
  }));

  await Location.startGeofencingAsync(BACKGROUND_GEOFENCING_TASK, regions);

  return {
    enabled: true,
    registeredRegions: regions.length,
    message: `Monitoring ${regions.length} saved place${
      regions.length === 1 ? "" : "s"
    } in the background.`,
  };
}

export async function stopSavedPlaceGeofences(): Promise<GeofenceSyncResult> {
  await Location.stopGeofencingAsync(BACKGROUND_GEOFENCING_TASK).catch(() => {
    // Ignore if no task is currently registered.
  });

  return {
    enabled: false,
    registeredRegions: 0,
    message: "Background geofencing stopped.",
  };
}

export async function isBackgroundGeofencingRegistered() {
  return Location.hasStartedGeofencingAsync(BACKGROUND_GEOFENCING_TASK);
}
