import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 54) / 2;

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Voyager</Text>
          <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.8}>
            <Image 
              source={{ uri: 'https://ui-avatars.com/api/?name=Virgo&background=DCECEF&color=4B2E1F' }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Your next{'\n'}adventure</Text>
        <Text style={styles.lede}>Discover places worth remembering.</Text>

        {/* 2x2 Menu Grid matching Reference Image */}
        <View style={styles.grid}>
          {/* Card 1: Plan a Trip */}
          <TouchableOpacity
            style={[styles.card, styles.cardPlan]}
            onPress={() => router.push('/map')}
            activeOpacity={0.85}
          >
            <View style={styles.iconWrap}>
              <Feather name="calendar" size={22} color={Colors.freshlyRoasted} />
            </View>
            <Text style={styles.cardTitle}>Plan a Trip</Text>
          </TouchableOpacity>

          {/* Card 2: Explore Places */}
          <TouchableOpacity
            style={[styles.card, styles.cardExplore]}
            onPress={() => router.push('/explore')}
            activeOpacity={0.85}
          >
            <View style={styles.iconWrap}>
              <Feather name="map-pin" size={22} color={Colors.freshlyRoasted} />
            </View>
            <Text style={styles.cardTitle}>Explore Places</Text>
          </TouchableOpacity>

          {/* Card 3: Saved Places */}
          <TouchableOpacity
            style={[styles.card, styles.cardSaved]}
            onPress={() => router.push('/map')}
            activeOpacity={0.85}
          >
            <View style={styles.iconWrap}>
              <Feather name="map-pin" size={22} color={Colors.freshlyRoasted} />
            </View>
            <Text style={styles.cardTitle}>Saved Places</Text>
          </TouchableOpacity>

          {/* Card 4: My Trips (Dashed Border Card) */}
          <TouchableOpacity
            style={[styles.card, styles.cardTrips]}
            onPress={() => router.push('/album')}
            activeOpacity={0.85}
          >
            <View style={styles.iconWrap}>
              <Feather name="file-text" size={22} color={Colors.freshlyRoasted} />
            </View>
            <Text style={styles.cardTitle}>My Trips</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.oldLace,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  logoText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    letterSpacing: 0.5,
    color: Colors.freshlyRoasted,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  title: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 44,
    lineHeight: 46,
    color: Colors.freshlyRoasted,
    marginBottom: 10,
  },
  lede: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(75, 46, 31, 0.7)',
    marginBottom: 28,
  },

  // 2x2 Menu Card Grid Styles matching reference screenshot
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    width: CARD_WIDTH,
    height: 150,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
  },
  iconWrap: {
    alignSelf: 'flex-start',
  },
  cardTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    color: Colors.freshlyRoasted,
    lineHeight: 26,
  },

  // Card 1: Plan a Trip (Cream with soft solid border)
  cardPlan: {
    backgroundColor: '#F5F1E8',
    borderWidth: 1,
    borderColor: '#E5DFD3',
  },

  // Card 2: Explore Places (Soft Ice Blue)
  cardExplore: {
    backgroundColor: '#DCECEF',
    borderWidth: 1,
    borderColor: '#C8E1E5',
  },

  // Card 3: Saved Places (Warm Yellow Butter)
  cardSaved: {
    backgroundColor: '#F3E59A',
    borderWidth: 1,
    borderColor: '#E7D784',
  },

  // Card 4: My Trips (Light Cream with Dashed Border)
  cardTrips: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#DDD7CC',
  },
});
