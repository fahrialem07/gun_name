import { describe, expect, it } from "vitest";
import {
  dateKey,
  localDate,
  occurs,
  scheduled,
  shift,
  streak,
  type Event,
  type Routine,
} from "./domain";
const event: Event = {
  id: "1",
  title: "Ders",
  date: "2026-11-10",
  time: "09:00",
  end: "10:00",
  description: "",
  repeat: "weekly",
};
describe("Takvim ve rutin mantığı", () => {
  it("yerel tarihleri saat dilimi kayması olmadan işler", () => {
    expect(dateKey(localDate("2026-11-10"))).toBe("2026-11-10");
    expect(shift("2026-12-31", 1)).toBe("2027-01-01");
  });
  it("haftalık tekrarları başlangıç tarihinden önce göstermez", () => {
    expect(occurs(event, "2026-11-03")).toBe(false);
    expect(occurs(event, "2026-11-17")).toBe(true);
    expect(occurs(event, "2026-11-18")).toBe(false);
  });
  it("günlük ve tek seferlik etkinlikleri ayırır", () => {
    expect(occurs({ ...event, repeat: "daily" }, "2026-11-11")).toBe(true);
    expect(occurs({ ...event, repeat: "none" }, "2026-11-11")).toBe(false);
  });
  it("haftalık rutinde planlanmayan günleri atlayarak devamlılığı hesaplar", () => {
    const r: Routine = {
      id: "r",
      title: "Oku",
      frequency: "weekly",
      days: [2],
      completions: ["2026-11-03", "2026-11-10"],
    };
    expect(scheduled(r, "2026-11-11")).toBe(false);
    expect(streak(r, "2026-11-11")).toBe(2);
    expect(streak(r, "2026-11-18")).toBe(0);
  });
  it("bugünün henüz tamamlanmaması önceki seriyi bozmaz", () => {
    const r: Routine = {
      id: "r",
      title: "Oku",
      frequency: "daily",
      days: [],
      completions: ["2026-11-08", "2026-11-09"],
    };
    expect(streak(r, "2026-11-10")).toBe(2);
  });
});
