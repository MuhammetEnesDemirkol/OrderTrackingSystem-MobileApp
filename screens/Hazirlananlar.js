import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert
} from 'react-native';
import { collection, onSnapshot, doc, updateDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Picker } from '@react-native-picker/picker';
import { sendPushNotification } from '../notifications';
import { sendAdminNotification } from '../sendAdminNotification';


export default function Hazirlananlar({ kullanici }) {
  const [siparisler, setSiparisler] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'siparisler'), (snapshot) => {
      const hazirlananlar = [];
      snapshot.forEach((docu) => {
        const data = docu.data();
        if (data.durum === 'Hazırlandı') {
          hazirlananlar.push({ id: docu.id, ...data });
        }
      });
      setSiparisler(hazirlananlar);
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

  const renderItem = ({ item }) => (
    <View style={[styles.kart, { backgroundColor: '#fff3e0' }]}>
      <Text style={styles.etiket}>📦 Hazırlandı – Sevk Bekliyor</Text>
      <Text style={styles.baslik}>🧾 {item.musteriAdi}</Text>
      <Text>📦 Ürünler: {item.urunler}</Text>
      <Text>👤 Siparişi Alan: {item.siparisiAlan}</Text>
      <Text>📅 Tarih: {item.tarih}</Text>

      {kullanici.rol === 'admin' && (
        <Picker
          selectedValue={item.durum}
          onValueChange={(deger) => durumGuncelle(item.id, deger)}
          style={styles.picker}
        >
          <Picker.Item label="Hazırlandı" value="Hazırlandı" />
          <Picker.Item label="Sevk Et" value="Sevk Et" />
          <Picker.Item label="Beklet" value="Beklet" />
          <Picker.Item label="İptal Edildi" value="İptal Edildi" />
        </Picker>
      )}
    </View>
  );

  if (kullanici.rol !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 16, color: 'gray' }}>
          Bu sayfa yalnızca admin tarafından görüntülenebilir.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.baslikEkran}>🟡 Hazırlandı – Sevk Bekleyen Siparişler</Text>
      <FlatList
        data={siparisler}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  baslikEkran: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  kart: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  etiket: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#e65100',
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
});
