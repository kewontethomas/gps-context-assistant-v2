import AsyncStorage from "@react-native-async-storage/async-storage";
import { savedPlaces as mockPlaces } from "@/data/places";
import { SavedPlace } from "@/types/place";
import { LocationTask } from "@/types/task";

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

export async function updateSavedPlace(updatedPlace: SavedPlace) {
  const currentPlaces = await getSavedPlaces();

  const updatedPlaces = currentPlaces.map((place) => {
    if (place.id === updatedPlace.id) {
      return updatedPlace;
    }

    return place;
  });

  await savePlaces(updatedPlaces);

  return updatedPlaces;
}

export async function deleteSavedPlace(placeId: string) {
  const currentPlaces = await getSavedPlaces();

  const updatedPlaces = currentPlaces.filter((place) => place.id !== placeId);

  await savePlaces(updatedPlaces);

  return updatedPlaces;
}

export async function archiveTemporaryPlaceIfCleared(
  placeId: string,
  updatedTasks: LocationTask[]
) {
  const currentPlaces = await getSavedPlaces();

  const place = currentPlaces.find((savedPlace) => savedPlace.id === placeId);

  if (!place || place.type !== "temporary") {
    return currentPlaces;
  }

  const hasRemainingOpenTasks = updatedTasks.some(
    (task) =>
      task.placeId === placeId &&
      (task.status === "active" || task.status === "snoozed")
  );

  if (hasRemainingOpenTasks) {
    return currentPlaces;
  }

  const updatedPlaces = currentPlaces.map((savedPlace) => {
    if (savedPlace.id === placeId) {
      return {
        ...savedPlace,
        archivedAt: new Date().toISOString(),
      };
    }

    return savedPlace;
  });

  await savePlaces(updatedPlaces);

  return updatedPlaces;
}