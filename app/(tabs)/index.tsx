import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import * as Location from "expo-location";
import { useState } from "react";

export default function HomeScreen() {
  const [statusText, setStatusText] = useState(
    "Use your current location to create a memory anchor."
  );

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  async function handleLocationPress() {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      setStatusText("Location permission was denied.");
      setLatitude("");
      setLongitude("");
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});

    setLatitude(currentLocation.coords.latitude.toFixed(5));
    setLongitude(currentLocation.coords.longitude.toFixed(5));
    setStatusText("Location captured. You can save a memory here next.");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>

        <Text style={styles.appName}>GPS Context Assistant</Text>

        <Text style={styles.headline}>
          Remember things by place.
        </Text>

        <Text style={styles.subtitle}>
          Capture where you are now, then attach reminders or notes to this location.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Current Location</Text>

          <Text style={styles.statusText}>
            {statusText}
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={handleLocationPress}
          >
            <Text style={styles.primaryButtonText}>
              Get Current Location
            </Text>
          </Pressable>
        </View>

        {latitude !== "" && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsLabel}>Location Details</Text>
            <Text style={styles.coords}>Latitude: {latitude}</Text>
            <Text style={styles.coords}>Longitude: {longitude}</Text>
          </View>
        )}

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
    padding: 24,
    paddingBottom: 120,
  },

  appName: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 28,
    marginTop: 20,
  },

  headline: {
    color: "#172033",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
    marginBottom: 14,
  },

  subtitle: {
    color: "#657084",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  cardLabel: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },

  statusText: {
    color: "#475569",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 22,
  },

  primaryButton: {
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

  detailsCard: {
    backgroundColor: "#EAF3FF",
    borderRadius: 24,
    padding: 20,
  },

  detailsLabel: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
  },

  coords: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 24,
  },
});