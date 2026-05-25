import { useCallback, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, typography } from "@/constants/theme";
import { getSavedPlaces } from "@/storage/placeStorage";
import { addSavedTask } from "@/storage/taskStorage";
import { SavedPlace } from "@/types/place";
import { LocationTask, ReminderProfile, TaskRecurrence } from "@/types/task";

const recurrenceOptions: TaskRecurrence[] = [
    "none",
    "daily",
    "weekdays",
    "weekly",
];

const reminderProfiles: ReminderProfile[] = [
    "gentle",
    "normal",
    "persistent",
];

const [reminderProfile, setReminderProfile] =
    useState<ReminderProfile>("normal");

const reminderOptions = [
    {
        key: "arrival",
        label: "On arrival",
        description: "Remind me when I reach the place.",
    },
    {
        key: "departure",
        label: "On departure",
        description: "Remind me if I leave before completing it.",
    },
    {
        key: "repeat",
        label: "Repeat while there",
        description: "Keep reminding me during my chosen reminder window.",
    },
    {
        key: "due",
        label: "Before due time",
        description: "Alert me early enough to finish on time.",
    },
];

function getReminderProfileDescription(profile: ReminderProfile) {
    if (profile === "gentle") {
        return "Arrival and departure reminders only.";
    }

    if (profile === "persistent") {
        return "Arrival, repeated reminders, and departure alerts.";
    }

    return "Balanced reminders while you are at the place.";
}

function formatLabel(value: string) {
    if (value === "none") {
        return "One-time";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AddTaskScreen() {
    const [places, setPlaces] = useState<SavedPlace[]>([]);

    const [taskTitle, setTaskTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedPlaceId, setSelectedPlaceId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [recurrence, setRecurrence] = useState<TaskRecurrence>("none");

    const [arrivalReminder, setArrivalReminder] = useState(true);
    const [departureReminder, setDepartureReminder] = useState(true);
    const [repeatReminder, setRepeatReminder] = useState(false);
    const [dueReminder, setDueReminder] = useState(false);

    useFocusEffect(
        useCallback(() => {
            async function loadPlaces() {
                const savedPlaces = await getSavedPlaces();
                const visiblePlaces = savedPlaces.filter((place) => !place.archivedAt);

                setPlaces(visiblePlaces);

                if (!selectedPlaceId && visiblePlaces.length > 0) {
                    setSelectedPlaceId(visiblePlaces[0].id);
                }
            }

            loadPlaces();
        }, [selectedPlaceId])
    );

    function isReminderSelected(key: string) {
        if (key === "arrival") return arrivalReminder;
        if (key === "departure") return departureReminder;
        if (key === "repeat") return repeatReminder;
        if (key === "due") return dueReminder;

        return false;
    }

    function toggleReminder(key: string) {
        if (key === "arrival") setArrivalReminder(!arrivalReminder);
        if (key === "departure") setDepartureReminder(!departureReminder);
        if (key === "repeat") setRepeatReminder(!repeatReminder);
        if (key === "due") setDueReminder(!dueReminder);
    }

    async function handleSaveTask() {
        if (!taskTitle.trim()) {
            console.log("Task title is required.");
            return;
        }

        if (!selectedPlaceId) {
            console.log("A place is required.");
            return;
        }

        const newTask: LocationTask = {
            id: `task-${Date.now()}`,
            placeId: selectedPlaceId,

            title: taskTitle.trim(),
            notes: notes.trim() || undefined,

            status: "active",

            dueDate: dueDate.trim() || undefined,
            dueTime: dueTime.trim() || undefined,
            arriveByTime: undefined,

            recurrence,

            travelMode: "unsure",
            travelBufferMinutes: 10,

            notifyBeforeLeave: false,
            notifyOnArrival: reminderProfile !== "gentle" || arrivalReminder,
            notifyWhileThere: reminderProfile === "normal" || reminderProfile === "persistent",
            notifyEveryMinutes:
                reminderProfile === "persistent"
                    ? 15
                    : reminderProfile === "normal"
                        ? 30
                        : undefined,
            notifyOnDeparture: reminderProfile !== "gentle" || departureReminder,
            notifyBeforeDue: dueReminder,
            createdAt: new Date().toISOString(),

            reminderProfile,
        };

        await addSavedTask(newTask);

        router.back();
    }

    return (
        <AppScreen>
            <PageHeader
                label="ADD TASK"
                title="Create a place-based task."
                subtitle="Choose where the task belongs, when it matters, and how strongly the app should remind you."
            />

            <Card style={styles.formCard}>
                <Text style={styles.fieldLabel}>Task title</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Example: Bring work badge"
                    placeholderTextColor="#94A3B8"
                    value={taskTitle}
                    onChangeText={setTaskTitle}
                />

                <Text style={styles.fieldLabel}>Notes</Text>

                <TextInput
                    style={[styles.input, styles.notesInput]}
                    placeholder="Optional details"
                    placeholderTextColor="#94A3B8"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    textAlignVertical="top"
                />
            </Card>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Place</Text>

                <View style={styles.placeList}>
                    {places.map((place) => {
                        const selected = selectedPlaceId === place.id;

                        return (
                            <Pressable
                                key={place.id}
                                onPress={() => setSelectedPlaceId(place.id)}
                                style={[
                                    styles.placeOption,
                                    selected && styles.placeOptionSelected,
                                ]}
                            >
                                <Text style={styles.placeIcon}>{place.icon}</Text>

                                <View style={styles.placeTextArea}>
                                    <Text
                                        style={[
                                            styles.placeName,
                                            selected && styles.placeNameSelected,
                                        ]}
                                    >
                                        {place.name}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.placeDescription,
                                            selected && styles.placeDescriptionSelected,
                                        ]}
                                    >
                                        {place.type === "permanent" ? "Permanent" : "Temporary"}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <Card style={styles.formCard}>
                <Text style={styles.fieldLabel}>Due date</Text>

                <TextInput
                    style={[styles.input, styles.dueDateInput]}
                    placeholder="Example: Today, Tomorrow, May 30"
                    placeholderTextColor="#94A3B8"
                    value={dueDate}
                    onChangeText={setDueDate}
                />

                <Text style={styles.fieldLabel}>Due time</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Example: 8:00 AM"
                    placeholderTextColor="#94A3B8"
                    value={dueTime}
                    onChangeText={setDueTime}
                />
            </Card>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Repeat</Text>

                <View style={styles.optionGrid}>
                    {recurrenceOptions.map((option) => {
                        const selected = recurrence === option;

                        return (
                            <Pressable
                                key={option}
                                onPress={() => setRecurrence(option)}
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
                                    {formatLabel(option)}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
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
                                {formatLabel(profile)}
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

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reminders</Text>

                {reminderOptions.map((option) => {
                    const selected = isReminderSelected(option.key);

                    return (
                        <Pressable
                            key={option.key}
                            onPress={() => toggleReminder(option.key)}
                            style={[
                                styles.reminderCard,
                                selected && styles.reminderCardSelected,
                            ]}
                        >
                            <View style={styles.reminderCircle}>
                                {selected && <View style={styles.reminderCircleInner} />}
                            </View>

                            <View style={styles.reminderTextArea}>
                                <Text style={styles.reminderTitle}>{option.label}</Text>
                                <Text style={styles.reminderDescription}>
                                    {option.description}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            <View style={styles.actions}>
                <PrimaryButton title="Save Task" onPress={handleSaveTask} />

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
    formCard: {
        marginBottom: 28,
    },

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

    dueDateInput: {
        minHeight: 70,
    },

    section: {
        marginBottom: 30,
    },

    sectionTitle: {
        ...typography.sectionTitle,
        color: colors.text,
        marginBottom: 14,
    },

    placeList: {
        gap: 12,
    },

    placeOption: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 18,

        flexDirection: "row",
        alignItems: "center",

        borderColor: colors.border,
        borderWidth: 1,
    },

    placeOptionSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    placeIcon: {
        fontSize: 26,
        marginRight: 14,
    },

    placeTextArea: {
        flex: 1,
    },

    placeName: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "900",
        marginBottom: 2,
    },

    placeNameSelected: {
        color: "#FFFFFF",
    },

    placeDescription: {
        color: colors.softText,
        fontSize: 13,
        fontWeight: "800",
    },

    placeDescriptionSelected: {
        color: "#DBEAFE",
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

    reminderCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 18,

        flexDirection: "row",
        alignItems: "center",

        borderColor: colors.border,
        borderWidth: 1,

        marginBottom: 12,
    },

    reminderCardSelected: {
        borderColor: colors.primary,
        backgroundColor: "#EFF6FF",
    },

    reminderCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,

        borderWidth: 2,
        borderColor: colors.primary,

        alignItems: "center",
        justifyContent: "center",

        marginRight: 14,
    },

    reminderCircleInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },

    reminderTextArea: {
        flex: 1,
    },

    reminderTitle: {
        color: colors.text,
        fontSize: 15,
        fontWeight: "900",
        marginBottom: 4,
    },

    reminderDescription: {
        color: colors.softText,
        fontSize: 13,
        lineHeight: 19,
    },

    actions: {
        gap: 14,
        paddingBottom: 90,
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