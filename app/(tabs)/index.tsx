import { View, Text, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, typography } from "@/constants/theme";
import { getSavedPlaces } from "@/storage/placeStorage";
import { getSavedTasks } from "@/storage/taskStorage";
import { findNearbyTasks, NearbyTaskResult } from "@/utils/nearbyTasks";
import {
  canNotifyForPlace,
  markPlaceNotified,
} from "@/utils/notificationCooldowns";
import { updatePlacePresence } from "@/utils/placePresence";
import {
  calculateDistanceMeters,
  getCurrentLocation,
} from "@/utils/location";

import {
  sendNearbyTasksNotification,
  sendPlaceEventNotification,
} from "@/utils/notifications";

export default function HomeScreen() {
  const [nearbyResults, setNearbyResults] = useState<NearbyTaskResult[]>([]);
  const [nearbyStatus, setNearbyStatus] = useState(
    "Checking nearby tasks..."
  );
  const [lastCheckedAt, setLastCheckedAt] = useState("");

  async function handleCheckNearbyTasks() {
    setNearbyStatus("Checking current location...");

    const currentLocation = await getCurrentLocation();

    if (!currentLocation) {
      setNearbyStatus("Could not access current location.");
      return;
    }

    const places = await getSavedPlaces();
    const tasks = await getSavedTasks();

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

      const activePlaceTasks = tasks.filter(
        (task) => task.placeId === place.id && task.status === "active"
      );

      if (
        presenceChange.eventType !== "none" &&
        activePlaceTasks.length > 0
      ) {
        await sendPlaceEventNotification(
          place.name,
          presenceChange.eventType,
          activePlaceTasks.length
        );
      }
    }

    const results = findNearbyTasks(
      currentLocation.latitude,
      currentLocation.longitude,
      places,
      tasks
    );

    setNearbyResults(results);

    for (const result of results) {
      const canNotify = await canNotifyForPlace(result.place.id);

      if (canNotify) {
        await sendNearbyTasksNotification(
          result.place.name,
          result.tasks.length
        );

        await markPlaceNotified(result.place.id);
      }
    }

    if (results.length === 0) {
      setNearbyStatus("No nearby tasks found.");
      setLastCheckedAt(new Date().toLocaleTimeString());
      return;
    }

    setNearbyStatus(
      `Found ${results.length} nearby place${results.length === 1 ? "" : "s"}.`
    );

    setLastCheckedAt(new Date().toLocaleTimeString());
  }

  useFocusEffect(
    useCallback(() => {
      handleCheckNearbyTasks();
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      handleCheckNearbyTasks();
    }, 1000 * 60 * 3);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppScreen>
      <PageHeader
        label="GPS CONTEXT ASSISTANT"
        title="Plan tasks by place."
        subtitle="Create reminders for Home, Work, School, stores, appointments, and temporary stops before you get there."
      />

      <Card>
        <Text style={styles.cardTitle}>What do you want to set up?</Text>

        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <PrimaryButton
              title="Add Task"
              onPress={() => router.push("/add-task")}
            />
          </View>

          <View style={styles.buttonHalf}>
            <PrimaryButton
              title="Add Place"
              variant="secondary"
              onPress={() => router.push("/add-place")}
            />
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Nearby Tasks</Text>

        <Text style={styles.sectionDescription}>{nearbyStatus}</Text>

        <Text style={styles.lastCheckedText}>
          Last checked: {lastCheckedAt || "Not checked yet"}
        </Text>

        <View style={styles.buttonWrapper}>
          <PrimaryButton
            title="Check Nearby Tasks"
            onPress={handleCheckNearbyTasks}
          />
        </View>
      </Card>

      {nearbyResults.length > 0 && (
        <Card variant="blue">
          <Text style={styles.nearbyAlertTitle}>
            You have tasks nearby
          </Text>

          <Text style={styles.nearbyAlertText}>
            {nearbyResults.reduce(
              (total, result) => total + result.tasks.length,
              0
            )} active task
            {nearbyResults.reduce(
              (total, result) => total + result.tasks.length,
              0
            ) === 1
              ? ""
              : "s"} waiting across {nearbyResults.length} nearby place
            {nearbyResults.length === 1 ? "" : "s"}.
          </Text>
        </Card>
      )}

      {nearbyResults.map((result) => (
        <Card key={result.place.id}>
          <Text style={styles.placeTitle}>
            {result.place.icon} {result.place.name}
          </Text>

          <Text style={styles.distanceText}>
            {Math.round(result.distanceMeters)} meters away
          </Text>

          {result.tasks.map((task) => (
            <Text key={task.id} style={styles.taskText}>
              • {task.title}
            </Text>
          ))}
        </Card>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today’s Place Tasks</Text>

        <Card variant="yellow">
          <Text style={styles.emptyTitle}>No tasks planned yet</Text>

          <Text style={styles.emptyText}>
            Add a task to a saved place like Work or Home, or create a temporary
            place for an errand.
          </Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How reminders will work</Text>

        <Card>
          <Text style={styles.reminderItem}>• Before it’s time to leave</Text>
          <Text style={styles.reminderItem}>• When you arrive</Text>
          <Text style={styles.reminderItem}>• While you’re there if unfinished</Text>
          <Text style={styles.reminderItem}>
            • When you leave if still incomplete
          </Text>
        </Card>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 16,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },

  buttonHalf: {
    flex: 1,
  },

  buttonWrapper: {
    marginTop: 14,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text,
    marginBottom: 8,
  },

  sectionDescription: {
    color: colors.softText,
    fontSize: 14,
    lineHeight: 20,
  },

  placeTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 8,
  },

  distanceText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },

  taskText: {
    color: colors.softText,
    fontSize: 14,
    lineHeight: 22,
  },

  emptyTitle: {
    color: "#4A3B14",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
  },

  emptyText: {
    color: "#6B5E3D",
    fontSize: 15,
    lineHeight: 22,
  },

  reminderItem: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 26,
  },

  nearbyAlertTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },

  nearbyAlertText: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 22,
  },

  lastCheckedText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 8,
  },
});