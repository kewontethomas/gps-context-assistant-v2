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
import * as Location from "expo-location";

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
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [coordinateStatus, setCoordinateStatus] = useState(
        "No coordinates found yet."
    );
    const [radiusMeters, setRadiusMeters] = useState("150");

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
                setLatitude(foundPlace.latitude);
                setLongitude(foundPlace.longitude);

                if (
                    typeof foundPlace.latitude === "number" &&
                    typeof foundPlace.longitude === "number"
                ) {
                    setCoordinateStatus(
                        `Coordinates saved:\nLat: ${foundPlace.latitude.toFixed(5)}\nLng: ${foundPlace.longitude.toFixed(5)}`
                    );
                } else {
                    setCoordinateStatus("No coordinates saved yet.");
                }

                setRadiusMeters(String(foundPlace.radiusMeters ?? 150));
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
            latitude,
            longitude,
            radiusMeters: Number(radiusMeters) || 150,
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


                <Text style={styles.fieldLabel}>Detection radius</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Example: 150"
                    placeholderTextColor="#94A3B8"
                    value={radiusMeters}
                    onChangeText={setRadiusMeters}
                    keyboardType="numeric"
                />

                <Text style={styles.helperText}>
                    Larger radius = easier to trigger nearby tasks. Try 300–1000 meters for testing.
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

    coordinateStatus: {
        color: colors.softText,
        fontSize: 13,
        lineHeight: 20,
        marginTop: 12,
    },

    helperText: {
        color: colors.softText,
        fontSize: 13,
        lineHeight: 19,
        marginTop: -10,
        marginBottom: 18,
    },

    coordinateButtonGap: {
        marginTop: 10,
    },
});