import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from "react-native";

const permanentPlaces = [
  {
    name: "Home",
    description: "Daily routines, chores, family tasks",
    icon: "🏠",
  },
  {
    name: "Work",
    description: "Recurring work tasks, site reminders, deadlines",
    icon: "💼",
  },
  {
    name: "School",
    description: "Assignments, classes, campus reminders",
    icon: "🎓",
  },
];

const temporaryPlaces = [
  {
    name: "Walmart Errand",
    description: "Temporary place example — disappears after tasks are complete",
    icon: "🛒",
  },
];

export default function PlacesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>

        <Text style={styles.appName}>PLACES</Text>

        <Text style={styles.headline}>Your saved places.</Text>

        <Text style={styles.subtitle}>
          Permanent places stay saved. Temporary places are removed or archived after their tasks are complete.
        </Text>

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Add Place</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permanent Places</Text>

          {permanentPlaces.map((place) => (
            <View key={place.name} style={styles.placeCard}>
              <Text style={styles.placeIcon}>{place.icon}</Text>

              <View style={styles.placeTextArea}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeDescription}>{place.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temporary Places</Text>

          {temporaryPlaces.map((place) => (
            <View key={place.name} style={styles.placeCardTemporary}>
              <Text style={styles.placeIcon}>{place.icon}</Text>

              <View style={styles.placeTextArea}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeDescription}>{place.description}</Text>
              </View>
            </View>
          ))}
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

  appName: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginTop: 18,
    marginBottom: 18,
  },

  headline: {
    color: "#172033",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
    marginBottom: 12,
  },

  subtitle: {
    color: "#657084",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 28,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    color: "#172033",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },

  placeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  placeCardTemporary: {
    backgroundColor: "#FFF7DE",
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  placeIcon: {
    fontSize: 30,
    marginRight: 16,
  },

  placeTextArea: {
    flex: 1,
  },

  placeName: {
    color: "#172033",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
  },

  placeDescription: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
  },
});