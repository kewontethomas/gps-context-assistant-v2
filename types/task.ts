import { TravelMode } from "./place";

export type TaskStatus = "active" | "completed" | "snoozed";

export type TaskRecurrence =
  | "none"
  | "daily"
  | "weekdays"
  | "weekly"
  | "custom";

export type LocationTask = {
  id: string;
  placeId: string;

  title: string;
  notes?: string;

  status: TaskStatus;

  dueDate?: string;
  dueTime?: string;
  arriveByTime?: string;

  recurrence: TaskRecurrence;

  travelMode: TravelMode;
  travelBufferMinutes: number;

  notifyBeforeLeave: boolean;
  notifyOnArrival: boolean;
  notifyWhileThere: boolean;
  notifyEveryMinutes?: number;
  notifyOnDeparture: boolean;
  notifyBeforeDue: boolean;

  snoozedUntil?: string;
  createdAt: string;
  completedAt?: string;
};