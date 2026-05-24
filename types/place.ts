export type PlaceType = "permanent" | "temporary";

export type PlaceCategory =
  | "home"
  | "work"
  | "school"
  | "store"
  | "gym"
  | "appointment"
  | "custom";

export type TravelMode =
  | "driving"
  | "transit"
  | "rideshare"
  | "walking"
  | "biking"
  | "unsure";

export type SavedPlace = {
  id: string;
  name: string;
  description: string;
  address: string;

  latitude?: number;
  longitude?: number;
  radiusMeters: number;

  type: PlaceType;
  category: PlaceCategory;
  icon: string;

  defaultTravelMode: TravelMode;

  createdAt: string;
  archivedAt?: string;
};