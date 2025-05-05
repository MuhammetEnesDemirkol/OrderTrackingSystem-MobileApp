import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert
} from 'react-native';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

export default function YeniKullaniciEkle() {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [ad, setAd] = useState('');
  const [rol, setRol] = useState('pazarlama');

  const kullaniciEkle = async () => {
    if (!email || !sifre || !ad || !rol) {
      Alert.alert('Uyarı', 'Tüm alanları doldurmalısınız.');
      return;
    }

    try {
      // 1️⃣ Firebase Authentication'a kullanıcı ekle
      const kullaniciOlustur = await createUserWithEmailAndPassword(auth, email, sifre);
      const uid = kullaniciOlustur.user.uid;

      // 2️⃣ Firestore'a kullanıcı detayları ekle
      await setDoc(doc(db, 'kullanicilar', uid), {
        ad,
        rol,
        email,
        bildirimToken: '', // şimdilik boş
      });

      Alert.alert('Başarılı', 'Kullanıcı başarıyla oluşturuldu.');
      setEmail('');
      setSifre('');
      setAd('');
      setRol('pazarlama');
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', error.message || 'Kullanıcı oluşturulamadı.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.baslik}>Yeni Kullanıcı Oluştur</Text>

      <TextInput placeholder="Ad" value={ad} onChangeText={setAd} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Şifre" value={sifre} onChangeText={setSifre} style={styles.input} secureTextEntry />

      <Text>Rol Seç:</Text>
      <Picker selectedValue={rol} onValueChange={(itemValue) => setRol(itemValue)} style={styles.input}>
        <Picker.Item label="Pazarlama" value="pazarlama" />
        <Picker.Item label="Sevkiyat" value="sevkiyat" />
        <Picker.Item label="Admin" value="admin" />
      </Picker>

      <Button title="Kullanıcı Oluştur" onPress={kullaniciEkle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  baslik: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
});
