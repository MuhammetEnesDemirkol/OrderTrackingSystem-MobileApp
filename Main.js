import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Button } from 'react-native';
import SiparisEkle from './screens/SiparisEkle';
import SiparisListesi from './screens/SiparisListesi';
import Gorevlerim from './screens/Gorevlerim';
import Raporlama from './screens/Raporlama';
import AdminSiparisPaneli from './screens/AdminSiparisPaneli';
import AdminDurumPaneli from './screens/AdminDurumPaneli';
import OnayBekleyenler from './screens/OnayBekleyenler';
import Revizeler from './screens/Revizeler';
import KullaniciYonetimi from './screens/KullaniciYonetimi';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { testNotification } from './notifications'; // varsa ../notifications


const Tab = createBottomTabNavigator();

export default function Main({ kullanici, cikisYap }) {
  return (
    <>
      <View style={{ padding: 10, backgroundColor: '#f0f0f0' }}>
        <Text style={{ fontWeight: 'bold' }}>👋 Merhaba, {kullanici.ad}</Text>
        <Button title="Çıkış Yap" onPress={cikisYap} color="red" />
        <Button title="📩 Bildirim Test Et"onPress={() => testNotification(kullanici.bildirimToken)}/>
      </View>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const icons = {
              'Yeni Sipariş': 'plus-box',
              'Siparişler': 'format-list-bulleted',
              'Görevlerim': 'clipboard-check',
              'Admin Panel': 'account-cog',
              'Raporlama': 'chart-bar',
              'Durum Paneli': 'clipboard-list',
              'Kullanıcılar': 'account-plus',
              'Onaylar': 'clipboard-alert',
              'Revizeler': 'check-circle-outline',
            };
            return <Icon name={icons[route.name]} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#1976d2',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        {/* Ortak: Pazarlama + Admin */}
        {(kullanici.rol === 'admin' || kullanici.rol === 'pazarlama') && (
          <Tab.Screen name="Yeni Sipariş">
            {() => <SiparisEkle kullanici={kullanici} />}
          </Tab.Screen>
        )}

        {/* Siparişler sadece pazarlama/diğer */}
        {kullanici.rol !== 'admin' && (
          <Tab.Screen name="Siparişler">
            {() => <SiparisListesi kullanici={kullanici} />}
          </Tab.Screen>
        )}

        {/* Sevkiyat kullanıcıları için */}
        {kullanici.rol === 'sevkiyat' && (
          <Tab.Screen name="Görevlerim">
            {() => <Gorevlerim kullanici={kullanici} />}
          </Tab.Screen>
        )}

        {/* Admin'e özel ekranlar */}
        {kullanici.rol === 'admin' && (
          <>
            <Tab.Screen name="Durum Paneli">
              {() => <AdminDurumPaneli kullanici={kullanici} />}
            </Tab.Screen>
            <Tab.Screen name="Admin Panel">
              {() => <AdminSiparisPaneli kullanici={kullanici} />}
            </Tab.Screen>
            <Tab.Screen name="Onaylar">
              {() => <OnayBekleyenler kullanici={kullanici} />}
            </Tab.Screen>
            <Tab.Screen name="Raporlama">
              {() => <Raporlama kullanici={kullanici} />}
            </Tab.Screen>
            <Tab.Screen name="Kullanıcılar">
              {() => <KullaniciYonetimi />}
            </Tab.Screen>
          </>
        )}

        {/* Pazarlamacıya özel revizeler */}
        {kullanici.rol === 'pazarlama' && (
          <Tab.Screen name="Revizeler">
            {() => <Revizeler kullanici={kullanici} />}
          </Tab.Screen>
        )}
      </Tab.Navigator>
    </>
  );
}
