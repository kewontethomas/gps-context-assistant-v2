import AsyncStorage from "@react-native-async-storage/async-storage";
import { locationTasks as mockTasks } from "@/data/tasks";
import { LocationTask } from "@/types/task";

const TASKS_KEY = "gps-context-assistant:tasks";

export async function getSavedTasks(): Promise<LocationTask[]> {
  const storedTasks = await AsyncStorage.getItem(TASKS_KEY);

  if (!storedTasks) {
    return mockTasks;
  }

  return JSON.parse(storedTasks);
}

export async function saveTasks(tasks: LocationTask[]) {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export async function addSavedTask(task: LocationTask) {
  const currentTasks = await getSavedTasks();
  const updatedTasks = [...currentTasks, task];

  await saveTasks(updatedTasks);

  return updatedTasks;
}

export async function updateSavedTask(updatedTask: LocationTask) {
  const currentTasks = await getSavedTasks();

  const updatedTasks = currentTasks.map((task) => {
    if (task.id === updatedTask.id) {
      return updatedTask;
    }

    return task;
  });

  await saveTasks(updatedTasks);

  return updatedTasks;
}