import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
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
import { FrostedGlassCard, FrostedGlassButton } from '../components/FrostedGlass';
import { OutlinedText } from '../components/OutlinedText';

const { width } = Dimensions.get('window');

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
        Alert.alert('Permission Denied', 'Please grant photo library access.');
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
      Alert.alert('Required Field', 'Please enter a name for the passport.');
      return;
    }
    setIdentity(form);
    setActiveTab('View');
    Alert.alert('Saved Successfully 🎉', 'Your personal passport details have been updated!');
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
        Alert.alert('Success', 'Passport card saved successfully!');
      }
    } catch (err) {
      console.log('Share passport error:', err);
      Alert.alert('Error', 'Unable to save or share passport card.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/dalmatian_bg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.container} edges={['top']}>
        
        {/* Header Title Section */}
        <View style={styles.headerTitleWrap}>
          <OutlinedText
            text="MY PROFILE & PASSPORT"
            style={styles.headerSubtitle}
            strokeColor="#FFFFFF"
            strokeWidth={3}
          />
          <OutlinedText
            text="Personal Pass & Info 🪪"
            style={styles.headerTitle}
            strokeColor="#FFFFFF"
            strokeWidth={4}
          />
        </View>

        {/* Top Segmented Switch */}
        <View style={styles.topSegmentWrap}>
          <View style={styles.topSegment}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'View' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('View')}
              activeOpacity={0.8}
            >
              <Feather name="credit-card" size={14} color={activeTab === 'View' ? Colors.freshlyRoasted : '#888'} />
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
              <Feather name="edit-3" size={14} color={activeTab === 'Edit' ? Colors.freshlyRoasted : '#888'} />
              <Text style={[styles.segmentText, activeTab === 'Edit' && styles.segmentTextActive]}>
                Edit Identity
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TAB 1: VISUAL DESIGNER PASSPORT VIEW */}
        {activeTab === 'View' ? (
          <ScrollView contentContainerStyle={styles.viewScrollContent} showsVerticalScrollIndicator={false}>
            {/* Main Visual Card Container (Frosted Glass Aesthetic Frame) */}
            <FrostedGlassCard style={styles.passportCardWrap} intensity={85}>
              <View ref={cardRef} collapsable={false} style={styles.cardRefInner}>
                
                {/* TOP CARD: Large Portrait + Elegant Calligraphy "Designer PASSPORT" */}
                <View style={[styles.passportCard, styles.topCardRotated]}>
                  <View style={styles.cardDecorativeBorder}>
                    <View style={styles.cornerFlourishTL} />
                    <View style={styles.cornerFlourishTR} />
                    <View style={styles.cornerFlourishBL} />
                    <View style={styles.cornerFlourishBR} />

                    <View style={styles.topCardRow}>
                      {/* Portrait Photo Frame with Official Stamp */}
                      <View style={styles.photoFrameWrap}>
                        <Image source={{ uri: identity.photoUri }} style={styles.portraitPhoto} />

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
            </FrostedGlassCard>

            {/* Action Bar (Save to Gallery / Share) */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.btnShareCard} onPress={handleSharePassportCard} activeOpacity={0.85}>
                <Feather name="download" size={16} color="#FFF" />
                <Text style={styles.btnShareCardText}>Save / Share Passport Card</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          /* TAB 2: EDIT IDENTITY FORM */
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.editScrollContent} showsVerticalScrollIndicator={false}>
              <FrostedGlassCard style={styles.editCard} intensity={90}>
                <Text style={styles.editHeading}>Edit Personal Passport Info ✍️</Text>
                <Text style={styles.editSubheading}>Customize your identity info and profile picture</Text>

                {/* Photo Upload Section */}
                <View style={styles.photoUploadSection}>
                  <View style={styles.previewUploadWrap}>
                    <Image source={{ uri: form.photoUri }} style={styles.previewUploadPhoto} />
                  </View>

                  <TouchableOpacity style={styles.btnChangePhoto} onPress={pickProfilePhoto} activeOpacity={0.8}>
                    <Feather name="camera" size={14} color={Colors.freshlyRoasted} />
                    <Text style={styles.btnChangePhotoText}>Change Profile Photo</Text>
                  </TouchableOpacity>
                </View>

                {/* Input Fields */}
                <Text style={styles.inputLabel}>FULL NAME (NAME)</Text>
                <TextInput style={styles.textInput} value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} placeholder="e.g. Virgo Boonyarid" placeholderTextColor="#A0A0A0" />

                <Text style={styles.inputLabel}>PROFESSION</Text>
                <TextInput style={styles.textInput} value={form.profession} onChangeText={(text) => setForm({ ...form, profession: text })} placeholder="e.g. UI/UX Designer & Mobile Dev" placeholderTextColor="#A0A0A0" />

                <Text style={styles.inputLabel}>CHARACTERISTIC</Text>
                <TextInput style={styles.textInput} value={form.characteristic} onChangeText={(text) => setForm({ ...form, characteristic: text })} placeholder="e.g. Creative • Minimalist • Explorer" placeholderTextColor="#A0A0A0" />

                <Text style={styles.inputLabel}>FAVORITE SERIES</Text>
                <TextInput style={styles.textInput} value={form.favoriteSeries} onChangeText={(text) => setForm({ ...form, favoriteSeries: text })} placeholder="e.g. Emily in Paris" placeholderTextColor="#A0A0A0" />

                <Text style={styles.inputLabel}>FAVORITE PLACE</Text>
                <TextInput style={styles.textInput} value={form.favoritePlace} onChangeText={(text) => setForm({ ...form, favoritePlace: text })} placeholder="e.g. Kyoto, Japan & Bangkok" placeholderTextColor="#A0A0A0" />

                <Text style={styles.inputLabel}>PERSONAL PHRASE</Text>
                <TextInput style={[styles.textInput, styles.textAreaInput]} value={form.personalPhrase} onChangeText={(text) => setForm({ ...form, personalPhrase: text })} multiline numberOfLines={2} placeholder="e.g. “Design is intelligence made visible.”" placeholderTextColor="#A0A0A0" />

                <Text style={styles.inputLabel}>SIGNATURE</Text>
                <TextInput style={styles.textInput} value={form.signature} onChangeText={(text) => setForm({ ...form, signature: text })} placeholder="e.g. Virgo Boonyarid" placeholderTextColor="#A0A0A0" />

                <TouchableOpacity style={styles.btnSaveForm} onPress={handleSaveIdentity} activeOpacity={0.85}>
                  <Text style={styles.btnSaveFormText}>Save Passport Details</Text>
                </TouchableOpacity>
              </FrostedGlassCard>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  backgroundOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(250, 246, 240, 0.45)' },
  container: { flex: 1 },

  // Header Title
  headerTitleWrap: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
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

  // Top Segment Control
  topSegmentWrap: { alignItems: 'center', marginVertical: 10, paddingHorizontal: 20 },
  topSegment: { flexDirection: 'row', backgroundColor: 'rgba(186, 221, 127, 0.35)', borderRadius: 999, padding: 3, width: '100%' },
  segmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 999 },
  segmentBtnActive: { backgroundColor: '#66023C', shadowColor: '#66023C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  segmentText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#391D01' },
  segmentTextActive: { fontFamily: 'Inter_600SemiBold', color: '#CAD183' },

  viewScrollContent: { paddingBottom: 40, alignItems: 'center', paddingHorizontal: 16 },

  // Passport Main Frame Wrap
  passportCardWrap: {
    width: width - 32,
    padding: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
  },
  cardRefInner: {
    width: '100%',
    alignItems: 'center',
  },

  // Vintage Passport Cards Common Style
  passportCard: {
    width: width - 56,
    backgroundColor: '#F7F2E6',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
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
  photoFrameWrap: { width: 100, height: 120, borderRadius: 6, padding: 3, backgroundColor: '#EFE8DA', borderWidth: 1, borderColor: '#C0B3A0', position: 'relative', overflow: 'hidden' },
  portraitPhoto: { width: '100%', height: '100%', borderRadius: 4, resizeMode: 'cover' },

  officialInkStamp: {
    position: 'absolute',
    bottom: -10,
    right: -14,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#66023C',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(202, 209, 131, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-18deg' }],
    zIndex: 10,
  },
  stampInkText: { fontFamily: 'Inter_700Bold', fontSize: 7, color: '#66023C' },
  stampInkSub: { fontFamily: 'Inter_600SemiBold', fontSize: 6, color: '#66023C' },
  stampInkDate: { fontFamily: 'Inter_500Medium', fontSize: 6, color: '#66023C' },

  topCardTextCol: { flex: 1, marginLeft: 14 },
  passportHeaderTag: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#8C7A6B', letterSpacing: 1.2 },
  designerScriptTitle: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 36, color: '#391D01', lineHeight: 38, marginTop: 2 },
  passportSubtextVertical: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: '#6A5649', letterSpacing: 3, marginTop: -4 },
  badgeLineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  goldBadge: { backgroundColor: '#BADD7F', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#66023C' },
  goldBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 7, color: '#391D01' },
  cardPassportNo: { fontFamily: 'Courier', fontSize: 9, color: '#391D01' },

  // Bottom Card Elements
  bottomCardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  smallPhotoWrap: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#C0B3A0', overflow: 'hidden', position: 'relative' },
  smallPortraitPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  designerScriptTitleSmall: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 22, color: '#391D01', lineHeight: 24 },
  passportSubtextSmall: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#7A6B58', letterSpacing: 1 },

  // Structured Identity Table
  identityGridTable: { borderWidth: 1, borderColor: '#D8CEBE', borderRadius: 6, overflow: 'hidden', backgroundColor: '#FFFDF9' },
  tableRowHalf: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#D8CEBE' },
  tableRowFull: { padding: 6, borderBottomWidth: 1, borderBottomColor: '#D8CEBE' },
  tableCell: { padding: 6 },
  cellLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#8A7867', letterSpacing: 0.8 },
  cellValue: { fontFamily: 'Courier', fontSize: 10, color: '#2B1E17', marginTop: 1 },
  cellValueBold: { fontFamily: 'Courier', fontSize: 11, fontWeight: 'bold', color: '#2B1E17', marginTop: 1 },
  phraseItalicValue: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: Colors.freshlyRoasted, marginTop: 1 },
  signatureRow: { padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF4E8' },
  signatureText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 20, color: Colors.freshlyRoasted },

  // Action Button
  actionRow: { marginTop: 18, width: width - 52 },
  btnShareCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#66023C', paddingVertical: 14, borderRadius: 999, shadowColor: '#66023C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  btnShareCardText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#CAD183' },

  // Edit Identity Form
  editScrollContent: { padding: 20, paddingBottom: 40 },
  editCard: { padding: 20, borderRadius: 24, backgroundColor: 'rgba(250, 246, 240, 0.92)' },
  editHeading: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 22, color: '#391D01' },
  editSubheading: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#391D01', marginTop: 2, marginBottom: 16 },
  photoUploadSection: { alignItems: 'center', marginBottom: 16 },
  previewUploadWrap: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#66023C', overflow: 'hidden' },
  previewUploadPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  btnChangePhoto: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: 'rgba(186, 221, 127, 0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(102, 2, 60, 0.2)' },
  btnChangePhotoText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#391D01' },

  inputLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#391D01', marginTop: 12, marginBottom: 6 },
  textInput: { backgroundColor: 'rgba(186, 221, 127, 0.25)', borderWidth: 1, borderColor: 'rgba(102, 2, 60, 0.2)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#391D01', shadowColor: '#391D01', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  textAreaInput: { height: 70, textAlignVertical: 'top' },
  btnSaveForm: { backgroundColor: '#66023C', paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginTop: 20, shadowColor: '#66023C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  btnSaveFormText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#CAD183' },
});
