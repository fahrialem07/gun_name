export type Repeat = "none" | "daily" | "weekly";
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  end: string;
  description: string;
  repeat: Repeat;
}
export interface Task {
  id: string;
  title: string;
  description: string;
  due: string;
  done: boolean;
}
export interface Routine {
  id: string;
  title: string;
  frequency: "daily" | "weekly";
  days: number[];
  completions: string[];
}
export interface Journal {
  title: string;
  text: string;
}
export interface Data {
  version: 1;
  events: Event[];
  tasks: Task[];
  routines: Routine[];
  journals: Record<string, Journal>;
  prayers: Record<string, string[]>;
}
export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function localDate(key: string) {
  return new Date(`${key}T12:00:00`);
}
export function shift(key: string, days: number) {
  const d = localDate(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}
export function occurs(event: Event, day: string) {
  if (day < event.date) return false;
  return (
    day === event.date ||
    event.repeat === "daily" ||
    (event.repeat === "weekly" &&
      localDate(day).getDay() === localDate(event.date).getDay())
  );
}
export function scheduled(r: Routine, day: string) {
  return r.frequency === "daily" || r.days.includes(localDate(day).getDay());
}
export function streak(r: Routine, today: string) {
  let count = 0;
  let day = today;
  if (scheduled(r, day) && !r.completions.includes(day)) day = shift(day, -1);
  for (let i = 0; i < 3660; i++, day = shift(day, -1)) {
    if (!scheduled(r, day)) continue;
    if (!r.completions.includes(day)) break;
    count++;
  }
  return count;
}
export function initialData(): Data {
  const day = dateKey();
  return {
    version: 1,
    events: [
      {
        id: crypto.randomUUID(),
        title: "Gününü planla",
        date: day,
        time: "09:00",
        end: "09:30",
        description: "Kendine küçük bir alan aç.",
        repeat: "none",
      },
    ],
    tasks: [
      {
        id: crypto.randomUUID(),
        title: "İlk görevini ekle",
        description: "Küçük bir adımla başla.",
        due: day,
        done: false,
      },
    ],
    routines: [
      {
        id: crypto.randomUUID(),
        title: "Biraz kitap oku",
        frequency: "daily",
        days: [],
        completions: [],
      },
    ],
    journals: {},
    prayers: {},
  };
}
