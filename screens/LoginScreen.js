import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Constants from 'expo-constants';

const surum = Constants.manifest?.extra?.appVersion || Constants.expoConfig?.extra?.appVersion || 'bilinmiyor';

export default function LoginScreen({ navigation, setKullanici }) {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');

  const girisYap = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, sifre);
      const uid = result.user.uid;
      const ref = doc(db, 'kullanicilar', uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setKullanici({ uid, ...data });
      } else {
        Alert.alert("Kullanıcı bulunamadı.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Giriş Başarısız", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap 1</Text>
      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
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
      <Button title="Giriş Yap (Login)" onPress={girisYap} />
      <Text style={{ fontSize: 12, color: '#888' }}>🆕 Sürüm: {surum}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
    borderColor: '#ccc',
  },
});
