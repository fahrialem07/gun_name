import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocalPlannerRepository } from "./storage";
import { initialData } from "./domain";
describe("Yerel veri deposu", () => {
  const values = new Map<string, string>();
  beforeEach(() => {
    values.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  it("birbirinden bağımsız depo örnekleri aynı veriyi okur", () => {
    const data = initialData();
    data.journals["2026-11-10"] = { title: "Başlangıç", text: "Bugün güzel." };
    new LocalPlannerRepository().save(data);
    expect(new LocalPlannerRepository().load()).toEqual(data);
  });
  it("bozuk veya uyumsuz verileri sessizce değiştirmez", () => {
    values.set(
      "gun.planner.v1",
      JSON.stringify({
        version: 1,
        events: [{}],
        tasks: [],
        routines: [],
        journals: {},
        prayers: {},
      }),
    );
    expect(() => new LocalPlannerRepository().load()).toThrow();
    expect(values.get("gun.planner.v1")).toContain('"events":[{}]');
  });
  it("depolama hatasını arayüzün gösterebilmesi için iletir", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    expect(() => new LocalPlannerRepository().save(initialData())).toThrow(
      "QuotaExceededError",
    );
  });
});
