# GÜN

Türkçe, sade ve yerel çalışan kişisel planlayıcı. React 19, TypeScript, Vite ve Tailwind CSS 4 ile geliştirildi. Sunucu, hesap veya ücretli servis gerektirmez.

## Kurulum

Node.js 22.12+ veya 24 LTS ve npm gerekir.

```sh
npm ci
npm run dev
```

Vite geliştirme sunucusu varsayılan olarak 5173 portunu kullanır. Üretim paketi ve yerel kontrol:

```sh
npm run build
npm run preview
```

## Kullanım

- **Bugün:** tarih, sıradaki etkinlik ve kalan süre, saatli program, bugün son tarihli/gecikmiş görevler, bugünün rutinleri ve beş vakit tamamlama takibi.
- **Takvim:** gün/hafta saat çizelgesi, ay ve yıl görünümü. Bir güne veya boş saat dilimine tıklayarak tarih seçin. `+ Yeni kayıt` ile etkinlik ekleyin; etkinliğe tıklayarak düzenleyin veya silin. Günlük/haftalık tekrarlar başlangıç tarihinden itibaren hesaplanır. Tekrarlayan etkinliği değiştirmek veya silmek bütün seriye uygulanır. Bu sürümde gece yarısını aşan etkinlikler iki ayrı kayıt olmalıdır.
- **Görevler:** isteğe bağlı açıklama ve son tarih. Saat ve kategori gerekmez. Tamamlananları filtreleyebilir, kayıtları düzenleyebilir ve silebilirsiniz.
- **Rutinler:** her gün veya seçili hafta günleri. Tamamlamalar o gün için tutulur. Seri hesabı planlanmayan günleri atlar; bugünün henüz tamamlanmaması önceki seriyi bozmaz.
- **Günlük:** tarih seçimi, başlık ve düz metin. Her değişiklik otomatik kaydedilir ve kayıt durumu gösterilir.
- Dar ekranlarda alt menü; geniş ekranlarda sol menü kullanılır. İlk açılışta silinebilen üç örnek kayıt bulunur.

## Veriler ve mimari

`src/domain.ts` tarih, etkinlik, görev ve rutin modellerini ve tekrar/seri hesaplarını içerir. `src/storage.ts` içindeki `PlannerRepository` sözleşmesinin ilk uygulaması `localStorage` kullanır (`gun.planner.v1`). React arayüzü bu katman üzerinden çalışır; Tauri 2 / Capacitor için SQLite uygulaması bu sözleşmeyi izleyerek eklenebilir. Yerel tarih anahtarları UTC dönüşümü yapılmadan üretilir.

Veriler **bu tarayıcı ve bu adres** için saklanır. Sayfa yenileme verileri silmez. Tarayıcı verilerini temizlemek siler; farklı port, cihaz ve tarayıcılar ayrı depolama kullanır. Senkronizasyon ve yedekleme henüz yoktur. Günlük şifrelenmez; paylaşılan cihazlarda tarayıcı profiline erişen kişiler okuyabilir. Depolama hataları kullanıcıya gösterilir. Okunamayan mevcut verinin üzerine otomatik yazılmaz.

Bu sürüm web uygulamasıdır: Tauri/Capacitor paketleri, native bildirimler, iOS/Windows derlemeleri ve namaz vakti hesaplama henüz eklenmedi. Namaz alanı günlük tamamlama takibidir. Uygulama açıldıktan sonra kayıtlar internetsiz çalışır; ilk yükleme için sunucuya erişim gerekir (PWA önbelleği henüz yok).

## Testler

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Sistem Chromium'u kullanmak için:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Birim testleri tarih sınırlarını, tekrarları ve rutin devamlılığını doğrular. Playwright, masaüstü ve 390 px mobil ekranda kayıt oluşturma/düzenleme/silme, takvim görünümleri, tamamlama ve sayfa yenileme sonrası kalıcılığı doğrular. Testler tarayıcı başına izole yerel veri kullanır.

Kaynak biçimlendirmesi: `npx prettier --write src tests *.ts *.json index.html README.md`.
