import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, typography } from "@/constants/theme";
import {
  deleteSavedPlace,
  getSavedPlaces,
  updateSavedPlace,
} from "@/storage/placeStorage";
import { getSavedTasks } from "@/storage/taskStorage";
import { PlaceType, SavedPlace, TravelMode } from "@/types/place";

const placeTypes: PlaceType[] = ["permanent", "temporary"];

const travelModes: TravelMode[] = [
  "driving",
  "transit",
  "rideshare",
  "walking",
  "biking",
  "unsure",
];

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function PlaceDetailsScreen() {
  const params = useLocalSearchParams<{ placeId?: string }>();

  const [place, setPlace] = useState<SavedPlace | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [placeType, setPlaceType] = useState<PlaceType>("permanent");
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");

  useFocusEffect(
    useCallback(() => {
      async function loadPlace() {
        if (!params.placeId) {
          return;
        }

        const places = await getSavedPlaces();
        const foundPlace = places.find(
          (savedPlace) => savedPlace.id === params.placeId
        );

        if (!foundPlace) {
          return;
        }

        setPlace(foundPlace);
        setPlaceName(foundPlace.name);
        setDescription(foundPlace.description);
        setAddress(foundPlace.address);
        setPlaceType(foundPlace.type);
        setTravelMode(foundPlace.defaultTravelMode);
      }

      loadPlace();
    }, [params.placeId])
  );

  async function handleSaveChanges() {
    if (!place) {
      return;
    }

    if (!placeName.trim()) {
      console.log("Place name is required.");
      return;
    }

    if (!address.trim()) {
      console.log("Address is required.");
      return;
    }

    const updatedPlace: SavedPlace = {
      ...place,
      name: placeName.trim(),
      description: description.trim() || "Saved place",
      address: address.trim(),
      type: placeType,
      defaultTravelMode: travelMode,
    };

    await updateSavedPlace(updatedPlace);

    router.back();
  }

  async function handleDeletePlace() {
    if (!place) {
      return;
    }

    const tasks = await getSavedTasks();

    const hasLinkedTasks = tasks.some((task) => task.placeId === place.id);

    if (hasLinkedTasks) {
      Alert.alert(
        "Place has tasks",
        "This place has tasks attached to it. Delete or move those tasks before deleting the place."
      );

      return;
    }

    await deleteSavedPlace(place.id);

    router.back();
  }

  return (
    <AppScreen>
      <PageHeader
        label="PLACE DETAILS"
        title="Edit this place."
        subtitle="Update the name, address, type, and default travel method."
      />

      <Card style={styles.formCard}>
        <Text style={styles.fieldLabel}>Place name</Text>

        <TextInput
          style={styles.input}
          placeholder="Example: Home, Work, Gym"
          placeholderTextColor="#94A3B8"
          value={placeName}
          onChangeText={setPlaceName}
        />

        <Text style={styles.fieldLabel}>Description</Text>

        <TextInput
          style={styles.input}
          placeholder="What usually happens here?"
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.fieldLabel}>Address</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter the address"
          placeholderTextColor="#94A3B8"
          value={address}
          onChangeText={setAddress}
        />
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Place type</Text>

        <View style={styles.placeTypeRow}>
          {placeTypes.map((type) => {
            const selected = placeType === type;

            return (
              <Pressable
                key={type}
                onPress={() => setPlaceType(type)}
                style={[
                  styles.placeTypePill,
                  selected && styles.optionPillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {formatLabel(type)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.travelSection}>
        <Text style={styles.sectionTitle}>Default travel mode</Text>

        <View style={styles.travelGrid}>
          {travelModes.map((mode) => {
            const selected = travelMode === mode;

            return (
              <Pressable
                key={mode}
                onPress={() => setTravelMode(mode)}
                style={[
                  styles.travelPill,
                  selected && styles.optionPillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {mode}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton title="Save Changes" onPress={handleSaveChanges} />

        <PrimaryButton
          title="Delete Place"
          variant="secondary"
          onPress={handleDeletePlace}
        />

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

  section: {
    marginBottom: 30,
  },

  travelSection: {
    marginBottom: 46,
  },

  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text,
    marginBottom: 14,
  },

  placeTypeRow: {
    flexDirection: "row",
    gap: 14,
  },

  placeTypePill: {
    minWidth: 120,
    minHeight: 54,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  travelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },

  travelPill: {
    width: "30%",
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

  actions: {
    gap: 14,
    paddingBottom: 90,
  },
});