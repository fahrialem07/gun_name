import { isTauri } from "@tauri-apps/api/core";

// Keep browser behavior while using a supported native dialog in Tauri WebView.
// Capacitor can keep the web implementation or supply its own adapter later.
export async function confirmDeletion(): Promise<boolean> {
  const message =
    "Bu kaydı silmek istiyor musunuz? Tekrarlayan etkinliklerin tüm tekrarları silinir.";
  if (!isTauri()) return window.confirm(message);
  const { confirm } = await import("@tauri-apps/plugin-dialog");
  return confirm(message, {
    title: "GÜNNAME",
    kind: "warning",
    okLabel: "Sil",
    cancelLabel: "Vazgeç",
  });
}
