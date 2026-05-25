import { useState } from "react";
import { Text, TextInput, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/constants/theme";
import { getSavedTasks, updateSavedTask } from "@/storage/taskStorage";
import { LocationTask } from "@/types/task";

export default function RescheduleTaskScreen() {
  const params = useLocalSearchParams<{ taskId?: string }>();
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  async function handleSaveSchedule() {
    if (!params.taskId) {
      console.log("No task ID provided.");
      return;
    }

    const tasks = await getSavedTasks();
    const taskToUpdate = tasks.find((task) => task.id === params.taskId);

    if (!taskToUpdate) {
      console.log("Task not found.");
      return;
    }

    const updatedTask: LocationTask = {
      ...taskToUpdate,
      dueDate: dueDate.trim() || undefined,
      dueTime: dueTime.trim() || undefined,
    };

    await updateSavedTask(updatedTask);

    router.back();
  }

  return (
    <AppScreen>
      <PageHeader
        label="RESCHEDULE"
        title="Pick date & time."
        subtitle="Choose a future date, time, or both for this task."
      />

      <Card>
        <Text style={styles.fieldLabel}>Due date</Text>

        <TextInput
          style={styles.input}
          placeholder="Example: Friday, May 30, Next Monday"
          placeholderTextColor="#94A3B8"
          value={dueDate}
          onChangeText={setDueDate}
        />

        <Text style={styles.fieldLabel}>Due time</Text>

        <TextInput
          style={styles.input}
          placeholder="Example: 8:00 AM, Tonight, Morning"
          placeholderTextColor="#94A3B8"
          value={dueTime}
          onChangeText={setDueTime}
        />
      </Card>

      <PrimaryButton title="Save Schedule" onPress={handleSaveSchedule} />
      <PrimaryButton
        title="Cancel"
        variant="secondary"
        onPress={() => router.back()}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 70,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 22,
  },
});