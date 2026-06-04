import { getSavedPlaces } from "@/storage/placeStorage";
import {
  FieldSeedInboxItem,
  markFieldSeedInboxItemAccepted,
  markFieldSeedInboxItemRejected,
} from "@/storage/fieldSeedInboxStorage";
import { importFieldSeedTask } from "@/utils/fieldSeedTaskImport";

export async function acceptFieldSeedInboxItem(item: FieldSeedInboxItem) {
  const places = await getSavedPlaces();

  const result = await importFieldSeedTask(places, {
    externalSourceId: item.externalSourceId,
    title: item.title,
    notes: item.notes,
    placeName: item.placeName,
    address: item.address,
    latitude: item.latitude,
    longitude: item.longitude,
    radiusMeters: item.radiusMeters,
    priority: item.priority,
    contextType: item.contextType,
    reminderProfile: item.reminderProfile,
    dueDate: item.dueDate,
    dueTime: item.dueTime,
  });

  if (!result.imported) {
    return {
      accepted: false,
      reason: result.reason,
    };
  }

  if (!result.task) {
    return {
      accepted: false,
      reason: "FieldSeed task imported without a task result.",
    };
  }

  const importedTask = result.task;

  const updatedInboxItems = await markFieldSeedInboxItemAccepted(
    item.id,
    importedTask.id
  );

  return {
    accepted: true,
    task: importedTask,
    inboxItems: updatedInboxItems,
  };
}

export async function rejectFieldSeedInboxItem(item: FieldSeedInboxItem) {
  const updatedInboxItems = await markFieldSeedInboxItemRejected(item.id);

  return {
    rejected: true,
    inboxItems: updatedInboxItems,
  };
}
