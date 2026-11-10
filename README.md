# Günname

GitHub deposu: [fahrialem07/gun_name](https://github.com/fahrialem07/gun_name).

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

`src/domain.ts` tarih, etkinlik, görev ve rutin modellerini ve tekrar/seri hesaplarını içerir. `src/storage.ts` içindeki `PlannerRepository` sözleşmesinin ilk uygulaması `localStorage` kullanır (`gun.planner.v1`). Uygulamanın önceki sürümündeki kayıtları korumak için bu dahili saklama anahtarı değiştirilmez. React arayüzü bu katman üzerinden çalışır; Tauri 2 / Capacitor için SQLite uygulaması bu sözleşmeyi izleyerek eklenebilir. Yerel tarih anahtarları UTC dönüşümü yapılmadan üretilir.

Veriler **bu tarayıcı ve bu adres** için saklanır. Sayfa yenileme verileri silmez. Tarayıcı verilerini temizlemek siler; farklı port, cihaz ve tarayıcılar ayrı depolama kullanır. Senkronizasyon ve yedekleme henüz yoktur. Günlük şifrelenmez; paylaşılan cihazlarda tarayıcı profiline erişen kişiler okuyabilir. Depolama hataları kullanıcıya gösterilir. Okunamayan mevcut verinin üzerine otomatik yazılmaz.

Web sürümüne ek olarak Tauri 2 ile Windows masaüstü kabuğu ve NSIS derleme iş akışı bulunur. Capacitor/iOS paketi, native bildirimler ve namaz vakti hesaplama henüz eklenmedi. Namaz alanı günlük tamamlama takibidir. Web sürümünde ilk yükleme için sunucuya erişim gerekir (PWA önbelleği henüz yok); masaüstü sürümü derlenmiş arayüzü kurulum paketinden yükler.

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

## Windows 10/11 masaüstü uygulaması (Tauri 2)

Hedef Windows 10/11 **x64** sistemlerdir. Uygulama adı **GÜNNAME**, sabit uygulama kimliği `com.gunname.planner` olarak ayarlandı. Pencere 1200×820 boyutunda, ortalanmış açılır; yeniden boyutlandırılabilir. En küçük boyut 390×600. Açılış ekranı mevcut React uygulamasındaki **Bugün** ekranıdır. Pencere kapatılınca uygulama kapanır; otomatik başlangıç, arka plan servisi veya sistem tepsisi eklenmedi.

### Hazır kurulum dosyasını GitHub Actions ile üretme

Bu entegrasyonun `main` dalına birleştirilmesinden sonra:

1. GitHub'da `fahrialem07/gun_name` → **Actions** → **Windows kurulum dosyası** ekranını açın.
2. **Run workflow** → `main` dalını seçip başlatın. Workflow yalnızca elle başlatılır; otomatik release yayımlamaz.
3. Çalışma başarıyla tamamlanınca aynı sayfadaki **Artifacts** bölümünden **Gunname-Windows-x64-NSIS** paketini indirin. Artifact 14 gün saklanır; sonra yeniden derlenebilir.
4. ZIP'i açıp içindeki `*-setup.exe` dosyasını çalıştırın. `SHA256SUMS.txt` kurulum dosyasının SHA256 özetini içerir. PowerShell'de `Get-FileHash .\DOSYA-setup.exe -Algorithm SHA256` ile karşılaştırabilirsiniz.
5. Kurulum yalnızca mevcut kullanıcı hesabına yapılır. Başlat menüsündeki **GÜNNAME** kısayoluyla açın.

**Durum:** Workflow'un eklenmesi, kurulum dosyasının üretildiği anlamına gelmez. Bu Linux bulut ortamında Windows kurulum dosyası üretilmedi; ilk başarılı Windows Actions çalışması ayrıca doğrulanmalıdır. Workflow, web testlerinden biri veya Rust/NSIS derlemesi başarısız olursa artifact yayımlamaz. Windows WebView içindeki etkileşimler ayrıca Windows'ta elle denenmelidir; Playwright testleri web sürümünü sınar.

Windows WebView2 Runtime gerekir. Kurulum paketi, Runtime eksikse Microsoft'un gömülü bootstrapper'ını kullanır; bu durumda internet gerekir. Zaten yüklüyse tekrar indirilmez. Kod imzalama sertifikası eklenmediğinden kurulum dosyası imzasızdır; Windows tanınmayan yayımcı uyarısı gösterebilir. Kurulum dosyasını kendi deponuzun başarılı Actions çalışmasından indirin.

### Windows'ta geliştirme ve yerel NSIS derlemesi

Önkoşullar: Git, Node.js 24 LTS, güncel **Rust stable (MSVC)**, Microsoft **Visual Studio Build Tools 2022 veya üstü** içinde **Desktop development with C++** iş yükü ve Windows SDK; WebView2 Runtime. Resmî önkoşullar: <https://v2.tauri.app/start/prerequisites/#windows>.

PowerShell'de mevcut depo klasöründe:

```powershell
npm ci
npm test
npm run build
npm run desktop:dev
```

Geliştirme komutu Vite'ı sabit 5173 portunda başlatıp native pencereyi açar; port kullanımda ise açık hata verir. Web sürümü için `npm run dev` aynı şekilde kullanılabilir.

Windows kurulum dosyası:

```powershell
npm run desktop:build -- --ci --target x86_64-pc-windows-msvc -- --locked
```

Başarılı derlemede çıktı: `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/*-setup.exe`. `--locked`, depodaki `Cargo.lock` dosyasının değiştirilmesini engeller. Linux/macOS üzerinde bu komut Windows MSVC araç zincirinin yerine geçmez. Bu projenin Windows kurulum derlemesi Windows üzerinde yapılır.

### Verilerin korunması ve izinler

Mevcut `localStorage` erişim katmanı ve `gun.planner.v1` anahtarı değişmedi. **Tarayıcı profili ile Tauri WebView profili ayrıdır; tarayıcıda görünen eski kayıtlar masaüstünde otomatik görünmez.** Geliştirme ve paketlenmiş masaüstü sürümleri de farklı origin kullanabilir. İlk masaüstü açılışında örnek kayıtların görünmesi eski tarayıcı verilerinin silindiği anlamına gelmez.

Otomatik aktarım, içe/dışa aktarma ve SQLite geçişi eklenmedi. Eski kayıtlarınıza aynı tarayıcı profili ve aynı web adresinden erişmeye devam edin; geçişten önce tarayıcı profilinizin yedeğini alın. Tarayıcı verilerini, WebView profilini veya uygulama veri klasörünü temizlemeyin. Gelecekteki sürümlerde sabit uygulama kimliğini değiştirmek farklı bir veri profili oluşturabilir.

Yalnızca `main` penceresine native onay/mesaj iletişim kutusu izni (`dialog:allow-message`) tanımlandı. Silme onayı web sürümünde tarayıcı, Tauri sürümünde native pencere kullanır; iptal veya onay hatasında kayıt silinmez. Dosya sistemi, kabuk, dış program çalıştırma, genel ağ veya otomatik güncelleme eklentisi eklenmedi. CSP yerel uygulama içeriğini ve Tauri IPC bağlantısını sınırlar; React'in mevcut dinamik yerleşimleri için satır içi stillere izin verir.

`src-tauri/` yalnızca masaüstü kabuğudur. Paylaşılan React arayüzü, modeller ve saklama katmanı korunur; gelecekte Capacitor eklenmesine engel oluşturmaz. Rust bağımlılıkları `Cargo.lock`, npm bağımlılıkları `package-lock.json` ile kilitlidir.
