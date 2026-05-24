import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import * as Location from "expo-location";
import { useState } from "react";

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>

        <View style={styles.header}>
          <Text style={styles.appName}>GPS CONTEXT ASSISTANT</Text>

          <Text style={styles.headline}>
            Plan tasks by place.
          </Text>

          <Text style={styles.subtitle}>
            Create reminders for Home, Work, School, stores, appointments, and temporary stops before you get there.
          </Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.cardTitle}>What do you want to set up?</Text>

          <View style={styles.buttonRow}>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Add Task</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Add Place</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today’s Place Tasks</Text>

          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No tasks planned yet</Text>

            <Text style={styles.emptyText}>
              Add a task to a saved place like Work or Home, or create a temporary place for an errand.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How reminders will work</Text>

          <View style={styles.reminderCard}>
            <Text style={styles.reminderItem}>• Before it’s time to leave</Text>
            <Text style={styles.reminderItem}>• When you arrive</Text>
            <Text style={styles.reminderItem}>• While you’re there if unfinished</Text>
            <Text style={styles.reminderItem}>• When you leave if still incomplete</Text>
          </View>
        </View>

        <View style={styles.gpsCard}>
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

          <Pressable
            style={styles.gpsButton}
            onPress={handleLocationPress}
          >
            <Text style={styles.gpsButtonText}>
              Test Current Location
            </Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F3EA",
  },

  screen: {
    padding: 22,
    paddingBottom: 120,
  },

  header: {
    marginTop: 18,
    marginBottom: 22,
  },

  appName: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 18,
  },

  headline: {
    color: "#172033",
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 42,
    marginBottom: 12,
  },

  subtitle: {
    color: "#657084",
    fontSize: 16,
    lineHeight: 24,
  },

  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    marginBottom: 24,

    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  cardTitle: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 16,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: "#EAF3FF",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "800",
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: "#172033",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },

  emptyCard: {
    backgroundColor: "#FFF7DE",
    borderRadius: 24,
    padding: 20,
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

  reminderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },

  reminderItem: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 26,
  },

  gpsCard: {
    backgroundColor: "#EAF3FF",
    borderRadius: 24,
    padding: 20,
  },

  gpsTitle: {
    color: "#172033",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  coords: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 22,
  },

  gpsButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },

  gpsButtonText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "800",
  },
});