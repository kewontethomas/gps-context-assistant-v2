import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, typography } from "@/constants/theme";
import {
    archiveTemporaryPlaceIfCleared,
    getSavedPlaces,
} from "@/storage/placeStorage";
import { getSavedTasks } from "@/storage/taskStorage";
import {
    completeTask,
    removeTask,
    rescheduleTask,
    undoCompleteTask,
} from "@/storage/taskActions";
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
    onOpen: () => void;
};

function TaskCard({
    task,
    place,
    time,
    onComplete,
    onDelete,
    onUndo,
    onLater,
    onOpen,
}: TaskCardProps) {
    return (
        <Card>
            <Pressable onPress={onOpen}>
                <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.statusBadge}>{task.status}</Text>
                </View>

                <Text style={styles.taskMeta}>Place: {place}</Text>
                <Text style={styles.taskMeta}>When: {time}</Text>
                <Text style={styles.taskMeta}>Travel: {task.travelMode}</Text>
                <Text style={styles.taskMeta}>Reminder: {task.reminderProfile ?? "normal"}</Text>
            </Pressable>

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

type TaskSectionProps = {
    title: string;
    emptyTitle: string;
    emptyMessage: string;
    tasks: LocationTask[];
    places: SavedPlace[];
    onComplete: (task: LocationTask) => void;
    onLater: (task: LocationTask) => void;
    onDelete: (task: LocationTask) => void;
    onOpen: (task: LocationTask) => void;
};

function TaskSection({
    title,
    emptyTitle,
    emptyMessage,
    tasks,
    places,
    onComplete,
    onLater,
    onDelete,
    onOpen,
}: TaskSectionProps) {
    function getPlaceName(placeId: string) {
        const place = places.find((savedPlace) => savedPlace.id === placeId);

        if (!place) {
            return "Unknown place";
        }

        return place.name;
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>

            {tasks.length === 0 ? (
                <Card variant="yellow">
                    <Text style={styles.emptyTitle}>{emptyTitle}</Text>
                    <Text style={styles.emptyText}>{emptyMessage}</Text>
                </Card>
            ) : (
                tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        place={getPlaceName(task.placeId)}
                        time={
                            task.dueDate && task.dueTime
                                ? `${task.dueDate} • ${task.dueTime}`
                                : task.dueDate ?? task.dueTime ?? "No time set"
                        }
                        onComplete={() => onComplete(task)}
                        onLater={() => onLater(task)}
                        onDelete={() => onDelete(task)}
                        onOpen={() => onOpen(task)}
                    />
                ))
            )}
        </View>
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

    const dueTodayTasks = activeTasks.filter((task) => {
        return task.dueDate === "Today" || task.dueDate === "Tonight";
    });

    const nextArrivalTasks = activeTasks.filter((task) => {
        return task.dueDate === "Next arrival";
    });

    const upcomingTasks = activeTasks.filter((task) => {
        return (
            task.dueDate !== "Today" &&
            task.dueDate !== "Tonight" &&
            task.dueDate !== "Next arrival"
        );
    });

    function getPlaceName(placeId: string) {
        const place = places.find((savedPlace) => savedPlace.id === placeId);

        if (!place) {
            return "Unknown place";
        }

        return place.name;
    }

    async function handleCompleteTask(task: LocationTask) {
        const result = await completeTask(task);
        setTasks(result.tasks);

        const savedPlaces = await getSavedPlaces();
        setPlaces(savedPlaces);
    }

    async function handleDeleteTask(task: LocationTask) {
        const result = await removeTask(task);
        setTasks(result.tasks);

        const savedPlaces = await getSavedPlaces();
        setPlaces(savedPlaces);
    }

    async function handleUndoCompleteTask(task: LocationTask) {
        const result = await undoCompleteTask(task);
        setTasks(result.tasks);

        const savedPlaces = await getSavedPlaces();
        setPlaces(savedPlaces);
    }

    function handleOpenLaterOptions(task: LocationTask) {
        setSelectedTaskForLater(task);
    }

    async function handleMoveTaskLater(dueDate: string, dueTime?: string) {
        if (!selectedTaskForLater) {
            return;
        }

        const result = await rescheduleTask(
            selectedTaskForLater,
            dueDate,
            dueTime
        );

        setTasks(result.tasks);

        const savedPlaces = await getSavedPlaces();
        setPlaces(savedPlaces);

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

            <TaskSection
                title="Due Today"
                emptyTitle="Nothing due today"
                emptyMessage="Tasks due today or tonight will appear here."
                tasks={dueTodayTasks}
                places={places}
                onComplete={handleCompleteTask}
                onLater={handleOpenLaterOptions}
                onDelete={handleDeleteTask}
                onOpen={(task) => router.push(`/task-details?taskId=${task.id}`)}
            />

            <TaskSection
                title="Next Arrival"
                emptyTitle="No next-arrival tasks"
                emptyMessage="Tasks waiting for the next time you arrive at a place will appear here."
                tasks={nextArrivalTasks}
                places={places}
                onComplete={handleCompleteTask}
                onLater={handleOpenLaterOptions}
                onDelete={handleDeleteTask}
                onOpen={(task) => router.push(`/task-details?taskId=${task.id}`)}
            />

            <TaskSection
                title="Upcoming"
                emptyTitle="No upcoming tasks"
                emptyMessage="Future tasks and moved tasks will appear here."
                tasks={upcomingTasks}
                places={places}
                onComplete={handleCompleteTask}
                onLater={handleOpenLaterOptions}
                onDelete={handleDeleteTask}
                onOpen={(task) => router.push(`/task-details?taskId=${task.id}`)}
            />

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
                            onDelete={() => handleDeleteTask(task)}
                            onOpen={() => router.push(`/task-details?taskId=${task.id}`)}
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

    emptyTitle: {
        color: "#4A3B14",
        fontSize: 16,
        fontWeight: "900",
        marginBottom: 6,
    },
});