import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";

const settings = [
  {
    title: "Default travel mode",
    value: "Driving, with custom overrides",
  },
  {
    title: "Work commute",
    value: "Train / Transit by default",
  },
  {
    title: "At-work movement",
    value: "Walking between sites",
  },
  {
    title: "Arrival reminders",
    value: "On",
  },
  {
    title: "Departure reminders",
    value: "On if tasks are unfinished",
  },
  {
    title: "Repeat reminders",
    value: "User controlled per task",
  },
];

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>

        <Text style={styles.appName}>SETTINGS</Text>

        <Text style={styles.headline}>Reminder preferences.</Text>

        <Text style={styles.subtitle}>
          Control how the app handles travel, arrival, departure, and repeated reminders.
        </Text>

        <View style={styles.section}>
          {settings.map((setting) => (
            <View key={setting.title} style={styles.settingCard}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingValue}>{setting.value}</Text>
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
    marginBottom: 24,
  },

  section: {
    marginBottom: 28,
  },

  settingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
  },

  settingTitle: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
  },

  settingValue: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
  },
});