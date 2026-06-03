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
  baselineSynced?: boolean;
};

export type UpdatePlacePresenceOptions = {
  silent?: boolean;
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
  isInside: boolean,
  options: UpdatePlacePresenceOptions = {}
): Promise<PlacePresenceChange> {
  const presenceMap = await getPresenceMap();

  const currentStatus: PlacePresenceStatus = isInside ? "inside" : "outside";
  const previousStatus = presenceMap[placeId] ?? currentStatus;

  let eventType: PlacePresenceChange["eventType"] = "none";

  if (!options.silent) {
    if (previousStatus === "outside" && currentStatus === "inside") {
      eventType = "arrival";
    }

    if (previousStatus === "inside" && currentStatus === "outside") {
      eventType = "departure";
    }
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
    baselineSynced: options.silent,
  };
}

export async function baselinePlacePresence(
  placeId: string,
  isInside: boolean
) {
  return updatePlacePresence(placeId, isInside, { silent: true });
}
