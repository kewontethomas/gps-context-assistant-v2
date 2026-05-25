import * as Location from "expo-location";

export type CurrentLocation = {
  latitude: number;
  longitude: number;
};

export async function getCurrentLocation(): Promise<CurrentLocation | null> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== "granted") {
    console.log("Location permission denied.");
    return null;
  }

  const currentLocation = await Location.getCurrentPositionAsync({});

  return {
    latitude: currentLocation.coords.latitude,
    longitude: currentLocation.coords.longitude,
  };
}

export function calculateDistanceMeters(
  firstLatitude: number,
  firstLongitude: number,
  secondLatitude: number,
  secondLongitude: number
) {
  const earthRadiusMeters = 6371000;

  const firstLatRadians = degreesToRadians(firstLatitude);
  const secondLatRadians = degreesToRadians(secondLatitude);

  const latDifference = degreesToRadians(secondLatitude - firstLatitude);
  const lngDifference = degreesToRadians(secondLongitude - firstLongitude);

  const a =
    Math.sin(latDifference / 2) * Math.sin(latDifference / 2) +
    Math.cos(firstLatRadians) *
      Math.cos(secondLatRadians) *
      Math.sin(lngDifference / 2) *
      Math.sin(lngDifference / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
}

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

export function isWithinPlaceRadius(
  currentLatitude: number,
  currentLongitude: number,
  placeLatitude: number,
  placeLongitude: number,
  radiusMeters: number
) {
  const distanceMeters = calculateDistanceMeters(
    currentLatitude,
    currentLongitude,
    placeLatitude,
    placeLongitude
  );

  return distanceMeters <= radiusMeters;
}