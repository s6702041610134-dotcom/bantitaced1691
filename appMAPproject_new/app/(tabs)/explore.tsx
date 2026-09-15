import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Alert,
  Dimensions,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { FrostedGlassCard, FrostedGlassButton } from '../components/FrostedGlass';
import { OutlinedText } from '../components/OutlinedText';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export interface BangkokPlace {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  categoryEmoji: string;
  district: string;
  rating: number;
  image: string;
  description: string;
  tips: string;
  latitude: number;
  longitude: number;
  isUserAdded?: boolean;
}

const INITIAL_BANGKOK_PLACES: BangkokPlace[] = [
  {
    id: 'bkk-1',
    name: 'วัดพระศรีรัตนศาสดาราม (วัดพระแก้ว)',
    nameEn: 'Wat Phra Kaew & Grand Palace',
    category: 'วัด & วัฒนธรรม',
    categoryEmoji: '⛩️',
    district: 'เขตพระนคร',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&auto=format&fit=crop&q=60',
    description: 'วัดคู่บ้านคู่เมืองไทย ตั้งอยู่ในพระบรมมหาราชวัง โดดเด่นด้วยสถาปัตยกรรมไทยโบราณที่ประดิดประดอยอย่างวิจิตรงดงาม และเป็นที่ประดิษฐานพระพุทธมหามณีรัตนปฏิมากร (พระแก้วมรกต)',
    tips: 'แนะนำแต่งกายสุภาพ สวมกางเกงหรือกระโปรงยาว และเปิดให้เข้าชมทุกวัน 08:30 - 15:30 น.',
    latitude: 13.7516,
    longitude: 100.4927,
  },
  {
    id: 'bkk-2',
    name: 'เยาวราช (Chinatown Bangkok)',
    nameEn: 'Yaowarat Road Chinatown',
    category: 'ตลาด & สตรีทฟู้ด',
    categoryEmoji: '🍜',
    district: 'เขตสัมพันธวงศ์',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=60',
    description: 'ย่านสตรีทฟู้ดระดับโลกใจกลางกรุงเทพฯ สองข้างทางเต็มไปด้วยร้านอาหารระดับมิชลินไกด์ แสงไฟนีออนยามค่ำคืน และบรรยากาศวัฒนธรรมไทย-จีนอันมีเสน่ห์',
    tips: 'ช่วงเวลาที่ดีที่สุดคือตั้งแต่ 18:00 น. เป็นต้นไป ร้านสตรีทฟู้ดจะเปิดเต็มพื้นที่',
    latitude: 13.7413,
    longitude: 100.5083,
  },
  {
    id: 'bkk-3',
    name: 'หอศิลปวัฒนธรรมแห่งกรุงเทพมหานคร (BACC)',
    nameEn: 'Bangkok Art and Culture Centre',
    category: 'ศิลปะ & มิวเซียม',
    categoryEmoji: '🎨',
    district: 'เขตปทุมวัน',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60',
    description: 'ศูนย์กลางการแสดงงานศิลปะร่วมสมัย นิทรรศการรูปถ่าย ละครเวที ดนตรี งานคราฟต์ และมีร้านกาแฟ Specialty ในอาคารทรงกลมสุดเก๋',
    tips: 'เข้าชมฟรี เปิดอังคาร-อาทิตย์ 10:00 - 20:00 น. (ปิดวันจันทร์)',
    latitude: 13.7466,
    longitude: 100.5304,
  },
  {
    id: 'bkk-4',
    name: 'Nana Coffee Roasters (อารีย์)',
    nameEn: 'Ari Vintage Cafe',
    category: 'คาเฟ่',
    categoryEmoji: '☕',
    district: 'เขตพญาไท (อารีย์)',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60',
    description: 'คาเฟ่ในเรือนไม้วินเทจล้อมรอบด้วยสวนร่มรื่น เสิร์ฟกาแฟ Specialty คั่วบดคุณภาพสูง ขนมเบเกอรี่อบใหม่ และมุมถ่ายรูปสไตล์วินเทจสวยงาม',
    tips: 'มีที่จอดรถสะดวกสบาย เหมาะกับสาย Cafe Hopping และการนั่งทำงานชิลๆ',
    latitude: 13.7801,
    longitude: 100.5435,
  },
  {
    id: 'bkk-5',
    name: 'สวนลุมพินี (Lumpini Park)',
    nameEn: 'Lumpini Park Bangkok',
    category: 'สวนสาธารณะ',
    categoryEmoji: '🌳',
    district: 'เขตปทุมวัน',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&auto=format&fit=crop&q=60',
    description: 'ปอดใจกลางกรุงเทพฯ สวนสาธารณะแห่งแรกที่มีบึงน้ำขนาดใหญ่ เหมาะแก่การวิ่ง ปั่นจักรยาน ปั่นเรือเป็ด และชมตัวเงินตัวทองสัตว์ประจำสวน',
    tips: 'เปิดทุกวัน 04:30 - 21:00 น. ช่วงเย็น 16:30 น. อากาศกำลังสบาย มีเต้นแอโรบิกฟรี',
    latitude: 13.7314,
    longitude: 100.5416,
  },
  {
    id: 'bkk-6',
    name: 'ตลาดนัดจตุจักร (Chatuchak Market)',
    nameEn: 'Chatuchak Weekend Market',
    category: 'ตลาด & ช้อปปิ้ง',
    categoryEmoji: '🛍️',
    district: 'เขตจตุจักร',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60',
    description: 'ตลาดนัดวันเสาร์-อาทิตย์ที่ใหญ่ที่สุดในประเทศไทย รวบรวมเสื้อผ้าแฟชั่น ของแต่งบ้าน วินเทจ ต้นไม้ และอาหารรวมกว่า 15,000 แผงค้า',
    tips: 'แนะนำเดินทางด้วย BTS สถานีหมอชิต หรือ MRT กำแพงเพชร สวมเสื้อผ้าโปร่งสบาย',
    latitude: 13.8000,
    longitude: 100.5500,
  },
  {
    id: 'bkk-7',
    name: 'วัดอรุณราชวราราม (Wat Arun)',
    nameEn: 'Temple of Dawn',
    category: 'วัด & วัฒนธรรม',
    categoryEmoji: '⛩️',
    district: 'เขตกอกใหญ่',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=60',
    description: 'พระปรางค์วัดอรุณตระหง่านโดดเด่นริมแม่น้ำเจ้าพระยา ประดับด้วยกระเบื้องเคลือบโบราณลวดลายดอกไม้หลากสี สวยงามมากยามอาทิตย์อัสดง',
    tips: 'สามารถนั่งเรือข้ามฟากจากท่าเตียนมายังวัดอรุณได้ มีบริการเช่าชุดไทยถ่ายรูปริมแม่น้ำ',
    latitude: 13.7437,
    longitude: 100.4888,
  },
  {
    id: 'bkk-8',
    name: 'บ้านจิม ทอมป์สัน (Jim Thompson House)',
    nameEn: 'Jim Thompson Museum',
    category: 'ศิลปะ & มิวเซียม',
    categoryEmoji: '🎨',
    district: 'เขตปทุมวัน',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&auto=format&fit=crop&q=60',
    description: 'เรือนไทยโบราณ 6 หลังริมคลองแสนแสบ ของราชาผ้าไหมไทย จิม ทอมป์สัน จัดแสดงศิลปวัตถุโบราณเอเชียท่ามกลางป่าเขตร้อนร่มรื่น',
    tips: 'มีมัคคุเทศก์นำชมภาษาไทย อังกฤษ และฝรั่งเศส เดินทางสะดวกด้วย BTS สนามกีฬาแห่งชาติ',
    latitude: 13.7492,
    longitude: 100.5283,
  },
];

const CATEGORIES = [
  'All',
  'Temple & Culture',
  'Cafe',
  'Market & Street Food',
  'Shopping',
  'Park',
  'Art & Museum',
];

interface UserTrip {
  id: string;
  name: string;
  placesCount: number;
}

export default function ExploreScreen() {
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);

  // State
  const [places, setPlaces] = useState<BangkokPlace[]>(INITIAL_BANGKOK_PLACES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals
  const [selectedPlace, setSelectedPlace] = useState<BangkokPlace | null>(null);
  const [showAddToTripModal, setShowAddToTripModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  
  // Trips state
  const [userTrips, setUserTrips] = useState<UserTrip[]>([
    { id: 't1', name: 'Temple & Riverside Chill Trip', placesCount: 3 },
    { id: 't2', name: 'Yaowarat Street Food Foodie Tour', placesCount: 4 },
    { id: 't3', name: 'Ari Cafe Hopping Day', placesCount: 2 },
  ]);
  const [newTripName, setNewTripName] = useState('');
  const [showNewTripInput, setShowNewTripInput] = useState(false);

  // New Post Form State
  const [newPostName, setNewPostName] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Cafe');
  const [newPostDistrict, setNewPostDistrict] = useState('');
  const [newPostDesc, setNewPostDesc] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);

const CATEGORY_MAP: { [key: string]: string[] } = {
  'All': [],
  'Temple & Culture': ['วัด & วัฒนธรรม', 'Temple & Culture'],
  'Cafe': ['คาเฟ่', 'Cafe'],
  'Market & Street Food': ['ตลาด & สตรีทฟู้ด', 'Market & Street Food'],
  'Shopping': ['ตลาด & ช้อปปิ้ง', 'ช้อปปิ้ง', 'Shopping'],
  'Park': ['สวนสาธารณะ', 'Park'],
  'Art & Museum': ['ศิลปะ & มิวเซียม', 'Art & Museum'],
};

  // Filter Places (Smart Search: Searches across name, nameEn, district, category, description, and tips)
  const filteredPlaces = places.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    
    // When a search query is provided, match across all place attributes
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.nameEn.toLowerCase().includes(query) ||
      item.district.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tips.toLowerCase().includes(query);

    const allowedCategories = CATEGORY_MAP[selectedCategory] || [selectedCategory];
    const matchesCategory =
      query.length > 0
        ? true
        : selectedCategory === 'All'
        ? true
        : allowedCategories.includes(item.category) || item.category === selectedCategory;

    return matchesCategory && matchesSearch;
  });

  // Pick Image for New Post
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Please grant photo library access to select a place photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewPostImage(result.assets[0].uri);
    }
  };

  // Submit New Post
  const handleCreatePost = () => {
    if (!newPostName.trim()) {
      Alert.alert('Required Field', 'Please enter a place name.');
      return;
    }

    const newPlace: BangkokPlace = {
      id: `user-${Date.now()}`,
      name: newPostName,
      nameEn: newPostName,
      category: newPostCategory,
      categoryEmoji: getCategoryEmoji(newPostCategory),
      district: newPostDistrict.trim() || 'Bangkok',
      rating: 5.0,
      image:
        newPostImage ||
        'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=60',
      description: newPostDesc.trim() || 'User recommended travel destination.',
      tips: 'Recommended by traveler community.',
      latitude: 13.7563,
      longitude: 100.5018,
      isUserAdded: true,
    };

    setPlaces([newPlace, ...places]);
    setShowCreatePostModal(false);

    // Reset Form
    setNewPostName('');
    setNewPostDistrict('');
    setNewPostDesc('');
    setNewPostImage(null);

    Alert.alert('Success! 🎉', 'Your recommended place has been added.');
  };

  const getCategoryEmoji = (cat: string) => {
    if (cat.includes('Temple')) return '⛩️';
    if (cat.includes('Cafe')) return '☕';
    if (cat.includes('Market') || cat.includes('Shopping')) return '🛍️';
    if (cat.includes('Park')) return '🌳';
    if (cat.includes('Art') || cat.includes('Museum')) return '🎨';
    return '📍';
  };

  // Add Place to Selected Trip
  const handleAddPlaceToTrip = (trip: UserTrip) => {
    setUserTrips(
      userTrips.map((t) =>
        t.id === trip.id ? { ...t, placesCount: t.placesCount + 1 } : t
      )
    );
    setShowAddToTripModal(false);
    Alert.alert(
      'Added to Trip! 🗺️',
      `Successfully added "${selectedPlace?.name}" to "${trip.name}".`
    );
  };

  // Create New Trip & Add
  const handleCreateNewTripAndAdd = () => {
    if (!newTripName.trim()) {
      Alert.alert('Trip Name Required', 'Please enter your new trip name.');
      return;
    }
    const newT: UserTrip = {
      id: `trip-${Date.now()}`,
      name: newTripName,
      placesCount: 1,
    };
    setUserTrips([newT, ...userTrips]);
    setNewTripName('');
    setShowNewTripInput(false);
    setShowAddToTripModal(false);
    Alert.alert(
      'New Trip Created! ✨',
      `Saved "${selectedPlace?.name}" into new trip "${newT.name}".`
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/images/dalmatian_bg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <OutlinedText
              text="BANGKOK EXPLORER"
              style={styles.headerSubtitle}
              strokeColor="#FFFFFF"
              strokeWidth={3}
            />
            <OutlinedText
              text="Explore Bangkok 🧭"
              style={styles.headerTitle}
              strokeColor="#FFFFFF"
              strokeWidth={4}
            />
          </View>

          {/* Clean Top Action Badge */}
          <FrostedGlassButton
            onPress={() => setShowCreatePostModal(true)}
            style={styles.headerAddBtn}
          >
            <Feather name="plus" size={18} color={Colors.freshlyRoasted} />
            <Text style={styles.headerAddText}>Add Place</Text>
          </FrostedGlassButton>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FrostedGlassCard style={styles.searchCard} intensity={85}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => searchInputRef.current?.focus()}
              style={styles.searchIconBtn}
            >
              <Feather name="search" size={20} color={Colors.freshlyRoasted} />
            </TouchableOpacity>

            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search places, districts, categories..."
              placeholderTextColor="rgba(75, 46, 31, 0.55)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
              clearButtonMode="while-editing"
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.searchClearBtn}
              >
                <Feather name="x-circle" size={18} color="rgba(57, 29, 1, 0.6)" />
              </TouchableOpacity>
            )}
          </FrostedGlassCard>
        </View>

        {/* Category Chips Scroll */}
        <View style={styles.categoriesWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryChip,
                    isActive && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isActive && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Places List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <View style={styles.sectionHeader}>
            <OutlinedText
              text={
                searchQuery.trim().length > 0
                  ? `Search Results: "${searchQuery}"`
                  : selectedCategory === 'All'
                  ? 'Recommended Places in Bangkok'
                  : `Category: ${selectedCategory}`
              }
              style={styles.sectionTitle}
              strokeColor="#FFFFFF"
              strokeWidth={3.5}
            />
            <OutlinedText
              text={`(${filteredPlaces.length} places)`}
              style={styles.sectionCount}
              strokeColor="#FFFFFF"
              strokeWidth={2.5}
            />
          </View>

          {filteredPlaces.length === 0 ? (
            <FrostedGlassCard style={styles.emptyCard}>
              <Feather name="map-pin" size={36} color="rgba(75, 46, 31, 0.4)" />
              <OutlinedText
                text="No Places Found"
                style={styles.emptyTitle}
                strokeColor="#FFFFFF"
                strokeWidth={3}
              />
              <Text style={styles.emptyText}>Try searching with other terms like "Wat Phra Kaew", "Yaowarat", or "Cafe"</Text>
            </FrostedGlassCard>
          ) : (
            filteredPlaces.map((place) => (
              <TouchableOpacity
                key={place.id}
                activeOpacity={0.9}
                onPress={() => setSelectedPlace(place)}
                style={styles.cardTouch}
              >
                <FrostedGlassCard style={styles.placeCard} intensity={70}>
                  {/* Card Cover Image */}
                  <View style={styles.imageWrap}>
                    <Image source={{ uri: place.image }} style={styles.cardImage} />
                    {/* Category Badge */}
                    <View style={styles.badgeCategory}>
                      <Text style={styles.badgeCategoryText}>
                        {place.categoryEmoji} {place.category}
                      </Text>
                    </View>
                    {/* Rating Badge */}
                    <View style={styles.badgeRating}>
                      <Feather name="star" size={12} color="#D97706" />
                      <Text style={styles.badgeRatingText}>{place.rating.toFixed(1)}</Text>
                    </View>
                  </View>

                  {/* Card Details */}
                  <View style={styles.placeDetails}>
                    <View style={styles.titleRow}>
                      <Text style={styles.placeName} numberOfLines={1}>
                        {place.name}
                      </Text>
                      {place.isUserAdded && (
                        <View style={styles.userAddedTag}>
                          <Text style={styles.userAddedTagText}>Your Post</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.placeDistrict} numberOfLines={1}>
                      <Feather name="map-pin" size={13} color={Colors.freshlyRoasted} /> {place.district}
                    </Text>

                    <Text style={styles.placeDesc} numberOfLines={2}>
                      {place.description}
                    </Text>

                    {/* Action Bar */}
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.actionBtnOutline}
                        onPress={() => {
                          setSelectedPlace(place);
                          setShowAddToTripModal(true);
                        }}
                      >
                        <Feather name="plus-circle" size={15} color={Colors.freshlyRoasted} />
                        <Text style={styles.actionBtnOutlineText}>Add to Trip</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnPrimary}
                        onPress={() => setSelectedPlace(place)}
                      >
                        <Text style={styles.actionBtnPrimaryText}>View Details</Text>
                        <Feather name="chevron-right" size={16} color={Colors.oldLace} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </FrostedGlassCard>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Clean Bottom Floating Action Button (+) */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.floatingFab}
          onPress={() => setShowCreatePostModal(true)}
        >
          <Feather name="plus" size={26} color={Colors.oldLace} />
        </TouchableOpacity>

        {/* ---------------------------------------------------- */}
        {/* MODAL 1: Place Details View */}
        {/* ---------------------------------------------------- */}
        <Modal
          visible={selectedPlace !== null && !showAddToTripModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedPlace(null)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
            <FrostedGlassCard style={styles.detailModalCard} intensity={95}>
              <View style={styles.dragHandleWrapAbs}>
                <View style={styles.dragHandleLight} />
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Image */}
                {selectedPlace && (
                  <>
                    <View style={styles.detailImageWrap}>
                      <Image
                        source={{ uri: selectedPlace.image }}
                        style={styles.detailImage}
                      />
                      <TouchableOpacity
                        style={styles.modalCloseBtn}
                        onPress={() => setSelectedPlace(null)}
                      >
                        <Feather name="x" size={20} color="#333" />
                      </TouchableOpacity>
                      <View style={styles.detailCategoryBadge}>
                        <Text style={styles.detailCategoryText}>
                          {selectedPlace.categoryEmoji} {selectedPlace.category}
                        </Text>
                      </View>
                    </View>

                    {/* Content */}
                    <View style={styles.detailBody}>
                      <View style={styles.detailTitleRow}>
                        <Text style={styles.detailTitle}>{selectedPlace.name}</Text>
                        <View style={styles.detailRatingChip}>
                          <Feather name="star" size={14} color="#D97706" />
                          <Text style={styles.detailRatingText}>
                            {selectedPlace.rating.toFixed(1)}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.detailNameEn}>{selectedPlace.nameEn}</Text>

                      <View style={styles.detailDistrictChip}>
                        <Feather name="map-pin" size={14} color={Colors.freshlyRoasted} />
                        <Text style={styles.detailDistrictText}>{selectedPlace.district}</Text>
                      </View>

                      <View style={styles.divider} />

                      <Text style={styles.sectionLabel}>📌 Place Details</Text>
                      <Text style={styles.detailDescription}>{selectedPlace.description}</Text>

                      <Text style={styles.sectionLabel}>💡 Travel Tips</Text>
                      <Text style={styles.detailTips}>{selectedPlace.tips}</Text>

                      <View style={styles.divider} />

                      {/* Modal Action Buttons */}
                      <View style={styles.detailActionRow}>
                        <FrostedGlassButton
                          style={styles.detailNavBtn}
                          onPress={() => {
                            if (selectedPlace) {
                              setSelectedPlace(null);
                              router.push({
                                pathname: '/(tabs)/map',
                                params: {
                                  lat: String(selectedPlace.latitude),
                                  lng: String(selectedPlace.longitude),
                                  placeName: selectedPlace.name,
                                },
                              });
                            }
                          }}
                        >
                          <Feather name="navigation" size={18} color={Colors.freshlyRoasted} />
                          <Text style={styles.detailNavBtnText}>View on Map</Text>
                        </FrostedGlassButton>

                        <TouchableOpacity
                          style={styles.detailAddTripBtn}
                          onPress={() => setShowAddToTripModal(true)}
                        >
                          <Feather name="plus-circle" size={18} color="#FFFFFF" />
                          <Text style={styles.detailAddTripBtnText}>Add to Trip</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </ScrollView>
            </FrostedGlassCard>
          </View>
        </Modal>

        {/* ---------------------------------------------------- */}
        {/* MODAL 2: Add Place to Trip */}
        {/* ---------------------------------------------------- */}
        <Modal
          visible={showAddToTripModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowAddToTripModal(false)}
        >
          <View style={styles.modalOverlayCenter}>
            <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
            <FrostedGlassCard style={styles.addTripModalCard} intensity={95}>
              <View style={styles.dragHandleWrap}>
                <View style={styles.dragHandle} />
              </View>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Add Place to Trip 🗺️</Text>
                <TouchableOpacity style={styles.modalHeaderCloseBtn} onPress={() => setShowAddToTripModal(false)}>
                  <Feather name="x" size={20} color="#333" />
                </TouchableOpacity>
              </View>

              <Text style={styles.targetPlaceName} numberOfLines={1}>
                📍 {selectedPlace?.name}
              </Text>

              {/* Trip Selection List */}
              <ScrollView style={{ maxHeight: 220, marginVertical: 12 }} showsVerticalScrollIndicator={false}>
                {userTrips.map((trip) => (
                  <TouchableOpacity
                    key={trip.id}
                    style={styles.tripItemCard}
                    onPress={() => handleAddPlaceToTrip(trip)}
                  >
                    <View style={styles.tripItemInfo}>
                      <Feather name="folder" size={18} color={Colors.freshlyRoasted} />
                      <Text style={styles.tripItemName}>{trip.name}</Text>
                    </View>
                    <Text style={styles.tripItemCount}>{trip.placesCount} places</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Create New Trip Option */}
              {showNewTripInput ? (
                <View style={styles.newTripInputWrap}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter your new trip name..."
                    placeholderTextColor="#A0A0A0"
                    value={newTripName}
                    onChangeText={setNewTripName}
                  />
                  <View style={styles.newTripActionRow}>
                    <TouchableOpacity
                      style={styles.cancelSmallBtn}
                      onPress={() => setShowNewTripInput(false)}
                    >
                      <Text style={styles.cancelSmallText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmSmallBtn}
                      onPress={handleCreateNewTripAndAdd}
                    >
                      <Text style={styles.confirmSmallText}>Create & Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.createTripBtnOutline}
                  onPress={() => setShowNewTripInput(true)}
                >
                  <Feather name="plus" size={18} color={Colors.freshlyRoasted} />
                  <Text style={styles.createTripBtnText}>Create New Trip</Text>
                </TouchableOpacity>
              )}
            </FrostedGlassCard>
          </View>
        </Modal>

        {/* ---------------------------------------------------- */}
        {/* MODAL 3: Create New Place Post (+) */}
        {/* ---------------------------------------------------- */}
        <Modal
          visible={showCreatePostModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreatePostModal(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
            <FrostedGlassCard style={styles.createPostModalCard} intensity={95}>
              <View style={styles.dragHandleWrap}>
                <View style={styles.dragHandle} />
              </View>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Share New Place 📸</Text>
                <TouchableOpacity style={styles.modalHeaderCloseBtn} onPress={() => setShowCreatePostModal(false)}>
                  <Feather name="x" size={20} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Photo Picker Section matching Image 1 layout */}
                <View style={{ alignItems: 'center', marginVertical: 12 }}>
                  {newPostImage ? (
                    <View style={styles.largePostImageWrap}>
                      <Image source={{ uri: newPostImage }} style={styles.largePostImage} />
                    </View>
                  ) : (
                    <View style={styles.largePostImagePlaceholder}>
                      <Feather name="image" size={36} color="#B0B0B0" />
                    </View>
                  )}
                  <TouchableOpacity style={styles.btnPickPhotoPill} onPress={handlePickImage}>
                    <Feather name="camera" size={15} color="#333" />
                    <Text style={styles.btnPickPhotoPillText}>Select Photo from Phone</Text>
                  </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <Text style={styles.formLabel}>Place Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Song Wat Vintage Cafe, Wat Rakhang..."
                  placeholderTextColor="#A0A0A0"
                  value={newPostName}
                  onChangeText={setNewPostName}
                />

                <Text style={styles.formLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catSelectChip,
                        newPostCategory === cat && styles.catSelectChipActive,
                      ]}
                      onPress={() => setNewPostCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.catSelectText,
                          newPostCategory === cat && styles.catSelectTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.formLabel}>District / Area in Bangkok</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Phra Nakhon, Giant Swing Area"
                  placeholderTextColor="#A0A0A0"
                  value={newPostDistrict}
                  onChangeText={setNewPostDistrict}
                />

                <Text style={styles.formLabel}>Description / Highlights</Text>
                <TextInput
                  style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="Share highlights, atmosphere, or photo spots..."
                  placeholderTextColor="#A0A0A0"
                  value={newPostDesc}
                  onChangeText={setNewPostDesc}
                />

                <TouchableOpacity
                  style={styles.submitPostBtn}
                  onPress={handleCreatePost}
                >
                  <Feather name="check-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.submitPostBtnText}>Share This Place</Text>
                </TouchableOpacity>
              </ScrollView>
            </FrostedGlassCard>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  backgroundOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(250, 246, 240, 0.45)' },
  container: { flex: 1 },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  headerSubtitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#391D01',
  },
  headerTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 25,
    color: '#391D01',
  },
  headerAddBtn: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerAddText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#66023C',
    marginLeft: 4,
  },

  // Search Bar
  searchContainer: { paddingHorizontal: 20, marginVertical: 8 },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  searchIconBtn: { paddingRight: 8 },
  searchClearBtn: { paddingLeft: 6 },
  searchActionBadge: {
    backgroundColor: '#66023C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 6,
  },
  searchActionBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#CAD183',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#391D01',
    paddingVertical: 0,
  },

  // Categories
  categoriesWrap: { marginVertical: 4 },
  categoriesScroll: { paddingHorizontal: 20, gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(186, 221, 127, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(186, 221, 127, 0.6)',
  },
  categoryChipActive: {
    backgroundColor: '#66023C',
    borderColor: '#66023C',
  },
  categoryChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#391D01',
  },
  categoryChipTextActive: {
    color: '#CAD183',
  },

  // Places List
  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,
    color: '#391D01',
    marginRight: 6,
    textShadowColor: 'rgba(202, 209, 131, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  sectionCount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#66023C',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginVertical: 20,
  },
  emptyTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: '#391D01',
    marginTop: 10,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#391D01',
    marginTop: 4,
    textAlign: 'center',
  },

  // Place Card
  cardTouch: { marginBottom: 16 },
  placeCard: { padding: 0, borderRadius: 20, overflow: 'hidden' },
  imageWrap: { position: 'relative', width: '100%', height: 170 },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  badgeCategory: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(202, 209, 131, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeCategoryText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#391D01' },
  badgeRating: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(186, 221, 127, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeRatingText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#391D01' },

  placeDetails: { padding: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  placeName: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: '#391D01', flex: 1 },
  userAddedTag: { backgroundColor: 'rgba(186, 221, 127, 0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 6 },
  userAddedTagText: { fontSize: 9, fontFamily: 'Inter_600SemiBold', color: '#391D01' },
  placeDistrict: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#66023C', marginVertical: 4 },
  placeDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#391D01', lineHeight: 18 },

  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(102, 2, 60, 0.3)',
    backgroundColor: 'rgba(202, 209, 131, 0.35)',
  },
  actionBtnOutlineText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#66023C' },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#66023C',
  },
  actionBtnPrimaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#CAD183' },

  // Floating Action Button (+)
  floatingFab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#66023C',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#66023C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 99,
  },

  // Drag Handle Bar (Aesop Sheet indicator style)
  dragHandleWrap: { alignItems: 'center', paddingTop: 4, paddingBottom: 10 },
  dragHandleWrapAbs: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center', zIndex: 12 },
  dragHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(0, 0, 0, 0.18)' },
  dragHandleLight: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.8)' },

  // Modals Shared
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },

  // Detail Modal
  detailModalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, height: '85%', padding: 0, backgroundColor: 'rgba(250, 246, 240, 0.98)' },
  detailImageWrap: { position: 'relative', width: '100%', height: 220 },
  detailImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(202, 209, 131, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#391D01',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalHeaderCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(57, 29, 1, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCategoryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: 'rgba(202, 209, 131, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  detailCategoryText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#391D01' },
  detailBody: { padding: 24 },
  detailTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#391D01', flex: 1 },
  detailRatingChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(186, 221, 127, 0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  detailRatingText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#391D01' },
  detailNameEn: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#66023C', marginTop: 2 },
  detailDistrictChip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  detailDistrictText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#66023C' },
  divider: { height: 1, backgroundColor: 'rgba(57, 29, 1, 0.1)', marginVertical: 16 },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#391D01', marginBottom: 6 },
  detailDescription: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(57, 29, 1, 0.82)', lineHeight: 22, marginBottom: 14 },
  detailTips: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#391D01', lineHeight: 20, backgroundColor: 'rgba(186, 221, 127, 0.3)', padding: 14, borderRadius: 16 },

  detailActionRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  detailNavBtn: { flex: 1, borderRadius: 999 },
  detailNavBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#66023C', marginLeft: 6 },
  detailAddTripBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#66023C', borderRadius: 999, paddingVertical: 14, shadowColor: '#66023C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3 },
  detailAddTripBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#CAD183' },

  // Add Trip Modal
  addTripModalCard: { borderRadius: 32, padding: 24, backgroundColor: 'rgba(250, 246, 240, 0.98)' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(57, 29, 1, 0.1)' },
  modalHeaderTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#391D01' },
  targetPlaceName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#391D01', marginBottom: 10 },
  tripItemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 16, backgroundColor: 'rgba(186, 221, 127, 0.25)', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(102, 2, 60, 0.12)', shadowColor: '#391D01', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  tripItemInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  tripItemName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#391D01', flex: 1 },
  tripItemCount: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#66023C' },

  createTripBtnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 999, borderWidth: 1.5, borderColor: '#66023C', backgroundColor: 'rgba(102, 2, 60, 0.06)' },
  createTripBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#66023C' },
  newTripInputWrap: { marginTop: 8 },
  modalInput: { backgroundColor: 'rgba(186, 221, 127, 0.2)', borderWidth: 1, borderColor: 'rgba(102, 2, 60, 0.2)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#391D01', marginBottom: 12 },
  newTripActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelSmallBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(57, 29, 1, 0.4)', backgroundColor: 'rgba(202, 209, 131, 0.3)' },
  cancelSmallText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#391D01' },
  confirmSmallBtn: { backgroundColor: '#66023C', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  confirmSmallText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#CAD183' },

  // Create Post Modal
  createPostModalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, maxHeight: '90%', padding: 24, backgroundColor: 'rgba(250, 246, 240, 0.98)' },
  largePostImageWrap: { width: 140, height: 140, backgroundColor: 'rgba(186, 221, 127, 0.3)', padding: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(102, 2, 60, 0.15)', shadowColor: '#391D01', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  largePostImage: { width: '100%', height: '100%', borderRadius: 14 },
  largePostImagePlaceholder: { width: 140, height: 140, backgroundColor: 'rgba(186, 221, 127, 0.4)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(57, 29, 1, 0.1)' },
  btnPickPhotoPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(186, 221, 127, 0.4)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(102, 2, 60, 0.15)' },
  btnPickPhotoPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#391D01' },
  formLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#391D01', marginTop: 12, marginBottom: 6 },
  catSelectChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(202, 209, 131, 0.5)', borderWidth: 1, borderColor: 'rgba(57, 29, 1, 0.1)', marginRight: 8 },
  catSelectChipActive: { backgroundColor: '#66023C', borderColor: '#66023C' },
  catSelectText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#391D01' },
  catSelectTextActive: { color: '#CAD183', fontFamily: 'Inter_600SemiBold' },
  submitPostBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#66023C', paddingVertical: 14, borderRadius: 999, marginTop: 16, shadowColor: '#66023C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3 },
  submitPostBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#CAD183' },
});
