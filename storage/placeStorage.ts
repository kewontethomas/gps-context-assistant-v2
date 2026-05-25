import AsyncStorage from "@react-native-async-storage/async-storage";
import { savedPlaces as mockPlaces } from "@/data/places";
import { SavedPlace } from "@/types/place";

const PLACES_KEY = "gps-context-assistant:places";

export async function getSavedPlaces(): Promise<SavedPlace[]> {
  const storedPlaces = await AsyncStorage.getItem(PLACES_KEY);

  if (!storedPlaces) {
    return mockPlaces;
  }

  return JSON.parse(storedPlaces);
}

export async function savePlaces(places: SavedPlace[]) {
  await AsyncStorage.setItem(PLACES_KEY, JSON.stringify(places));
}

export async function addSavedPlace(place: SavedPlace) {
  const currentPlaces = await getSavedPlaces();
  const updatedPlaces = [...currentPlaces, place];

  await savePlaces(updatedPlaces);

  return updatedPlaces;
}

export async function archiveSavedPlace(placeId: string) {
  const currentPlaces = await getSavedPlaces();

  const updatedPlaces = currentPlaces.map((place) => {
    if (place.id === placeId) {
      return {
        ...place,
        archivedAt: new Date().toISOString(),
      };
    }

    return place;
  });

  await savePlaces(updatedPlaces);

  return updatedPlaces;
}