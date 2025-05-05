import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function OnayBekleyenler({ kullanici }) {
  const [istekler, setIstekler] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'siparisler'), (snapshot) => {
      const liste = [];
      snapshot.forEach((docu) => {
        const data = docu.data();
        if (data.onayBekliyor && data.guncellenmisUrunler) {
          liste.push({ id: docu.id, ...data });
        }
      });
      setIstekler(liste);
    });

    return () => unsubscribe();
  }, []);

  const onayla = async (siparis) => {
    try {
      const ref = doc(db, 'siparisler', siparis.id);
      await updateDoc(ref, {
        urunler: siparis.guncellenmisUrunler,
        onayBekliyor: false,
        guncellenmisUrunler: null
      });
      Alert.alert('Onaylandı', 'Ürün güncellemesi uygulandı.');
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Onay işlemi başarısız.');
    }
  };

  const reddet = async (siparis) => {
    try {
      const ref = doc(db, 'siparisler', siparis.id);
      await updateDoc(ref, {
        onayBekliyor: false,
        guncellenmisUrunler: null
      });
      Alert.alert('Reddedildi', 'Güncelleme isteği silindi.');
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Reddetme işlemi başarısız.');
    }
  };

  if (kullanici.rol !== 'admin') {
    return (
      <View style={styles.container}>
        <Text>Sadece admin kullanıcılar erişebilir.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.baslik}>📨 Onay Bekleyen Siparişler</Text>

      {istekler.length === 0 ? (
        <Text style={styles.bos}>Şu anda onay bekleyen herhangi bir sipariş yok.</Text>
      ) : (
        istekler.map((siparis) => (
          <View key={siparis.id} style={styles.kart}>
            <Text style={styles.musteri}>🧾 {siparis.musteriAdi}</Text>
            <Text>📌 Durum: {siparis.durum}</Text>
            <Text>👤 Siparişi Alan: {siparis.siparisiAlan}</Text>
            <Text style={{ marginTop: 6, fontWeight: 'bold' }}>Yeni Ürün Listesi:</Text>
            {siparis.guncellenmisUrunler.map((urun, i) => (
              <Text key={i}>• {urun}</Text>
            ))}

            <View style={styles.butonlar}>
              <TouchableOpacity
                style={[styles.buton, { backgroundColor: '#4caf50' }]}
                onPress={() => onayla(siparis)}
              >
                <Text style={styles.butonText}>✅ Onayla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buton, { backgroundColor: '#f44336' }]}
                onPress={() => reddet(siparis)}
              >
                <Text style={styles.butonText}>❌ Reddet</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  baslik: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  bos: { color: '#777', textAlign: 'center', marginTop: 40 },
  kart: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  musteri: { fontWeight: 'bold', fontSize: 16 },
  butonlar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  buton: {
    padding: 10,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  butonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
