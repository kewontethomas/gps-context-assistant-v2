import { LocationTask } from "@/types/task";

export type TaskMigrationResult = {
  tasks: LocationTask[];
  changed: boolean;
};

function migrateTask(task: Partial<LocationTask>): LocationTask {
  const reminderProfile = task.reminderProfile ?? "normal";
  const priority = task.priority ?? "normal";
  const source = task.source ?? "manual";
  const contextType = task.contextType ?? "personal";

  return {
    id: task.id ?? `task-${Date.now()}`,
    placeId: task.placeId ?? "",
    title: task.title ?? "Untitled task",
    notes: task.notes,
    status: task.status ?? "active",
    dueDate: task.dueDate,
    dueTime: task.dueTime,
    arriveByTime: task.arriveByTime,
    recurrence: task.recurrence ?? "none",
    travelMode: task.travelMode ?? "unsure",
    travelBufferMinutes: task.travelBufferMinutes ?? 10,
    notifyBeforeLeave: task.notifyBeforeLeave ?? false,
    notifyOnArrival: task.notifyOnArrival ?? true,
    notifyWhileThere:
      task.notifyWhileThere ??
      (reminderProfile === "normal" || reminderProfile === "persistent"),
    notifyEveryMinutes:
      task.notifyEveryMinutes ??
      (reminderProfile === "persistent"
        ? 15
        : reminderProfile === "normal"
          ? 30
          : undefined),
    notifyOnDeparture: task.notifyOnDeparture ?? true,
    notifyBeforeDue: task.notifyBeforeDue ?? false,
    snoozedUntil: task.snoozedUntil,
    createdAt: task.createdAt ?? new Date().toISOString(),
    completedAt: task.completedAt,
    reminderProfile,
    source,
    priority,
    contextType,
    externalSourceId: task.externalSourceId,
  };
}

export function migrateTasks(rawTasks: Partial<LocationTask>[]): TaskMigrationResult {
  let changed = false;

  const tasks = rawTasks.map((task) => {
    const migratedTask = migrateTask(task);

    if (
      task.reminderProfile !== migratedTask.reminderProfile ||
      task.source !== migratedTask.source ||
      task.priority !== migratedTask.priority ||
      task.contextType !== migratedTask.contextType ||
      task.recurrence !== migratedTask.recurrence ||
      task.travelMode !== migratedTask.travelMode ||
      task.travelBufferMinutes !== migratedTask.travelBufferMinutes ||
      task.notifyBeforeLeave !== migratedTask.notifyBeforeLeave ||
      task.notifyOnArrival !== migratedTask.notifyOnArrival ||
      task.notifyWhileThere !== migratedTask.notifyWhileThere ||
      task.notifyOnDeparture !== migratedTask.notifyOnDeparture ||
      task.notifyBeforeDue !== migratedTask.notifyBeforeDue ||
      task.createdAt !== migratedTask.createdAt
    ) {
      changed = true;
    }

    return migratedTask;
  });

  return { tasks, changed };
}
