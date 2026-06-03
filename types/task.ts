import { TravelMode } from "./place";

export type TaskStatus = "active" | "completed" | "snoozed";

export type TaskRecurrence =
  | "none"
  | "daily"
  | "weekdays"
  | "weekly"
  | "custom";

export type ReminderProfile = "gentle" | "normal" | "persistent";

export type TaskSource = "manual" | "fieldseed" | "routine";

export type TaskPriority = "low" | "normal" | "high" | "urgent";

export type TaskContextType = "personal" | "home" | "work" | "errand" | "site";

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

  reminderProfile: ReminderProfile;
  source: TaskSource;
  priority: TaskPriority;
  contextType: TaskContextType;
  externalSourceId?: string;
};
