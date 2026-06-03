import { SavedPlace } from "@/types/place";
import { LocationTask } from "@/types/task";
import { NearbyTaskResult } from "@/utils/nearbyTasks";
import { getTaskPriorityWeight } from "@/utils/taskMetadata";

export type WhatMattersNowItem = {
  task: LocationTask;
  place?: SavedPlace;
  score: number;
  reasons: string[];
  distanceMeters?: number;
};

const SOURCE_WEIGHTS: Record<string, number> = {
  fieldseed: 18,
  routine: 8,
  manual: 10,
};

const CONTEXT_WEIGHTS: Record<string, number> = {
  site: 18,
  work: 14,
  errand: 10,
  home: 8,
  personal: 6,
};

function getDueDateWeight(task: LocationTask) {
  if (task.dueDate === "Today") return 24;
  if (task.dueDate === "Next arrival") return 20;
  if (task.dueDate === "Tomorrow") return 10;
  return 0;
}

function getReminderWeight(task: LocationTask) {
  if (task.reminderProfile === "persistent") return 12;
  if (task.reminderProfile === "normal") return 7;
  return 3;
}

function getNearbyWeight(distanceMeters?: number) {
  if (typeof distanceMeters !== "number") return 0;
  if (distanceMeters <= 50) return 28;
  if (distanceMeters <= 150) return 22;
  if (distanceMeters <= 500) return 16;
  return 10;
}

function buildReasons(task: LocationTask, distanceMeters?: number) {
  const reasons: string[] = [];

  if (task.priority === "urgent") reasons.push("Urgent priority");
  if (task.priority === "high") reasons.push("High priority");
  if (task.source === "fieldseed") reasons.push("FieldSeed task");
  if (task.contextType === "work" || task.contextType === "site") {
    reasons.push("Work context");
  }
  if (task.dueDate === "Today") reasons.push("Due today");
  if (task.dueDate === "Next arrival") reasons.push("Relevant on arrival");
  if (task.reminderProfile === "persistent") reasons.push("Persistent reminder");
  if (typeof distanceMeters === "number") {
    reasons.push(`${Math.round(distanceMeters)}m away`);
  }

  if (reasons.length === 0) {
    reasons.push("Active task");
  }

  return reasons;
}

export function scoreTaskForNow(
  task: LocationTask,
  distanceMeters?: number
) {
  const priorityScore = getTaskPriorityWeight(task.priority) * 18;
  const sourceScore = SOURCE_WEIGHTS[task.source ?? "manual"] ?? 10;
  const contextScore = CONTEXT_WEIGHTS[task.contextType ?? "personal"] ?? 6;
  const dueScore = getDueDateWeight(task);
  const reminderScore = getReminderWeight(task);
  const nearbyScore = getNearbyWeight(distanceMeters);

  return priorityScore + sourceScore + contextScore + dueScore + reminderScore + nearbyScore;
}

export function getWhatMattersNow(
  tasks: LocationTask[],
  places: SavedPlace[],
  nearbyResults: NearbyTaskResult[],
  limit = 5
): WhatMattersNowItem[] {
  const activeTasks = tasks.filter((task) => task.status === "active");

  const nearbyDistanceByTaskId = new Map<string, number>();

  nearbyResults.forEach((result) => {
    result.tasks.forEach((task) => {
      nearbyDistanceByTaskId.set(task.id, result.distanceMeters);
    });
  });

  return activeTasks
    .map((task) => {
      const place = places.find((savedPlace) => savedPlace.id === task.placeId);
      const distanceMeters = nearbyDistanceByTaskId.get(task.id);
      const score = scoreTaskForNow(task, distanceMeters);

      return {
        task,
        place,
        score,
        distanceMeters,
        reasons: buildReasons(task, distanceMeters),
      };
    })
    .sort((firstItem, secondItem) => {
      if (secondItem.score !== firstItem.score) {
        return secondItem.score - firstItem.score;
      }

      return firstItem.task.title.localeCompare(secondItem.task.title);
    })
    .slice(0, limit);
}
