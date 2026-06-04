import { AppState, AppStateStatus } from "react-native";

import { syncFieldSeedCloudTasks } from "@/services/fieldSeedCloudSync";
import { sendFieldSeedCloudTaskNotification } from "@/utils/notifications";

const AUTO_SYNC_INTERVAL_MS = 1000 * 60 * 5;
const MIN_SYNC_GAP_MS = 1000 * 30;

let syncInterval: ReturnType<typeof setInterval> | null = null;
let lastSyncStartedAt = 0;
let isSyncRunning = false;
let hasStarted = false;

async function runFieldSeedAutoSync(reason: string) {
  const now = Date.now();

  if (isSyncRunning) {
    return;
  }

  if (now - lastSyncStartedAt < MIN_SYNC_GAP_MS) {
    return;
  }

  lastSyncStartedAt = now;
  isSyncRunning = true;

  try {
    const result = await syncFieldSeedCloudTasks();

    if (result.importedCount > 0) {
      await sendFieldSeedCloudTaskNotification(result.importedCount);
    }

    console.log(`[FieldSeed Auto Sync] ${reason}: ${result.message}`);
  } catch (error) {
    console.log(`[FieldSeed Auto Sync] ${reason} failed:`, error);
  } finally {
    isSyncRunning = false;
  }
}

function handleAppStateChange(state: AppStateStatus) {
  if (state === "active") {
    runFieldSeedAutoSync("app became active");
  }
}

export function startFieldSeedAutoSync() {
  if (hasStarted) {
    return () => {};
  }

  hasStarted = true;

  runFieldSeedAutoSync("startup");

  syncInterval = setInterval(() => {
    runFieldSeedAutoSync("interval");
  }, AUTO_SYNC_INTERVAL_MS);

  const appStateSubscription = AppState.addEventListener(
    "change",
    handleAppStateChange
  );

  return () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }

    appStateSubscription.remove();
    hasStarted = false;
  };
}
