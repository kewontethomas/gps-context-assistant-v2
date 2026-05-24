import { LocationTask } from "@/types/task";

export const locationTasks: LocationTask[] = [
  {
    id: "task-check-server-room",
    placeId: "place-work",

    title: "Check server room",
    notes: "Verify alerts and confirm equipment status.",

    status: "active",

    dueDate: "Today",
    dueTime: undefined,
    arriveByTime: undefined,

    recurrence: "none",

    travelMode: "walking",
    travelBufferMinutes: 5,

    notifyBeforeLeave: false,
    notifyOnArrival: true,
    notifyWhileThere: true,
    notifyEveryMinutes: 30,
    notifyOnDeparture: true,
    notifyBeforeDue: false,

    createdAt: new Date().toISOString(),
  },
  {
    id: "task-take-out-trash",
    placeId: "place-home",

    title: "Take out trash",
    notes: "Move to tomorrow if not completed tonight.",

    status: "active",

    dueDate: "Today",
    dueTime: "Tonight",
    arriveByTime: undefined,

    recurrence: "weekly",

    travelMode: "walking",
    travelBufferMinutes: 0,

    notifyBeforeLeave: false,
    notifyOnArrival: false,
    notifyWhileThere: true,
    notifyEveryMinutes: 60,
    notifyOnDeparture: false,
    notifyBeforeDue: true,

    createdAt: new Date().toISOString(),
  },
];