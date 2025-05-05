import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// notifications.js
export async function testNotification(token) {
  await sendPushNotification(
    token,
    '🚀 Test Bildirimi',
    'Bu sadece bir deneme mesajıdır.'
  );
}


// Bildirim izni al ve token'ı döndür
export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('📛 Bildirim izni verilmedi.');
      return null;
    }

    // Android için bildirim kanalı oluştur
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Token'ı al
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.firebaseProjectId
    });
    token = tokenData.data;
    console.log('🚀 Alınan PUSH TOKEN:', token);
  } else {
    alert('📵 Fiziksel cihaz kullanmalısın.');
    return null;
  }

  return token;
}

// Push bildirimi gönder
export async function sendPushNotification(expoPushToken, title, body) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { time: new Date().toISOString() },
    priority: 'high',
    android: {
      priority: 'high',
      channelId: 'default',
      vibrate: [0, 250, 250, 250],
    },
  };

  try {
    // Bildirim gönderme işlemi
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log('Bildirim gönderildi:', data);

    // Firebase'e log kaydı ekle
    try {
      await addDoc(collection(db, 'logs'), {
        type: 'notification',
        token: expoPushToken,
        title,
        body,
        status: 'success',
        response: data,
        timestamp: serverTimestamp(),
        platform: Platform.OS,
      });
      console.log('✅ Bildirim logu kaydedildi');
    } catch (logError) {
      console.error('❌ Log kaydedilemedi:', logError);
    }

  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
    
    // Hata durumunda da log kaydı ekle
    try {
      await addDoc(collection(db, 'logs'), {
        type: 'notification',
        token: expoPushToken,
        title,
        body,
        status: 'error',
        error: error.message,
        timestamp: serverTimestamp(),
        platform: Platform.OS,
      });
      console.log('✅ Hata logu kaydedildi');
    } catch (logError) {
      console.error('❌ Hata logu kaydedilemedi:', logError);
    }
  }
}
