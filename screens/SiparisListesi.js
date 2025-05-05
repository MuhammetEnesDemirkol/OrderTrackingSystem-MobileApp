import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import {
  View, Text, FlatList, StyleSheet, Alert, Button
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../firebase';
import {
  collection, onSnapshot, doc, updateDoc
} from 'firebase/firestore';

export default function SiparisListesi({ kullanici }) {
  const [siparisler, setSiparisler] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'siparisler'), (snapshot) => {
      const liste = [];

      snapshot.forEach((docu) => {
        const data = docu.data();
        const siparis = { id: docu.id, ...data };

        const kullaniciAdi = kullanici.ad;

        // Admin bu sayfayı kullanmıyor
        if (kullanici.rol === 'admin') return;

        // Pazarlama: sadece kendi siparişlerini görür
        if (
          kullanici.rol === 'pazarlama' &&
          siparis.siparisiAlan === kullaniciAdi
        ) {
          liste.push(siparis);
        }

        // Sevkiyat: sadece kendi teslim ettikleri ve aktif görevleri
        if (
          kullanici.rol === 'sevkiyat' &&
          (
            (['Hazırla', 'Sevk Et'].includes(siparis.durum)) ||
            siparis.teslimEden === kullaniciAdi
          )
        ) {
          liste.push(siparis);
        }
      });

      const gruplu = {};
      liste.forEach((siparis) => {
        const tarih = siparis.tarih || 'Bilinmeyen';
        if (!gruplu[tarih]) gruplu[tarih] = [];
        gruplu[tarih].push(siparis);
      });

      const sirali = Object.keys(gruplu)
        .sort((a, b) => new Date(b) - new Date(a))
        .map((tarih) => ({
          tarih,
          veriler: gruplu[tarih],
        }));

      setSiparisler(sirali);
    });

    return () => unsubscribe();
  }, []);

  const durumEtiketi = (durum) => {
    switch (durum) {
      case 'Yeni': return { renk: '#e0e0e0', etiket: '🕓 Yeni' };
      case 'Hazırla': return { renk: '#bbdefb', etiket: '📦 Hazırlanıyor' };
      case 'Beklet': return { renk: '#ffe082', etiket: '⏸️ Bekletildi' };
      case 'Sevk Et': return { renk: '#c8e6c9', etiket: '🚚 Sevke Hazır' };
      case 'İptal Edildi': return { renk: '#ffcdd2', etiket: '❌ İptal' };
      case 'Hazırlandı': return { renk: '#fff3e0', etiket: '🟡 Hazırlandı' };
      default: return { renk: '#eeeeee', etiket: durum };
    }
  };

  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    const { renk, etiket } = durumEtiketi(item.durum);
  
    return (
      <TouchableOpacity onPress={() => navigation.navigate('SiparisDetay', { siparis: item, kullanici })}>
        <View style={[styles.kart, { backgroundColor: renk }]}>
          <Text style={styles.etiket}>{etiket}</Text>
          <Text style={styles.baslik}>🧾 {item.musteriAdi}</Text>
          <Text>📦 Ürünler: {Array.isArray(item.urunler) ? item.urunler.length + ' ürün' : item.urunler}</Text>
          <Text>👤 Siparişi Alan: {item.siparisiAlan}</Text>
          <Text>📅 Tarih: {item.tarih}</Text>
          {item.teslimEden && <Text>🚚 Teslim Eden: {item.teslimEden}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = ({ item }) => (
    <View style={styles.bolum}>
      <Text style={styles.tarihBasligi}>📅 {item.tarih}</Text>
      <FlatList
        data={item.veriler}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.ekranBaslik}>📋 Siparişlerim</Text>
      <FlatList
        data={siparisler}
        renderItem={renderSection}
        keyExtractor={(item) => item.tarih}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  ekranBaslik: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  bolum: { marginBottom: 20 },
  tarihBasligi: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  kart: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  baslik: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  etiket: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#424242',
  },
});
