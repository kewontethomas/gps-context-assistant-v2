import { Text, StyleSheet } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { colors } from "@/constants/theme";

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
  return (
    <AppScreen>
      <PageHeader
        label="SETTINGS"
        title="Reminder preferences."
        subtitle="Control how the app handles travel, arrival, departure, and repeated reminders."
      />

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
});