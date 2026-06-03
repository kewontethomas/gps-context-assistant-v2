import { useCallback, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { addSavedPlace } from "@/storage/placeStorage";
import { SavedPlace } from "@/types/place";

import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, typography } from "@/constants/theme";
import { PlaceType, TravelMode } from "@/types/place";
import * as Location from "expo-location";
import { registerSavedPlaceGeofences } from "@/utils/backgroundGeofencing";
import { getAppSettings } from "@/storage/appSettingsStorage";


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
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [coordinateStatus, setCoordinateStatus] = useState(
        "No coordinates found yet."
    );
    const [defaultRadiusMeters, setDefaultRadiusMeters] = useState(150);

    useFocusEffect(
        useCallback(() => {
            async function loadSettings() {
                const settings = await getAppSettings();
                setDefaultRadiusMeters(settings.defaultRadiusMeters);
                setTravelMode(settings.defaultTravelMode);
            }

            loadSettings();
        }, [])
    );

    async function handleFindCoordinates() {
        if (!address.trim()) {
            setCoordinateStatus("Enter an address first.");
            return;
        }

        try {
            setCoordinateStatus("Finding coordinates...");

            const results = await Location.geocodeAsync(address.trim());

            if (results.length === 0) {
                setCoordinateStatus("No coordinates found for that address.");
                return;
            }

            const firstResult = results[0];

            setLatitude(firstResult.latitude);
            setLongitude(firstResult.longitude);

            setCoordinateStatus(
                `Coordinates found:\nLat: ${firstResult.latitude.toFixed(5)}\nLng: ${firstResult.longitude.toFixed(5)}`
            );
        } catch (error) {
            console.log(error);
            setCoordinateStatus("Could not find coordinates. Try a more complete address.");
        }
    }

    async function handleSavePlace() {
        if (!placeName.trim()) {
            console.log("Place name is required.");
            return;
        }

        if (!address.trim()) {
            console.log("Address is required.");
            return;
        }

        const newPlace: SavedPlace = {
            id: `place-${Date.now()}`,
            name: placeName.trim(),
            description:
                placeType === "permanent"
                    ? "Saved permanent place"
                    : "Temporary place for this task or errand",
            address: address.trim(),

            latitude,
            longitude,
            radiusMeters: defaultRadiusMeters,
            type: placeType,
            category: "custom",
            icon: placeType === "permanent" ? "📍" : "🧭",

            defaultTravelMode: travelMode,

            createdAt: new Date().toISOString(),
        };

        await addSavedPlace(newPlace);
        await registerSavedPlaceGeofences();

        router.back();
    }

    async function handleUseCurrentLocation() {
        try {
            setCoordinateStatus("Getting current location...");

            const permission = await Location.requestForegroundPermissionsAsync();

            if (permission.status !== "granted") {
                setCoordinateStatus("Location permission denied.");
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});

            setLatitude(currentLocation.coords.latitude);
            setLongitude(currentLocation.coords.longitude);

            setCoordinateStatus(
                `Current location saved:\nLat: ${currentLocation.coords.latitude.toFixed(5)}\nLng: ${currentLocation.coords.longitude.toFixed(5)}`
            );
        } catch (error) {
            console.log(error);
            setCoordinateStatus("Could not get current location.");
        }
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

                <PrimaryButton
                    title="Find Coordinates"
                    variant="secondary"
                    onPress={handleFindCoordinates}
                />

                <View style={styles.coordinateButtonGap}>
                    <PrimaryButton
                        title="Use Current Location"
                        variant="secondary"
                        onPress={handleUseCurrentLocation}
                    />
                </View>

                <Text style={styles.coordinateStatus}>
                    {coordinateStatus}
                </Text>

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

    coordinateStatus: {
        color: colors.softText,
        fontSize: 13,
        lineHeight: 20,
        marginTop: 12,
        flexShrink: 1,
    },

    coordinateButtonGap: {
        marginTop: 10,
    },
});