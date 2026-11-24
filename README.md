# Sipariş Takip Mobil Uygulaması

Pazarlama, onay ve sevkiyat ekiplerinin sipariş sürecini tek uygulamada yürüttüğü React Native (Expo) uygulaması. Siparişin aşamaları ve onay durumu rol bazlı ekranlarla izlenir.

## Çözdüğü problem

Siparişler telefonla, mesajla ve kağıtla dolaştığında kimin onayladığı, neyin hazırlandığı ve hangi siparişin teslim edildiği takip edilemez. Uygulama her adımı ilgili role gösterir ve kayıt altına alır.

## Roller

| Rol | Yapabildikleri |
| --- | --- |
| `pazarlama` | Sipariş ekler, kendi siparişlerini ve revizelerini izler. |
| `admin` | Onay bekleyenleri yönetir, tüm siparişleri, kullanıcıları ve raporları görür. |
| `sevkiyat` | Kendine atanan görevleri görür, hazırlanan siparişleri takip eder. |

## Özellikler

- Sipariş ekleme, listeleme ve detay görüntüleme.
- Onay bekleyenler, revizeler ve hazırlananlar ekranları.
- Kullanıcı ekleme ve yönetimi (admin).
- Raporlama: grafikli özet (`react-native-chart-kit`).
- Expo ile anlık bildirim; yönetici bildirimleri Firebase Admin SDK ile gönderilir.
- Belge seçme (`expo-document-picker`).

## Teknoloji yığını

React Native, Expo 52, React Navigation, Firebase (Authentication, Firestore, Storage), Firebase Admin SDK, Expo Notifications.

## Proje yapısı

```
App.tsx, Main.js       Giriş ve role göre ekran yönlendirme
screens/               Rol ekranları (SiparisEkle, SiparisListesi, OnayBekleyenler, Raporlama, ...)
firebase.js            İstemci Firebase ayarları (örnek değerler; kendi projenizle doldurun)
firebaseAdmin.js       Bildirimler için Admin SDK
notifications.js       Bildirim kaydı
scripts/               Dağıtımda servis hesabı dosyasını ortam değişkeninden üreten betik
```

## Kurulum

```bash
npm install
```

`firebase.js` içindeki örnek değerleri kendi Firebase projenizin bilgileriyle değiştirin. Admin SDK için servis hesabı dosyasını (`firebase-admin.json`) depoya eklemeyin; dağıtımda `FIREBASE_SERVICE_ACCOUNT` ortam değişkeninden üretilir.

```bash
npm start
```

## Durum

Örnek/geliştirme aşamasında bir uygulamadır; canlı kullanım için Firebase güvenlik kurallarının ayrıca yazılması gerekir.
