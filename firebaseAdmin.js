import admin from 'firebase-admin';
import fs from 'fs';

let serviceAccount;

try {
  const raw = fs.readFileSync('./firebase-admin.json', 'utf8');
  serviceAccount = JSON.parse(raw);
} catch (e) {
  console.error('❌ firebase-admin.json okunamadı:', e.message);
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firebaseAdmin = admin;
