import { View, Text, StyleSheet, Pressable } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, spacing, typography } from "@/constants/theme";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getSavedPlaces } from "@/storage/placeStorage";
import { SavedPlace } from "@/types/place";
import { router } from "expo-router";

type PlaceCardProps = {
  icon: string;
  name: string;
  description: string;
  isTemporary?: boolean;
  onPress: () => void;
};

function PlaceCard({
  icon,
  name,
  description,
  isTemporary = false,
  onPress,
}: PlaceCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card variant={isTemporary ? "yellow" : "default"} style={styles.placeCard}>
        <Text style={styles.placeIcon}>{icon}</Text>

        <View style={styles.placeTextArea}>
          <Text style={styles.placeName}>{name}</Text>
          <Text style={styles.placeDescription}>{description}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

export default function PlacesScreen() {
  const [places, setPlaces] = useState<SavedPlace[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadPlaces() {
        const savedPlaces = await getSavedPlaces();
        setPlaces(savedPlaces);
      }

      loadPlaces();
    }, [])
  );

  const visiblePlaces = places.filter((place) => !place.archivedAt);

  const permanentPlaces = visiblePlaces.filter(
    (place) => place.type === "permanent"
  );

  const temporaryPlaces = visiblePlaces.filter(
    (place) => place.type === "temporary"
  );

  return (
    <AppScreen>
      <PageHeader
        label="PLACES"
        title="Your saved places."
        subtitle="Permanent places stay saved. Temporary places are removed or archived after their tasks are complete."
      />

      <View style={styles.buttonWrapper}>
        <PrimaryButton title="Add Place" onPress={() => router.push("/add-place")} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permanent Places</Text>

        {permanentPlaces.length === 0 ? (
          <Card variant="yellow">
            <Text style={styles.emptyTitle}>No permanent places yet</Text>
            <Text style={styles.emptyText}>
              Add places like Home, Work, School, or the Gym to create recurring location-based tasks.
            </Text>
          </Card>
        ) : (
          permanentPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              icon={place.icon}
              name={place.name}
              description={place.description}
              onPress={() => router.push(`/place-details?placeId=${place.id}`)}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temporary Places</Text>

        {temporaryPlaces.length === 0 ? (
          <Card variant="yellow">
            <Text style={styles.emptyTitle}>No temporary places</Text>
            <Text style={styles.emptyText}>
              Temporary places appear when you add one-time errands, appointments, or stops.
            </Text>
          </Card>
        ) : (
          temporaryPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              icon={place.icon}
              name={place.name}
              description={place.description}
              isTemporary
              onPress={() => router.push(`/place-details?placeId=${place.id}`)}
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

  emptyTitle: {
  color: "#4A3B14",
  fontSize: 16,
  fontWeight: "900",
  marginBottom: 6,
},

emptyText: {
  color: "#6B5E3D",
  fontSize: 15,
  lineHeight: 22,
},
});