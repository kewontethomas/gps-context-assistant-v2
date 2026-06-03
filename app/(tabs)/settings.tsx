import { Pressable, Text, StyleSheet, View, TextInput } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionTitle } from "@/components/SectionTitle";
import { colors } from "@/constants/theme";
import {
    getAppSettings,
    updateAppSettings,
} from "@/storage/appSettingsStorage";
import { TravelMode } from "@/types/place";
import { sendTestNotification } from "@/utils/notifications";
import {
    isBackgroundGeofencingRegistered,
    registerSavedPlaceGeofences,
    stopSavedPlaceGeofences,
} from "@/utils/backgroundGeofencing";

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
    const [backgroundStatus, setBackgroundStatus] = useState(
        "Background geofencing status unknown."
    );

    useFocusEffect(
        useCallback(() => {
            async function loadSettings() {
                const settings = await getAppSettings();

                setDefaultRadiusMeters(String(settings.defaultRadiusMeters));
                setNotificationCooldownMinutes(
                    String(settings.notificationCooldownMinutes)
                );
                setNormalStayReminderMinutes(
                    String(settings.normalStayReminderMinutes)
                );
                setPersistentStayReminderMinutes(
                    String(settings.persistentStayReminderMinutes)
                );
                setDefaultTravelMode(settings.defaultTravelMode);

                const isRegistered = await isBackgroundGeofencingRegistered();
                setBackgroundStatus(
                    isRegistered
                        ? "Background geofencing is active."
                        : "Background geofencing is not active."
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

    async function handleEnableBackgroundGeofencing() {
        const result = await registerSavedPlaceGeofences();
        setBackgroundStatus(result.message);
    }

    async function handleDisableBackgroundGeofencing() {
        const result = await stopSavedPlaceGeofences();
        setBackgroundStatus(result.message);
    }

    return (
        <AppScreen>
            <PageHeader
                label="SETTINGS"
                title="Reminder preferences."
                subtitle="Control location detection, notification timing, and default travel behavior."
            />

            <SectionTitle>Notifications</SectionTitle>

            <Card>
                <Text style={styles.settingTitle}>Test notifications</Text>
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

            <SectionTitle>Location defaults</SectionTitle>

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

            <SectionTitle>Travel defaults</SectionTitle>

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

            <SectionTitle>Background awareness</SectionTitle>

            <Card>
                <Text style={styles.settingTitle}>Background geofencing</Text>

                <Text style={styles.settingValue}>
                    Monitor saved places even when the app is not open. This is what
                    powers real arrival and departure reminders.
                </Text>

                <Text style={styles.statusText}>{backgroundStatus}</Text>

                <View style={styles.buttonWrapper}>
                    <PrimaryButton
                        title="Enable Background Monitoring"
                        onPress={handleEnableBackgroundGeofencing}
                    />
                </View>

                <View style={styles.buttonWrapper}>
                    <PrimaryButton
                        title="Stop Background Monitoring"
                        variant="secondary"
                        onPress={handleDisableBackgroundGeofencing}
                    />
                </View>
            </Card>

            <SectionTitle>System behavior</SectionTitle>

            <Card>
                <Text style={styles.settingTitle}>How reminders behave</Text>

                <Text style={styles.settingValue}>
                    Arrival reminders trigger when you enter a saved place. Departure
                    reminders help catch unfinished tasks when you leave. Stay reminders
                    repeat based on the task’s reminder profile.
                </Text>
            </Card>
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

    statusText: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: "800",
        lineHeight: 19,
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