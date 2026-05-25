import { archiveTemporaryPlaceIfCleared } from "@/storage/placeStorage";
import {
  deleteSavedTask,
  getSavedTasks,
  updateSavedTask,
} from "@/storage/taskStorage";
import { LocationTask } from "@/types/task";

export type TaskActionResult = {
  tasks: LocationTask[];
};

export async function completeTask(task: LocationTask): Promise<TaskActionResult> {
  const completedTask: LocationTask = {
    ...task,
    status: "completed",
    completedAt: new Date().toISOString(),
  };

  const updatedTasks = await updateSavedTask(completedTask);
  await archiveTemporaryPlaceIfCleared(task.placeId, updatedTasks);

  return {
    tasks: updatedTasks,
  };
}

export async function undoCompleteTask(
  task: LocationTask
): Promise<TaskActionResult> {
  const activeTask: LocationTask = {
    ...task,
    status: "active",
    completedAt: undefined,
  };

  const updatedTasks = await updateSavedTask(activeTask);
  await archiveTemporaryPlaceIfCleared(task.placeId, updatedTasks);

  return {
    tasks: updatedTasks,
  };
}

export async function removeTask(task: LocationTask): Promise<TaskActionResult> {
  const updatedTasks = await deleteSavedTask(task.id);
  await archiveTemporaryPlaceIfCleared(task.placeId, updatedTasks);

  return {
    tasks: updatedTasks,
  };
}

export async function rescheduleTask(
  task: LocationTask,
  dueDate: string,
  dueTime?: string
): Promise<TaskActionResult> {
  const updatedTask: LocationTask = {
    ...task,
    dueDate,
    dueTime,
    status: "active",
    completedAt: undefined,
  };

  const updatedTasks = await updateSavedTask(updatedTask);
  await archiveTemporaryPlaceIfCleared(task.placeId, updatedTasks);

  return {
    tasks: updatedTasks,
  };
}

export async function updateTaskDetails(
  task: LocationTask,
  updates: Partial<LocationTask>
): Promise<TaskActionResult> {
  const updatedTask: LocationTask = {
    ...task,
    ...updates,
  };

  const updatedTasks = await updateSavedTask(updatedTask);
  await archiveTemporaryPlaceIfCleared(updatedTask.placeId, updatedTasks);

  return {
    tasks: updatedTasks,
  };
}