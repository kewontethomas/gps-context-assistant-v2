import { useCallback, useState } from "react";
import { Text, TextInput, StyleSheet, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/constants/theme";
import { LocationTask, ReminderProfile } from "@/types/task";
import { getSavedTasks } from "@/storage/taskStorage";
import {
    completeTask,
    removeTask,
    undoCompleteTask,
    updateTaskDetails,
} from "@/storage/taskActions";


export default function TaskDetailsScreen() {
    const params = useLocalSearchParams<{ taskId?: string }>();

    const [task, setTask] = useState<LocationTask | null>(null);
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [reminderProfile, setReminderProfile] =
    useState<ReminderProfile>("normal");

    useFocusEffect(
        useCallback(() => {
            async function loadTask() {
                if (!params.taskId) {
                    return;
                }

                const tasks = await getSavedTasks();
                const foundTask = tasks.find((savedTask) => savedTask.id === params.taskId);

                if (!foundTask) {
                    return;
                }

                setTask(foundTask);
                setTitle(foundTask.title);
                setNotes(foundTask.notes ?? "");
                setDueDate(foundTask.dueDate ?? "");
                setDueTime(foundTask.dueTime ?? "");
                setReminderProfile(foundTask.reminderProfile ?? "normal");
            }

            loadTask();
        }, [params.taskId])
    );

    async function handleSaveChanges() {
        if (!task) {
            return;
        }

        if (!title.trim()) {
            console.log("Task title is required.");
            return;
        }

        await updateTaskDetails(task, {
            title: title.trim(),
            notes: notes.trim() || undefined,
            dueDate: dueDate.trim() || undefined,
            dueTime: dueTime.trim() || undefined,
            reminderProfile,
        });

        router.back();
    }

    async function handleToggleComplete() {
        if (!task) {
            return;
        }

        if (task.status === "completed") {
            await undoCompleteTask(task);
        } else {
            await completeTask(task);
        }

        router.back();
    }

    async function handleDeleteTask() {
        if (!task) {
            return;
        }

        await removeTask(task);

        router.back();
    }

    return (
        <AppScreen>
            <PageHeader
                label="TASK DETAILS"
                title="Edit this task."
                subtitle="Update the task name, notes, date, or time."
            />

            <Card>
                <Text style={styles.fieldLabel}>Task title</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Task title"
                    placeholderTextColor="#94A3B8"
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.fieldLabel}>Notes</Text>

                <TextInput
                    style={[styles.input, styles.notesInput]}
                    placeholder="Optional notes"
                    placeholderTextColor="#94A3B8"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    textAlignVertical="top"
                />

                <Text style={styles.fieldLabel}>Due date</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Example: Tomorrow, Friday, May 30"
                    placeholderTextColor="#94A3B8"
                    value={dueDate}
                    onChangeText={setDueDate}
                />

                <Text style={styles.fieldLabel}>Due time</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Example: 8:00 AM, Tonight"
                    placeholderTextColor="#94A3B8"
                    value={dueTime}
                    onChangeText={setDueTime}
                />
            </Card>

            <View style={styles.actions}>
                <PrimaryButton title="Save Changes" onPress={handleSaveChanges} />

                <PrimaryButton
                    title={task?.status === "completed" ? "Undo Complete" : "Complete Task"}
                    variant="secondary"
                    onPress={handleToggleComplete}
                />

                <PrimaryButton
                    title="Delete Task"
                    variant="secondary"
                    onPress={handleDeleteTask}
                />

                <PrimaryButton
                    title="Cancel"
                    variant="secondary"
                    onPress={() => router.back()}
                />
            </View>
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
        minHeight: 56,
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 22,
    },

    notesInput: {
        minHeight: 110,
    },

    actions: {
        gap: 14,
        paddingBottom: 90,
    },
});