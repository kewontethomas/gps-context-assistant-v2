import { addFieldSeedInboxItem } from "@/storage/fieldSeedInboxStorage";
import { CreateFieldSeedInboxItemInput } from "@/storage/fieldSeedInboxStorage";

export type FieldSeedOutboxPackage = {
  source?: string;
  package_type?: string;
  created_at?: string;
  gps_context_payload?: CreateFieldSeedInboxItemInput;
};

function normalizePayload(raw: unknown): CreateFieldSeedInboxItemInput | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const value = raw as Partial<CreateFieldSeedInboxItemInput>;

  if (!value.title || !value.placeName) {
    return null;
  }

  return {
    externalSourceId: value.externalSourceId,
    title: String(value.title),
    notes: value.notes ? String(value.notes) : undefined,
    placeName: String(value.placeName),
    priority: value.priority,
    contextType: value.contextType,
    reminderProfile: value.reminderProfile,
    dueDate: value.dueDate,
    dueTime: value.dueTime,
  };
}

function extractPayloads(parsedJson: unknown): CreateFieldSeedInboxItemInput[] {
  if (Array.isArray(parsedJson)) {
    return parsedJson
      .map((item) => normalizePayload(item))
      .filter((item): item is CreateFieldSeedInboxItemInput => item !== null);
  }

  if (!parsedJson || typeof parsedJson !== "object") {
    return [];
  }

  const packageJson = parsedJson as FieldSeedOutboxPackage;

  if (packageJson.gps_context_payload) {
    const payload = normalizePayload(packageJson.gps_context_payload);
    return payload ? [payload] : [];
  }

  const directPayload = normalizePayload(parsedJson);
  return directPayload ? [directPayload] : [];
}

export async function importFieldSeedOutboxJson(rawJson: string) {
  if (!rawJson.trim()) {
    return {
      importedCount: 0,
      message: "Paste a FieldSeed outbox JSON package first.",
    };
  }

  try {
    const parsedJson = JSON.parse(rawJson);
    const payloads = extractPayloads(parsedJson);

    if (payloads.length === 0) {
      return {
        importedCount: 0,
        message:
          "No valid GPS Context task payloads found. Export a GPS task from FieldSeed first.",
      };
    }

    for (const payload of payloads) {
      await addFieldSeedInboxItem(payload);
    }

    return {
      importedCount: payloads.length,
      message: `Imported ${payloads.length} FieldSeed task${payloads.length === 1 ? "" : "s"} into the inbox.`,
    };
  } catch (error) {
    console.log("Could not import FieldSeed outbox JSON:", error);
    return {
      importedCount: 0,
      message: "Could not read that JSON. Copy the full FieldSeed outbox package and try again.",
    };
  }
}
