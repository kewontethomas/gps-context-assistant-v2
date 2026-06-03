import { useCallback, useState } from "react";
import { Pressable, Text, TextInput, StyleSheet, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/constants/theme";
import {
    LocationTask,
    ReminderProfile,
    TaskContextType,
    TaskPriority,
    TaskSource,
} from "@/types/task";
import { getSavedTasks } from "@/storage/taskStorage";
import {
    completeTask,
    removeTask,
    undoCompleteTask,
    updateTaskDetails,
} from "@/storage/taskActions";
import {
  getReminderProfileDescription,
  getReminderProfileLabel,
} from "@/utils/reminderProfiles";
import {
    getTaskContextDescription,
    getTaskContextLabel,
    getTaskPriorityDescription,
    getTaskPriorityLabel,
    getTaskSourceDescription,
    getTaskSourceLabel,
    taskContextTypes,
    taskPriorities,
    taskSources,
} from "@/utils/taskMetadata";

const reminderProfiles: ReminderProfile[] = [
    "gentle",
    "normal",
    "persistent",
];

export default function TaskDetailsScreen() {
    const params = useLocalSearchParams<{ taskId?: string }>();

    const [task, setTask] = useState<LocationTask | null>(null);
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [reminderProfile, setReminderProfile] =
        useState<ReminderProfile>("normal");
    const [taskSource, setTaskSource] = useState<TaskSource>("manual");
    const [taskPriority, setTaskPriority] = useState<TaskPriority>("normal");
    const [taskContextType, setTaskContextType] =
        useState<TaskContextType>("personal");

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
                setTaskSource(foundTask.source ?? "manual");
                setTaskPriority(foundTask.priority ?? "normal");
                setTaskContextType(foundTask.contextType ?? "personal");
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
            source: taskSource,
            priority: taskPriority,
            contextType: taskContextType,
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


            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Task intelligence</Text>

                <Text style={styles.fieldLabel}>Priority</Text>

                {taskPriorities.map((priority) => {
                    const selected = taskPriority === priority;

                    return (
                        <Pressable
                            key={priority}
                            onPress={() => setTaskPriority(priority)}
                            style={[
                                styles.metadataCard,
                                selected && styles.metadataCardSelected,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.metadataTitle,
                                    selected && styles.metadataTitleSelected,
                                ]}
                            >
                                {getTaskPriorityLabel(priority)}
                            </Text>

                            <Text
                                style={[
                                    styles.metadataDescription,
                                    selected && styles.metadataDescriptionSelected,
                                ]}
                            >
                                {getTaskPriorityDescription(priority)}
                            </Text>
                        </Pressable>
                    );
                })}

                <Text style={[styles.fieldLabel, styles.fieldLabelSpacing]}>
                    Context
                </Text>

                <View style={styles.optionGrid}>
                    {taskContextTypes.map((contextType) => {
                        const selected = taskContextType === contextType;

                        return (
                            <Pressable
                                key={contextType}
                                onPress={() => setTaskContextType(contextType)}
                                style={[
                                    styles.optionPill,
                                    selected && styles.optionPillSelected,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        selected && styles.optionTextSelected,
                                    ]}
                                >
                                    {getTaskContextLabel(contextType)}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                <Text style={styles.helperText}>
                    {getTaskContextDescription(taskContextType)}
                </Text>

                <Text style={[styles.fieldLabel, styles.fieldLabelSpacing]}>
                    Source
                </Text>

                {taskSources.map((source) => {
                    const selected = taskSource === source;

                    return (
                        <Pressable
                            key={source}
                            onPress={() => setTaskSource(source)}
                            style={[
                                styles.metadataCard,
                                selected && styles.metadataCardSelected,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.metadataTitle,
                                    selected && styles.metadataTitleSelected,
                                ]}
                            >
                                {getTaskSourceLabel(source)}
                            </Text>

                            <Text
                                style={[
                                    styles.metadataDescription,
                                    selected && styles.metadataDescriptionSelected,
                                ]}
                            >
                                {getTaskSourceDescription(source)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reminder intensity</Text>

                {reminderProfiles.map((profile) => {
                    const selected = reminderProfile === profile;

                    return (
                        <Pressable
                            key={profile}
                            onPress={() => setReminderProfile(profile)}
                            style={[
                                styles.reminderProfileCard,
                                selected && styles.reminderProfileCardSelected,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.reminderProfileTitle,
                                    selected && styles.reminderProfileTitleSelected,
                                ]}
                            >
                                {getReminderProfileLabel(profile)}
                            </Text>

                            <Text
                                style={[
                                    styles.reminderProfileDescription,
                                    selected && styles.reminderProfileDescriptionSelected,
                                ]}
                            >
                                {getReminderProfileDescription(profile)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

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

    fieldLabelSpacing: {
        marginTop: 22,
    },

    optionGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 14,
    },

    optionPill: {
        width: "48%",
        minHeight: 54,
        backgroundColor: "#FFFFFF",
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },

    optionPillSelected: {
        backgroundColor: colors.primary,
    },

    optionText: {
        color: colors.softText,
        fontSize: 14,
        fontWeight: "900",
        textAlign: "center",
    },

    optionTextSelected: {
        color: "#FFFFFF",
    },

    metadataCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 18,
        borderColor: colors.border,
        borderWidth: 1,
        marginBottom: 12,
    },

    metadataCardSelected: {
        borderColor: colors.primary,
        backgroundColor: "#EFF6FF",
    },

    metadataTitle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "900",
        marginBottom: 4,
    },

    metadataTitleSelected: {
        color: colors.primary,
    },

    metadataDescription: {
        color: colors.softText,
        fontSize: 13,
        lineHeight: 19,
    },

    metadataDescriptionSelected: {
        color: "#475569",
    },

    helperText: {
        color: colors.softText,
        fontSize: 13,
        lineHeight: 19,
        marginTop: 10,
    },


    section: {
    marginBottom: 30,
},

sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 14,
},

reminderProfileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 12,
},

reminderProfileCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "#EFF6FF",
},

reminderProfileTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
},

reminderProfileTitleSelected: {
    color: colors.primary,
},

reminderProfileDescription: {
    color: colors.softText,
    fontSize: 13,
    lineHeight: 19,
},

reminderProfileDescriptionSelected: {
    color: "#475569",
},
});