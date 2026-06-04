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
};

function getActiveTasksForPlace(tasks: LocationTask[], placeId: string) {
  return tasks.filter(
    (task) => task.placeId === placeId && task.status === "active"
  );
}

export async function evaluateContextNotifications(
  currentLocation: CurrentLocation,
  places: SavedPlace[],
  tasks: LocationTask[]
): Promise<ContextNotificationResult> {
  const decisions: ContextNotificationDecision[] = [];
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
    const presenceChange = await updatePlacePresence(place.id, isInside);
    const activePlaceTasks = getActiveTasksForPlace(tasks, place.id);

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

    if (presenceChange.eventType !== "none") {
      await sendPlaceEventNotification(
        place.name,
        presenceChange.eventType,
        activePlaceTasks.length
      );

      sentContextNotification = true;

      decisions.push({
        placeId: place.id,
        placeName: place.name,
        eventType: presenceChange.eventType,
        taskCount: activePlaceTasks.length,
        notificationSent: true,
        reason: `Detected ${presenceChange.eventType}.`,
      });

      continue;
    }

    if (presenceChange.currentStatus === "inside") {
      const strongestProfile = getStrongestReminderProfile(activePlaceTasks);
      const canRemind = await canSendStayReminder(place.id, strongestProfile);

      if (canRemind) {
        await sendStillAtPlaceNotification(place.name, activePlaceTasks.length);
        await markStayReminderSent(place.id);

        sentContextNotification = true;

        decisions.push({
          placeId: place.id,
          placeName: place.name,
          eventType: "stay",
          taskCount: activePlaceTasks.length,
          notificationSent: true,
          reason: `Still inside place with ${strongestProfile} reminder profile.`,
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

  if (!sentContextNotification) {
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

  return { nearbyResults, decisions };
}
