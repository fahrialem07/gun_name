import { initialData, type Data } from "./domain";
export interface PlannerRepository {
  load(): Data;
  save(data: Data): void;
}
const KEY = "gun.planner.v1";
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");
function validData(v: unknown): v is Data {
  if (!record(v) || v.version !== 1) return false;
  return (
    Array.isArray(v.events) &&
    v.events.every(
      (e) =>
        record(e) &&
        ["id", "title", "date", "time", "end", "description"].every(
          (k) => typeof e[k] === "string",
        ) &&
        ["none", "daily", "weekly"].includes(String(e.repeat)),
    ) &&
    Array.isArray(v.tasks) &&
    v.tasks.every(
      (t) =>
        record(t) &&
        ["id", "title", "description", "due"].every(
          (k) => typeof t[k] === "string",
        ) &&
        typeof t.done === "boolean",
    ) &&
    Array.isArray(v.routines) &&
    v.routines.every(
      (r) =>
        record(r) &&
        typeof r.id === "string" &&
        typeof r.title === "string" &&
        ["daily", "weekly"].includes(String(r.frequency)) &&
        Array.isArray(r.days) &&
        r.days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6) &&
        strings(r.completions),
    ) &&
    record(v.journals) &&
    Object.values(v.journals).every(
      (j) =>
        record(j) && typeof j.title === "string" && typeof j.text === "string",
    ) &&
    record(v.prayers) &&
    Object.values(v.prayers).every(strings)
  );
}
// A future SQLite adapter can implement this contract without changing domain logic.
export class LocalPlannerRepository implements PlannerRepository {
  load(): Data {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return initialData();
    const data: unknown = JSON.parse(raw);
    if (!validData(data)) throw new Error("Saklanan veri okunamıyor.");
    return data;
  }
  save(data: Data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }
}
export const repository: PlannerRepository = new LocalPlannerRepository();
