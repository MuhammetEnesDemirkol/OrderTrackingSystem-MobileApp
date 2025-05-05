import { firebaseAdmin } from './firebaseAdmin';

export async function sendAdminNotification(token, title, body, data = {}) {
  const message = {
    token,
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      time: new Date().toISOString(),
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
  };

  try {
    const response = await firebaseAdmin.messaging().send(message);
    console.log('✅ FCM Bildirim gönderildi:', response);
    return response;
  } catch (error) {
    console.error('❌ FCM Bildirim hatası:', error.message);
    return null;
  }
}
