import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Clipboard, PermissionsAndroid, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { useFonts } from 'expo-font';
import Animated, {
  FadeIn, FadeInDown, FadeOut, Layout, ZoomIn,
  useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';

// ── BLE Manager init ──────────────────────────────────────────────────────────
let _manager: BleManager | null = null;
try {
  _manager = new BleManager();
} catch (e) { console.log('Failed to init BleManager:', e); }

// Safe proxy: all calls are no-ops if manager failed to initialize
const manager: Pick<BleManager,
  'startDeviceScan' | 'stopDeviceScan' | 'connectToDevice' |
  'cancelDeviceConnection' | 'onDeviceDisconnected' |
  'monitorCharacteristicForDevice'
> & {
  readCharacteristicForDevice: BleManager['readCharacteristicForDevice'];
  writeCharacteristicWithResponseForDevice: BleManager['writeCharacteristicWithResponseForDevice'];
  writeCharacteristicWithoutResponseForDevice: BleManager['writeCharacteristicWithoutResponseForDevice'];
} = new Proxy({} as any, {
  get(_: any, prop: string) {
    if (_manager && prop in _manager) {
      const val = (_manager as any)[prop];
      return typeof val === 'function' ? val.bind(_manager) : val;
    }
    return () => { console.warn(`BleManager.${prop} called but manager not ready`); };
  }
});

const SERVICE_UUID    = 'aee04821-1973-4e1f-a590-e84b10d580e7';
const CHAR_UUID       = 'cde07b1a-889b-44b7-a99f-c888dddac729';
const CHAR_UUID_NOTIFY = CHAR_UUID;
const HISTORY_KEY     = '@gradeally_history';

type HistoryItem = { id: string; name: string; result: string; timestamp: string };

// ── Typewriter Text Component ─────────────────────────────────────────────────
function TypewriterText({ text, speed = 35, style }: { text: string; speed?: number; style?: any }) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <Text style={style}>
      {displayedText}
      <Text style={{ opacity: showCursor ? 1 : 0, color: '#F472B6' }}>▌</Text>
    </Text>
  );
}

// ── Sparkling / Twinkling Background ──────────────────────────────────────────
function SingleSparkle({ top, left, size, delay, symbol }: { top: number; left: number; size: number; delay: number; symbol: string }) {
  const opacity = useSharedValue(0.2);
  const scale   = useSharedValue(0.6);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.95, { duration: 1300 }),
          withTiming(0.2, { duration: 1300 })
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1300 }),
          withTiming(0.6, { duration: 1300 })
        ),
        -1,
        true
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text
      style={[
        {
          position: 'absolute',
          top: `${top}%`,
          left: `${left}%`,
          fontSize: size,
          color: '#FBCFE8',
        },
        animStyle,
      ]}
    >
      {symbol}
    </Animated.Text>
  );
}

function SparklesBackground() {
  const sparkles = [
    { top: 5, left: 8, size: 16, delay: 0, symbol: '✨' },
    { top: 12, left: 82, size: 20, delay: 350, symbol: '✨' },
    { top: 22, left: 45, size: 12, delay: 650, symbol: '✦' },
    { top: 28, left: 88, size: 14, delay: 150, symbol: '✧' },
    { top: 38, left: 12, size: 18, delay: 450, symbol: '✨' },
    { top: 48, left: 78, size: 12, delay: 200, symbol: '✦' },
    { top: 58, left: 22, size: 15, delay: 700, symbol: '✨' },
    { top: 68, left: 85, size: 20, delay: 100, symbol: '✨' },
    { top: 78, left: 8, size: 14, delay: 500, symbol: '✦' },
    { top: 88, left: 62, size: 16, delay: 300, symbol: '✧' },
    { top: 18, left: 28, size: 14, delay: 800, symbol: '✦' },
    { top: 82, left: 35, size: 18, delay: 250, symbol: '✨' },
    { top: 62, left: 92, size: 12, delay: 400, symbol: '✧' },
  ];

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {sparkles.map((s, idx) => (
        <SingleSparkle key={idx} {...s} />
      ))}
    </View>
  );
}

// ── Primary Pill Button ───────────────────────────────────────────────────────
function PillButton({
  onPress, label, icon, loading = false, disabled = false,
  variant = 'primary',
}: {
  onPress: () => void; label: string;
  icon?: React.ReactNode;
  loading?: boolean; disabled?: boolean;
  variant?: 'primary' | 'danger' | 'ghost';
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled || loading ? 0.5 : 1,
  }));
  const bg =
    variant === 'danger' ? '#BE123C' :
    variant === 'ghost'  ? 'rgba(255,255,255,0.12)' :
    '#F472B6'; // Soft sweet pink from image

  const textColor =
    variant === 'danger' ? '#FFFFFF' :
    variant === 'ghost'  ? '#FBCFE8' :
    '#2D031A'; // Dark maroon text from reference image

  return (
    <Animated.View style={[animStyle, { borderRadius: 50, overflow: 'hidden' }]}>
      <Pressable
        disabled={disabled || loading}
        onPressIn={() => { scale.value = withSpring(0.91, { damping: 20, stiffness: 400, mass: 0.4 }); }}
        onPressOut={() => { scale.value = withSpring(1,    { damping: 20, stiffness: 400, mass: 0.4 }); }}
        onPress={onPress}
        style={[styles.pillBtn, { backgroundColor: bg }]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <>
            {icon && <View style={styles.pillBtnIcon}>{icon}</View>}
            <Text style={[styles.pillBtnLabel, { color: textColor }]}>
              {label}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ── Icon Chip Button (Copy / Share) ───────────────────────────────────────────
function ChipButton({
  onPress, label, icon, active = false,
}: { onPress: () => void; label: string; icon: React.ReactNode; active?: boolean }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animStyle, { flex: 1 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.88, { damping: 20, stiffness: 400, mass: 0.4 }); }}
        onPressOut={() => { scale.value = withSpring(1,    { damping: 20, stiffness: 400, mass: 0.4 }); }}
        onPress={onPress}
        style={[styles.chipBtn, active && styles.chipBtnActive]}
      >
        {icon}
        <Text style={[styles.chipBtnLabel, active && { color: '#fff' }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Friendly Error Banner ─────────────────────────────────────────────────────
function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.errorBanner}>
      <Feather name="alert-circle" size={18} color="#FF6B6B" />
      <Text style={styles.errorBannerText}>{message}</Text>
      <TouchableOpacity onPress={onDismiss}>
        <Feather name="x" size={18} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Grade Result Card ─────────────────────────────────────────────────────────
function GradeResultCard({ rawData, isReading }: { rawData: string; isReading: boolean }) {
  if (isReading) {
    return (
      <View style={[styles.dataBox, { minHeight: 120 }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F472B6" />
          <TypewriterText text="🔮 กำลังประมวลผล..." style={styles.loadingText} />
        </View>
      </View>
    );
  }

  if (!rawData) {
    return (
      <View style={styles.dataBox}>
        <TypewriterText text="ยังไม่มีข้อมูลที่อ่านเข้ามา ☁️" style={styles.dataText} />
      </View>
    );
  }

  // Parse logic: e.g. "Read Value: John Doe - Your grade is D."
  const match = rawData.match(/grade is\s*([A-F][+-]?)/i);
  const grade = match ? match[1].toUpperCase() : null;
  let name = "";
  if (rawData.includes('-')) {
     name = rawData.split('-')[0].replace('Read Value:', '').trim();
  }

  if (!grade) {
     return (
        <View style={styles.dataBox}>
          <TypewriterText text={rawData} style={styles.dataText} />
        </View>
     );
  }

  let color = '#FFF';
  let emoji = '🎓';
  if (grade.startsWith('A')) { color = '#4ADE80'; emoji = '🌟'; } // Jungle Green
  else if (grade.startsWith('B')) { color = '#FBBF24'; emoji = '👍'; } // Safari Gold
  else if (grade.startsWith('C')) { color = '#FB923C'; emoji = '👌'; } // Sunset Orange
  else if (grade.startsWith('D')) { color = '#F87171'; emoji = '😅'; } // Clay Red
  else if (grade.startsWith('F')) { color = '#B91C1C'; emoji = '💔'; } // Dark Blood

  return (
    <Animated.View entering={ZoomIn.springify().damping(12).stiffness(200)} style={[styles.gradeCard, { borderColor: 'rgba(244, 114, 182, 0.4)' }]}>
       <View style={[styles.gradeCircle, { backgroundColor: 'rgba(244, 114, 182, 0.15)', borderColor: 'rgba(244, 114, 182, 0.35)' }]}>
          <Text style={[styles.gradeLetter, { color: color }]}>{grade}</Text>
       </View>
       <View style={{ flex: 1 }}>
          <Text style={styles.gradeCardName}>{name || 'Student'}</Text>
          <TypewriterText text={`${emoji} ผลการทำนายเกรดของคุณคือ ${grade}`} style={styles.gradeCardMsg} />
       </View>
    </Animated.View>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Index() {
  const [fontsLoaded] = useFonts({
    'PixelifySans': require('../../assets/fonts/PixelifySans-Bold.ttf'),
    'Pixelify Sans': require('../../assets/fonts/PixelifySans-Bold.ttf'),
    'PixelifySans-Bold': require('../../assets/fonts/PixelifySans-Bold.ttf'),
    'PixelifySans-Regular': require('../../assets/fonts/PixelifySans-Bold.ttf'),
    'Mitr': require('../../assets/fonts/Mitr-ExtraLight.ttf'),
    'Mitr-ExtraLight': require('../../assets/fonts/Mitr-ExtraLight.ttf'),
    'Mitr ExtraLight': require('../../assets/fonts/Mitr-ExtraLight.ttf'),
    'Mitr-Regular': require('../../assets/fonts/Mitr-Regular.ttf'),
  });

  const [devices, setDevices]               = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [receivedData, setReceivedData]     = useState<string>('');
  const [lastUpdated, setLastUpdated]       = useState<string>('');
  const [writeValue, setWriteValue]         = useState<string>('');
  const [history, setHistory]               = useState<HistoryItem[]>([]);
  const [isReading, setIsReading]           = useState(false);
  const [isSending, setIsSending]           = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [errorMsg, setErrorMsg]             = useState('');
  const [mockGrade, setMockGrade]           = useState<string>('Read Value: Student Demo - Your grade is A.');
  
  // Debug Log State
  const [isDebugOpen, setIsDebugOpen]       = useState(false);
  const [debugLogs, setDebugLogs]           = useState<{time: string, type: 'TX' | 'RX' | 'INFO' | 'ERR', data: string}[]>([]);

  useEffect(() => { loadHistory(); }, []);

  const showError = (msg: string) => { setErrorMsg(msg); };
  const clearError = () => setErrorMsg('');

  const addDebugLog = (type: 'TX' | 'RX' | 'INFO' | 'ERR', data: string) => {
    const time = new Date().toISOString().split('T')[1].slice(0, 12); // HH:mm:ss.SSS
    setDebugLogs(prev => [{time, type, data}, ...prev].slice(0, 50));
  };

  // ── History helpers ──────────────────────────────────────────────────────
  const loadHistory = async () => {
    try {
      const json = await AsyncStorage.getItem(HISTORY_KEY);
      if (json) setHistory(JSON.parse(json));
    } catch { }
  };
  const saveHistory = async (items: HistoryItem[]) => {
    try { await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items)); } catch { }
  };
  const addHistory = (name: string, result: string) => {
    const now  = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setLastUpdated(`Last updated ${time}`);
    const item: HistoryItem = {
      id: Date.now().toString(), name, result,
      timestamp: now.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    };
    const next = [item, ...history].slice(0, 50);
    setHistory(next);
    saveHistory(next);
  };
  const clearHistory = () => {
    setHistory([]);
    AsyncStorage.removeItem(HISTORY_KEY);
  };

  // ── Copy ─────────────────────────────────────────────────────────────────
  const handleCopy = () => {
    if (!receivedData) { showError("There's nothing to copy yet. Read a value first!"); return; }
    Clipboard.setString(receivedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Permissions ──────────────────────────────────────────────────────────
  async function requestPermissions() {
    manager.stopDeviceScan();
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        const g = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          g['android.permission.BLUETOOTH_SCAN']    === PermissionsAndroid.RESULTS.GRANTED &&
          g['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          g['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
      const g = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      return g === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  useEffect(() => {
    requestPermissions();
    return () => { manager.stopDeviceScan(); };
  }, []);

  // ── BLE Actions ──────────────────────────────────────────────────────────
  const startScan = () => {
    setDevices([]);
    addDebugLog('INFO', 'Started scanning for BLE devices...');
    manager.startDeviceScan(null, null, (error: any, device: any) => {
      if (error) { 
        showError('Bluetooth is unavailable on iOS Simulator. Loaded Demo Devices for testing.'); 
        addDebugLog('ERR', `Scan error (Simulator/No BLE): ${error.message}`);
        // Fallback: Provide Mock Devices for Simulator testing
        const mockDevs: any[] = [
          { id: 'MOCK-ESP32-01', name: 'GradeAlly ESP32 (Demo)', isMock: true },
          { id: 'MOCK-NRF52-02', name: 'nRF52-BLE Sensor (Demo)', isMock: true },
        ];
        setDevices(mockDevs);
        return; 
      }
      if (device?.name)
        setDevices((p) => p.some((d) => d.id === device.id) ? p : [...p, device]);
    });
  };

  const connectToDevice = async (device: any) => {
    manager.stopDeviceScan();
    addDebugLog('INFO', `Connecting to ${device.id}...`);
    if (device.isMock) {
      setTimeout(() => {
        setConnectedDevice(device);
        addDebugLog('INFO', `Connected to ${device.name} (Demo Mode)`);
      }, 500);
      return;
    }
    try {
      const connected  = await manager.connectToDevice(device.id);
      const discovered = await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(discovered);
      addDebugLog('INFO', `Connected to ${device.name || device.id}`);
      manager.onDeviceDisconnected(device.id, () => {
        showError('Device disconnected unexpectedly.');
        addDebugLog('ERR', `Disconnected from ${device.id}`);
        setConnectedDevice(null);
      });
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('peer removed pairing') || msg.includes('Connection failed') || msg.includes('Encryption') || msg.includes('GATT')) {
        showError(`Could not connect to ${device.name || 'device'}. (Smartwatches & Macs block raw GATT connections — connect to an ESP32/BLE board).`);
      } else {
        showError(`Could not connect to ${device.name || 'device'}: ${msg || 'Please try again.'}`);
      }
      addDebugLog('ERR', `Connection failed: ${msg}`);
    }
  };

  const readCharacteristic = async () => {
    if (!connectedDevice) return;
    setIsReading(true);
    clearError();
    addDebugLog('INFO', `Reading from ${CHAR_UUID}...`);

    if ((connectedDevice as any).isMock) {
      setTimeout(() => {
        const demoData = mockGrade;
        addDebugLog('RX', `[Demo Mode] -> [UTF-8] ${demoData}`);
        setReceivedData(demoData);
        addHistory('read', demoData);
        setIsReading(false);
      }, 800);
      return;
    }

    try {
      let char: any;
      try {
        char = await manager.readCharacteristicForDevice(connectedDevice.id, SERVICE_UUID, CHAR_UUID);
      } catch (err: any) {
        if (err?.message?.includes('not found') || err?.reason?.includes('not found')) {
          addDebugLog('INFO', 'Characteristic not found in cache. Re-discovering services...');
          await manager.discoverAllServicesAndCharacteristicsForDevice(connectedDevice.id);
          char = await manager.readCharacteristicForDevice(connectedDevice.id, SERVICE_UUID, CHAR_UUID);
        } else {
          throw err;
        }
      }

      const rawData = Buffer.from(char.value || '', 'base64').toString('utf-8');
      addDebugLog('RX', `[Base64] ${char.value} -> [UTF-8] ${rawData}`);
      setReceivedData(rawData);
      addHistory('read', rawData);
    } catch (error: any) {
      showError(`Couldn't read data — ${error.reason || error.message || 'please check device connection.'}`);
      addDebugLog('ERR', `Read failed: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsReading(false);
    }
  };

  const writeCharacteristic = async () => {
    if (!connectedDevice) return;
    if (!writeValue.trim()) {
      showError('Please enter a name or value before sending.');
      return;
    }
    setIsSending(true);
    clearError();

    const valueToSend = writeValue;

    if ((connectedDevice as any).isMock) {
      setTimeout(() => {
        const b64 = Buffer.from(valueToSend, 'utf-8').toString('base64');
        addDebugLog('TX', `[UTF-8] ${valueToSend} -> [Base64] ${b64}`);
        setMockGrade(`Read Value: ${valueToSend} - Your grade is A.`);
        addHistory(`send:${valueToSend}`, '✓ Sent (Tap Read Value to view grade)');
        setWriteValue('');
        setIsSending(false);
        addDebugLog('INFO', '[Demo Mode] Data sent! Tap "Read Value" button to fetch grade.');
      }, 600);
      return;
    }

    try {
      const b64 = Buffer.from(valueToSend, 'utf-8').toString('base64');
      addDebugLog('TX', `[UTF-8] ${valueToSend} -> [Base64] ${b64}`);

      // Try re-discovering if first call fails with 'not found'
      let sent = false;
      try {
        await manager.writeCharacteristicWithResponseForDevice(connectedDevice.id, SERVICE_UUID, CHAR_UUID, b64);
        sent = true;
        addDebugLog('INFO', 'Sent with response.');
      } catch (err1: any) {
        if (err1?.message?.includes('not found')) {
          addDebugLog('INFO', 'Re-discovering services for write...');
          await manager.discoverAllServicesAndCharacteristicsForDevice(connectedDevice.id);
        }
        addDebugLog('INFO', `WithResponse failed (${err1?.message}), trying WithoutResponse...`);
        await manager.writeCharacteristicWithoutResponseForDevice(connectedDevice.id, SERVICE_UUID, CHAR_UUID, b64);
        sent = true;
        addDebugLog('INFO', 'Sent without response.');
      }

      if (sent) {
        addHistory(`send:${valueToSend}`, '✓ Sent');
        setWriteValue('');
        addDebugLog('INFO', 'Data sent to device successfully. Tap "Read Value" button to see your predicted grade.');
      }
    } catch (error: any) {
      showError(`Send failed 😕 — ${error.reason || error.message || 'The device may be busy or disconnected.'}`);
      addDebugLog('ERR', `Write failed: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsSending(false);
    }
  };

  const startNotify = () => {
    if (!connectedDevice) return;
    addDebugLog('INFO', `Subscribing to ${CHAR_UUID_NOTIFY}...`);
    if ((connectedDevice as any).isMock) {
      addDebugLog('INFO', '[Demo Mode] Subscribed to notifications.');
      return;
    }
    manager.monitorCharacteristicForDevice(connectedDevice.id, SERVICE_UUID, CHAR_UUID_NOTIFY,
      (error: any, char: any) => {
        if (error) {
          addDebugLog('ERR', `Notify error: ${error.message}`);
          return;
        }
        if (char?.value) {
          const raw = Buffer.from(char.value, 'base64').toString('utf-8');
          addDebugLog('RX', `[Notify] Base64: ${char.value} -> UTF-8: ${raw}`);
          setReceivedData(raw);
          addHistory('(notify)', raw);
        }
      });
  };

  const disconnect = async () => {
    if (!connectedDevice) return;
    addDebugLog('INFO', `Disconnecting from ${connectedDevice.id}...`);
    await manager.cancelDeviceConnection(connectedDevice.id);
    setConnectedDevice(null);
    setReceivedData('');
    setLastUpdated('');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#140610', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F472B6" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Image source={require('../../assets/images/background.jpg')} style={styles.bgImage} contentFit="cover" />
      <View style={styles.overlay} />
      <SparklesBackground />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.headerRow}>
          <Text style={styles.headerTitle}>GradeAlly</Text>
          <Text style={styles.headerSub}>🎓  BLE Grade Predictor</Text>
        </Animated.View>

        {/* Error Banner */}
        {errorMsg ? <ErrorBanner message={errorMsg} onDismiss={clearError} /> : null}

        {/* ── SCAN SCREEN ── */}
        {!connectedDevice ? (
          <Animated.View layout={Layout} style={{ gap: 12, marginTop: 8 }}>
            <PillButton
              label="Scan Devices"
              icon={<Feather name="bluetooth" size={18} color="#2D031A" />}
              onPress={startScan}
            />
            {devices.length === 0 && (
              <TypewriterText text="กด Scan เพื่อค้นหาอุปกรณ์ BLE ในบริเวณใกล้เคียง" style={styles.emptyText} />
            )}
            {devices.map((item, idx) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(100 * (idx + 1)).duration(400)}>
                <TouchableOpacity style={styles.deviceCard} onPress={() => connectToDevice(item)}>
                  <View style={styles.deviceCardInner}>
                    <View style={styles.bleIcon}>
                      <Ionicons name="bluetooth" size={20} color="#F472B6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
                      <Text style={styles.deviceInfoText} numberOfLines={1}>{item.id}</Text>
                    </View>
                    <View style={styles.rssiBadge}>
                      <Text style={styles.rssiText}>{item.rssi} dBm</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        ) : (
          /* ── DASHBOARD ── */
          <Animated.View layout={Layout} style={{ gap: 14 }}>

            {/* Disconnect / Back Button */}
            <Animated.View entering={FadeInDown.delay(50).duration(500)}>
              <PillButton
                label="← Disconnect"
                icon={<Feather name="x-circle" size={18} color="#fff" />}
                variant="danger"
                onPress={disconnect}
              />
            </Animated.View>

            {/* Status Card */}
            <Animated.View entering={FadeInDown.delay(120).duration(500)}>
              <View style={styles.statusCard}>
                <View style={styles.statusDotRow}>
                  <View style={styles.dot} />
                  <Text style={styles.statusLabel}>CONNECTED</Text>
                </View>
                <Text style={styles.statusName}>{connectedDevice.name || 'Unknown'}</Text>
              </View>
            </Animated.View>

            {/* Result Card */}
            <Animated.View entering={FadeInDown.delay(220).duration(500)}>
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <MaterialCommunityIcons name="chart-bar" size={18} color="#F472B6" />
                  <Text style={styles.cardTitle}>Prediction Result</Text>
                </View>

                {/* Data Display */}
                <GradeResultCard rawData={receivedData} isReading={isReading} />

                {/* Last Updated */}
                {lastUpdated ? (
                  <View style={styles.lastUpdatedRow}>
                    <Feather name="clock" size={12} color="rgba(251,207,232,0.6)" />
                    <Text style={styles.lastUpdatedText}>{lastUpdated}</Text>
                  </View>
                ) : null}

                {/* Read Button */}
                <PillButton
                  label={isReading ? 'Reading...' : 'Read Value'}
                  icon={<Feather name="download" size={18} color="#2D031A" />}
                  loading={isReading}
                  onPress={readCharacteristic}
                />
              </View>
            </Animated.View>

            {/* Action Row */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <View style={styles.chipRow}>
                <ChipButton
                  label={copied ? 'Copied' : 'Copy'}
                  icon={<Feather name={copied ? 'check' : 'copy'} size={14} color={copied ? '#fff' : '#F472B6'} />}
                  onPress={handleCopy}
                  active={copied}
                />
              </View>
            </Animated.View>

            {/* Send Card */}
            <Animated.View entering={FadeInDown.delay(380).duration(500)}>
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Feather name="send" size={16} color="#F472B6" />
                  <Text style={styles.cardTitle}>Send Data</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={writeValue}
                  onChangeText={(t) => { setWriteValue(t); clearError(); }}
                  placeholder="พิมพ์ชื่อของคุณและเพื่อนที่นี่..."
                  placeholderTextColor="rgba(251,207,232,0.4)"
                  returnKeyType="send"
                  onSubmitEditing={writeCharacteristic}
                />
                <PillButton
                  label={isSending ? 'Sending...' : 'Send'}
                  icon={<Feather name="arrow-up-circle" size={18} color="#2D031A" />}
                  loading={isSending}
                  onPress={writeCharacteristic}
                />
              </View>
            </Animated.View>

            {/* BLE Debug Console (Collapsible) */}
            <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
              <Pressable onPress={() => setIsDebugOpen(!isDebugOpen)} style={styles.debugHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="terminal" size={16} color="#4ADE80" />
                  <Text style={styles.debugTitle}>BLE Debug Console</Text>
                </View>
                <Feather name={isDebugOpen ? "chevron-up" : "chevron-down"} size={18} color="rgba(255,220,150,0.6)" />
              </Pressable>
              {isDebugOpen && (
                <View style={styles.debugContent}>
                  {debugLogs.length === 0 ? (
                    <Text style={styles.debugText}>No logs yet.</Text>
                  ) : (
                    debugLogs.map((log, i) => {
                      const color = log.type === 'TX' ? '#FBBF24' : log.type === 'RX' ? '#4ADE80' : log.type === 'ERR' ? '#F87171' : '#60A5FA';
                      return (
                        <Text key={i} style={styles.debugText}>
                          <Text style={{ color: 'rgba(255,255,255,0.4)' }}>[{log.time}] </Text>
                          <Text style={{ color }}>[{log.type}] </Text>
                          {log.data}
                        </Text>
                      );
                    })
                  )}
                </View>
              )}
            </View>

            {/* History Card */}
            <View style={styles.card}>
              <View style={[styles.cardTitleRow, { justifyContent: 'space-between' }]}>
                <View style={styles.cardTitleRow}>
                  <Feather name="list" size={16} color="#FFD580" />
                  <Text style={styles.cardTitle}>Prediction History</Text>
                </View>
                {history.length > 0 && (
                  <TouchableOpacity onPress={clearHistory} style={styles.clearBtn}>
                    <Feather name="trash-2" size={14} color="#FF8A80" />
                    <Text style={styles.clearBtnText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
              {history.length === 0 ? (
                <Text style={styles.emptyText}>No history yet</Text>
              ) : (
                <ScrollView nestedScrollEnabled style={{ maxHeight: 250, marginHorizontal: -20, paddingHorizontal: 20 }}>
                  {history.map((item) => {
                    const isSend = item.name.startsWith('send:');
                    const title = isSend ? item.name.replace('send:', '') : 'Received Data';
                    const iconName = isSend ? 'arrow-up-circle' : 'download-cloud';
                    const iconColor = isSend ? '#FBBF24' : '#4ADE80';
                    
                    return (
                      <View key={item.id} style={styles.historyItem}>
                        <View style={styles.historyTopRow}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                            <Feather name={iconName} size={14} color={iconColor} />
                            <Text style={styles.historyName} numberOfLines={1}>{title}</Text>
                          </View>
                          <Text style={styles.historyTime}>{item.timestamp}</Text>
                        </View>
                        <View style={[styles.historyBadge, item.result.includes('✓') && styles.historyBadgeSuccess]}>
                          <Text style={styles.historyResult}>{item.result}</Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Footer */}
            <PillButton
              label="Subscribe to Notifications"
              icon={<Feather name="bell" size={18} color="#888" />}
              disabled
              onPress={startNotify}
              variant="ghost"
            />
            <PillButton
              label="Disconnect"
              icon={<MaterialCommunityIcons name="bluetooth-off" size={18} color="#fff" />}
              onPress={disconnect}
              variant="danger"
            />

          </Animated.View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// ─── Styles ──────────────────────────────────────────────────────────────────
const CREAM   = '#FDF2F8';
const CARD_BG = 'rgba(48, 22, 32, 0.52)';
const BORDER  = 'rgba(244, 114, 182, 0.38)';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#14080F' },
  bgImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 1 },
  overlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(30, 14, 22, 0.52)' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 72, paddingHorizontal: 18, paddingBottom: 20, gap: 14 },

  // Header
  headerRow: { alignItems: 'center', marginBottom: 6 },
  headerTitle: { fontFamily: 'PixelifySans', fontSize: 44, color: '#F472B6', letterSpacing: -0.5 },
  headerSub: { fontFamily: 'Mitr-ExtraLight', fontSize: 14, color: '#FBCFE8', marginTop: 4 },

  // Error Banner
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(180, 30, 30, 0.6)', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,100,100,0.3)',
  },
  errorBannerText: { flex: 1, color: '#FFD0D0', fontFamily: 'Mitr-ExtraLight', fontSize: 13 },

  // Pill Button
  pillBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, paddingHorizontal: 26, borderRadius: 50,
    shadowColor: '#9D174D', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.45, shadowRadius: 8, elevation: 5,
  },
  pillBtnIcon: {},
  pillBtnLabel: { fontFamily: 'PixelifySans', fontSize: 18, letterSpacing: 0.5 },

  // Chip Button
  chipRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 4 },
  chipBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    paddingVertical: 12, borderRadius: 50,
    backgroundColor: 'rgba(48, 14, 34, 0.72)', borderWidth: 1, borderColor: BORDER,
  },
  chipBtnActive: { backgroundColor: '#DB2777', borderColor: 'transparent' },
  chipBtnLabel: { color: '#FBCFE8', fontFamily: 'PixelifySans', fontSize: 14 },

  // Cards
  card: {
    backgroundColor: CARD_BG, borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 6,
    gap: 12,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontFamily: 'PixelifySans', fontSize: 17, color: CREAM, letterSpacing: 0.2 },

  // Status
  statusCard: {
    backgroundColor: 'rgba(180, 25, 90, 0.65)', borderRadius: 24, paddingVertical: 20, paddingHorizontal: 20,
    alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255, 182, 218, 0.45)',
  },
  statusDotRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  statusLabel: { fontFamily: 'PixelifySans', fontSize: 13, color: '#FBCFE8', letterSpacing: 2, textTransform: 'uppercase' },
  statusName: { fontFamily: 'PixelifySans', fontSize: 28, color: '#FFFFFF' },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#4EE88A' },

  // Data display & Grade Card
  dataBox: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 18,
    alignItems: 'center', minHeight: 72, justifyContent: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  dataText: { fontFamily: 'Mitr-ExtraLight', fontSize: 16, color: CREAM, textAlign: 'center' },
  
  gradeCard: {
    backgroundColor: 'rgba(48, 12, 34, 0.75)', borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderWidth: 2,
  },
  gradeCircle: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center'
  },
  gradeLetter: { fontFamily: 'PixelifySans', fontSize: 36 },
  gradeCardName: { fontFamily: 'PixelifySans', fontSize: 20, color: CREAM, marginBottom: 4 },
  gradeCardMsg: { fontFamily: 'Mitr-ExtraLight', fontSize: 14, color: '#FBCFE8' },
  loadingContainer: { alignItems: 'center', gap: 10 },
  loadingText: { fontFamily: 'Mitr-ExtraLight', fontSize: 14, color: '#FBCFE8' },
  lastUpdatedRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  lastUpdatedText: { fontFamily: 'Mitr-ExtraLight', fontSize: 12, color: 'rgba(251,207,232,0.75)' },

  // Input
  input: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 16,
    color: CREAM, fontFamily: 'Mitr-ExtraLight', fontSize: 16,
    borderWidth: 1, borderColor: BORDER,
  },

  // Device List
  deviceCard: {
    backgroundColor: CARD_BG, borderRadius: 20,
    borderWidth: 1, borderColor: BORDER, overflow: 'hidden',
  },
  deviceCardInner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  bleIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(244, 114, 182, 0.25)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 182, 218, 0.4)',
  },
  deviceName: { fontFamily: 'PixelifySans', fontSize: 17, color: CREAM },
  deviceInfoText: { fontFamily: 'PixelifySans', fontSize: 12, color: 'rgba(251,207,232,0.7)', marginTop: 2 },
  rssiBadge: { backgroundColor: 'rgba(244, 114, 182, 0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  rssiText: { fontFamily: 'PixelifySans', fontSize: 13, color: '#FBCFE8' },

  // History
  historyItem: {
    flexDirection: 'column', gap: 8,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyName: { fontFamily: 'PixelifySans', fontSize: 15, color: CREAM, flex: 1, paddingRight: 10 },
  historyTime: { fontFamily: 'PixelifySans', fontSize: 11, color: 'rgba(251,207,232,0.7)' },
  historyBadge: { backgroundColor: 'rgba(244, 114, 182, 0.3)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start' },
  historyBadgeSuccess: { backgroundColor: 'rgba(50,180,90,0.35)' },
  historyResult: { fontFamily: 'Mitr-ExtraLight', fontSize: 13, color: '#FBCFE8' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  clearBtnText: { fontFamily: 'Mitr-ExtraLight', fontSize: 13, color: '#FF8A80' },

  emptyText: { textAlign: 'center', color: '#FBCFE8', fontFamily: 'Mitr-ExtraLight', fontSize: 15, paddingVertical: 12 },

  // Debug Console
  debugHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: 'rgba(255,255,255,0.03)'
  },
  debugTitle: { fontFamily: 'PixelifySans', fontSize: 15, color: '#4ADE80', letterSpacing: 0.5 },
  debugContent: {
    padding: 16, paddingTop: 12,
    backgroundColor: 'rgba(0,0,0,0.4)', borderTopWidth: 1, borderTopColor: BORDER
  },
  debugText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11, color: CREAM, marginBottom: 6, lineHeight: 16
  }
});
