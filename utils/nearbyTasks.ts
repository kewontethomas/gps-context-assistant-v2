import { SavedPlace } from "@/types/place";
import { LocationTask } from "@/types/task";
import { calculateDistanceMeters } from "@/utils/location";

export type NearbyTaskResult = {
  place: SavedPlace;
  tasks: LocationTask[];
  distanceMeters: number;
};

export function findNearbyTasks(
  currentLatitude: number,
  currentLongitude: number,
  places: SavedPlace[],
  tasks: LocationTask[]
): NearbyTaskResult[] {
  const activeTasks = tasks.filter((task) => task.status === "active");

  return places
    .filter((place) => {
      return (
        !place.archivedAt &&
        typeof place.latitude === "number" &&
        typeof place.longitude === "number"
      );
    })
    .map((place) => {
      const distanceMeters = calculateDistanceMeters(
        currentLatitude,
        currentLongitude,
        place.latitude as number,
        place.longitude as number
      );

      const placeTasks = activeTasks.filter((task) => task.placeId === place.id);

      return {
        place,
        tasks: placeTasks,
        distanceMeters,
      };
    })
    .filter((result) => {
      return (
        result.tasks.length > 0 &&
        result.distanceMeters <= result.place.radiusMeters
      );
    });
}