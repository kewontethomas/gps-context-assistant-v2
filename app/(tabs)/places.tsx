import { View, Text, StyleSheet } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";

const permanentPlaces = [
  {
    name: "Home",
    description: "Daily routines, chores, family tasks",
    icon: "🏠",
  },
  {
    name: "Work",
    description: "Recurring work tasks, site reminders, deadlines",
    icon: "💼",
  },
  {
    name: "School",
    description: "Assignments, classes, campus reminders",
    icon: "🎓",
  },
];

const temporaryPlaces = [
  {
    name: "Walmart Errand",
    description: "Temporary place example — disappears after tasks are complete",
    icon: "🛒",
  },
];

type PlaceCardProps = {
  icon: string;
  name: string;
  description: string;
  isTemporary?: boolean;
};

function PlaceCard({
  icon,
  name,
  description,
  isTemporary = false,
}: PlaceCardProps) {
  return (
    <Card variant={isTemporary ? "yellow" : "default"} style={styles.placeCard}>
      <Text style={styles.placeIcon}>{icon}</Text>

      <View style={styles.placeTextArea}>
        <Text style={styles.placeName}>{name}</Text>
        <Text style={styles.placeDescription}>{description}</Text>
      </View>
    </Card>
  );
}

export default function PlacesScreen() {
  return (
    <AppScreen>
      <PageHeader
        label="PLACES"
        title="Your saved places."
        subtitle="Permanent places stay saved. Temporary places are removed or archived after their tasks are complete."
      />

      <View style={styles.buttonWrapper}>
        <PrimaryButton title="Add Place" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permanent Places</Text>

        {permanentPlaces.map((place) => (
          <PlaceCard
            key={place.name}
            icon={place.icon}
            name={place.name}
            description={place.description}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temporary Places</Text>

        {temporaryPlaces.map((place) => (
          <PlaceCard
            key={place.name}
            icon={place.icon}
            name={place.name}
            description={place.description}
            isTemporary
          />
        ))}
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

  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },

  placeIcon: {
    fontSize: 30,
    marginRight: 16,
  },

  placeTextArea: {
    flex: 1,
  },

  placeName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
  },

  placeDescription: {
    color: colors.softText,
    fontSize: 14,
    lineHeight: 20,
  },
});