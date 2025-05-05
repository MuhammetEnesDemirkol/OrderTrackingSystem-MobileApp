import { ExpoConfig, ConfigContext } from 'expo/config';
import * as fs from 'fs';

// Firebase yapılandırma dosyası kontrolü
const googleServicesPath = './app/google-services.json';
if (fs.existsSync(googleServicesPath)) {
  console.log('✅ google-services.json bulundu');
} else {
  console.warn('⚠️ google-services.json bulunamadı!');
}

export default ({ config }) => {
  return {
    ...config,
    name: 'Sipariş Takip',
    slug: 'siparis-takip',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yourcompany.siparistakip'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.yourcompany.siparistakip',
      googleServicesFile: './app/google-services.json'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      eas: {
        projectId: 'your-project-id'
      },
      firebaseProjectId: 'your-firebase-project-id'
    }
  };
};
