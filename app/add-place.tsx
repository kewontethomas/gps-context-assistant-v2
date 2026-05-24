import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { router } from "expo-router";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, typography } from "@/constants/theme";
import { PlaceType, TravelMode } from "@/types/place";

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

export default function AddPlaceScreen() {
  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");
  const [placeType, setPlaceType] = useState<PlaceType>("permanent");
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");

  function handleSavePlace() {
    console.log({
      placeName,
      address,
      placeType,
      travelMode,
    });

    router.back();
  }

  return (
    <AppScreen>
      <PageHeader
        label="ADD PLACE"
        title="Create a saved place."
        subtitle="Save permanent places like Home and Work, or temporary places for errands and appointments."
      />

      <Card style={styles.formCard}>
        <Text style={styles.fieldLabel}>Place name</Text>

        <TextInput
          style={styles.input}
          placeholder="Example: Work, Home, Etc..."
          placeholderTextColor="#94A3B8"
          value={placeName}
          onChangeText={setPlaceName}
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
        <Text style={styles.sectionTitle}>Usual travel mode</Text>

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
        <PrimaryButton title="Save Place" onPress={handleSavePlace} />

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