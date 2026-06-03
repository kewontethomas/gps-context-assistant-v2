import { SavedPlace } from "@/types/place";
import { LocationTask } from "@/types/task";
import { CurrentLocation, calculateDistanceMeters } from "@/utils/location";
import { findNearbyTasks, NearbyTaskResult } from "@/utils/nearbyTasks";
import {
  canNotifyForPlace,
  markPlaceNotified,
} from "@/utils/notificationCooldowns";
import {
  sendNearbyTasksNotification,
  sendPlaceEventNotification,
  sendStillAtPlaceNotification,
} from "@/utils/notifications";
import { updatePlacePresence } from "@/utils/placePresence";
import { getStrongestReminderProfile } from "@/utils/reminderProfiles";
import {
  canSendStayReminder,
  markStayReminderSent,
} from "@/utils/stayReminderCooldowns";

export type ContextNotificationEvent =
  | "arrival"
  | "departure"
  | "stay"
  | "nearby"
  | "baseline"
  | "none";

export type ContextNotificationDecision = {
  placeId: string;
  placeName: string;
  eventType: ContextNotificationEvent;
  taskCount: number;
  notificationSent: boolean;
  reason: string;
};

export type ContextNotificationResult = {
  nearbyResults: NearbyTaskResult[];
  decisions: ContextNotificationDecision[];
  startupBaselineSynced: boolean;
};

let hasCompletedStartupBaseline = false;

function getActiveTasksForPlace(tasks: LocationTask[], placeId: string) {
  return tasks.filter(
    (task) => task.placeId === placeId && task.status === "active"
  );
}

async function trySendPlaceNotification(
  placeId: string,
  sendNotification: () => Promise<void>
) {
  const canNotify = await canNotifyForPlace(placeId);

  if (!canNotify) {
    return false;
  }

  await sendNotification();
  await markPlaceNotified(placeId);

  return true;
}

export async function evaluateContextNotifications(
  currentLocation: CurrentLocation,
  places: SavedPlace[],
  tasks: LocationTask[]
): Promise<ContextNotificationResult> {
  const decisions: ContextNotificationDecision[] = [];
  const isStartupBaseline = !hasCompletedStartupBaseline;
  let sentContextNotification = false;

  for (const place of places) {
    if (
      place.archivedAt ||
      typeof place.latitude !== "number" ||
      typeof place.longitude !== "number"
    ) {
      continue;
    }

    const distanceMeters = calculateDistanceMeters(
      currentLocation.latitude,
      currentLocation.longitude,
      place.latitude,
      place.longitude
    );

    const isInside = distanceMeters <= place.radiusMeters;
    const presenceChange = await updatePlacePresence(place.id, isInside, {
      silent: isStartupBaseline,
    });

    const activePlaceTasks = getActiveTasksForPlace(tasks, place.id);

    if (isStartupBaseline) {
      decisions.push({
        placeId: place.id,
        placeName: place.name,
        eventType: "baseline",
        taskCount: activePlaceTasks.length,
        notificationSent: false,
        reason: "Startup baseline synced silently.",
      });

      continue;
    }

    if (activePlaceTasks.length === 0) {
      decisions.push({
        placeId: place.id,
        placeName: place.name,
        eventType: "none",
        taskCount: 0,
        notificationSent: false,
        reason: "No active tasks for this place.",
      });
      continue;
    }

    if (
      presenceChange.eventType === "arrival" ||
      presenceChange.eventType === "departure"
    ) {
      const placeEventType = presenceChange.eventType;

      const sent = await trySendPlaceNotification(place.id, async () => {
        await sendPlaceEventNotification(
          place.name,
          placeEventType,
          activePlaceTasks.length
        );
      });

      if (sent) {
        sentContextNotification = true;
      }

      decisions.push({
        placeId: place.id,
        placeName: place.name,
        eventType: presenceChange.eventType,
        taskCount: activePlaceTasks.length,
        notificationSent: sent,
        reason: sent
          ? `Detected ${presenceChange.eventType}.`
          : `${presenceChange.eventType} detected, but cooldown is active.`,
      });

      continue;
    }

    if (presenceChange.currentStatus === "inside") {
      const strongestProfile = getStrongestReminderProfile(activePlaceTasks);
      const canRemind = await canSendStayReminder(place.id, strongestProfile);

      if (canRemind) {
        const sent = await trySendPlaceNotification(place.id, async () => {
          await sendStillAtPlaceNotification(
            place.name,
            activePlaceTasks.length
          );
        });

        if (sent) {
          await markStayReminderSent(place.id);
          sentContextNotification = true;
        }

        decisions.push({
          placeId: place.id,
          placeName: place.name,
          eventType: "stay",
          taskCount: activePlaceTasks.length,
          notificationSent: sent,
          reason: sent
            ? `Still inside place with ${strongestProfile} reminder profile.`
            : "Stay reminder was ready, but global cooldown is active.",
        });
      } else {
        decisions.push({
          placeId: place.id,
          placeName: place.name,
          eventType: "stay",
          taskCount: activePlaceTasks.length,
          notificationSent: false,
          reason: "Stay reminder cooldown is active or profile is gentle.",
        });
      }
    }
  }

  const nearbyResults = findNearbyTasks(
    currentLocation.latitude,
    currentLocation.longitude,
    places,
    tasks
  );

  if (!isStartupBaseline && !sentContextNotification) {
    for (const result of nearbyResults) {
      const canNotify = await canNotifyForPlace(result.place.id);

      if (canNotify) {
        await sendNearbyTasksNotification(
          result.place.name,
          result.tasks.length
        );

        await markPlaceNotified(result.place.id);

        decisions.push({
          placeId: result.place.id,
          placeName: result.place.name,
          eventType: "nearby",
          taskCount: result.tasks.length,
          notificationSent: true,
          reason: "No stronger context notification was sent.",
        });
      } else {
        decisions.push({
          placeId: result.place.id,
          placeName: result.place.name,
          eventType: "nearby",
          taskCount: result.tasks.length,
          notificationSent: false,
          reason: "Nearby notification cooldown is active.",
        });
      }
    }
  }

  hasCompletedStartupBaseline = true;

  return {
    nearbyResults,
    decisions,
    startupBaselineSynced: isStartupBaseline,
  };
}

export function resetStartupBaselineForTesting() {
  hasCompletedStartupBaseline = false;
}
