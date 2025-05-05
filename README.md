# Sipariş Takip Sistemi

Bu proje, bir sipariş takip sistemini yönetmek için geliştirilmiş bir mobil uygulamadır. Uygulama, farklı kullanıcı rolleri (admin, pazarlama, sevkiyat) ile siparişlerin eklenmesi, takibi, onaylanması ve raporlanması gibi işlevleri içerir.

## Proje Yapısı

Proje, aşağıdaki ana bileşenlerden oluşmaktadır:

- **App.tsx**: Uygulamanın ana giriş noktasıdır. Kullanıcı kimlik doğrulaması ve ana navigasyon yapısını içerir.
- **Main.js**: Alt sekmeleri ve kullanıcı rolüne göre erişilebilir ekranları yönetir.
- **Screens/**: Farklı işlevsellikleri içeren ekranların bulunduğu klasördür.

## Kullanıcı Rolleri ve İşlevler

### Admin
- **Sipariş Yönetimi**: Tüm siparişleri görüntüleme, durumlarını güncelleme ve onaylama.
- **Kullanıcı Yönetimi**: Yeni kullanıcı ekleme, mevcut kullanıcıları silme ve rollerini yönetme.
- **Raporlama**: Siparişlerin durumlarına ve pazarlamacılara göre raporlama yapma.
- **Durum Paneli**: Siparişlerin durumlarını görüntüleme ve güncelleme.

### Pazarlama
- **Sipariş Ekleme**: Yeni siparişler ekleme ve müşteri bilgilerini giriş yapma.
- **Sipariş Listesi**: Kendi siparişlerini görüntüleme ve durumlarını takip etme.
- **Revizeler**: Siparişlerde yapılan değişiklikleri görüntüleme ve onay bekleme durumlarını takip etme.

### Sevkiyat
- **Görevlerim**: Kendilerine atanan siparişleri görüntüleme ve durumlarını güncelleme.
- **Sipariş Listesi**: Teslim ettikleri siparişleri görüntüleme.

## Ekranlar ve İşlevler

### Sipariş Ekleme (SiparisEkle.js)
- Müşteri adı, ürün listesi ve tarih bilgilerini giriş yapma.
- Fatura ekleme ve görüntüleme.

### Sipariş Listesi (SiparisListesi.js)
- Kullanıcı rolüne göre filtreleme yaparak siparişleri görüntüleme.
- Sipariş detaylarına erişim.

### Sipariş Detay (SiparisDetay.js)
- Siparişin tüm detaylarını görüntüleme.
- Admin için ürün listesini düzenleme imkanı.

### Admin Durum Paneli (AdminDurumPaneli.js)
- Siparişlerin durumlarını görüntüleme ve güncelleme.
- Farklı durumlara göre filtreleme yapma.

### Raporlama (Raporlama.js)
- Siparişlerin durumlarına ve pazarlamacılara göre grafiksel raporlama.
- Tarih aralığına göre filtreleme yapma.

### Kullanıcı Yönetimi (KullaniciYonetimi.js)
- Yeni kullanıcı ekleme ve mevcut kullanıcıları silme.
- Kullanıcı rollerini yönetme.

### Onay Bekleyenler (OnayBekleyenler.js)
- Onay bekleyen siparişleri görüntüleme ve onaylama/reddetme işlemleri.

### Revizeler (Revizeler.js)
- Revize edilen siparişleri görüntüleme ve durumlarını takip etme.

## Bildirim Sistemi

Uygulama, Expo Notifications kullanarak push bildirimleri gönderme ve alma özelliğine sahiptir. Bildirimler, sipariş durumlarındaki değişiklikler ve yeni görevler hakkında kullanıcıları bilgilendirmek için kullanılır.

## Bağımlılıklar

- **expo**: Mobil uygulama geliştirme platformu.
- **firebase**: Veritabanı ve kimlik doğrulama işlemleri için.
- **react-navigation**: Uygulama içi navigasyon için.
- **react-native-chart-kit**: Grafiksel raporlama için.
- **expo-notifications**: Push bildirimleri için.

## Kurulum

1. Projeyi klonlayın.
2. Bağımlılıkları yükleyin: `npm install`
3. Uygulamayı başlatın: `npm start`

## Lisans

Bu proje 0BSD lisansı altında lisanslanmıştır. 