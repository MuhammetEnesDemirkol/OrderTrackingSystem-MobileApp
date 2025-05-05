import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import * as WebBrowser from 'expo-web-browser';

export default function SiparisDetay({ route }) {
  const { siparis, kullanici } = route.params;
  const [urunler, setUrunler] = useState(Array.isArray(siparis.urunler) ? [...siparis.urunler] : []);
  const [yeniUrun, setYeniUrun] = useState('');
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);

  const urunEkle = () => {
    if (yeniUrun.trim() !== '') {
      setUrunler([...urunler, yeniUrun.trim()]);
      setYeniUrun('');
    }
  };

  const urunuSil = (index) => {
    const kopya = [...urunler];
    kopya.splice(index, 1);
    setUrunler(kopya);
  };

  const urunleriGuncelle = async () => {
    try {
      const ref = doc(db, 'siparisler', siparis.id);
      await updateDoc(ref, { urunler });
      Alert.alert('Başarılı', 'Ürün listesi güncellendi.');
      setDuzenlemeModu(false);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Ürün listesi güncellenemedi.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.baslik}>📋 Sipariş Detayı</Text>

      <Text style={styles.etiket}>🧾 Müşteri: {siparis.musteriAdi}</Text>
      <Text style={styles.etiket}>📅 Tarih: {siparis.tarih}</Text>
      <Text style={styles.etiket}>📌 Durum: {siparis.durum}</Text>
      <Text style={styles.etiket}>👤 Siparişi Alan: {siparis.siparisiAlan}</Text>
      {siparis.teslimEden && (
        <Text style={styles.etiket}>🚚 Teslim Eden: {siparis.teslimEden}</Text>
      )}

      {/* 📎 Fatura butonu */}
      {siparis.faturaUrl && (
        <TouchableOpacity
          onPress={() => WebBrowser.openBrowserAsync(siparis.faturaUrl)}
          style={styles.faturaButon}
        >
          <Text style={{ color: '#1565c0' }}>📄 Faturayı Gör</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.etiket, { marginTop: 16 }]}>📦 Ürünler:</Text>

      {kullanici?.rol === 'admin' && duzenlemeModu ? (
        <>
          <FlatList
            data={urunler}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.urunSatiri}>
                <Text>• {item}</Text>
                <Button title="Sil" color="red" onPress={() => urunuSil(index)} />
              </View>
            )}
          />
          <View style={styles.yeniUrunAlani}>
            <TextInput
              placeholder="Yeni ürün"
              value={yeniUrun}
              onChangeText={setYeniUrun}
              style={styles.input}
            />
            <Button title="Ekle" onPress={urunEkle} />
          </View>
          <Button title="💾 Kaydet" onPress={urunleriGuncelle} />
        </>
      ) : (
        <FlatList
          data={urunler}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <Text style={styles.urun}>• {item}</Text>}
        />
      )}

      {kullanici?.rol === 'admin' && !duzenlemeModu && (
        <Button title="✏️ Ürünleri Düzenle" onPress={() => setDuzenlemeModu(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  baslik: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  etiket: { fontSize: 16, marginBottom: 6 },
  urun: { fontSize: 15, marginLeft: 8, marginBottom: 4 },
  urunSatiri: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  yeniUrunAlani: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    borderRadius: 6,
  },
  faturaButon: {
    padding: 10,
    backgroundColor: '#e0f7fa',
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 10,
  },
});
