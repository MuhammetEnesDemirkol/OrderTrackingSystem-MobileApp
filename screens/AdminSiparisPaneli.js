import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';

export default function AdminSiparisPaneli({ kullanici }) {
  const [siparisler, setSiparisler] = useState([]);
  const [kategori, setKategori] = useState('Aktif');
  const [acikGunler, setAcikGunler] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'siparisler'), (snapshot) => {
      const liste = [];
      snapshot.forEach((docu) => {
        const data = docu.data();
        liste.push({ id: docu.id, ...data });
      });
      setSiparisler(liste);
    });

    return () => unsub();
  }, []);

  const durumEtiketi = (durum) => {
    switch (durum) {
      case 'Yeni':
        return { renk: '#e0e0e0', etiket: '🕓 Yeni' };
      case 'Hazırla':
        return { renk: '#bbdefb', etiket: '📦 Hazırlanıyor' };
      case 'Beklet':
        return { renk: '#ffe082', etiket: '⏸️ Bekletildi' };
      case 'Sevk Et':
        return { renk: '#c8e6c9', etiket: '🚚 Sevke Hazır' };
      case 'Teslim Edildi':
        return { renk: '#c5e1a5', etiket: '✅ Teslim Edildi' };
      case 'İptal Edildi':
        return { renk: '#ffcdd2', etiket: '❌ İptal Edildi' };
      default:
        return { renk: '#eeeeee', etiket: durum };
    }
  };

  const filtrelenmis = siparisler.filter((s) => {
    if (kategori === 'Aktif') {
      return !['Teslim Edildi', 'İptal Edildi'].includes(s.durum);
    }
    if (kategori === 'Tamamlandı') {
      return s.durum === 'Teslim Edildi';
    }
    if (kategori === 'İptal') {
      return s.durum === 'İptal Edildi';
    }
    return false;
  });

  const gruplu = {};
  filtrelenmis.forEach((siparis) => {
    const tarih = siparis.tarih || 'Bilinmeyen';
    if (!gruplu[tarih]) gruplu[tarih] = [];
    gruplu[tarih].push(siparis);
  });

  const siraliGunler = Object.keys(gruplu).sort((a, b) => new Date(b) - new Date(a));

  const toggleGunu = (tarih) => {
    setAcikGunler((prev) => ({
      ...prev,
      [tarih]: !prev[tarih]
    }));
  };

  const renderSiparis = (siparis) => {
    const { renk, etiket } = durumEtiketi(siparis.durum);
    const urunGosterim = Array.isArray(siparis.urunler)
      ? `${siparis.urunler.length} ürün`
      : siparis.urunler;

    return (
      <TouchableOpacity
        key={siparis.id}
        onPress={() => navigation.navigate('SiparisDetay', {
          siparis,
          kullanici, // giriş yapan kullanıcı bilgisi buradan gider
        })}        
      >
        <View style={[styles.kart, { backgroundColor: renk }]}>
          <Text style={styles.etiket}>{etiket}</Text>
          <Text style={styles.baslik}>🧾 {siparis.musteriAdi}</Text>
          <Text>📦 Ürünler: {urunGosterim}</Text>
          <Text>👤 Siparişi Alan: {siparis.siparisiAlan}</Text>
          <Text>📅 Tarih: {siparis.tarih}</Text>
          {siparis.teslimEden && (
            <Text>👤 Teslim Eden: {siparis.teslimEden}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.baslikEkran}>🧭 Admin Sipariş Paneli</Text>

      <View style={styles.menu}>
        {['Aktif', 'Tamamlandı', 'İptal'].map((secenek) => (
          <TouchableOpacity
            key={secenek}
            onPress={() => setKategori(secenek)}
            style={[
              styles.kategoriButon,
              kategori === secenek && styles.kategoriSecili
            ]}
          >
            <Text
              style={{
                fontWeight: kategori === secenek ? 'bold' : 'normal',
                color: kategori === secenek ? '#fff' : '#333'
              }}
            >
              {secenek}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {siraliGunler.length === 0 ? (
        <Text style={styles.bos}>Bu kategoride sipariş yok.</Text>
      ) : (
        siraliGunler.map((tarih) => (
          <View key={tarih} style={styles.gunBolumu}>
            <TouchableOpacity onPress={() => toggleGunu(tarih)}>
              <Text style={styles.tarihBasligi}>
                {acikGunler[tarih] ? '🔽' : '▶️'} {tarih}
              </Text>
            </TouchableOpacity>

            {acikGunler[tarih] &&
              gruplu[tarih].map((siparis) => renderSiparis(siparis))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  baslikEkran: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  kategoriButon: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  kategoriSecili: {
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
  baslik: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  bos: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
  gunBolumu: {
    marginBottom: 24,
  },
  tarihBasligi: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#eeeeee',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
});
