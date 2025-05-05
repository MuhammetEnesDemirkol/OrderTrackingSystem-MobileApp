import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Dimensions, StyleSheet, TouchableOpacity,
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PieChart, BarChart } from 'react-native-chart-kit';

export default function Raporlama() {
  const [siparisler, setSiparisler] = useState([]);
  const [filtreliListe, setFiltreliListe] = useState([]);
  const [durumlar, setDurumlar] = useState({});
  const [pazarlamacilar, setPazarlamacilar] = useState({});

  const [baslangic, setBaslangic] = useState(null);
  const [bitis, setBitis] = useState(null);
  const [showPicker, setShowPicker] = useState({ show: false, tip: null });

  const ekranGenisligi = Dimensions.get('window').width - 32;
  const renkler = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#03a9f4'];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'siparisler'), (snap) => {
      const liste = [];
      snap.forEach((doc) => liste.push(doc.data()));
      setSiparisler(liste);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const filtrelenmis = [];

    siparisler.forEach((s) => {
      const tarihStr = s.tarih?.split('/');
      if (!tarihStr || tarihStr.length !== 3) return;

      const siparisTarihi = new Date(`${tarihStr[2]}-${tarihStr[1]}-${tarihStr[0]}`);
      siparisTarihi.setHours(0, 0, 0, 0);

      if (baslangic && siparisTarihi < baslangic) return;
      if (bitis && siparisTarihi > bitis) return;

      filtrelenmis.push(s);
    });

    setFiltreliListe(filtrelenmis);
  }, [siparisler, baslangic, bitis]);

  useEffect(() => {
    const durumlarObj = {};
    const personeller = {};

    filtreliListe.forEach((s) => {
      // Durum sayısı
      if (durumlarObj[s.durum]) {
        durumlarObj[s.durum]++;
      } else {
        durumlarObj[s.durum] = 1;
      }

      // Pazarlamacı sayısı
      if (s.siparisiAlan) {
        if (personeller[s.siparisiAlan]) {
          personeller[s.siparisiAlan]++;
        } else {
          personeller[s.siparisiAlan] = 1;
        }
      }
    });

    setDurumlar(durumlarObj);
    setPazarlamacilar(personeller);
  }, [filtreliListe]);

  const tarihSec = (event, selectedDate) => {
    if (selectedDate) {
      const secili = new Date(selectedDate.setHours(0, 0, 0, 0));
      if (showPicker.tip === 'baslangic') setBaslangic(secili);
      if (showPicker.tip === 'bitis') setBitis(secili);
    }
    setShowPicker({ show: false, tip: null });
  };

  const durumVerisi = Object.keys(durumlar).map((durum, i) => ({
    name: durum,
    population: durumlar[durum],
    color: renkler[i % renkler.length],
    legendFontColor: '#333',
    legendFontSize: 14,
  }));

  const barVeri = {
    labels: Object.keys(pazarlamacilar),
    datasets: [
      {
        data: Object.values(pazarlamacilar),
      },
    ],
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.baslik}>📊 Raporlama</Text>

      {/* Tarih filtre alanı */}
      <View style={styles.tarihFiltreAlani}>
        <TouchableOpacity
          onPress={() => setShowPicker({ show: true, tip: 'baslangic' })}
          style={styles.tarihButonu}
        >
          <Text>📅 Başlangıç: {baslangic ? baslangic.toLocaleDateString() : 'Seçiniz'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowPicker({ show: true, tip: 'bitis' })}
          style={styles.tarihButonu}
        >
          <Text>📅 Bitiş: {bitis ? bitis.toLocaleDateString() : 'Seçiniz'}</Text>
        </TouchableOpacity>
      </View>

      {showPicker.show && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={tarihSec}
        />
      )}

      {/* Duruma göre grafik */}
      <Text style={styles.altBaslik}>🗂 Duruma Göre Sipariş Dağılımı</Text>
      {durumVerisi.length > 0 ? (
        <PieChart
          data={durumVerisi}
          width={ekranGenisligi}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text style={styles.bos}>Gösterilecek veri yok</Text>
      )}

      {/* Pazarlamacı bazlı grafik */}
      <Text style={styles.altBaslik}>👤 Pazarlamacıya Göre Sipariş</Text>
      {barVeri.labels.length > 0 ? (
        <BarChart
          data={barVeri}
          width={ekranGenisligi}
          height={250}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero
          style={{ marginTop: 20 }}
        />
      ) : (
        <Text style={styles.bos}>Gösterilecek veri yok</Text>
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  labelColor: () => '#000',
  barPercentage: 0.6,
};

const styles = StyleSheet.create({
  baslik: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  altBaslik: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 16,
  },
  tarihFiltreAlani: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  tarihButonu: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    flex: 1,
  },
  bos: {
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
    color: '#999',
  },
});
