import { View, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useState } from "react";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, typography } from "@/constants/theme";
import { router } from "expo-router";

export default function HomeScreen() {
  const [locationStatus, setLocationStatus] = useState(
    "Location check has not been run yet."
  );

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  async function handleLocationPress() {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      setLocationStatus("Location permission was denied.");
      setLatitude("");
      setLongitude("");
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});

    setLatitude(currentLocation.coords.latitude.toFixed(5));
    setLongitude(currentLocation.coords.longitude.toFixed(5));
    setLocationStatus("Location is working. Arrival reminders can use GPS later.");
  }

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
            <PrimaryButton title="Add Task" onPress={() => router.push("/add-task")} />
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today’s Place Tasks</Text>

        <Card variant="yellow">
          <Text style={styles.emptyTitle}>No tasks planned yet</Text>

          <Text style={styles.emptyText}>
            Add a task to a saved place like Work or Home, or create a temporary place for an errand.
          </Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How reminders will work</Text>

        <Card>
          <Text style={styles.reminderItem}>• Before it’s time to leave</Text>
          <Text style={styles.reminderItem}>• When you arrive</Text>
          <Text style={styles.reminderItem}>• While you’re there if unfinished</Text>
          <Text style={styles.reminderItem}>• When you leave if still incomplete</Text>
        </Card>
      </View>

      <Card variant="blue">
        <Text style={styles.gpsTitle}>GPS Test</Text>

        <Text style={styles.gpsText}>
          {locationStatus}
        </Text>

        {latitude !== "" && (
          <View style={styles.coordsBox}>
            <Text style={styles.coords}>Latitude: {latitude}</Text>
            <Text style={styles.coords}>Longitude: {longitude}</Text>
          </View>
        )}

        <PrimaryButton
          title="Test Current Location"
          variant="secondary"
          onPress={handleLocationPress}
        />
      </Card>
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

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text,
    marginBottom: 12,
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

  gpsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },

  gpsText: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },

  coordsBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  coords: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 22,
  },
});