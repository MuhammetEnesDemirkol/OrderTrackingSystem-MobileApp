import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import LoginScreen from './screens/LoginScreen';
import Main from './Main';
import SiparisDetay from './screens/SiparisDetay';
import { ActivityIndicator, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import { Platform } from 'react-native';


const Stack = createNativeStackNavigator();

type Kullanici = {
  uid: string;
  ad: string;
  rol: string;
  email?: string;
  bildirimToken?: string;
};

// 🔹 Firestore'a log yazma fonksiyonu
const logYaz = async (uid: string, mesaj: string, extra: any = {}) => {
  try {
    const logRef = doc(db, 'loglar', `${uid}-${Date.now()}`);
    await setDoc(logRef, {
      uid,
      mesaj,
      zaman: new Date().toISOString(),
      ...extra
    });
  } catch (e: any) {
    console.error('📛 Log yazılamadı:', e.message);
  }
};

// 🔹 Bildirim token'ını al ve kaydet
const tokenAlVeKaydet = async (uid: string) => {
  try {
    await logYaz(uid, '🎯 Token alma işlemi başladı');
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      await logYaz(uid, '❌ Bildirim izni verilmedi');
      return;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync();
    await logYaz(uid, '📲 Token alındı', { token });

    const ref = doc(db, 'kullanicilar', uid);
    await setDoc(ref, { bildirimToken: token }, { merge: true });
  } catch (e: any) {
    await logYaz(uid, '⚠️ Token alma hatası', { hata: e.message });
  }
};

export default function App() {
  const [kullanici, setKullanici] = useState<Kullanici | null | undefined>(undefined);
  const [yukleniyor, setYukleniyor] = useState(true);

  // ✅ Zorunlu Güncelleme Kontrolü
  useEffect(() => {
    const guncellemeKontrolEt = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          console.log('🚀 Yeni güncelleme bulundu, indiriliyor...');
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // otomatik yeniden başlat
        }
      } catch (e: any) {
        console.log('❌ Güncelleme kontrol hatası:', e.message);
      }
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }      
    };

    guncellemeKontrolEt();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const ref = doc(db, 'kullanicilar', user.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            const data = snap.data();

            if (data.ad && data.rol) {
              const aktifKullanici: Kullanici = {
                uid: user.uid,
                ad: data.ad,
                rol: data.rol,
                email: user.email || '',
              };

              setKullanici(aktifKullanici);
              await tokenAlVeKaydet(user.uid);
            } else {
              await logYaz(user.uid, '⚠️ Kullanıcı verisi eksik');
              setKullanici(null);
            }
          } else {
            await logYaz(user.uid, '❌ Kullanıcı Firestore’da bulunamadı');
            setKullanici(null);
          }
        } catch (e: any) {
          await logYaz(user?.uid || 'bilinmiyor', '🔥 Firestore veri hatası', { hata: e.message });
          setKullanici(null);
        }
      } else {
        setKullanici(null);
      }

      setYukleniyor(false);
    });

    return () => unsubscribe();
  }, []);

  const cikisYap = async () => {
    await signOut(auth);
    setKullanici(null);
  };

  if (kullanici === undefined || yukleniyor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!kullanici ? (
          <Stack.Screen name="Login">
            {({ navigation }) => (
              <LoginScreen setKullanici={setKullanici} navigation={navigation} />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main">
              {() => <Main kullanici={kullanici} cikisYap={cikisYap} />}
            </Stack.Screen>
            <Stack.Screen name="SiparisDetay">
              {({ route }) => (
                <SiparisDetay
                  route={{
                    params: {
                      siparis: (route.params as any)?.siparis,
                      kullanici: kullanici,
                    },
                  }}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
