import React from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { FrostedGlassCard } from '../../components/FrostedGlass';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function CreateScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../assets/images/dalmatian_bg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.container}>
        <FrostedGlassCard style={styles.glassCard} intensity={75}>
          <Text style={styles.title}>Record a Journey ✍️</Text>
          <Text style={styles.text}>เลือกฟังก์ชันที่คุณต้องการเริ่มบันทึกการเดินทาง:</Text>

          <View style={styles.btnGroup}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push('/map')}
              activeOpacity={0.8}
            >
              <Feather name="map-pin" size={18} color={Colors.freshlyRoasted} />
              <Text style={styles.actionBtnText}>ปักหมุดลากเส้นทางบนแผนที่ (Map)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push('/album')}
              activeOpacity={0.8}
            >
              <Feather name="book-open" size={18} color={Colors.freshlyRoasted} />
              <Text style={styles.actionBtnText}>สร้างพาสปอร์ต / เพิ่มแสตมป์ (Album)</Text>
            </TouchableOpacity>
          </View>
        </FrostedGlassCard>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(250, 246, 240, 0.45)',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  glassCard: {
    padding: 20,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 26,
    color: Colors.freshlyRoasted,
    marginBottom: 8,
  },
  text: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(75, 46, 31, 0.8)',
    marginBottom: 20,
  },
  btnGroup: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  actionBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.freshlyRoasted,
  },
});
