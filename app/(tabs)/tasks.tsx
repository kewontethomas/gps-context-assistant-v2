import { View, Text, StyleSheet } from "react-native";
import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, typography } from "@/constants/theme";
import { getSavedPlaces } from "@/storage/placeStorage";
import { SavedPlace } from "@/types/place";
import { getSavedTasks } from "@/storage/taskStorage";
import { LocationTask } from "@/types/task";
import { updateSavedTask } from "@/storage/taskStorage";

type TaskCardProps = {
    task: LocationTask;
    place: string;
    time: string;
    onComplete?: () => void;
};

function TaskCard({ task, place, time, onComplete }: TaskCardProps) {
    return (
        <Card>
            <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.statusBadge}>{task.status}</Text>
            </View>

            <Text style={styles.taskMeta}>Place: {place}</Text>
            <Text style={styles.taskMeta}>When: {time}</Text>
            <Text style={styles.taskMeta}>Travel: {task.travelMode}</Text>

            {task.status === "active" && onComplete && (
                <View style={styles.taskActions}>
                    <PrimaryButton title="Complete" onPress={onComplete} />
                </View>
            )}
        </Card>
    );
}

export default function TasksScreen() {
    const [tasks, setTasks] = useState<LocationTask[]>([]);
    const [places, setPlaces] = useState<SavedPlace[]>([]);

    useFocusEffect(
        useCallback(() => {
            async function loadData() {
                const savedTasks = await getSavedTasks();
                const savedPlaces = await getSavedPlaces();

                setTasks(savedTasks);
                setPlaces(savedPlaces);
            }

            loadData();
        }, [])
    );

    const activeTasks = tasks.filter((task) => task.status === "active");
    const completedTasks = tasks.filter((task) => task.status === "completed");

    function getPlaceName(placeId: string) {
        const place = places.find((savedPlace) => savedPlace.id === placeId);

        if (!place) {
            return "Unknown place";
        }

        return place.name;
    }

    async function handleCompleteTask(task: LocationTask) {
        const completedTask: LocationTask = {
            ...task,
            status: "completed",
            completedAt: new Date().toISOString(),
        };

        const updatedTasks = await updateSavedTask(completedTask);
        setTasks(updatedTasks);
    }

    return (
        <AppScreen>
            <PageHeader
                label="TASKS"
                title="Tasks tied to places."
                subtitle="Plan what needs to happen, where it should happen, and how aggressively you want to be reminded."
            />

            <View style={styles.buttonWrapper}>
                <PrimaryButton
                    title="Add Task"
                    onPress={() => router.push("/add-task")}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Tasks</Text>

                {activeTasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        place={getPlaceName(task.placeId)}
                        time={task.dueTime ?? task.dueDate ?? "No time set"}
                        onComplete={() => handleCompleteTask(task)}
                    />
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Completed Tasks</Text>

                {completedTasks.length === 0 ? (
                    <Card variant="yellow">
                        <Text style={styles.emptyText}>
                            Completed tasks will appear here after you finish them.
                        </Text>
                    </Card>
                ) : (
                    completedTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            place={getPlaceName(task.placeId)}
                            time={task.completedAt ? "Completed" : "Completed"}
                            onComplete={() => { }}
                        />
                    ))
                )}
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

    taskActions: {
        marginTop: 16,
    },

    emptyText: {
        color: "#6B5E3D",
        fontSize: 15,
        lineHeight: 22,
    },
});