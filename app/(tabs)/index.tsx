import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Location from "expo-location";
import { useState } from "react";

export default function HomeScreen() {
  const [locationText, setLocationText] = useState(
    "Tap below to anchor this moment to your current place."
  );

  const [coordsText, setCoordsText] = useState("");

  async function handleLocationPress() {
    const permission =
      await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      setLocationText("Location permission was denied.");
      setCoordsText("");
      return;
    }

    const currentLocation =
      await Location.getCurrentPositionAsync({});

    const latitude =
      currentLocation.coords.latitude.toFixed(5);

    const longitude =
      currentLocation.coords.longitude.toFixed(5);

    setLocationText("Current place captured. You can save a memory here.");
    setCoordsText(`Lat ${latitude} • Lng ${longitude}`);
  }

  return (
    <View style={styles.screen}>

      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>
          PLACE MEMORY
        </Text>

        <Text style={styles.title}>
          What should I remember here?
        </Text>

        <Text style={styles.subtitle}>
          Save reminders, notes, and ideas that come back when you arrive.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={handleLocationPress}
        >
          <Text style={styles.primaryButtonText}>
            Use Current Location
          </Text>
        </Pressable>
      </View>

      <View style={styles.anchorCard}>
        <View style={styles.pinCircle}>
          <Text style={styles.pinIcon}>⌖</Text>
        </View>

        <View style={styles.anchorTextArea}>
          <Text style={styles.cardLabel}>
            Current Anchor
          </Text>

          <Text style={styles.anchorText}>
            {locationText}
          </Text>

          {coordsText !== "" && (
            <Text style={styles.coordsText}>
              {coordsText}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.memoryPreviewCard}>
        <Text style={styles.cardLabel}>
          Nearby Memories
        </Text>

        <Text style={styles.emptyState}>
          No memories nearby yet. Add one for this place when you are ready.
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F3EA",
    padding: 24,
    justifyContent: "center",
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 28,
    marginBottom: 20,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 4,
  },

  eyebrow: {
    color: "#3B82F6",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginBottom: 14,
  },

  title: {
    color: "#172033",
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 44,
    marginBottom: 14,
  },

  subtitle: {
    color: "#657084",
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 28,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  anchorCard: {
    backgroundColor: "#EAF3FF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  pinCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  pinIcon: {
    color: "#2563EB",
    fontSize: 28,
    fontWeight: "900",
  },

  anchorTextArea: {
    flex: 1,
  },

  cardLabel: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 6,
  },

  anchorText: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 21,
  },

  coordsText: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 8,
  },

  memoryPreviewCard: {
    backgroundColor: "#FFF7DE",
    borderRadius: 28,
    padding: 22,
  },

  emptyState: {
    color: "#6B5E3D",
    fontSize: 15,
    lineHeight: 22,
  },
});