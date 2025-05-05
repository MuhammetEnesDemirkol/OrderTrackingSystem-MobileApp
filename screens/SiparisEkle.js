import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function SiparisEkle({ kullanici }) {
  const [musteriAdi, setMusteriAdi] = useState('');
  const [yeniUrun, setYeniUrun] = useState('');
  const [urunler, setUrunler] = useState([]);
  const [fatura, setFatura] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const bugun = new Date();
  const [dateObj, setDateObj] = useState(bugun);
  const [tarih, setTarih] = useState(() => {
    const gun = String(bugun.getDate()).padStart(2, '0');
    const ay = String(bugun.getMonth() + 1).padStart(2, '0');
    const yil = bugun.getFullYear();
    return `${gun}/${ay}/${yil}`;
  });
  const [showPicker, setShowPicker] = useState(false);

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

  const faturaSec = async () => {
    const sonuc = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    console.log("Fatura seçildi:", sonuc);
    if (!sonuc.canceled && sonuc.assets?.length > 0) {
      const secilen = sonuc.assets[0];
      setFatura(secilen);
    }
  };

  const siparisEkle = async () => {
    if (!musteriAdi || urunler.length === 0 || !tarih) {
      Alert.alert('Eksik Bilgi', 'Tüm alanları doldurmalısınız.');
      return;
    }

    setYukleniyor(true);
    let faturaUrl = null;

    try {
      if (fatura) {
        const response = await fetch(fatura.uri);
        const blob = await response.blob();
        const storage = getStorage();
        const refFatura = ref(storage, `faturalar/${Date.now()}_${fatura.name}`);
        await uploadBytes(refFatura, blob);
        faturaUrl = await getDownloadURL(refFatura);
      }

      await addDoc(collection(db, 'siparisler'), {
        musteriAdi,
        urunler,
        tarih,
        durum: 'Yeni',
        siparisiAlan: kullanici?.ad || 'Bilinmiyor',
        createdAt: serverTimestamp(),
        faturaUrl: faturaUrl || null,
      });

      Alert.alert('Başarılı', 'Sipariş eklendi.');
      setMusteriAdi('');
      setUrunler([]);
      setYeniUrun('');
      setDateObj(bugun);
      setShowPicker(false);
      setFatura(null);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Sipariş eklenemedi.');
    } finally {
      setYukleniyor(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      const gun = String(selectedDate.getDate()).padStart(2, '0');
      const ay = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const yil = selectedDate.getFullYear();
      setTarih(`${gun}/${ay}/${yil}`);
      setDateObj(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.baslik}>🆕 Yeni Sipariş Ekle</Text>

      <TextInput
        placeholder="Müşteri Adı"
        value={musteriAdi}
        onChangeText={setMusteriAdi}
        style={styles.input}
      />

      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
        <Text>{tarih}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={dateObj}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <View style={styles.urunEkleme}>
        <TextInput
          placeholder="Ürün adı"
          value={yeniUrun}
          onChangeText={setYeniUrun}
          style={[styles.input, { flex: 1 }]}
        />
        <TouchableOpacity style={styles.iconButon} onPress={urunEkle}>
          <Icon name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {urunler.length > 0 && (
        <View style={styles.urunListeAlani}>
          <Text style={styles.urunBaslik}>📦 Eklenen Ürünler:</Text>
          <FlatList
            data={urunler}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.urunSatiri}>
                <Text>• {item}</Text>
                <TouchableOpacity onPress={() => urunuSil(index)}>
                  <Icon name="delete" size={20} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      <TouchableOpacity style={styles.faturaButon} onPress={faturaSec}>
        <Text>
          {fatura ? `📎 ${fatura.name}` : '➕ Fatura Seç (Opsiyonel)'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buton} onPress={siparisEkle} disabled={yukleniyor}>
        {yukleniyor ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="content-save" size={20} color="#fff" />
            <Text style={styles.butonYazi}>  Siparişi Kaydet</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  baslik: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 6,
  },
  urunEkleme: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  urunListeAlani: {
    marginBottom: 16,
  },
  urunBaslik: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  urunSatiri: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 10,
  },
  butonYazi: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconButon: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faturaButon: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
});
