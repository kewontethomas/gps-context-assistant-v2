import {
  addFieldSeedInboxItem,
  getFieldSeedInboxItems,
} from "@/storage/fieldSeedInboxStorage";
import {
  ReminderProfile,
  TaskContextType,
  TaskPriority,
} from "@/types/task";

const SUPABASE_URL = "https://wlduynemsazaznidsrga.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsZHV5bmVtc2F6YXpuaWRzcmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTgwNTYsImV4cCI6MjA5NjAzNDA1Nn0.KnxLOw-kcQEpO0kPxcbSB5q48AFTyPELpslethQKH0A";

const FIELDSEED_TASKS_ENDPOINT = `${SUPABASE_URL}/rest/v1/fieldseed_tasks`;

type SupabaseFieldSeedTask = {
  id: string;
  title: string;
  notes?: string | null;
  place_name?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radius_meters?: number | null;
  priority?: string | null;
  context_type?: string | null;
  reminder_profile?: string | null;
  due_date?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export type FieldSeedCloudSyncResult = {
  importedCount: number;
  skippedCount: number;
  message: string;
};

function getHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

function normalizePriority(value?: string | null): TaskPriority {
  if (value === "low" || value === "normal" || value === "high" || value === "urgent") {
    return value;
  }

  return "high";
}

function normalizeContextType(value?: string | null): TaskContextType {
  if (
    value === "personal" ||
    value === "home" ||
    value === "work" ||
    value === "errand" ||
    value === "site"
  ) {
    return value;
  }

  return "work";
}

function normalizeReminderProfile(value?: string | null): ReminderProfile {
  if (value === "gentle" || value === "normal" || value === "persistent") {
    return value;
  }

  return "persistent";
}

async function fetchPendingFieldSeedTasks() {
  const query = new URLSearchParams({
    status: "eq.pending",
    order: "created_at.desc",
  });

  const response = await fetch(`${FIELDSEED_TASKS_ENDPOINT}?${query.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase read failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as SupabaseFieldSeedTask[];
}

async function markCloudTaskImported(taskId: string) {
  const response = await fetch(`${FIELDSEED_TASKS_ENDPOINT}?id=eq.${taskId}`, {
    method: "PATCH",
    headers: {
      ...getHeaders(),
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      status: "imported",
      imported_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase update failed: ${response.status} ${errorText}`);
  }
}

export async function syncFieldSeedCloudTasks(): Promise<FieldSeedCloudSyncResult> {
  const cloudTasks = await fetchPendingFieldSeedTasks();
  const existingInboxItems = await getFieldSeedInboxItems();
  const existingExternalIds = new Set(
    existingInboxItems
      .map((item) => item.externalSourceId)
      .filter(Boolean)
  );

  let importedCount = 0;
  let skippedCount = 0;

  for (const cloudTask of cloudTasks) {
    const externalSourceId = `supabase:${cloudTask.id}`;

    if (existingExternalIds.has(externalSourceId)) {
      skippedCount += 1;
      await markCloudTaskImported(cloudTask.id);
      continue;
    }

    const placeName = cloudTask.place_name?.trim() || "FieldSeed Temporary Site";

    await addFieldSeedInboxItem({
      externalSourceId,
      title: cloudTask.title,
      notes: cloudTask.notes || undefined,
      placeName,
      address: cloudTask.address || undefined,
      latitude: typeof cloudTask.latitude === "number" ? cloudTask.latitude : undefined,
      longitude: typeof cloudTask.longitude === "number" ? cloudTask.longitude : undefined,
      radiusMeters:
        typeof cloudTask.radius_meters === "number" ? cloudTask.radius_meters : undefined,
      priority: normalizePriority(cloudTask.priority),
      contextType: normalizeContextType(cloudTask.context_type),
      reminderProfile: normalizeReminderProfile(cloudTask.reminder_profile),
      dueDate: cloudTask.due_date || "Next arrival",
    });

    await markCloudTaskImported(cloudTask.id);
    importedCount += 1;
  }

  if (importedCount === 0 && skippedCount === 0) {
    return {
      importedCount,
      skippedCount,
      message: "No pending FieldSeed cloud tasks found.",
    };
  }

  return {
    importedCount,
    skippedCount,
    message: `Imported ${importedCount} FieldSeed cloud task${
      importedCount === 1 ? "" : "s"
    }.`,
  };
}
