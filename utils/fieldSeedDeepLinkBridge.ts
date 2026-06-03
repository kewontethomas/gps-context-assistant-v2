import { useCallback, useEffect } from "react";
import * as Linking from "expo-linking";

import { addFieldSeedInboxItem } from "@/storage/fieldSeedInboxStorage";
import { CreateFieldSeedInboxItemInput } from "@/storage/fieldSeedInboxStorage";

function extractPayloadFromUrl(url: string) {
  const marker = "payload=";
  const payloadIndex = url.indexOf(marker);

  if (payloadIndex === -1) {
    return null;
  }

  const rawPayload = url.slice(payloadIndex + marker.length).split("&")[0];

  if (!rawPayload) {
    return null;
  }

  return JSON.parse(decodeURIComponent(rawPayload)) as CreateFieldSeedInboxItemInput;
}

export async function importFieldSeedDeepLink(url: string) {
  if (!url.includes("fieldseed-import")) {
    return {
      imported: false,
      reason: "URL is not a FieldSeed import link.",
    };
  }

  const payload = extractPayloadFromUrl(url);

  if (!payload?.title || !payload?.placeName) {
    return {
      imported: false,
      reason: "FieldSeed import payload is missing title or placeName.",
    };
  }

  const result = await addFieldSeedInboxItem(payload);

  return {
    imported: true,
    inboxItem: result.inboxItem,
  };
}

export function useFieldSeedDeepLinkImport() {
  const handleUrl = useCallback(async (url: string | null) => {
    if (!url) {
      return;
    }

    try {
      const result = await importFieldSeedDeepLink(url);

      if (result.imported) {
        console.log("Imported FieldSeed task into inbox.");
      }
    } catch (error) {
      console.log("Could not import FieldSeed deep link:", error);
    }
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener("url", (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleUrl]);
}
