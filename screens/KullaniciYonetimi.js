import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';

export default function KullaniciYonetimi() {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [ad, setAd] = useState('');
  const [mail, setMail] = useState('');
  const [sifre, setSifre] = useState('');
  const [rol, setRol] = useState('pazarlama');

  useEffect(() => {
    kullanicilariGetir();
  }, []);

  const kullanicilariGetir = async () => {
    const snapshot = await getDocs(collection(db, 'kullanicilar'));
    const liste = [];
    snapshot.forEach((docu) => {
      liste.push({ id: docu.id, ...docu.data() });
    });
    setKullanicilar(liste);
  };

  const kullaniciEkle = async () => {
    if (!ad || !mail || !sifre || !rol) {
      Alert.alert('Eksik bilgi', 'Tüm alanları doldurunuz.');
      return;
    }
  
    try {
      console.log('KULLANICI EKLENİYOR:', mail); // ✅ debug için
  
      const yeniKullanici = await createUserWithEmailAndPassword(auth, mail, sifre);
      const uid = yeniKullanici.user.uid;
  
      await setDoc(doc(db, 'kullanicilar', uid), {
        ad,
        mail,
        rol,
        bildirimToken: '',
      });
  
      Alert.alert('Başarılı', 'Kullanıcı başarıyla oluşturuldu.');
      console.log('✅ Firestore ve Auth tamamlandı:', uid);
      setAd('');
      setMail('');
      setSifre('');
      setRol('pazarlama');
      kullanicilariGetir();
    } catch (e) {
      console.error('❌ Kullanıcı ekleme hatası:', e);
      Alert.alert('Hata', e.message || 'Kullanıcı eklenemedi.');
    }
  };
  

  const kullaniciSil = async (id) => {
    try {
      await deleteDoc(doc(db, 'kullanicilar', id));
      Alert.alert('Silindi', 'Kullanıcı silindi.');
      kullanicilariGetir();
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Kullanıcı silinemedi.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.baslik}>👤 Kullanıcı Yönetimi</Text>

      <TextInput
        placeholder="Ad"
        value={ad}
        onChangeText={setAd}
        style={styles.input}
      />
      <TextInput
        placeholder="E-posta"
        value={mail}
        onChangeText={setMail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Şifre"
        value={sifre}
        onChangeText={setSifre}
        style={styles.input}
        secureTextEntry
      />

      <Picker
        selectedValue={rol}
        onValueChange={(itemValue) => setRol(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Pazarlama" value="pazarlama" />
        <Picker.Item label="Sevkiyat" value="sevkiyat" />
        <Picker.Item label="Admin" value="admin" />
      </Picker>

      <Button title="Kullanıcı Ekle" onPress={kullaniciEkle} />

      <Text style={styles.altBaslik}>📋 Kayıtlı Kullanıcılar</Text>
      <FlatList
        data={kullanicilar}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.kart}>
            <Text style={styles.kullaniciBilgi}>👤 {item.ad}</Text>
            <Text>{item.mail}</Text>
            <Text>Rol: {item.rol}</Text>
            <Button
              title="Sil"
              onPress={() => kullaniciSil(item.id)}
              color="red"
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  baslik: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  altBaslik: { fontSize: 18, fontWeight: 'bold', marginVertical: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  kart: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  kullaniciBilgi: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
