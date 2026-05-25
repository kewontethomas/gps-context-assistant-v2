import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, typography } from "@/constants/theme";
import { getSavedPlaces } from "@/storage/placeStorage";
import { deleteSavedTask, getSavedTasks, updateSavedTask } from "@/storage/taskStorage";
import { SavedPlace } from "@/types/place";
import { LocationTask } from "@/types/task";

type TaskCardProps = {
    task: LocationTask;
    place: string;
    time: string;
    onComplete?: () => void;
    onUndo?: () => void;
    onDelete: () => void;
    onLater?: () => void;
};

function TaskCard({
    task,
    place,
    time,
    onComplete,
    onDelete,
    onUndo,
    onLater,
}: TaskCardProps) {
    return (
        <Card>
            <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.statusBadge}>{task.status}</Text>
            </View>

            <Text style={styles.taskMeta}>Place: {place}</Text>
            <Text style={styles.taskMeta}>When: {time}</Text>
            <Text style={styles.taskMeta}>Travel: {task.travelMode}</Text>

            <View style={styles.taskActions}>
                {task.status === "active" && onComplete && (
                    <View style={styles.actionButton}>
                        <PrimaryButton title="Complete" onPress={onComplete} />
                    </View>
                )}

                {task.status === "active" && onLater && (
                    <View style={styles.actionButton}>
                        <PrimaryButton
                            title="Later"
                            variant="secondary"
                            onPress={onLater}
                        />
                    </View>
                )}

                {task.status === "completed" && onUndo && (
                    <View style={styles.actionButton}>
                        <PrimaryButton title="Undo" onPress={onUndo} />
                    </View>
                )}

                <View style={styles.actionButton}>
                    <PrimaryButton
                        title="Delete"
                        variant="secondary"
                        onPress={onDelete}
                    />
                </View>
            </View>
        </Card>
    );
}

export default function TasksScreen() {
    const [tasks, setTasks] = useState<LocationTask[]>([]);
    const [places, setPlaces] = useState<SavedPlace[]>([]);
    const [selectedTaskForLater, setSelectedTaskForLater] =
        useState<LocationTask | null>(null);

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

    async function handleDeleteTask(taskId: string) {
        const updatedTasks = await deleteSavedTask(taskId);
        setTasks(updatedTasks);
    }

    async function handleUndoCompleteTask(task: LocationTask) {
        const activeTask: LocationTask = {
            ...task,
            status: "active",
            completedAt: undefined,
        };

        const updatedTasks = await updateSavedTask(activeTask);
        setTasks(updatedTasks);
    }

    function handleOpenLaterOptions(task: LocationTask) {
        setSelectedTaskForLater(task);
    }

    async function handleMoveTaskLater(dueDate: string, dueTime?: string) {
        if (!selectedTaskForLater) {
            return;
        }

        const updatedTask: LocationTask = {
            ...selectedTaskForLater,
            dueDate,
            dueTime,
        };

        const updatedTasks = await updateSavedTask(updatedTask);

        setTasks(updatedTasks);
        setSelectedTaskForLater(null);
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
                        time={
                            task.dueDate && task.dueTime
                                ? `${task.dueDate} • ${task.dueTime}`
                                : task.dueDate ?? task.dueTime ?? "No time set"
                        }
                        onComplete={() => handleCompleteTask(task)}
                        onLater={() => handleOpenLaterOptions(task)}
                        onDelete={() => handleDeleteTask(task.id)}
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
                            time="Completed"
                            onUndo={() => handleUndoCompleteTask(task)}
                            onDelete={() => handleDeleteTask(task.id)}
                        />
                    ))
                )}
            </View>

            <Modal
                visible={selectedTaskForLater !== null}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Move task</Text>

                        <Text style={styles.modalSubtitle}>
                            Choose when this task should come back.
                        </Text>

                        <Pressable
                            style={styles.modalOption}
                            onPress={() => handleMoveTaskLater("Today", "Later")}
                        >
                            <Text style={styles.modalOptionText}>Later today</Text>
                        </Pressable>

                        <Pressable
                            style={styles.modalOption}
                            onPress={() => handleMoveTaskLater("Tomorrow")}
                        >
                            <Text style={styles.modalOptionText}>Tomorrow</Text>
                        </Pressable>

                        <Pressable
                            style={styles.modalOption}
                            onPress={() => handleMoveTaskLater("Tomorrow", "Morning")}
                        >
                            <Text style={styles.modalOptionText}>Tomorrow morning</Text>
                        </Pressable>

                        <Pressable
                            style={styles.modalOption}
                            onPress={() => handleMoveTaskLater("Next workday")}
                        >
                            <Text style={styles.modalOptionText}>Next workday</Text>
                        </Pressable>

                        <Pressable
                            style={styles.modalOption}
                            onPress={() => handleMoveTaskLater("Next arrival")}
                        >
                            <Text style={styles.modalOptionText}>Next time I’m at this place</Text>
                        </Pressable>

                        <Pressable
                            style={styles.modalOption}
                            onPress={() => {
                                if (!selectedTaskForLater) {
                                    return;
                                }

                                const taskId = selectedTaskForLater.id;

                                setSelectedTaskForLater(null);
                                router.push(`/reschedule-task?taskId=${taskId}`);
                            }}
                        >
                            <Text style={styles.modalOptionText}>Pick date & time</Text>
                        </Pressable>

                        <Pressable
                            style={styles.cancelOption}
                            onPress={() => setSelectedTaskForLater(null)}
                        >
                            <Text style={styles.cancelOptionText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
        flexDirection: "row",
        gap: 10,
        marginTop: 16,
    },

    emptyText: {
        color: "#6B5E3D",
        fontSize: 15,
        lineHeight: 22,
    },

    actionButton: {
        flex: 1,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        justifyContent: "flex-end",
    },

    modalCard: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 42,
    },

    modalTitle: {
        color: colors.text,
        fontSize: 24,
        fontWeight: "900",
        marginBottom: 6,
    },

    modalSubtitle: {
        color: colors.softText,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 18,
    },

    modalOption: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 18,
        marginBottom: 10,
    },

    modalOptionText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "800",
    },

    cancelOption: {
        backgroundColor: colors.primarySoft,
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 8,
    },

    cancelOptionText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: "900",
    },

    modalOptionDisabled: {
        backgroundColor: "#E5E7EB",
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 18,
        marginBottom: 10,
    },

    modalOptionDisabledText: {
        color: "#94A3B8",
        fontSize: 16,
        fontWeight: "800",
    },
});