import { View, Text, StyleSheet } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, typography } from "@/constants/theme";
import { savedPlaces } from "@/data/places";
import { locationTasks } from "@/data/tasks";

const activeTasks = locationTasks.filter((task) => task.status === "active");

function getPlaceName(placeId: string) {
  const place = savedPlaces.find((savedPlace) => savedPlace.id === placeId);

  if (!place) {
    return "Unknown place";
  }

  return place.name;
}

type TaskCardProps = {
  title: string;
  place: string;
  time: string;
  travel: string;
  status: string;
};

function TaskCard({ title, place, time, travel, status }: TaskCardProps) {
  return (
    <Card>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{title}</Text>
        <Text style={styles.statusBadge}>{status}</Text>
      </View>

      <Text style={styles.taskMeta}>Place: {place}</Text>
      <Text style={styles.taskMeta}>When: {time}</Text>
      <Text style={styles.taskMeta}>Travel: {travel}</Text>
    </Card>
  );
}

export default function TasksScreen() {
  return (
    <AppScreen>
      <PageHeader
        label="TASKS"
        title="Tasks tied to places."
        subtitle="Plan what needs to happen, where it should happen, and how aggressively you want to be reminded."
      />

      <View style={styles.buttonWrapper}>
        <PrimaryButton title="Add Task" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Tasks</Text>

        {activeTasks.map((task) => (
            <TaskCard
                key={task.id}
                title={task.title}
                place={getPlaceName(task.placeId)}
                time={task.dueTime ?? task.dueDate ?? "No time set"}
                travel={task.travelMode}
                status={task.status}
            />
            ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    marginBottom: 28,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text,
    marginBottom: 12,
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
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  statusBadge: {
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900",
  },

  taskMeta: {
    color: colors.softText,
    fontSize: 14,
    lineHeight: 22,
  },
});