import { Text, StyleSheet, View, TextInput } from "react-native";

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

export default function SettingsScreen() {

    const [defaultRadiusMeters, setDefaultRadiusMeters] = useState("150");

    useFocusEffect(
        useCallback(() => {
            async function loadSettings() {
                const settings = await getAppSettings();
                setDefaultRadiusMeters(String(settings.defaultRadiusMeters));
            }

            loadSettings();
        }, [])
    );

    async function handleSaveDefaultRadius() {
        await updateAppSettings({
            defaultRadiusMeters: Number(defaultRadiusMeters) || 150,
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
});