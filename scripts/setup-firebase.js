const fs = require('fs');

const encoded = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!encoded) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT değişkeni tanımlı değil.');
  process.exit(1);
}

const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
const outputPath = './firebase-admin.json';

fs.writeFileSync(outputPath, decoded);
console.log('✅ firebase-admin.json oluşturuldu');
