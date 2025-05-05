import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { collection, onSnapshot, doc, updateDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { sendPushNotification } from '../notifications';

export default function Gorevlerim({ kullanici }) {
  const [siparisler, setSiparisler] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'siparisler'), (snapshot) => {
      const liste = [];
      snapshot.forEach((docu) => {
        const data = docu.data();
        if (
          (data.durum === 'Hazırla' || data.durum === 'Sevk Et') &&
          !['Teslim Edildi', 'İptal Edildi'].includes(data.durum)
        ) {
          liste.push({ id: docu.id, ...data });
        }
      });
      setSiparisler(liste);
    });

    return () => unsubscribe();
  }, []);

  const tamamla = async (siparis) => {
    const ref = doc(db, 'siparisler', siparis.id);
    const yeniDurum = siparis.durum === 'Hazırla' ? 'Hazırlandı' : 'Teslim Edildi';

    try {
      const guncelleme = { durum: yeniDurum };
      if (yeniDurum === 'Teslim Edildi') {
        guncelleme.teslimEden = kullanici.ad;
      }

      await updateDoc(ref, guncelleme);
      Alert.alert('Başarılı', `Sipariş ${yeniDurum} olarak işaretlendi.`);

      // 🔔 Bildirim gönder: Sipariş Teslim Edildi
      if (yeniDurum === 'Teslim Edildi') {
        const q = query(
          collection(db, 'kullanicilar'),
          where('ad', '==', siparis.siparisiAlan)
        );
        const snapshot = await getDocs(q);

        snapshot.forEach(async (docu) => {
          const token = docu.data().bildirimToken;
          if (token) {
            await sendPushNotification(
              token,
              '📦 Sipariş Teslim Edildi',
              `${siparis.musteriAdi} müşterisine ait sipariş teslim edildi.`
            );
          }
        });
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Durum güncellenemedi.');
    }
  };

  const getButonEtiketi = (durum) => {
    switch (durum) {
      case 'Hazırla':
        return '✅ Hazırlandı olarak işaretle';
      case 'Sevk Et':
        return '✅ Sevk Edildi olarak işaretle';
      default:
        return '✅ Tamamlandı';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.kart}>
      <Text style={styles.baslik}>{item.musteriAdi}</Text>
      <Text>📦 Ürünler: {item.urunler}</Text>
      <Text>📅 Tarih: {item.tarih}</Text>
      <Text>📌 Durum: {item.durum}</Text>

      <Button
        title={getButonEtiketi(item.durum)}
        onPress={() => tamamla(item)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.baslikEkran}>🚚 Görevlerim</Text>
      <FlatList
        data={siparisler}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
    backgroundColor: '#f0f0f0',
  },
  baslik: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
