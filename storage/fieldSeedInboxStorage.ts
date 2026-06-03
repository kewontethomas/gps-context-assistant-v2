import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ReminderProfile,
  TaskContextType,
  TaskPriority,
} from "@/types/task";

const FIELDSEED_INBOX_KEY = "gps-context-assistant:fieldseed-inbox";

export type FieldSeedInboxStatus = "pending" | "accepted" | "rejected";

export type FieldSeedInboxItem = {
  id: string;
  externalSourceId?: string;
  title: string;
  notes?: string;
  placeName: string;
  priority: TaskPriority;
  contextType: TaskContextType;
  reminderProfile: ReminderProfile;
  dueDate: string;
  dueTime?: string;
  status: FieldSeedInboxStatus;
  createdAt: string;
  reviewedAt?: string;
  importedTaskId?: string;
};

export type CreateFieldSeedInboxItemInput = {
  externalSourceId?: string;
  title: string;
  notes?: string;
  placeName: string;
  priority?: TaskPriority;
  contextType?: TaskContextType;
  reminderProfile?: ReminderProfile;
  dueDate?: string;
  dueTime?: string;
};

export async function getFieldSeedInboxItems(): Promise<FieldSeedInboxItem[]> {
  const storedItems = await AsyncStorage.getItem(FIELDSEED_INBOX_KEY);

  if (!storedItems) {
    return [];
  }

  return JSON.parse(storedItems);
}

export async function saveFieldSeedInboxItems(items: FieldSeedInboxItem[]) {
  await AsyncStorage.setItem(FIELDSEED_INBOX_KEY, JSON.stringify(items));

  return items;
}

export async function addFieldSeedInboxItem(
  input: CreateFieldSeedInboxItemInput
) {
  const currentItems = await getFieldSeedInboxItems();

  const inboxItem: FieldSeedInboxItem = {
    id: `fieldseed-inbox-${Date.now()}`,
    externalSourceId: input.externalSourceId,
    title: input.title.trim(),
    notes: input.notes?.trim() || undefined,
    placeName: input.placeName.trim(),
    priority: input.priority ?? "high",
    contextType: input.contextType ?? "work",
    reminderProfile: input.reminderProfile ?? "persistent",
    dueDate: input.dueDate ?? "Next arrival",
    dueTime: input.dueTime,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const updatedItems = [inboxItem, ...currentItems];

  await saveFieldSeedInboxItems(updatedItems);

  return {
    inboxItem,
    items: updatedItems,
  };
}

export async function markFieldSeedInboxItemAccepted(
  itemId: string,
  importedTaskId?: string
) {
  const currentItems = await getFieldSeedInboxItems();

  const updatedItems = currentItems.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    return {
      ...item,
      status: "accepted" as const,
      reviewedAt: new Date().toISOString(),
      importedTaskId,
    };
  });

  await saveFieldSeedInboxItems(updatedItems);

  return updatedItems;
}

export async function markFieldSeedInboxItemRejected(itemId: string) {
  const currentItems = await getFieldSeedInboxItems();

  const updatedItems = currentItems.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    return {
      ...item,
      status: "rejected" as const,
      reviewedAt: new Date().toISOString(),
    };
  });

  await saveFieldSeedInboxItems(updatedItems);

  return updatedItems;
}

export async function deleteFieldSeedInboxItem(itemId: string) {
  const currentItems = await getFieldSeedInboxItems();
  const updatedItems = currentItems.filter((item) => item.id !== itemId);

  await saveFieldSeedInboxItems(updatedItems);

  return updatedItems;
}
