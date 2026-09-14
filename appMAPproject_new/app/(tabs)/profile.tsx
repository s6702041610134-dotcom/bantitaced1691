import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

export type FilterMode = 'normal' | 'grayscale' | 'vintage';

type IdentityData = {
  name: string;
  profession: string;
  characteristic: string;
  favoriteSeries: string;
  favoritePlace: string;
  personalPhrase: string;
  signature: string;
  photoUri: string;
  passportNo: string;
  filterMode: FilterMode;
};

const defaultIdentity: IdentityData = {
  name: 'Virgo Boonyarid',
  profession: 'Designer & Mobile Engineer',
  characteristic: 'Creative • Minimalist • Explorer',
  favoriteSeries: 'Emily in Paris / Midnight in Paris',
  favoritePlace: 'Kyoto, Japan & Bangkok',
  personalPhrase: '“Design is intelligence made visible.”',
  signature: 'Virgo Boonyarid',
  photoUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  passportNo: 'PASSPORT-NO. 8829-TH',
  filterMode: 'grayscale', // Default vintage grayscale portrait
};

export default function ProfilePassportScreen() {
  const [activeTab, setActiveTab] = useState<'View' | 'Edit'>('View');
  const [identity, setIdentity] = useState<IdentityData>(defaultIdentity);

  // Form states for Editing Identity
  const [form, setForm] = useState<IdentityData>(defaultIdentity);

  const cardRef = useRef<View | null>(null);

  const pickProfilePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('ขอสิทธิ์เข้าถึงคลังภาพ', 'โปรดอนุญาตให้เปิดคลังภาพในโทรศัพท์ครับ');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setForm((prev) => ({ ...prev, photoUri: result.assets[0].uri }));
      }
    } catch (err) {
      console.log('Error picking photo:', err);
    }
  };

  const handleSaveIdentity = () => {
    if (!form.name.trim()) {
      Alert.alert('โปรดระบุชื่อ', 'กรุณากรอกชื่อในพาสปอร์ตครับ');
      return;
    }
    setIdentity(form);
    setActiveTab('View');
    Alert.alert('บันทึกสำเร็จ 🎉', 'อัปเดตข้อมูลพาสปอร์ตส่วนตัวเรียบร้อยแล้ว!');
  };

  const handleSharePassportCard = async () => {
    try {
      if (!cardRef.current) return;
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
        }
      } catch (err) {
        console.log('MediaLibrary error:', err);
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Designer Passport Card',
          mimeType: 'image/png',
        });
      } else {
        Alert.alert('สำเร็จ', 'บันทึกบัตรพาสปอร์ตเรียบร้อยแล้ว!');
      }
    } catch (err) {
      console.log('Share passport error:', err);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกหรือแชร์บัตรพาสปอร์ตได้');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header Segmented Switch: [ 🪪 Passport Card | ✍️ Edit Identity ] */}
      <View style={styles.topSegmentWrap}>
        <View style={styles.topSegment}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'View' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('View')}
            activeOpacity={0.8}
          >
            <Feather name="credit-card" size={14} color={activeTab === 'View' ? '#4A1521' : '#AAA'} />
            <Text style={[styles.segmentText, activeTab === 'View' && styles.segmentTextActive]}>
              Designer Passport
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'Edit' && styles.segmentBtnActive]}
            onPress={() => {
              setForm(identity);
              setActiveTab('Edit');
            }}
            activeOpacity={0.8}
          >
            <Feather name="edit-3" size={14} color={activeTab === 'Edit' ? '#4A1521' : '#AAA'} />
            <Text style={[styles.segmentText, activeTab === 'Edit' && styles.segmentTextActive]}>
              Edit Identity
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TAB 1: VISUAL DESIGNER PASSPORT VIEW */}
      {activeTab === 'View' ? (
        <ScrollView contentContainerStyle={styles.viewScrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Visual Card Container (Deep Burgundy Fabric Aesthetic Background) */}
          <View ref={cardRef} collapsable={false} style={styles.burgundyFabricBg}>
            <View style={styles.fabricSubtleRibbing} />

            {/* TOP CARD: Large Portrait + Elegant Calligraphy "Designer PASSPORT" */}
            <View style={[styles.passportCard, styles.topCardRotated]}>
              {/* Outer Decorative Border */}
              <View style={styles.cardDecorativeBorder}>
                <View style={styles.cornerFlourishTL} />
                <View style={styles.cornerFlourishTR} />
                <View style={styles.cornerFlourishBL} />
                <View style={styles.cornerFlourishBR} />

                <View style={styles.topCardRow}>
                  {/* Portrait Photo Frame with Filter & Official Stamp */}
                  <View style={styles.photoFrameWrap}>
                    <Image source={{ uri: identity.photoUri }} style={styles.portraitPhoto} />
                    
                    {/* Photo Filter Overlays */}
                    {identity.filterMode === 'grayscale' && <View style={styles.grayscaleOverlay} />}
                    {identity.filterMode === 'vintage' && <View style={styles.vintageOverlay} />}

                    {/* Circular Ink Official Stamp Overlay */}
                    <View style={styles.officialInkStamp}>
                      <Text style={styles.stampInkText}>VERIFIED</Text>
                      <Text style={styles.stampInkSub}>IDENTITY</Text>
                      <Text style={styles.stampInkDate}>2026</Text>
                    </View>
                  </View>

                  {/* Right Column: Large Script Typography */}
                  <View style={styles.topCardTextCol}>
                    <Text style={styles.passportHeaderTag}>OFFICIAL PERSONAL IDENTITY</Text>
                    <Text style={styles.designerScriptTitle}>Designer</Text>
                    <Text style={styles.passportSubtextVertical}>P A S S P O R T</Text>
                    
                    <View style={styles.badgeLineRow}>
                      <View style={styles.goldBadge}>
                        <Text style={styles.goldBadgeText}>CREATIVE IDENTITY</Text>
                      </View>
                      <Text style={styles.cardPassportNo}>{identity.passportNo}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* BOTTOM CARD: Overlapping Vertically + Structured Identity Table */}
            <View style={[styles.passportCard, styles.bottomCardRotated]}>
              <View style={styles.cardDecorativeBorder}>
                <View style={styles.cornerFlourishTL} />
                <View style={styles.cornerFlourishTR} />
                <View style={styles.cornerFlourishBL} />
                <View style={styles.cornerFlourishBR} />

                <View style={styles.bottomCardHeaderRow}>
                  <View style={styles.smallPhotoWrap}>
                    <Image source={{ uri: identity.photoUri }} style={styles.smallPortraitPhoto} />
                    {identity.filterMode === 'grayscale' && <View style={styles.grayscaleOverlay} />}
                    {identity.filterMode === 'vintage' && <View style={styles.vintageOverlay} />}
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.designerScriptTitleSmall}>Designer</Text>
                    <Text style={styles.passportSubtextSmall}>PERSONAL IDENTITY CARD</Text>
                  </View>
                </View>

                {/* Structured Identity Grid Table */}
                <View style={styles.identityGridTable}>
                  <View style={styles.tableRowHalf}>
                    <View style={[styles.tableCell, { flex: 1 }]}>
                      <Text style={styles.cellLabel}>NAME</Text>
                      <Text style={styles.cellValueBold}>{identity.name.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 1, borderLeftWidth: 1, borderLeftColor: '#D8CEBE' }]}>
                      <Text style={styles.cellLabel}>PROFESSION</Text>
                      <Text style={styles.cellValue}>{identity.profession}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRowFull}>
                    <Text style={styles.cellLabel}>CHARACTERISTIC</Text>
                    <Text style={styles.cellValue}>{identity.characteristic}</Text>
                  </View>

                  <View style={styles.tableRowFull}>
                    <Text style={styles.cellLabel}>FAVORITE SERIES</Text>
                    <Text style={styles.cellValue} numberOfLines={1}>{identity.favoriteSeries}</Text>
                  </View>

                  <View style={styles.tableRowFull}>
                    <Text style={styles.cellLabel}>FAVORITE PLACE</Text>
                    <Text style={styles.cellValue}>{identity.favoritePlace}</Text>
                  </View>

                  <View style={styles.tableRowFull}>
                    <Text style={styles.cellLabel}>PERSONAL PHRASE</Text>
                    <Text style={styles.phraseItalicValue}>{identity.personalPhrase}</Text>
                  </View>

                  <View style={styles.signatureRow}>
                    <Text style={styles.cellLabel}>SIGNATURE</Text>
                    <Text style={styles.signatureText}>{identity.signature}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Action Bar (Save to Gallery / Share) */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnShareCard} onPress={handleSharePassportCard} activeOpacity={0.85}>
              <Feather name="download" size={16} color="#FFF" />
              <Text style={styles.btnShareCardText}>บันทึก / แชร์บัตรพาสปอร์ต</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* TAB 2: EDIT IDENTITY FORM */
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.editScrollContent}>
            <View style={styles.editCard}>
              <Text style={styles.editHeading}>แก้ไขข้อมูลพาสปอร์ตส่วนตัว ✍️</Text>
              <Text style={styles.editSubheading}>ปรับแต่งข้อมูลตัวตนและเลือกฟิลเตอร์รูปโปรไฟล์ของคุณ</Text>

              {/* Photo Upload & Filter Selector */}
              <View style={styles.photoUploadSection}>
                <View style={{ position: 'relative' }}>
                  <Image source={{ uri: form.photoUri }} style={styles.previewUploadPhoto} />
                  {form.filterMode === 'grayscale' && <View style={styles.grayscaleOverlayCircle} />}
                  {form.filterMode === 'vintage' && <View style={styles.vintageOverlayCircle} />}
                </View>

                <TouchableOpacity style={styles.btnChangePhoto} onPress={pickProfilePhoto} activeOpacity={0.8}>
                  <Feather name="camera" size={14} color="#4A1521" />
                  <Text style={styles.btnChangePhotoText}>เปลี่ยนรูปโปรไฟล์</Text>
                </TouchableOpacity>

                {/* Photo Filter Selection Pills */}
                <Text style={styles.filterTitleLabel}>เลือกฟิลเตอร์รูปโปรไฟล์ (Photo Filter)</Text>
                <View style={styles.filterPillRow}>
                  <TouchableOpacity
                    style={[styles.filterPill, form.filterMode === 'normal' && styles.filterPillActive]}
                    onPress={() => setForm({ ...form, filterMode: 'normal' })}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterPillText, form.filterMode === 'normal' && styles.filterPillTextActive]}>
                      📷 ปกติ (Normal)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterPill, form.filterMode === 'grayscale' && styles.filterPillActive]}
                    onPress={() => setForm({ ...form, filterMode: 'grayscale' })}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterPillText, form.filterMode === 'grayscale' && styles.filterPillTextActive]}>
                      🎬 ขาวดำ (B&W)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterPill, form.filterMode === 'vintage' && styles.filterPillActive]}
                    onPress={() => setForm({ ...form, filterMode: 'vintage' })}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterPillText, form.filterMode === 'vintage' && styles.filterPillTextActive]}>
                      🎞️ วินเทจ (Vintage)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Input Fields */}
              <Text style={styles.inputLabel}>ชื่อ-นามสกุล (NAME)</Text>
              <TextInput style={styles.textInput} value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} placeholder="เช่น Virgo Boonyarid" />

              <Text style={styles.inputLabel}>อาชีพ / สิ่งที่เป็น (PROFESSION)</Text>
              <TextInput style={styles.textInput} value={form.profession} onChangeText={(text) => setForm({ ...form, profession: text })} placeholder="เช่น UI/UX Designer & Mobile Dev" />

              <Text style={styles.inputLabel}>บุคลิกภาพ / บุคลิกประจำตัว (CHARACTERISTIC)</Text>
              <TextInput style={styles.textInput} value={form.characteristic} onChangeText={(text) => setForm({ ...form, characteristic: text })} placeholder="เช่น Creative • Curious • Explorer" />

              <Text style={styles.inputLabel}>หนัง / ซีรีส์เรื่องโปรด (FAVORITE SERIES)</Text>
              <TextInput style={styles.textInput} value={form.favoriteSeries} onChangeText={(text) => setForm({ ...form, favoriteSeries: text })} placeholder="เช่น Emily in Paris" />

              <Text style={styles.inputLabel}>สถานที่ชอบที่สุด (FAVORITE PLACE)</Text>
              <TextInput style={styles.textInput} value={form.favoritePlace} onChangeText={(text) => setForm({ ...form, favoritePlace: text })} placeholder="เช่น Kyoto, Japan & Bangkok" />

              <Text style={styles.inputLabel}>คติประจำใจ / คำคมประจำตัว (PERSONAL PHRASE)</Text>
              <TextInput style={[styles.textInput, styles.textAreaInput]} value={form.personalPhrase} onChangeText={(text) => setForm({ ...form, personalPhrase: text })} multiline numberOfLines={2} placeholder="เช่น “Design is intelligence made visible.”" />

              <Text style={styles.inputLabel}>ลายเซ็น / ลายเซ็นดิจิทัล (SIGNATURE)</Text>
              <TextInput style={styles.textInput} value={form.signature} onChangeText={(text) => setForm({ ...form, signature: text })} placeholder="เช่น Virgo Boonyarid" />

              <TouchableOpacity style={styles.btnSaveForm} onPress={handleSaveIdentity} activeOpacity={0.85}>
                <Text style={styles.btnSaveFormText}>บันทึกข้อมูลพาสปอร์ต</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C0B12' },

  // Top Segment Control
  topSegmentWrap: { alignItems: 'center', marginVertical: 10, paddingHorizontal: 20 },
  topSegment: { flexDirection: 'row', backgroundColor: '#42131D', borderRadius: 999, padding: 4, width: '100%' },
  segmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 999 },
  segmentBtnActive: { backgroundColor: '#FAF6EE', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  segmentText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#C8B0B5' },
  segmentTextActive: { fontFamily: 'Inter_600SemiBold', color: '#4A1521' },

  viewScrollContent: { paddingBottom: 40, alignItems: 'center' },

  // Main Deep Burgundy Fabric Background Container
  burgundyFabricBg: {
    width: width - 24,
    backgroundColor: '#3A0E17',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  fabricSubtleRibbing: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'transparent',
    opacity: 0.05,
  },

  // Vintage Passport Cards Common Style
  passportCard: {
    width: width - 52,
    backgroundColor: '#F7F2E6',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  topCardRotated: {
    transform: [{ rotate: '-1.8deg' }],
    marginBottom: -22,
    zIndex: 2,
  },
  bottomCardRotated: {
    transform: [{ rotate: '1.5deg' }],
    zIndex: 1,
  },

  cardDecorativeBorder: {
    borderWidth: 1,
    borderColor: '#C5B8A5',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FAF6EE',
    position: 'relative',
  },
  cornerFlourishTL: { position: 'absolute', top: 4, left: 4, width: 8, height: 8, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: '#7A6B58' },
  cornerFlourishTR: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderTopWidth: 1.5, borderRightWidth: 1.5, borderColor: '#7A6B58' },
  cornerFlourishBL: { position: 'absolute', bottom: 4, left: 4, width: 8, height: 8, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderColor: '#7A6B58' },
  cornerFlourishBR: { position: 'absolute', bottom: 4, right: 4, width: 8, height: 8, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: '#7A6B58' },

  // Top Card Elements
  topCardRow: { flexDirection: 'row', alignItems: 'center' },
  photoFrameWrap: { width: 105, height: 125, borderRadius: 6, padding: 3, backgroundColor: '#EFE8DA', borderWidth: 1, borderColor: '#C0B3A0', position: 'relative', overflow: 'hidden' },
  portraitPhoto: { width: '100%', height: '100%', borderRadius: 4, resizeMode: 'cover' },
  
  // Filter Overlay Effects for React Native Image
  grayscaleOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(30,25,20,0.5)',
    borderRadius: 4,
  },
  vintageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(120, 80, 40, 0.35)',
    borderRadius: 4,
  },
  grayscaleOverlayCircle: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(30,25,20,0.5)',
    borderRadius: 45,
  },
  vintageOverlayCircle: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(120, 80, 40, 0.35)',
    borderRadius: 45,
  },

  officialInkStamp: {
    position: 'absolute',
    bottom: -10,
    right: -14,
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: '#7A1C29',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(250,246,238,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-18deg' }],
    zIndex: 10,
  },
  stampInkText: { fontFamily: 'Inter_700Bold', fontSize: 7, color: '#7A1C29' },
  stampInkSub: { fontFamily: 'Inter_600SemiBold', fontSize: 6, color: '#7A1C29' },
  stampInkDate: { fontFamily: 'Inter_500Medium', fontSize: 6, color: '#7A1C29' },

  topCardTextCol: { flex: 1, marginLeft: 14 },
  passportHeaderTag: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#8C7A6B', letterSpacing: 1.2 },
  designerScriptTitle: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 38, color: '#3A271D', lineHeight: 40, marginTop: 2 },
  passportSubtextVertical: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: '#6A5649', letterSpacing: 3, marginTop: -4 },
  badgeLineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  goldBadge: { backgroundColor: '#EAD9C0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#C8B294' },
  goldBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 7, color: '#5A4637' },
  cardPassportNo: { fontFamily: 'Courier', fontSize: 9, color: '#7A6B58' },

  // Bottom Card Elements
  bottomCardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  smallPhotoWrap: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#C0B3A0', overflow: 'hidden', position: 'relative' },
  smallPortraitPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  designerScriptTitleSmall: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 22, color: '#3A271D', lineHeight: 24 },
  passportSubtextSmall: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#7A6B58', letterSpacing: 1 },

  // Structured Identity Table
  identityGridTable: { borderWidth: 1, borderColor: '#D8CEBE', borderRadius: 6, overflow: 'hidden', backgroundColor: '#FFFDF9' },
  tableRowHalf: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#D8CEBE' },
  tableRowFull: { padding: 6, borderBottomWidth: 1, borderBottomColor: '#D8CEBE' },
  tableCell: { padding: 6 },
  cellLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#8A7867', letterSpacing: 0.8 },
  cellValue: { fontFamily: 'Courier', fontSize: 10, color: '#2B1E17', marginTop: 1 },
  cellValueBold: { fontFamily: 'Courier', fontSize: 11, fontWeight: 'bold', color: '#2B1E17', marginTop: 1 },
  phraseItalicValue: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: '#3A271D', marginTop: 1 },
  signatureRow: { padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF4E8' },
  signatureText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 20, color: '#2B1E17' },

  // Action Button
  actionRow: { marginTop: 18, width: width - 52 },
  btnShareCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#7A1C29', paddingVertical: 13, borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  btnShareCardText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFF' },

  // Edit Identity Form
  editScrollContent: { padding: 20, paddingBottom: 40 },
  editCard: { backgroundColor: '#FAF6EE', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#D8CEBE' },
  editHeading: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 22, color: '#3A271D' },
  editSubheading: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#7A6B58', marginTop: 2, marginBottom: 16 },
  photoUploadSection: { alignItems: 'center', marginBottom: 16 },
  previewUploadPhoto: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#7A1C29' },
  btnChangePhoto: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: '#EAD9C0', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  btnChangePhotoText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#4A1521' },
  
  filterTitleLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#5A4637', marginTop: 14, marginBottom: 6 },
  filterPillRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  filterPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#EAE1D2', borderWidth: 1, borderColor: '#D8CEBE' },
  filterPillActive: { backgroundColor: '#7A1C29', borderColor: '#7A1C29' },
  filterPillText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#5A4637' },
  filterPillTextActive: { fontFamily: 'Inter_600SemiBold', color: '#FFF' },

  inputLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#5A4637', marginTop: 12, marginBottom: 4 },
  textInput: { backgroundColor: '#FFFDF9', borderWidth: 1, borderColor: '#D8CEBE', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#2B1E17' },
  textAreaInput: { height: 60, textAlignVertical: 'top' },
  btnSaveForm: { backgroundColor: '#7A1C29', paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginTop: 20 },
  btnSaveFormText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFF' },
});
