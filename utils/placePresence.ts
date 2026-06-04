import AsyncStorage from "@react-native-async-storage/async-storage";

const PRESENCE_KEY = "gps-context-assistant:place-presence";

export type PlacePresenceStatus = "inside" | "outside";

export type PlacePresenceMap = {
  [placeId: string]: PlacePresenceStatus;
};

export type PlacePresenceChange = {
  placeId: string;
  previousStatus: PlacePresenceStatus;
  currentStatus: PlacePresenceStatus;
  eventType: "arrival" | "departure" | "none";
};

async function getPresenceMap(): Promise<PlacePresenceMap> {
  const storedPresence = await AsyncStorage.getItem(PRESENCE_KEY);

  if (!storedPresence) {
    return {};
  }

  return JSON.parse(storedPresence);
}

async function savePresenceMap(presenceMap: PlacePresenceMap) {
  await AsyncStorage.setItem(PRESENCE_KEY, JSON.stringify(presenceMap));
}

export async function updatePlacePresence(
  placeId: string,
  isInside: boolean
): Promise<PlacePresenceChange> {
  const presenceMap = await getPresenceMap();

  const previousStatus = presenceMap[placeId] ?? "outside";
  const currentStatus: PlacePresenceStatus = isInside ? "inside" : "outside";

  let eventType: PlacePresenceChange["eventType"] = "none";

  if (previousStatus === "outside" && currentStatus === "inside") {
    eventType = "arrival";
  }

  if (previousStatus === "inside" && currentStatus === "outside") {
    eventType = "departure";
  }

  const updatedPresenceMap: PlacePresenceMap = {
    ...presenceMap,
    [placeId]: currentStatus,
  };

  await savePresenceMap(updatedPresenceMap);

  return {
    placeId,
    previousStatus,
    currentStatus,
    eventType,
  };
}