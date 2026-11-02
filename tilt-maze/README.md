# Tilt Maze 3D — เกมเขาวงกตควบคุมด้วยการเอียงมือถือ

Tilt Maze 3D เป็นแอปพลิเคชันเกมมือถือพัฒนาด้วย **Expo v56 (React Native + Expo Router)** โดยใช้ **Sensor Fusion (Accelerometer + Gyroscope)** ผ่าน Complementary Filter เพื่อควบคุมลูกบอล 3D ให้กลิ้งผ่านเขาวงกต หลบหลุมพราง แก้ปริศนากุญแจ และเข้าสู่เส้นชัย

---

## 🎮 วิธีการเล่นและการควบคุม (Controls)

### 1. Motion Control (เล่นบนโทรศัพท์จริง)
- **เอียงมือถือไปทางซ้าย / ขวา (Roll)**: บังคับลูกบอลกลิ้งในแนวแกน X
- **เอียงมือถือไปข้างหน้า / ข้างหลัง (Pitch)**: บังคับลูกบอลกลิ้งในแนวแกน Y
- **ระบบ Sensor Fusion**: รวมสัญญาณระหว่าง:
  - **Accelerometer**: ตรวจจับเวกเตอร์แรงโน้มถ่วงของโลก (ป้องกันการ Drift ในระยะยาว)
  - **Gyroscope**: ตรวจจับความเร็วเชิงมุมของการหมุน (ตอบสนองไว ทันใจ ไม่หน่วง ไม่กระตุก)
  - **Complementary Filter**: $\theta = \alpha \cdot (\theta + \omega \cdot \Delta t) + (1 - \alpha) \cdot \theta_{accel}$

### 2. Virtual Tilt Pad / Keyboard (เล่นบน Simulator & Web Browser)
- บนคอมพิวเตอร์หรือ Simulator ที่ไม่มีฮาร์ดแวร์เซนเซอร์ เกมจะสลับเข้าสู่โหมด Virtual อัตโนมัติ:
  - **ปุ่มลูกศร (Arrow Keys) หรือ W, A, S, D**: เอียงกระดานในทิศทางที่ต้องการ
  - **On-Screen Analog Pad**: ลากปุ่มจอยสติ๊กจำลองบนหน้าจอเพื่อเอียงกระดานอย่างละเอียด

---

## 🌟 ฟีเจอร์หลัก (Key Features)

| ฟีเจอร์ | รายละเอียด |
|---|---|
| **Sensor Fusion Engine** | รวม Accelerometer + Gyroscope ด้วย Complementary Filter ปรับค่าน้ำหนัก $\alpha$ และความไวได้ |
| **Calibration System** | ปุ่ม Calibrate ในหน้าตั้งค่า เพื่อกำหนดมุมถือปัจจุบันเป็นจุดศูนย์ (Neutral Position) |
| **Physics Simulation** | ฟิสิกส์การกลิ้ง, แรงเฉื่อย, แรงเสียดทาน, การกระดอนชนกำแพง (Restitution), และแรงดูด Vortex ของหลุมพราง |
| **3D Stylized Graphics** | กราฟิกสไตล์ 3D Arcade ด้วย SVG: กำแพงมีมิติความลึก (Extruded Bevel), ลูกบอลทองคำพร้อมเงาและแสงสะท้อนตามมุมเอียง |
| **4 Handcrafted Levels** | มีตั้งแต่ระดับฝึกซ้อม จนถึงด่านกลไกแท่นเลื่อนและบททดสอบจับเวลา 90 วินาที |
| **Collectibles & Hazards** | เก็บดาว ⭐, ดอกกุญแจ 🗝️ ปลดล็อกประตูกล 🔒, หลบหลุมพรางมรณะ 🕳️ และแท่นเลื่อนอันตราย ⚠️ |
| **Audio & Haptics** | สั่น Haptic Feedback และเสียงสังเคราะห์ Retro Arcade เมื่อชนกำแพง, เก็บไอเทม, ตกหลุม และชนะ |
| **Save & Progress** | บันทึกคะแนนสูงสุด, ดาวที่ได้ (0-3 ดาว), เวลาที่ดีที่สุด, และการตั้งค่าผ่าน AsyncStorage |

---

## 🗺️ ด่านทั้ง 4 ระดับ (Levels)

1. **Level 1: Training Maze (สนามฝึกซ้อม)**
   - ทางกว้าง ไม่มีหลุมพราง ฝึกทักษะการเอียงและทำความเข้าใจโมเมนตัมของลูกบอล (3 ดาว)
2. **Level 2: The Traps (กับดักหลุมพรางมรณะ)**
   - ทางแคบ เพิ่มหลุมพราง 5 จุดพร้อมแรงดูด ต้องเบรกและควบคุมความเร็วอย่างระมัดระวัง (4 ดาว)
3. **Level 3: Moving Labyrinth (เขาวงกตกลไกปริศนา)**
   - แท่นเลื่อนเคลื่อนที่ขวางทาง ประตูกลเลเซอร์ ต้องตามหากุญแจคริสตัลสีชมพูเพื่อปลดล็อกเส้นชัย (5 ดาว + 1 กุญแจ)
4. **Level 4: The Master Maze (บททดสอบสุดยอดปรมาจารย์)**
   - เขาวงกตขนาดใหญ่ ซับซ้อน หลุมพราง 8 จุด แท่นหนามเคลื่อนที่ ประตูกล 2 ชั้น ต้องเก็บกุญแจ 2 ดอก และจำกัดเวลา 90 วินาที! (6 ดาว + 2 กุญแจ)

---

## 🚀 วิธีการรันโปรเจกต์ (Run & Development)

### จาก Root Workspace:
```bash
# รัน Expo สำหรับ Mobile (Expo Go / Development Build)
npm run tilt-maze

# รัน Expo สำหรับ Web Browser
npm run tilt-maze:web
```

### จากโฟลเดอร์ `tilt-maze/`:
```bash
cd tilt-maze

# เริ่ม Expo dev server
npx expo start

# รันบน Web
npx expo start --web

# รันบน iOS Simulator (macOS)
npx expo start --ios

# รันบน Android Emulator / Device
npx expo start --android
```

---

## 📁 โครงสร้างโค้ด (Architecture)

```
tilt-maze/
├── app/
│   ├── _layout.tsx              # Root Layout & Theme Stack
│   ├── index.tsx                # Home Screen (Hero 3D showcase & Menu)
│   ├── levels.tsx               # Level Select Screen (Stars & Unlock Cards)
│   ├── settings.tsx             # Live Bubble Level, Calibrate, Sensitivity
│   └── game/
│       └── [level].tsx          # Core Gameplay, 60FPS Game Loop & Modals
├── components/
│   ├── Maze3DRenderer.tsx       # 3D Stylized Perspective SVG Board
│   ├── Ball3D.tsx               # 3D Ball with dynamic lighting & shadows
│   ├── HUD.tsx                  # Hearts, Stars, Keys, Timer, Pause
│   ├── VirtualTiltControls.tsx  # On-screen Analog Pad & Touch Joystick
│   ├── LevelCard.tsx            # Level Card with Lock/Unlock Status
│   ├── WinModal.tsx             # Victory Fanfare & Star Rating Breakdown
│   └── GameOverModal.tsx        # Retry & Level Select Options
├── engine/
│   ├── sensorFusion.ts          # Complementary Filter Engine (Accel + Gyro)
│   ├── physics.ts               # 2D Rolling Physics, Vortex & Collisions
│   ├── audioHaptics.ts          # Web Audio Synthesis & Expo Haptics
│   └── types.ts                 # TypeScript Data Models
├── data/
│   └── levels.ts                # Level Definitions (Grid, Holes, Keys, Doors)
├── store/
│   └── gameStore.ts             # AsyncStorage Progress & Settings Persistence
└── constants/
    └── theme.ts                 # Modern Neon Dark Cyber Gaming Theme
```
