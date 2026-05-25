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