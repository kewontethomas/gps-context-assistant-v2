import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from "react-native";

const sampleTasks = [
  {
    title: "Check server room",
    place: "Work",
    time: "Today",
    travel: "Walking while at work",
    status: "Active",
  },
  {
    title: "Take out trash",
    place: "Home",
    time: "Tonight",
    travel: "No travel needed",
    status: "Active",
  },
];

export default function TasksScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>

        <Text style={styles.appName}>TASKS</Text>

        <Text style={styles.headline}>Tasks tied to places.</Text>

        <Text style={styles.subtitle}>
          Plan what needs to happen, where it should happen, and how aggressively you want to be reminded.
        </Text>

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Add Task</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Tasks</Text>

          {sampleTasks.map((task) => (
            <View key={task.title} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.statusBadge}>{task.status}</Text>
              </View>

              <Text style={styles.taskMeta}>Place: {task.place}</Text>
              <Text style={styles.taskMeta}>When: {task.time}</Text>
              <Text style={styles.taskMeta}>Travel: {task.travel}</Text>
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

  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },

  taskTitle: {
    flex: 1,
    color: "#172033",
    fontSize: 18,
    fontWeight: "900",
  },

  statusBadge: {
    color: "#2563EB",
    backgroundColor: "#EAF3FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900",
  },

  taskMeta: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
  },
});