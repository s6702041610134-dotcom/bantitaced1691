import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { FrostedGlassCard } from '../../components/FrostedGlass';
import { OutlinedText } from '../../components/OutlinedText';

const { width } = Dimensions.get('window');
const CELL_WIDTH = (width - 40) / 7;

const monthNamesEnglish = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Cover Colors Palette Options for User Customization (Exact Palette from User Request)
const BOOK_COLORS = [
  { id: 'beige', name: 'Beige', hex: '#F4F2E0', textColor: '#4B2E1F' },
  { id: 'champagne_pink', name: 'Champagne Pink', hex: '#F3D5CF', textColor: '#4B2E1F' },
  { id: 'pale_silver', name: 'Pale Silver', hex: '#CCC3C0', textColor: '#222222' },
  { id: 'metallic_silver', name: 'Metallic Silver', hex: '#A5ABAB', textColor: '#222222' },
  { id: 'cool_gray', name: 'Cool Gray', hex: '#6F6F71', textColor: '#FFFFFF' },
  { id: 'celadon', name: 'Celadon', hex: '#7DC4CE', textColor: '#FFFFFF' },
  { id: 'lemon_yellow', name: 'Lemon Yellow', hex: '#EDE7B3', textColor: '#4B2E1F' },
];

type JournalEntry = {
  dateKey: string;
  day: number;
  month: number;
  year: number;
  photoUrl: string;
  title: string;
  places: string[];
  journalNote: string;
};

type StampItem = {
  id: string;
  title: string;
  location: string;
  date: string;
  photoUrl: string;
  note: string;
};

type TravelBook = {
  id: string;
  title: string;
  subtitle: string;
  colorHex: string;
  textColor: string;
  emblem: string;
  stamps: StampItem[];
};

// Preset sample photos — Bangkok Tourism themed
const samplePhotos: { [key: number]: string } = {
  1:  'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=300&q=80', // Wat Phra Kaew / Grand Palace
  2:  'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=300&q=80', // Bangkok temples at night
  3:  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&q=80', // Chao Phraya river
  4:  'https://images.unsplash.com/photo-1583417646698-f2b7f75fb192?w=300&q=80', // Thai temple golden
  5:  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=300&q=80', // Bangkok skyline night
  6:  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=300&q=80', // Wat Arun
  7:  'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=300&q=80', // Chatuchak weekend market
  8:  'https://images.unsplash.com/photo-1559628376-f3fe5f782a2a?w=300&q=80', // Bangkok street food Yaowarat
  9:  'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=300&q=80', // Bangkok Asiatique pier
  10: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=300&q=80', // Bangkok modern skyline
  11: 'https://images.unsplash.com/photo-1597335068558-463a8d4e60a4?w=300&q=80', // Jim Thompson House
  12: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=300&q=80', // Flower market Bangkok
};

// Bangkok attractions for journal entries
const bangkokPlaces = [
  { title: 'วัดพระแก้ว', place: 'วัดพระศรีรัตนศาสดาราม, พระนคร' },
  { title: 'เยาวราช ยามค่ำ', place: 'เยาวราช, สัมพันธวงศ์' },
  { title: 'แม่น้ำเจ้าพระยา', place: 'ท่าช้าง, พระนคร' },
  { title: 'วัดอรุณฯ', place: 'วัดอรุณราชวราราม, บางกอกใหญ่' },
  { title: 'สยามพารากอน', place: 'สยามสแควร์, ปทุมวัน' },
  { title: 'จตุจักร วีคเอนด์', place: 'ตลาดจตุจักร, จตุจักร' },
  { title: 'ICONSIAM ริมน้ำ', place: 'ICONSIAM, คลองสาน' },
  { title: 'คาเฟ่ย่านอารีย์', place: 'ย่านอารีย์, พญาไท' },
  { title: 'ตลาดดอกไม้ปากคลอง', place: 'ปากคลองตลาด, พระนคร' },
  { title: 'วัดโพธิ์', place: 'วัดพระเชตุพนฯ, พระนคร' },
  { title: 'อาเซียทีค ริมเจ้าพระยา', place: 'Asiatique, ยานนาวา' },
  { title: 'ถนนข้าวสาร ไนท์มาร์เก็ต', place: 'ถนนข้าวสาร, พระนคร' },
  { title: 'บ้านจิม ทอมป์สัน', place: 'ปทุมวัน, กรุงเทพฯ' },
  { title: 'Chatuchak Park', place: 'สวนจตุจักร, จตุจักร' },
  { title: 'Sky Bar Lebua', place: 'State Tower, บางรัก' },
  { title: 'วัดสระเกศ (ภูเขาทอง)', place: 'บางกอกน้อย, กรุงเทพฯ' },
  { title: 'ตลาดออร์กานิก OR', place: 'เพลินจิต, ปทุมวัน' },
  { title: 'เมืองเก่า บางลำพู', place: 'บางลำพู, พระนคร' },
  { title: 'ห้างสรรพสินค้าเอ็มควอเทียร์', place: 'สุขุมวิท 35-37, วัฒนา' },
  { title: 'ลานคนเมือง', place: 'สนามหลวง, พระนคร' },
  { title: 'บึงบัวท่าน้ำ', place: 'บางนา, กรุงเทพฯ' },
  { title: 'คลองบางหลวง', place: 'บางกอกใหญ่, กรุงเทพฯ' },
  { title: 'One Bangkok', place: 'วิทยุ, ปทุมวัน' },
  { title: 'สยามสแควร์ วัน', place: 'สยาม, ปทุมวัน' },
  { title: 'วัดมหาธาตุ', place: 'ท้องสนามหลวง, พระนคร' },
  { title: 'พิพิธภัณฑ์ MOCA', place: 'วิภาวดีรังสิต, จตุจักร' },
  { title: 'สวนลุมพินี', place: 'ลุมพินี, ปทุมวัน' },
  { title: 'เซ็นทรัล เวิลด์', place: 'ราชประสงค์, ปทุมวัน' },
  { title: 'ตลาดน้ำคลองลัดมะยม', place: 'ภาษีเจริญ, กรุงเทพฯ' },
  { title: 'เอ็มสเฟียร์ & วัฒนา', place: 'สุขุมวิท, วัฒนา' },
];

// Initial preset entries for April 2026
const initialEntries: { [dateKey: string]: JournalEntry } = {};
for (let d = 1; d <= 30; d++) {
  const key = `2026-03-${d.toString().padStart(2, '0')}`;
  const placeInfo = bangkokPlaces[(d - 1) % bangkokPlaces.length];
  initialEntries[key] = {
    dateKey: key,
    day: d,
    month: 3,
    year: 2026,
    photoUrl: samplePhotos[(d % 12) + 1] || samplePhotos[1],
    title: placeInfo.title,
    places: [placeInfo.place],
    journalNote: `เที่ยว${placeInfo.title} ย่าน${placeInfo.place} — บันทึกความทรงจำกรุงเทพฯ วันที่ ${d} เมษายน 2026`,
  };
}

// Initial Sample Travel Books
const initialBooks: TravelBook[] = [
  {
    id: 'book-1',
    title: 'PASSPORT TO THAILAND',
    subtitle: 'BANGKOK & BEYOND 2026',
    colorHex: '#7DC4CE',
    textColor: '#FFFFFF',
    emblem: 'compass',
    stamps: [
      {
        id: 's1',
        title: 'วัดพระแก้ว (Grand Palace)',
        location: 'Bangkok, Thailand',
        date: '12 เม.ย. 2026',
        photoUrl: 'https://images.unsplash.com/photo-1583417646698-f2b7f75fb192?w=400&q=80',
        note: 'ไหว้พระแก้วมรกตยามเช้า บรรยากาศงดงามตระการตามาก',
      },
      {
        id: 's2',
        title: 'ICONSIAM & Chao Phraya',
        location: 'Bangkok, Thailand',
        date: '13 เม.ย. 2026',
        photoUrl: 'https://images.unsplash.com/photo-1605335122119-e58f00db1a86?w=400&q=80',
        note: 'นั่งเรือด่วนเจ้าพระยาชมทัศนียภาพสองฝั่งแม่น้ำยามเย็น',
      },
      {
        id: 's3',
        title: 'อารีย์ คาเฟ่ฮ็อปปิ้ง',
        location: 'Ari, Bangkok',
        date: '14 เม.ย. 2026',
        photoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
        note: 'จิบกาแฟดริปสโลว์ไลฟ์ย่านอารีย์ บรรยากาศอบอุ่น',
      },
      {
        id: 's4',
        title: 'เยาวราช ย่านของกิน',
        location: 'Yaowarat, Bangkok',
        date: '15 เม.ย. 2026',
        photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
        note: 'ลุยของกินสตรีทฟู้ดเยาวราชตอนค่ำ อร่อยติดใจทุกร้าน',
      },
    ],
  },
  {
    id: 'book-2',
    title: 'JAPAN MEMORY JOURNAL',
    subtitle: 'SPRING TOKYO 2026',
    colorHex: '#F3D5CF',
    textColor: '#4B2E1F',
    emblem: 'globe',
    stamps: [
      {
        id: 's5',
        title: 'Shibuya Crossing',
        location: 'Tokyo, Japan',
        date: '02 พ.ค. 2026',
        photoUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80',
        note: 'ห้าแยกชิบุย่าอันคึกคัก แสงสีและผู้คนในเมืองหลวงญี่ปุ่น',
      },
    ],
  },
];

export default function AlbumScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'Calendar' | 'Books'>('Books');
  
  // --- Calendar States ---
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(3); // 3 = April
  const [viewMode, setViewMode] = useState<'Compact' | 'Full'>('Full');
  const [entries, setEntries] = useState<{ [dateKey: string]: JournalEntry }>(initialEntries);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editPlaces, setEditPlaces] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');

  // --- Travel Books States ---
  const [books, setBooks] = useState<TravelBook[]>(initialBooks);
  const [selectedBook, setSelectedBook] = useState<TravelBook | null>(null);
  const [createBookModalVisible, setCreateBookModalVisible] = useState(false);

  // New Book Form States
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookSubtitle, setNewBookSubtitle] = useState('');
  const [newBookColor, setNewBookColor] = useState(BOOK_COLORS[0]);
  const [newBookEmblem, setNewBookEmblem] = useState('compass');

  // Add Stamp to Book Modal States
  const [addStampModalVisible, setAddStampModalVisible] = useState(false);
  const [newStampTitle, setNewStampTitle] = useState('');
  const [newStampLocation, setNewStampLocation] = useState('');
  const [newStampNote, setNewStampNote] = useState('');
  const [newStampPhotoUrl, setNewStampPhotoUrl] = useState('');
  const [newStampDate, setNewStampDate] = useState('');

  // Import-from-calendar picker inside stamp form
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);

  // Stamp Detail Preview Modal
  const [selectedStamp, setSelectedStamp] = useState<StampItem | null>(null);

  // --- Calendar Logic ---
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const gridCells = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    gridCells.push({ day: daysInPrevMonth - i, isCurrentMonth: false, dateKey: `prev-${i}` });
  }
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const key = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    gridCells.push({ day: d, isCurrentMonth: true, dateKey: key });
  }
  const remaining = (7 - (gridCells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    gridCells.push({ day: i, isCurrentMonth: false, dateKey: `next-${i}` });
  }

  const openDayModal = (cell: { day: number; isCurrentMonth: boolean; dateKey: string }) => {
    if (!cell.isCurrentMonth) return;
    const existing = entries[cell.dateKey];
    setSelectedDateKey(cell.dateKey);

    if (existing) {
      setEditTitle(existing.title);
      setEditNote(existing.journalNote);
      setEditPlaces(existing.places.join(', '));
      setEditPhotoUrl(existing.photoUrl);
    } else {
      setEditTitle(`บันทึกวันที่ ${cell.day} ${monthNamesEnglish[currentMonth]}`);
      setEditNote('');
      setEditPlaces('');
      setEditPhotoUrl('');
    }
    setDayModalVisible(true);
  };

  const pickPhotoForCalendar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('ขอสิทธิ์เข้าถึงคลังภาพ', 'โปรดอนุญาตให้เปิดคลังภาพในโทรศัพท์ครับ');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setEditPhotoUrl(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Error picking photo:', err);
    }
  };

  const saveCalendarEntry = () => {
    if (!selectedDateKey) return;
    const dayNum = parseInt(selectedDateKey.split('-')[2]);
    const updatedEntry: JournalEntry = {
      dateKey: selectedDateKey,
      day: dayNum,
      month: currentMonth,
      year: currentYear,
      photoUrl: editPhotoUrl || samplePhotos[(dayNum % 12) + 1],
      title: editTitle || `บันทึกวันที่ ${dayNum}`,
      places: editPlaces ? editPlaces.split(',').map(s => s.trim()) : ['จุดเดินทาง'],
      journalNote: editNote,
    };
    setEntries(prev => ({ ...prev, [selectedDateKey]: updatedEntry }));
    setDayModalVisible(false);
  };

  const deleteCalendarEntry = () => {
    if (!selectedDateKey) return;
    const updated = { ...entries };
    delete updated[selectedDateKey];
    setEntries(updated);
    setDayModalVisible(false);
  };

  // --- Travel Book Creation Logic ---
  const createNewBook = () => {
    if (!newBookTitle.trim()) {
      Alert.alert('โปรดระบุชื่อหนังสือ', 'กรุณากรอกคำที่จะพิมพ์บนปกหนังสือครับ');
      return;
    }

    const created: TravelBook = {
      id: `book-${Date.now()}`,
      title: newBookTitle.trim().toUpperCase(),
      subtitle: newBookSubtitle.trim() || 'TRAVEL JOURNAL & PASSPORT',
      colorHex: newBookColor.hex,
      textColor: newBookColor.textColor,
      emblem: newBookEmblem,
      stamps: [],
    };

    setBooks([created, ...books]);
    setCreateBookModalVisible(false);

    // Reset Form
    setNewBookTitle('');
    setNewBookSubtitle('');
    setNewBookColor(BOOK_COLORS[0]);
    setNewBookEmblem('compass');
  };

  // Pick Photo for Stamp in Book
  const pickPhotoForStamp = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('ขอสิทธิ์เข้าถึงคลังภาพ', 'โปรดอนุญาตให้เปิดคลังภาพในโทรศัพท์ครับ');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setNewStampPhotoUrl(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Error picking photo:', err);
    }
  };

  // Import from calendar entry into stamp form
  const importCalendarEntry = (entry: JournalEntry) => {
    const day = entry.day;
    const monthShort = monthNamesEnglish[entry.month].slice(0, 3);
    const dateStr = `${day} ${monthShort} ${entry.year}`;
    setNewStampPhotoUrl(entry.photoUrl);
    setNewStampDate(dateStr);
    if (!newStampTitle.trim()) setNewStampTitle(entry.title);
    if (!newStampNote.trim()) setNewStampNote(entry.journalNote);
    if (!newStampLocation.trim()) setNewStampLocation(entry.places.join(', '));
    setShowCalendarPicker(false);
  };

  // Add New Stamp to Opened Book
  const addStampToBook = () => {
    if (!selectedBook) return;
    if (!newStampTitle.trim()) {
      Alert.alert('โปรดระบุชื่อแสตมป์', 'กรอกชื่อสถานที่หรือความทรงจำครับ');
      return;
    }

    const finalDate = newStampDate.trim() ||
      `${new Date().getDate()} ${monthNamesEnglish[new Date().getMonth()].slice(0,3)} ${new Date().getFullYear()}`;

    const newStamp: StampItem = {
      id: `stamp-${Date.now()}`,
      title: newStampTitle.trim(),
      location: newStampLocation.trim() || 'Bangkok, Thailand',
      date: finalDate,
      photoUrl: newStampPhotoUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
      note: newStampNote.trim() || 'บันทึกความทรงจำการเดินทางสไตล์แสตมป์ที่น่าประทับใจ',
    };

    const updatedBook = {
      ...selectedBook,
      stamps: [newStamp, ...selectedBook.stamps],
    };

    setBooks(prev => prev.map(b => (b.id === selectedBook.id ? updatedBook : b)));
    setSelectedBook(updatedBook);
    setAddStampModalVisible(false);

    // Reset form
    setNewStampTitle('');
    setNewStampLocation('');
    setNewStampNote('');
    setNewStampPhotoUrl('');
    setNewStampDate('');
    setShowCalendarPicker(false);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/dalmatian_bg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Top Segmented Selector: [ 📮 Stamp Calendar | 📕 Travel Books & Stamps ] */}
      <View style={styles.topSegmentWrap}>
        <View style={styles.topSegment}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'Calendar' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('Calendar')}
            activeOpacity={0.8}
          >
            <Feather name="calendar" size={15} color={activeTab === 'Calendar' ? Colors.freshlyRoasted : '#888'} />
            <Text style={[styles.segmentText, activeTab === 'Calendar' && styles.segmentTextActive]}>
              Stamp Calendar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'Books' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('Books')}
            activeOpacity={0.8}
          >
            <Feather name="book-open" size={15} color={activeTab === 'Books' ? Colors.freshlyRoasted : '#888'} />
            <Text style={[styles.segmentText, activeTab === 'Books' && styles.segmentTextActive]}>
              Travel Books & Stamps
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TAB 1: STAMP CALENDAR VIEW */}
      {activeTab === 'Calendar' ? (
        <>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.monthHeaderLeft}>
              <OutlinedText
                text={(currentMonth + 1).toString().padStart(2, '0')}
                style={styles.monthNumber}
                strokeColor="#FFFFFF"
                strokeWidth={5}
              />
              <View style={styles.monthNameWrap}>
                <OutlinedText
                  text={String(currentYear)}
                  style={styles.yearText}
                  strokeColor="#FFFFFF"
                  strokeWidth={2.5}
                />
                <OutlinedText
                  text={monthNamesEnglish[currentMonth]}
                  style={styles.monthNameText}
                  strokeColor="#FFFFFF"
                  strokeWidth={3.5}
                />
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity onPress={prevMonth} style={styles.arrowBtn}>
                <Feather name="chevron-left" size={22} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity onPress={nextMonth} style={styles.arrowBtn}>
                <Feather name="chevron-right" size={22} color="#555" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mode Toggle Switch (Compact / Full) */}
          <View style={styles.toggleWrapper}>
            <View style={styles.toggleCapsule}>
              <TouchableOpacity
                style={[styles.toggleBtn, viewMode === 'Compact' && styles.toggleBtnActive]}
                onPress={() => setViewMode('Compact')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, viewMode === 'Compact' && styles.toggleTextActive]}>
                  Compact
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, viewMode === 'Full' && styles.toggleBtnActive]}
                onPress={() => setViewMode('Full')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, viewMode === 'Full' && styles.toggleTextActive]}>
                  Full
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday Row */}
          <View style={styles.weekDaysRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => (
              <Text key={idx} style={styles.weekDayText}>{dayName}</Text>
            ))}
          </View>

          {viewMode === 'Full' ? (
            <ScrollView contentContainerStyle={styles.gridContainer}>
              <View style={styles.grid}>
                {gridCells.map((cell, idx) => {
                  const entry = cell.isCurrentMonth ? entries[cell.dateKey] : null;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.cell}
                      onPress={() => openDayModal(cell)}
                      activeOpacity={cell.isCurrentMonth ? 0.7 : 1}
                    >
                      <Text style={[
                        styles.cellDayNumber,
                        !cell.isCurrentMonth && styles.cellDayNumberDimmed
                      ]}>
                        {cell.day}
                      </Text>
                      {cell.isCurrentMonth && entry?.photoUrl ? (
                        <View style={styles.stampOuter}>
                          <View style={styles.stampBorder}>
                            <Image source={{ uri: entry.photoUrl }} style={styles.stampImage} />
                          </View>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <ScrollView style={styles.compactList}>
              {Object.values(entries).filter(e => e.month === currentMonth && e.year === currentYear).map(item => (
                <TouchableOpacity
                  key={item.dateKey}
                  style={styles.compactCard}
                  onPress={() => {
                    setSelectedDateKey(item.dateKey);
                    setEditTitle(item.title);
                    setEditNote(item.journalNote);
                    setEditPlaces(item.places.join(', '));
                    setEditPhotoUrl(item.photoUrl);
                    setDayModalVisible(true);
                  }}
                >
                  <View style={styles.compactStamp}>
                    <Image source={{ uri: item.photoUrl }} style={styles.compactImage} />
                  </View>
                  <View style={styles.compactContent}>
                    <Text style={styles.compactDate}>วันที่ {item.day} {monthNamesEnglish[currentMonth]}</Text>
                    <Text style={styles.compactTitle}>{item.title}</Text>
                    {item.journalNote ? <Text style={styles.compactNote} numberOfLines={2}>{item.journalNote}</Text> : null}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      ) : (
        /* TAB 2: TRAVEL BOOKS & STAMP OVERVIEW GALLERY */
        <ScrollView contentContainerStyle={styles.booksContainer}>
          <View style={styles.booksHeader}>
            <View>
              <OutlinedText
                text="MY TRAVEL PASSPORTS"
                style={styles.booksTitle}
                strokeColor="#FFFFFF"
                strokeWidth={3.5}
              />
              <OutlinedText
                text="Personal Travel Stamp Collection Books"
                style={styles.booksSubtitle}
                strokeColor="#FFFFFF"
                strokeWidth={2.5}
              />
            </View>
            <TouchableOpacity
              style={styles.btnCreateBook}
              onPress={() => setCreateBookModalVisible(true)}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.btnCreateBookText}>Create Book</Text>
            </TouchableOpacity>
          </View>

          {/* Book Shelf List */}
          <View style={styles.shelfGrid}>
            {books.map(book => (
              <TouchableOpacity
                key={book.id}
                style={[styles.bookCover, { backgroundColor: book.colorHex }]}
                onPress={() => setSelectedBook(book)}
                activeOpacity={0.9}
              >
                {/* Gold Foil Spine Line */}
                <View style={styles.bookSpineLine} />
                
                {/* Cover Emblem */}
                <View style={styles.bookEmblemWrap}>
                  <Feather name={book.emblem as any} size={28} color={book.textColor} />
                </View>

                {/* Cover Title */}
                <Text style={[styles.bookCoverTitle, { color: book.textColor }]}>
                  {book.title}
                </Text>
                <Text style={[styles.bookCoverSubtitle, { color: book.textColor }]}>
                  {book.subtitle}
                </Text>

                {/* Stamp Counter Badge */}
                <View style={styles.bookBadge}>
                  <Text style={styles.bookBadgeText}>📮 {book.stamps.length} STAMPS</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* --- MODAL 1: OPENED BOOK & STAMP OVERVIEW GALLERY --- */}
      <Modal visible={selectedBook !== null} animationType="slide" statusBarTranslucent={true}>
        {selectedBook && (
          <View style={styles.openedBookContainer}>
            {/* Book Header Bar */}
            <View style={[styles.openedBookNav, { paddingTop: Math.max(insets.top + 6, Platform.OS === 'ios' ? 52 : 16) }]}>
              <TouchableOpacity onPress={() => setSelectedBook(null)} style={styles.openedBookBackBtn} activeOpacity={0.7}>
                <Feather name="arrow-left" size={20} color="#333" />
                <Text style={styles.openedBookBackText}>Close Book</Text>
              </TouchableOpacity>
              <Text style={styles.openedBookNavTitle} numberOfLines={1}>
                {selectedBook.title}
              </Text>
              <TouchableOpacity
                style={styles.btnAddStamp}
                onPress={() => setAddStampModalVisible(true)}
                activeOpacity={0.8}
              >
                <Feather name="plus" size={15} color="#fff" />
                <Text style={styles.btnAddStampText}>Add Stamp</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.openedBookContent}>
              {/* Passport Bio Intro Banner */}
              <View style={[styles.passportBioCard, { borderTopColor: selectedBook.colorHex }]}>
                <View style={styles.passportBioHead}>
                  <Feather name={selectedBook.emblem as any} size={32} color={selectedBook.colorHex} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.passportBioTitle}>{selectedBook.title}</Text>
                    <Text style={styles.passportBioSub}>{selectedBook.subtitle}</Text>
                  </View>
                </View>
                <View style={styles.passportBioDivider} />
                <View style={styles.passportBioRow}>
                  <Text style={styles.passportBioLbl}>STAMPS COLLECTED:</Text>
                  <Text style={styles.passportBioVal}>{selectedBook.stamps.length} places</Text>
                </View>
              </View>

              {/* Stamp Collection Overview Gallery Section */}
              <View style={styles.stampGallerySection}>
                <Text style={styles.stampGalleryHeading}>STAMP COLLECTION OVERVIEW 📮</Text>
                <Text style={styles.stampGallerySubheading}>Overview of all travel stamps collected in this book</Text>

                {selectedBook.stamps.length === 0 ? (
                  <View style={styles.emptyStampsWrap}>
                    <Feather name="award" size={40} color="#ccc" />
                    <Text style={styles.emptyStampsText}>No stamps in this book yet</Text>
                    <TouchableOpacity
                      style={styles.btnAddStampEmpty}
                      onPress={() => setAddStampModalVisible(true)}
                    >
                      <Text style={styles.btnAddStampEmptyText}>+ Add Your First Stamp</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.stampGrid}>
                    {selectedBook.stamps.map(stamp => (
                      <TouchableOpacity
                        key={stamp.id}
                        style={styles.stampCard}
                        onPress={() => setSelectedStamp(stamp)}
                        activeOpacity={0.8}
                      >
                        {/* Jagged Postage Stamp Frame */}
                        <View style={styles.stampFrame}>
                          <Image source={{ uri: stamp.photoUrl }} style={styles.stampPhoto} />
                          
                          {/* Circular Postmark Ink Seal Overlay */}
                          <View style={styles.postmarkSeal}>
                            <Text style={styles.postmarkText}>POST</Text>
                            <Text style={styles.postmarkDate}>{stamp.date.split(' ')[0]}</Text>
                          </View>
                        </View>

                        <Text style={styles.stampCardTitle} numberOfLines={1}>
                          {stamp.title}
                        </Text>
                        <Text style={styles.stampCardLocation} numberOfLines={1}>
                          📍 {stamp.location}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* --- MODAL 2: CREATE NEW BOOK (CUSTOM TITLE & COLOR) --- */}
      <Modal visible={createBookModalVisible} animationType="slide" transparent onRequestClose={() => setCreateBookModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
          <FrostedGlassCard style={styles.modalCard} intensity={95}>
            <View style={styles.dragHandleWrap}>
              <View style={styles.dragHandle} />
            </View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Passport Book 📕</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setCreateBookModalVisible(false)}>
                <Feather name="x" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Book Title (Foil Stamped Text)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. MY TRAVEL PASSPORT 2026, JAPAN TRIP"
                placeholderTextColor="#A0A0A0"
                value={newBookTitle}
                onChangeText={setNewBookTitle}
              />

              <Text style={styles.label}>Subtitle / Passport No.</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. BANGKOK & BEYOND, Virgo Collection"
                placeholderTextColor="#A0A0A0"
                value={newBookSubtitle}
                onChangeText={setNewBookSubtitle}
              />

              <Text style={styles.label}>Book Cover Color</Text>
              <View style={styles.colorPalette}>
                {BOOK_COLORS.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.colorOption,
                      { backgroundColor: c.hex },
                      newBookColor.id === c.id && styles.colorOptionSelected,
                    ]}
                    onPress={() => setNewBookColor(c)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Cover Emblem</Text>
              <View style={styles.emblemRow}>
                {['compass', 'globe', 'map-pin', 'navigation', 'star'].map(emb => (
                  <TouchableOpacity
                    key={emb}
                    style={[styles.emblemOption, newBookEmblem === emb && styles.emblemOptionSelected]}
                    onPress={() => setNewBookEmblem(emb)}
                  >
                    <Feather name={emb as any} size={20} color={newBookEmblem === emb ? Colors.freshlyRoasted : '#888'} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setCreateBookModalVisible(false)}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={createNewBook}>
                <Text style={styles.btnSaveText}>Create Book</Text>
              </TouchableOpacity>
            </View>
          </FrostedGlassCard>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- MODAL 3: ADD STAMP TO BOOK --- */}
      <Modal visible={addStampModalVisible} animationType="slide" transparent onRequestClose={() => { setAddStampModalVisible(false); setShowCalendarPicker(false); }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
          <FrostedGlassCard style={styles.modalCard} intensity={95}>
            <View style={styles.dragHandleWrap}>
              <View style={styles.dragHandle} />
            </View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Stamp to Book 📮</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => { setAddStampModalVisible(false); setShowCalendarPicker(false); }}>
                <Feather name="x" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Photo preview + pickers */}
              <View style={styles.modalPhotoSection}>
                {newStampPhotoUrl ? (
                  <View style={styles.largeStamp}>
                    <Image source={{ uri: newStampPhotoUrl }} style={styles.largeStampImage} />
                  </View>
                ) : (
                  <View style={styles.largeStampPlaceholder}>
                    <Feather name="image" size={36} color="#B0B0B0" />
                  </View>
                )}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <TouchableOpacity style={styles.btnPickPhoto} onPress={pickPhotoForStamp}>
                    <Feather name="camera" size={15} color="#333" />
                    <Text style={styles.btnPickPhotoText}>From Phone</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btnPickPhoto, { backgroundColor: 'rgba(42, 127, 160, 0.12)', borderColor: 'rgba(42, 127, 160, 0.2)' }]}
                    onPress={() => setShowCalendarPicker(prev => !prev)}
                  >
                    <Feather name="calendar" size={15} color="#2A7FA0" />
                    <Text style={[styles.btnPickPhotoText, { color: '#2A7FA0' }]}>Import Calendar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Calendar Entry Picker */}
              {showCalendarPicker && (() => {
                const calEntries = Object.values(entries).filter(e => e.photoUrl);
                return (
                  <View style={styles.calPickerWrap}>
                    <Text style={styles.calPickerTitle}>📸 Select from Calendar Entries</Text>
                    {calEntries.length === 0 ? (
                      <Text style={{ fontSize: 12, color: '#888', textAlign: 'center', padding: 12 }}>No calendar entries found</Text>
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 4 }}>
                          {calEntries.map(entry => (
                            <TouchableOpacity
                              key={entry.dateKey}
                              style={styles.calPickerItem}
                              onPress={() => importCalendarEntry(entry)}
                              activeOpacity={0.75}
                            >
                              <Image source={{ uri: entry.photoUrl }} style={styles.calPickerImg} />
                              <Text style={styles.calPickerDate} numberOfLines={1}>
                                {entry.day} {monthNamesEnglish[entry.month].slice(0,3)}
                              </Text>
                              <Text style={styles.calPickerName} numberOfLines={1}>{entry.title}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    )}
                  </View>
                );
              })()}

              <Text style={styles.label}>Place Name / Stamp Title</Text>
              <TextInput style={styles.input} placeholder="e.g. Wat Phra Kaew, Siam Paragon" placeholderTextColor="#A0A0A0" value={newStampTitle} onChangeText={setNewStampTitle} />

              <Text style={styles.label}>City / Country</Text>
              <TextInput style={styles.input} placeholder="e.g. Bangkok, Thailand" placeholderTextColor="#A0A0A0" value={newStampLocation} onChangeText={setNewStampLocation} />

              {newStampDate ? (
                <View style={styles.importedDateBadge}>
                  <Feather name="calendar" size={12} color="#2A7FA0" />
                  <Text style={styles.importedDateText}>Date from calendar: {newStampDate}</Text>
                  <TouchableOpacity onPress={() => setNewStampDate('')}>
                    <Feather name="x" size={12} color="#999" />
                  </TouchableOpacity>
                </View>
              ) : null}

              <Text style={styles.label}>Short Journal Note ✍️</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Write a short memory note..." placeholderTextColor="#A0A0A0" multiline numberOfLines={3} value={newStampNote} onChangeText={setNewStampNote} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => { setAddStampModalVisible(false); setShowCalendarPicker(false); }}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={addStampToBook}>
                <Text style={styles.btnSaveText}>Save Stamp</Text>
              </TouchableOpacity>
            </View>
          </FrostedGlassCard>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- MODAL 4: FULL STAMP PREVIEW --- */}
      <Modal visible={selectedStamp !== null} transparent animationType="fade" onRequestClose={() => setSelectedStamp(null)}>
        {selectedStamp && (
          <View style={styles.stampDetailModalBg}>
            <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
            <FrostedGlassCard style={styles.stampDetailCard} intensity={95}>
              <View style={styles.dragHandleWrap}>
                <View style={styles.dragHandle} />
              </View>
              <TouchableOpacity style={styles.modalCloseBtnAbs} onPress={() => setSelectedStamp(null)}>
                <Feather name="x" size={18} color="#333" />
              </TouchableOpacity>

              <View style={styles.stampDetailFrame}>
                <Image source={{ uri: selectedStamp.photoUrl }} style={styles.stampDetailPhoto} />
              </View>

              <Text style={styles.stampDetailTitle}>{selectedStamp.title}</Text>
              <Text style={styles.stampDetailLoc}>📍 {selectedStamp.location} • {selectedStamp.date}</Text>
              <Text style={styles.stampDetailNote}>"{selectedStamp.note}"</Text>
            </FrostedGlassCard>
          </View>
        )}
      </Modal>

      {/* --- MODAL 5: CALENDAR DAY EDIT MODAL --- */}
      <Modal visible={dayModalVisible} animationType="slide" transparent onRequestClose={() => setDayModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
          <FrostedGlassCard style={styles.modalCard} intensity={95}>
            <View style={styles.dragHandleWrap}>
              <View style={styles.dragHandle} />
            </View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Stamp Memory Entry 📮</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setDayModalVisible(false)}>
                <Feather name="x" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.modalPhotoSection}>
                {editPhotoUrl ? (
                  <View style={styles.largeStamp}>
                    <Image source={{ uri: editPhotoUrl }} style={styles.largeStampImage} />
                  </View>
                ) : (
                  <View style={styles.largeStampPlaceholder}>
                    <Feather name="image" size={36} color="#B0B0B0" />
                  </View>
                )}
                <TouchableOpacity style={styles.btnPickPhoto} onPress={pickPhotoForCalendar}>
                  <Feather name="camera" size={16} color="#333" />
                  <Text style={styles.btnPickPhotoText}>Select Photo from Phone</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Memory Title</Text>
              <TextInput
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Enter title..."
                placeholderTextColor="#A0A0A0"
              />

              <Text style={styles.label}>Places Visited</Text>
              <TextInput
                style={styles.input}
                value={editPlaces}
                onChangeText={setEditPlaces}
                placeholder="Separated by comma ,"
                placeholderTextColor="#A0A0A0"
              />

              <Text style={styles.label}>Journal Note ✍️</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editNote}
                onChangeText={setEditNote}
                placeholder="Write a brief journal description..."
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnDelete} onPress={deleteCalendarEntry}>
                <Text style={styles.btnDeleteText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={saveCalendarEntry}>
                <Text style={styles.btnSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </FrostedGlassCard>
        </KeyboardAvoidingView>
      </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  backgroundOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(250, 246, 240, 0.45)' },
  container: { flex: 1 },

  // Top Segment Bar
  topSegmentWrap: { alignItems: 'center', marginVertical: 8, paddingHorizontal: 20 },
  topSegment: { flexDirection: 'row', backgroundColor: 'rgba(186, 221, 127, 0.35)', borderRadius: 999, padding: 3, width: '100%' },
  segmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 999 },
  segmentBtnActive: { backgroundColor: '#66023C', shadowColor: '#66023C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  segmentText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(57, 29, 1, 0.55)' },
  segmentTextActive: { fontFamily: 'Inter_600SemiBold', color: '#CAD183' },

  // Calendar Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 4, marginBottom: 4 },
  monthHeaderLeft: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  monthNumber: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 64, color: '#222', lineHeight: 68 },
  monthNameWrap: { justifyContent: 'center' },
  yearText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#888', marginBottom: -4 },
  monthNameText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: '#333' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  arrowBtn: { padding: 6 },

  toggleWrapper: { alignItems: 'center', marginVertical: 8 },
  toggleCapsule: { flexDirection: 'row', backgroundColor: 'rgba(186, 221, 127, 0.35)', borderRadius: 999, padding: 3, width: 240 },
  toggleBtn: { flex: 1, paddingVertical: 6, borderRadius: 999, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#66023C', shadowColor: '#66023C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  toggleText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(57, 29, 1, 0.55)' },
  toggleTextActive: { color: '#CAD183', fontFamily: 'Inter_600SemiBold' },

  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 6 },
  weekDayText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(57, 29, 1, 0.5)', width: CELL_WIDTH, textAlign: 'center' },

  gridContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL_WIDTH, height: 72, padding: 2, alignItems: 'flex-start' },
  cellDayNumber: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#391D01', marginLeft: 2 },
  cellDayNumberDimmed: { color: 'rgba(57, 29, 1, 0.25)' },

  stampOuter: { width: CELL_WIDTH - 6, height: 48, marginTop: 2, backgroundColor: 'rgba(202, 209, 131, 0.5)', borderRadius: 4, padding: 2, borderWidth: 1, borderColor: 'rgba(57, 29, 1, 0.15)', shadowColor: '#391D01', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  stampBorder: { flex: 1, borderRadius: 2, overflow: 'hidden' },
  stampImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  compactList: { flex: 1, paddingHorizontal: 20 },
  compactCard: { flexDirection: 'row', backgroundColor: 'rgba(186, 221, 127, 0.2)', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(57, 29, 1, 0.1)', alignItems: 'center', gap: 12 },
  compactStamp: { width: 60, height: 60, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(202, 209, 131, 0.4)' },
  compactImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  compactContent: { flex: 1 },
  compactDate: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(57, 29, 1, 0.55)' },
  compactTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 18, color: '#391D01' },
  compactNote: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(57, 29, 1, 0.6)', marginTop: 2 },

  // Bookshelf Tab Styles
  booksContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  booksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 14 },
  booksTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 22, color: '#391D01', letterSpacing: 1 },
  booksSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(57, 29, 1, 0.55)', marginTop: 2 },
  btnCreateBook: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#66023C', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  btnCreateBookText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#CAD183' },

  shelfGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 10 },
  bookCover: { width: (width - 56) / 2, height: 210, borderRadius: 12, padding: 14, justifyContent: 'space-between', shadowColor: '#391D01', shadowOffset: { width: 4, height: 8 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6, position: 'relative', overflow: 'hidden' },
  bookSpineLine: { position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  bookEmblemWrap: { alignSelf: 'flex-end', opacity: 0.9 },
  bookCoverTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 18, letterSpacing: 1.5, marginTop: 20 },
  bookCoverSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, opacity: 0.8 },
  bookBadge: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  bookBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#fff' },

  // Opened Book View Modal
  openedBookContainer: { flex: 1, backgroundColor: '#FAF6F0' },
  openedBookNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(57, 29, 1, 0.1)',
    backgroundColor: '#FAF6F0',
  },
  openedBookBackBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingRight: 4 },
  openedBookBackText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#391D01' },
  openedBookNavTitle: { flex: 1, textAlign: 'center', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: '#391D01', marginHorizontal: 6 },
  btnAddStamp: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#66023C', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  btnAddStampText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#CAD183' },

  openedBookContent: { paddingHorizontal: 20, paddingVertical: 16 },
  passportBioCard: { backgroundColor: 'rgba(186, 221, 127, 0.35)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(102, 2, 60, 0.15)', borderTopWidth: 6, shadowColor: '#391D01', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2, marginBottom: 20 },
  passportBioHead: { flexDirection: 'row', alignItems: 'center' },
  passportBioTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: '#391D01' },
  passportBioSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(57, 29, 1, 0.55)' },
  passportBioDivider: { height: 1, backgroundColor: 'rgba(57, 29, 1, 0.1)', marginVertical: 12 },
  passportBioRow: { flexDirection: 'row', justifyContent: 'space-between' },
  passportBioLbl: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: 'rgba(57, 29, 1, 0.6)' },
  passportBioVal: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#391D01' },

  // Stamp Overview Gallery Section
  stampGallerySection: { marginTop: 10 },
  stampGalleryHeading: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: '#391D01', letterSpacing: 1 },
  stampGallerySubheading: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(57, 29, 1, 0.55)', marginBottom: 16 },
  emptyStampsWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyStampsText: { fontFamily: 'Inter_400Regular', color: 'rgba(57, 29, 1, 0.55)', marginTop: 10 },
  btnAddStampEmpty: { marginTop: 14, backgroundColor: '#BADD7F', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  btnAddStampEmptyText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#391D01' },

  stampGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  stampCard: { width: (width - 54) / 2, backgroundColor: 'rgba(186, 221, 127, 0.25)', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: 'rgba(57, 29, 1, 0.1)', shadowColor: '#391D01', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  stampFrame: { height: 130, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(202, 209, 131, 0.5)', position: 'relative' },
  stampPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  postmarkSeal: { position: 'absolute', bottom: 6, right: 6, width: 44, height: 44, borderRadius: 22, borderStyle: 'dashed', borderWidth: 1.5, borderColor: 'rgba(202, 209, 131, 0.9)', backgroundColor: 'rgba(102, 2, 60, 0.75)', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '-15deg' }] },
  postmarkText: { fontFamily: 'Inter_700Bold', fontSize: 8, color: '#CAD183' },
  postmarkDate: { fontFamily: 'Inter_500Medium', fontSize: 7, color: '#CAD183' },
  stampCardTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: '#391D01', marginTop: 8 },
  stampCardLocation: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(57, 29, 1, 0.55)', marginTop: 2 },

  // Color Palette Selector
  colorPalette: { flexDirection: 'row', gap: 10, marginVertical: 8 },
  colorOption: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  colorOptionSelected: { borderColor: '#66023C', transform: [{ scale: 1.1 }] },

  emblemRow: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  emblemOption: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(57, 29, 1, 0.2)', backgroundColor: 'rgba(202, 209, 131, 0.3)' },
  emblemOptionSelected: { borderColor: '#66023C', backgroundColor: 'rgba(186, 221, 127, 0.6)' },

  // Stamp Detail Preview Modal
  stampDetailModalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  stampDetailCard: { width: '100%', backgroundColor: 'rgba(250, 246, 240, 0.98)', borderRadius: 28, padding: 24, alignItems: 'center', position: 'relative' },
  modalCloseBtnAbs: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(57, 29, 1, 0.08)', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  stampDetailFrame: { width: '100%', height: 220, borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(57, 29, 1, 0.12)' },
  stampDetailPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  stampDetailTitle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, color: '#391D01', textAlign: 'center' },
  stampDetailLoc: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#66023C', marginTop: 4 },
  stampDetailNote: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: 'rgba(57, 29, 1, 0.8)', marginTop: 12, textAlign: 'center', lineHeight: 22 },

  // Drag Handle Bar (Aesop Sheet indicator style)
  dragHandleWrap: { alignItems: 'center', paddingTop: 4, paddingBottom: 10 },
  dragHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(57, 29, 1, 0.2)' },

  // Modals General
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, width: '100%', maxHeight: '90%', padding: 24, paddingTop: 12, backgroundColor: 'rgba(250, 246, 240, 0.98)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(57, 29, 1, 0.12)', paddingBottom: 14 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 19, color: '#391D01' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(57, 29, 1, 0.08)', alignItems: 'center', justifyContent: 'center' },
  modalBody: { marginVertical: 12 },
  modalPhotoSection: { alignItems: 'center', marginVertical: 12 },
  largeStamp: { width: 140, height: 140, backgroundColor: 'rgba(186, 221, 127, 0.3)', padding: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(102, 2, 60, 0.15)', shadowColor: '#391D01', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  largeStampImage: { width: '100%', height: '100%', borderRadius: 14 },
  largeStampPlaceholder: { width: 140, height: 140, backgroundColor: 'rgba(186, 221, 127, 0.3)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(57, 29, 1, 0.1)' },
  btnPickPhoto: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(186, 221, 127, 0.4)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(102, 2, 60, 0.15)' },
  btnPickPhotoText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#391D01' },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#391D01', marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: 'rgba(186, 221, 127, 0.2)', borderWidth: 1, borderColor: 'rgba(102, 2, 60, 0.2)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#391D01', shadowColor: '#391D01', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  textArea: { height: 80, textAlignVertical: 'top' },

  // Calendar-to-Stamp import picker
  calPickerWrap: { backgroundColor: 'rgba(186, 221, 127, 0.4)', borderRadius: 16, padding: 14, marginVertical: 12, borderWidth: 1, borderColor: 'rgba(57, 29, 1, 0.12)' },
  calPickerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#66023C' },
  calPickerItem: { width: 80, alignItems: 'center' },
  calPickerImg: { width: 72, height: 72, borderRadius: 12, backgroundColor: 'rgba(202, 209, 131, 0.5)', borderWidth: 2, borderColor: 'rgba(102, 2, 60, 0.2)' },
  calPickerDate: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#66023C', marginTop: 4 },
  calPickerName: { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(57, 29, 1, 0.75)', textAlign: 'center' },
  importedDateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(102, 2, 60, 0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10, alignSelf: 'flex-start' },
  importedDateText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#66023C', flex: 1 },
  modalFooter: { flexDirection: 'row', gap: 12, paddingTop: 16, marginTop: 4 },
  btnCancel: { flex: 1, backgroundColor: 'rgba(202, 209, 131, 0.4)', borderWidth: 1.5, borderColor: 'rgba(57, 29, 1, 0.35)', paddingVertical: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  btnCancelText: { fontFamily: 'Inter_600SemiBold', color: '#391D01', fontSize: 15 },
  btnDelete: { flex: 1, backgroundColor: 'rgba(202, 209, 131, 0.4)', borderWidth: 1.5, borderColor: 'rgba(57, 29, 1, 0.35)', paddingVertical: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  btnDeleteText: { fontFamily: 'Inter_600SemiBold', color: '#391D01', fontSize: 15 },
  btnSave: { flex: 1, backgroundColor: '#66023C', paddingVertical: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center', shadowColor: '#66023C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  btnSaveText: { fontFamily: 'Inter_600SemiBold', color: '#CAD183', fontSize: 15 },
});
