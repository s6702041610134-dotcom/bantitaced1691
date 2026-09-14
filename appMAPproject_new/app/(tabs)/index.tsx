import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FrostedGlassCard } from '../components/FrostedGlass';
import { OutlinedText } from '../components/OutlinedText';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 54) / 2;

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../assets/images/dalmatian_bg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Direct Floating Hero Section (No Card Frame - Crisp White Text Outline) */}
          <View style={styles.heroSection}>
            {/* Top Header */}
            <View style={styles.header}>
              <OutlinedText text="Voyager" style={styles.logoText} strokeColor="#FFFFFF" strokeWidth={3.5} />
              <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.8}>
                <Image
                  source={{ uri: 'https://ui-avatars.com/api/?name=Virgo&background=66023C&color=CAD183' }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            </View>

            {/* Title & Lede with White Text Stroke/Outline */}
            <OutlinedText text={`Your next\nadventure`} style={styles.title} strokeColor="#FFFFFF" strokeWidth={4.5} />
            <OutlinedText text="Discover places worth remembering." style={styles.lede} strokeColor="#FFFFFF" strokeWidth={3} />
          </View>

          {/* Cards Section */}
          <View style={styles.cardContainer}>
            {/* Card 1: Plan a Trip (Full-width Featured Card) */}
            <TouchableOpacity
              style={styles.fullCardTouch}
              onPress={() => router.push('/map')}
              activeOpacity={0.85}
            >
              <FrostedGlassCard style={styles.fullGlassCard} intensity={80}>
                <View style={styles.fullCardHeader}>
                  <View style={styles.iconWrap}>
                    <Feather name="calendar" size={24} color={Colors.freshlyRoasted} />
                  </View>
                  <View style={styles.arrowCircle}>
                    <Feather name="arrow-up-right" size={18} color={Colors.freshlyRoasted} />
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={styles.fullCardTitle}>Plan a Trip 🗺️</Text>
                  <Text style={styles.fullCardDesc}>Plan itineraries, pin places, and map custom routes</Text>
                </View>
              </FrostedGlassCard>
            </TouchableOpacity>

            {/* 2 Side-by-Side Cards */}
            <View style={styles.rowGrid}>
              {/* Card 2: Explore Places */}
              <TouchableOpacity
                style={styles.cardTouch}
                onPress={() => router.push('/explore')}
                activeOpacity={0.85}
              >
                <FrostedGlassCard style={styles.glassCard} intensity={80}>
                  <View style={styles.iconWrap}>
                    <Feather name="compass" size={22} color={Colors.freshlyRoasted} />
                  </View>
                  <Text style={styles.cardTitle}>Explore Places 🧭</Text>
                </FrostedGlassCard>
              </TouchableOpacity>

              {/* Card 3: My Trips */}
              <TouchableOpacity
                style={styles.cardTouch}
                onPress={() => router.push('/album')}
                activeOpacity={0.85}
              >
                <FrostedGlassCard style={styles.glassCard} intensity={80}>
                  <View style={styles.iconWrap}>
                    <Feather name="book-open" size={22} color={Colors.freshlyRoasted} />
                  </View>
                  <Text style={styles.cardTitle}>My Trips 📮</Text>
                </FrostedGlassCard>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
    backgroundColor: 'rgba(202, 209, 131, 0.35)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },

  // Hero Floating Container
  heroSection: {
    marginBottom: 24,
    paddingTop: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 26,
    letterSpacing: 0.5,
    color: '#391D01',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#66023C',
  },
  title: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 48,
    lineHeight: 50,
    color: '#391D01',
    marginBottom: 8,
  },
  lede: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#391D01',
    lineHeight: 20,
  },

  // Card Section Layout
  cardContainer: {
    gap: 14,
  },
  fullCardTouch: {
    width: '100%',
    height: 140,
  },
  fullGlassCard: {
    flex: 1,
    padding: 18,
    borderRadius: 24,
    justifyContent: 'space-between',
  },
  fullCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(186, 221, 127, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullCardTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    color: '#391D01',
  },
  fullCardDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(57, 29, 1, 0.65)',
    marginTop: 2,
  },

  rowGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  cardTouch: {
    width: CARD_WIDTH,
    height: 135,
  },
  glassCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    justifyContent: 'space-between',
  },
  iconWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(186, 221, 127, 0.5)',
    padding: 10,
    borderRadius: 14,
  },
  cardTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,
    color: '#391D01',
    lineHeight: 24,
  },
});

