import { Pressable, Text, StyleSheet, View, TextInput } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/constants/theme";
import { sendTestNotification } from "@/utils/notifications";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
    getAppSettings,
    updateAppSettings,
} from "@/storage/appSettingsStorage";
import { TravelMode } from "@/types/place";

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

type SettingCardProps = {
    title: string;
    value: string;
};

function SettingCard({ title, value }: SettingCardProps) {
    return (
        <Card>
            <Text style={styles.settingTitle}>{title}</Text>
            <Text style={styles.settingValue}>{value}</Text>
        </Card>
    );
}

const travelModes: TravelMode[] = [
    "driving",
    "transit",
    "walking",
    "rideshare",
];

export default function SettingsScreen() {

    const [defaultRadiusMeters, setDefaultRadiusMeters] = useState("150");
    const [notificationCooldownMinutes, setNotificationCooldownMinutes] =
        useState("15");
    const [normalStayReminderMinutes, setNormalStayReminderMinutes] =
        useState("30");
    const [persistentStayReminderMinutes, setPersistentStayReminderMinutes] =
        useState("15");
    const [defaultTravelMode, setDefaultTravelMode] =
        useState<TravelMode>("driving");

    useFocusEffect(
        useCallback(() => {
            async function loadSettings() {
                const settings = await getAppSettings();
                setDefaultRadiusMeters(String(settings.defaultRadiusMeters));
                setNotificationCooldownMinutes(
                    String(settings.notificationCooldownMinutes)
                );
                setNormalStayReminderMinutes(String(settings.normalStayReminderMinutes));
                setPersistentStayReminderMinutes(
                    String(settings.persistentStayReminderMinutes)
                );
            }

            loadSettings();
        }, [])
    );

    async function handleSaveDefaultRadius() {
        await updateAppSettings({
            defaultRadiusMeters: Number(defaultRadiusMeters) || 150,
        });
    }

    async function handleSaveNotificationCooldown() {
        await updateAppSettings({
            notificationCooldownMinutes:
                Number(notificationCooldownMinutes) || 15,
        });
    }

    async function handleSaveStayReminderIntervals() {
        await updateAppSettings({
            normalStayReminderMinutes:
                Number(normalStayReminderMinutes) || 30,
            persistentStayReminderMinutes:
                Number(persistentStayReminderMinutes) || 15,
        });
    }

    async function handleSaveDefaultTravelMode() {
        await updateAppSettings({
            defaultTravelMode,
        });
    }

    return (
        <AppScreen>
            <PageHeader
                label="SETTINGS"
                title="Reminder preferences."
                subtitle="Control how the app handles travel, arrival, departure, and repeated reminders."
            />

            <Card>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingValue}>
                    Send a test notification to confirm reminders are working.
                </Text>

                <View style={styles.buttonWrapper}>
                    <PrimaryButton
                        title="Send Test Notification"
                        onPress={sendTestNotification}
                    />
                </View>
            </Card>

            <Card>
                <Text style={styles.settingTitle}>Default detection radius</Text>

                <Text style={styles.settingValue}>
                    This radius will be used when creating new places.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Example: 150"
                    placeholderTextColor="#94A3B8"
                    value={defaultRadiusMeters}
                    onChangeText={setDefaultRadiusMeters}
                    keyboardType="numeric"
                />

                <View style={styles.buttonWrapper}>
                    <PrimaryButton
                        title="Save Default Radius"
                        onPress={handleSaveDefaultRadius}
                    />
                </View>
            </Card>

            <Card>
                <Text style={styles.settingTitle}>Notification cooldown</Text>

                <Text style={styles.settingValue}>
                    Controls how long the app waits before sending another nearby
                    notification for the same place.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Example: 15"
                    placeholderTextColor="#94A3B8"
                    value={notificationCooldownMinutes}
                    onChangeText={setNotificationCooldownMinutes}
                    keyboardType="numeric"
                />

                <View style={styles.buttonWrapper}>
                    <PrimaryButton
                        title="Save Cooldown"
                        onPress={handleSaveNotificationCooldown}
                    />
                </View>
            </Card>

            <Card>
                <Text style={styles.settingTitle}>Stay reminder intervals</Text>

                <Text style={styles.settingValue}>
                    Controls how often the app reminds you while you are still at a
                    place with unfinished tasks.
                </Text>

                <Text style={styles.inputLabel}>Normal reminders</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Example: 30"
                    placeholderTextColor="#94A3B8"
                    value={normalStayReminderMinutes}
                    onChangeText={setNormalStayReminderMinutes}
                    keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>Persistent reminders</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Example: 15"
                    placeholderTextColor="#94A3B8"
                    value={persistentStayReminderMinutes}
                    onChangeText={setPersistentStayReminderMinutes}
                    keyboardType="numeric"
                />

                <View style={styles.buttonWrapper}>
                    <PrimaryButton
                        title="Save Stay Intervals"
                        onPress={handleSaveStayReminderIntervals}
                    />
                </View>
            </Card>

            <Card>
                <Text style={styles.settingTitle}>Default travel mode</Text>

                <Text style={styles.settingValue}>
                    New places will start with this travel mode unless you change it.
                </Text>

                <View style={styles.optionGrid}>
                    {travelModes.map((mode) => {
                        const selected = defaultTravelMode === mode;

                        return (
                            <Pressable
                                key={mode}
                                onPress={() => setDefaultTravelMode(mode)}
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
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                <View style={styles.buttonWrapper}>
                    <PrimaryButton
                        title="Save Travel Mode"
                        onPress={handleSaveDefaultTravelMode}
                    />
                </View>
            </Card>

            {settings.map((setting) => (
                <SettingCard
                    key={setting.title}
                    title={setting.title}
                    value={setting.value}
                />
            ))}
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    settingTitle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "900",
        marginBottom: 6,
    },

    settingValue: {
        color: colors.softText,
        fontSize: 14,
        lineHeight: 20,
    },

    buttonWrapper: {
        marginTop: 14,
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
        marginTop: 14,
    },

    inputLabel: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "900",
        marginTop: 14,
    },

    optionGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 14,
    },

    optionPill: {
        backgroundColor: "#F8FAFC",
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },

    optionPillSelected: {
        backgroundColor: colors.primarySoft,
        borderColor: colors.primary,
    },

    optionText: {
        color: colors.softText,
        fontSize: 13,
        fontWeight: "800",
    },

    optionTextSelected: {
        color: colors.primary,
    },
});