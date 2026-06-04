import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  if (__DEV__ && !Device.isDevice) {
    console.log("Notifications require a physical device.");
    return false;
  }

  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.granted) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();

  return requestedPermission.granted;
}

export async function sendTestNotification() {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    console.log("Notification permission denied.");
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "GPS Context Assistant",
      body: "This is a test reminder.",
      sound: true,
    },
    trigger: null,
  });
}

export async function sendNearbyTasksNotification(
  placeName: string,
  taskCount: number
) {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    console.log("Notification permission denied.");
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `You're near ${placeName}`,
      body: `${taskCount} active task${taskCount === 1 ? "" : "s"} waiting here.`,
      sound: true,
    },
    trigger: null,
  });
}

export async function sendPlaceEventNotification(
  placeName: string,
  eventType: "arrival" | "departure",
  taskCount: number
) {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return;
  }

  const title =
    eventType === "arrival"
      ? `You arrived at ${placeName}`
      : `You left ${placeName}`;

  const body =
    eventType === "arrival"
      ? `${taskCount} active task${taskCount === 1 ? "" : "s"} waiting here.`
      : `${taskCount} unfinished task${taskCount === 1 ? "" : "s"} still here.`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null,
  });
}

export async function sendStillAtPlaceNotification(
  placeName: string,
  taskCount: number
) {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Still at ${placeName}`,
      body: `${taskCount} unfinished task${taskCount === 1 ? "" : "s"} still waiting.`,
      sound: true,
    },
    trigger: null,
  });
}

export async function sendFieldSeedCloudTaskNotification(taskCount: number) {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "New FieldSeed task received",
      body: `${taskCount} work task${taskCount === 1 ? "" : "s"} waiting in your FieldSeed Inbox.`,
      sound: true,
    },
    trigger: null,
  });
}
