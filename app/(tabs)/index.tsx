import { View, Text, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionTitle } from "@/components/SectionTitle";
import { colors, typography } from "@/constants/theme";
import { getSavedPlaces } from "@/storage/placeStorage";
import { getSavedTasks } from "@/storage/taskStorage";
import { getCurrentLocation } from "@/utils/location";
import { NearbyTaskResult } from "@/utils/nearbyTasks";
import { evaluateContextNotifications } from "@/utils/contextNotificationEngine";

export default function HomeScreen() {
  const [nearbyResults, setNearbyResults] = useState<NearbyTaskResult[]>([]);
  const [nearbyStatus, setNearbyStatus] = useState("Checking nearby tasks...");
  const [lastCheckedAt, setLastCheckedAt] = useState("");

  const nearbyTaskCount = nearbyResults.reduce(
    (total, result) => total + result.tasks.length,
    0
  );

  async function handleCheckNearbyTasks() {
    setNearbyStatus("Checking current location...");

    const currentLocation = await getCurrentLocation();

    if (!currentLocation) {
      setNearbyStatus("Could not access current location.");
      setLastCheckedAt(new Date().toLocaleTimeString());
      return;
    }

    const places = await getSavedPlaces();
    const tasks = await getSavedTasks();

    const contextResult = await evaluateContextNotifications(
      currentLocation,
      places,
      tasks
    );

    setNearbyResults(contextResult.nearbyResults);

    if (contextResult.nearbyResults.length === 0) {
      setNearbyStatus("No nearby tasks found.");
      setLastCheckedAt(new Date().toLocaleTimeString());
      return;
    }

    setNearbyStatus(
      `Found ${contextResult.nearbyResults.length} nearby place${
        contextResult.nearbyResults.length === 1 ? "" : "s"
      }.`
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
        title="Your location-aware task dashboard."
        subtitle="See what needs your attention based on where you are right now."
      />

      <Card variant={nearbyTaskCount > 0 ? "blue" : undefined}>
        <Text style={styles.dashboardLabel}>Current context</Text>

        <Text style={styles.dashboardNumber}>
          {nearbyTaskCount}
        </Text>

        <Text style={styles.dashboardText}>
          {nearbyTaskCount === 1
            ? "active task nearby"
            : "active tasks nearby"}
        </Text>

        <Text style={styles.lastCheckedText}>
          Last checked: {lastCheckedAt || "Not checked yet"}
        </Text>

        <View style={styles.buttonWrapper}>
          <PrimaryButton
            title="Refresh Nearby Tasks"
            onPress={handleCheckNearbyTasks}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Quick actions</Text>

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

        <View style={styles.buttonWrapper}>
          <PrimaryButton
            title="FieldSeed Inbox"
            variant="secondary"
            onPress={() => router.push("/fieldseed-inbox")}
          />
        </View>
      </Card>

      <View style={styles.section}>
        <SectionTitle>Nearby Tasks</SectionTitle>

        <Card>
          <Text style={styles.sectionDescription}>{nearbyStatus}</Text>
        </Card>

        {nearbyResults.length === 0 ? (
          <EmptyStateCard
            title="Nothing nearby right now"
            message="When you are close to a saved place with active tasks, they will appear here."
          />
        ) : (
          nearbyResults.map((result) => (
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
          ))
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle>How reminders work</SectionTitle>

        <Card>
          <Text style={styles.reminderItem}>• Before it’s time to leave</Text>
          <Text style={styles.reminderItem}>• When you arrive</Text>
          <Text style={styles.reminderItem}>
            • While you’re there if unfinished
          </Text>
          <Text style={styles.reminderItem}>
            • When you leave if still incomplete
          </Text>
        </Card>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  dashboardLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  dashboardNumber: {
    color: colors.text,
    fontSize: 52,
    fontWeight: "900",
    lineHeight: 58,
  },

  dashboardText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },

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

  reminderItem: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 26,
  },

  lastCheckedText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 8,
  },
});