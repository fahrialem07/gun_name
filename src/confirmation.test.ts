import { afterEach, describe, expect, it, vi } from "vitest";
import { confirmDeletion } from "./confirmation";
vi.mock("@tauri-apps/api/core", () => ({ isTauri: vi.fn() }));
vi.mock("@tauri-apps/plugin-dialog", () => ({ confirm: vi.fn() }));
import { isTauri } from "@tauri-apps/api/core";
import { confirm } from "@tauri-apps/plugin-dialog";
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});
describe("Platforma uygun silme onayı", () => {
  it("web sürümünde tarayıcı onayını kullanır", async () => {
    vi.mocked(isTauri).mockReturnValue(false);
    const browserConfirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal("window", { confirm: browserConfirm });
    expect(await confirmDeletion()).toBe(false);
    expect(browserConfirm).toHaveBeenCalledOnce();
    expect(confirm).not.toHaveBeenCalled();
  });
  it("Tauri sürümünde yalnızca native onay penceresini kullanır", async () => {
    vi.mocked(isTauri).mockReturnValue(true);
    vi.mocked(confirm).mockResolvedValue(true);
    expect(await confirmDeletion()).toBe(true);
    expect(confirm).toHaveBeenCalledWith(
      expect.stringContaining("silmek"),
      expect.objectContaining({
        title: "GÜNNAME",
        kind: "warning",
        cancelLabel: "Vazgeç",
      }),
    );
  });
  it("native onay hatasını çağırana iletir; sessizce silmeye izin vermez", async () => {
    vi.mocked(isTauri).mockReturnValue(true);
    vi.mocked(confirm).mockRejectedValue(new Error("IPC unavailable"));
    await expect(confirmDeletion()).rejects.toThrow("IPC unavailable");
  });
});
