import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Onaylarim({ kullanici }) {
  const [siparisler, setSiparisler] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'siparisler'), (snapshot) => {
      const liste = [];
      snapshot.forEach((docu) => {
        const data = docu.data();
        if (
          data.siparisiAlan === kullanici.ad &&
          (data.onayBekliyor || data.guncellenmisUrunler)
        ) {
          liste.push({ id: docu.id, ...data });
        }
      });
      setSiparisler(liste);
    });

    return () => unsub();
  }, []);

  const durumEtiketi = (siparis) => {
    if (siparis.onayBekliyor) return '🟠 Bekliyor';
    if (siparis.guncellenmisUrunler === null) return '✅ Onaylandı';
    return '❌ Reddedildi';
  };

  if (kullanici.rol !== 'pazarlama') {
    return (
      <View style={styles.container}>
        <Text>Sadece pazarlama kullanıcıları görebilir.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.baslik}>📋 Onay Taleplerim</Text>

      {siparisler.length === 0 ? (
        <Text style={styles.bos}>Gönderilmiş herhangi bir onay isteğiniz yok.</Text>
      ) : (
        siparisler.map((siparis) => (
          <View key={siparis.id} style={styles.kart}>
            <Text style={styles.musteri}>🧾 {siparis.musteriAdi}</Text>
            <Text>📅 Tarih: {siparis.tarih}</Text>
            <Text>📌 Durum: {durumEtiketi(siparis)}</Text>
            <Text style={{ marginTop: 6, fontWeight: 'bold' }}>
              Talep Edilen Ürün Listesi:
            </Text>
            {Array.isArray(siparis.guncellenmisUrunler) &&
              siparis.guncellenmisUrunler.map((urun, i) => (
                <Text key={i}>• {urun}</Text>
              ))}
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
});
