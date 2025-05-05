import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert
} from 'react-native';
import { collection, onSnapshot, doc, updateDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Picker } from '@react-native-picker/picker';
import { sendPushNotification } from '../notifications';
import { sendAdminNotification } from '../sendAdminNotification';


const durumlar = [
  { baslik: 'Yeni', kod: 'Yeni', renk: '#e0e0e0', ikon: '🕓' },
  { baslik: 'Hazırla', kod: 'Hazırla', renk: '#bbdefb', ikon: '📦' },
  { baslik: 'Beklet', kod: 'Beklet', renk: '#ffe082', ikon: '⏸️' },
  { baslik: 'Sevk Et', kod: 'Sevk Et', renk: '#c8e6c9', ikon: '🚚' },
  { baslik: 'Sevke Hazır', kod: 'Hazırlandı', renk: '#fff3e0', ikon: '🟡' }
];

export default function AdminDurumPaneli({ kullanici }) {
  const [siparisler, setSiparisler] = useState([]);
  const [aktifDurum, setAktifDurum] = useState('Yeni');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'siparisler'), (snapshot) => {
      const liste = [];
      snapshot.forEach((docu) => {
        const data = docu.data();
        if (!['Teslim Edildi', 'İptal Edildi'].includes(data.durum)) {
          liste.push({ id: docu.id, ...data });
        }
      });
      setSiparisler(liste);
    });

    return () => unsub();
  }, []);

  const durumGuncelle = async (id, yeniDurum) => {
    try {
      await updateDoc(doc(db, 'siparisler', id), { durum: yeniDurum });
      // 🔹 Bildirim gönderimi
if (yeniDurum === 'Hazırla' || yeniDurum === 'Sevk Et') {
  const q = query(collection(db, 'kullanicilar'), where('rol', '==', 'sevkiyat'));
  const snapshot = await getDocs(q);

  snapshot.forEach(async (docu) => {
    const token = docu.data().bildirimToken;
    if (token) {
      await sendAdminNotification(
        token,
        '📢 Yeni Görev',
        `Yeni '${yeniDurum}' siparişi eklendi. Lütfen kontrol edin.`
      );
    }
  });
}
  
      // Sipariş verisine tekrar eriş
      const sipRef = doc(db, 'siparisler', id);
      const sipSnap = await getDoc(sipRef);
      const siparis = sipSnap.data();

      // Eğer durum "Hazırla" veya "Sevk Et" ise sevkiyat rolündeki kullanıcılara bildirim gönder
      if (yeniDurum === 'Hazırla' || yeniDurum === 'Sevk Et') {
        // Sevkiyat rolündeki tüm kullanıcıları bul
        const q = query(collection(db, 'kullanicilar'), where('rol', '==', 'sevkiyat'));
        const snapshot = await getDocs(q);

        snapshot.forEach(async (docu) => {
          const token = docu.data().bildirimToken;
          if (token) {
            await sendPushNotification(
              token,
              `📦 Sipariş ${yeniDurum === 'Hazırla' ? 'Hazırlanıyor' : 'Sevke Hazır'}`,
              `${siparis.musteriAdi} müşterisine ait sipariş ${yeniDurum === 'Hazırla' ? 'hazırlanıyor' : 'sevke hazır'}.`
            );
          }
        });
      }
  
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Durum güncellenemedi.');
    }
  };

  const filtreli = siparisler.filter((s) => s.durum === aktifDurum);


  
  const navigation = useNavigation();
  
  const renderItem = ({ item }) => {
    const secili = durumlar.find((d) => d.kod === item.durum);
    const urunBilgisi = Array.isArray(item.urunler)
      ? `${item.urunler.length} ürün`
      : item.urunler;
  
    return (
      <TouchableOpacity onPress={() => navigation.navigate('SiparisDetay', { siparis: item, kullanici })}>
        <View style={[styles.kart, { backgroundColor: secili?.renk || '#eee' }]}>
          <Text style={styles.etiket}>{secili?.ikon} {secili?.baslik}</Text>
          <Text style={styles.baslik}>🧾 {item.musteriAdi}</Text>
          <Text>📦 Ürünler: {urunBilgisi}</Text>
          <Text>👤 Siparişi Alan: {item.siparisiAlan}</Text>
          <Text>📅 Tarih: {item.tarih}</Text>
  
          <Picker
            selectedValue={item.durum}
            onValueChange={(deger) => durumGuncelle(item.id, deger)}
            style={styles.picker}
          >
            <Picker.Item label="Yeni" value="Yeni" />
            <Picker.Item label="Hazırla" value="Hazırla" />
            <Picker.Item label="Beklet" value="Beklet" />
            <Picker.Item label="Sevk Et" value="Sevk Et" />
            <Picker.Item label="Hazırlandı" value="Hazırlandı" />
            <Picker.Item label="İptal Edildi" value="İptal Edildi" />
          </Picker>
        </View>
      </TouchableOpacity>
    );
  };
  

  if (kullanici.rol !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.uyari}>Bu panel yalnızca admin tarafından görüntülenebilir.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.baslikEkran}>📂 Sipariş Durum Paneli</Text>

      <View style={styles.sekmeSatiri}>
        {durumlar.map((d) => (
          <TouchableOpacity
            key={d.kod}
            onPress={() => setAktifDurum(d.kod)}
            style={[
              styles.sekme,
              aktifDurum === d.kod && styles.sekmeSecili
            ]}
          >
            <Text style={{ color: aktifDurum === d.kod ? '#fff' : '#333' }}>
              {d.ikon} {d.baslik}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtreli.length === 0 ? (
        <Text style={styles.bos}>Bu kategoride sipariş bulunmuyor.</Text>
      ) : (
        <FlatList
          data={filtreli}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  baslikEkran: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  sekmeSatiri: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  sekme: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  sekmeSecili: {
    backgroundColor: '#1565c0',
  },
  kart: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  etiket: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#424242',
  },
  baslik: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  picker: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  bos: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 30,
  },
  uyari: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});
