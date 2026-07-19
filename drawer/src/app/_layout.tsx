import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer screenOptions={{
        // แถบหัวขอด้านบน (Header Style) สไตล์นิตยสารชั้นสูง
        headerStyle: {
          backgroundColor: '#FFFDF9', // สีขาวงาช้าง (Ivory Paper)
          borderBottomWidth: 1,
          borderBottomColor: '#E6DCCF', // เส้นขอบสีน้ำตาลทองหม่น
          elevation: 0, // ลบเงาหนาๆ ของ Android
          shadowOpacity: 0, // ลบเงาของ iOS
        },
        headerTintColor: '#5C5043', // สีหมึกปากกาโบราณสำหรับปุ่มเปิดเมนู
        headerTitleStyle: {
          fontFamily: 'Georgia',
          fontSize: 16,
          letterSpacing: 2,
          fontWeight: '600',
          color: '#8C765C', // สีทองแชมเปญโบราณ
        },
        
        // แถบเมนูด้านข้าง (Drawer Style) สไตล์กระดาษพาร์ชเมนต์
        drawerStyle: {
          backgroundColor: '#F7F4EB', // สีครีมกระดาษวินเทจ (Cream Parchment)
          width: 220,
          borderRightWidth: 1,
          borderRightColor: '#E6DCCF',
        },
        drawerLabelStyle: {
          fontFamily: 'Georgia',
          fontSize: 14,
          letterSpacing: 1,
        },
        drawerActiveTintColor: '#C5A059', // สีทองหรูหราเมื่อกดเลือก
        drawerActiveBackgroundColor: '#FFFDF9', // พื้นหลังสีงาช้างเมื่อแถบนั้นถูกเลือก
        drawerInactiveTintColor: '#A89984', // สีทองหม่นสไตล์ไลน์อาร์ตเมื่อไม่ได้เลือก
      }} >
        
        <Drawer.Screen name="index" options={{
          title: "Home Screen",
          drawerLabel: "Home",
          drawerIcon: ({color}) => (
            <FontAwesome name="home" size={20} color={color} />
          ),
        }}/>
        
        <Drawer.Screen name="education" options={{
          title: "My Education",
          drawerLabel: "Education",
          drawerIcon: ({color}) => (
            <FontAwesome name="book" size={20} color={color} />
          ),
        }} />

        {/* ลงทะเบียนหน้าความสนใจ (Interest) เพิ่มเติมเพื่อแก้ไข Error ทางเดินของ Router */}
        <Drawer.Screen name="interest" options={{
          title: "My Interests",
          drawerLabel: "Interests",
          drawerIcon: ({color}) => (
            // ใช้ไอคอนรูปหัวใจดวงเล็กที่เหมาะกับหน้าความสนใจ (Interest)
            <FontAwesome name="heart" size={18} color={color} />
          ),
        }} />
        
        <Drawer.Screen name="contact" options={{
          title: "My Contact",
          drawerLabel: "Correspondence", // เปลี่ยนเป็นคำหรูหราเข้ากับยุค Regency
          drawerIcon: ({color}) => (
            // เปลี่ยนจาก 'laptop' เป็น 'envelope' เพื่อคุมโทนยุค 1813 (ยุคเขียนจดหมายรัก)
            <FontAwesome name='envelope' size={18} color={color} />
          ),
        }}/>
        
      </Drawer>
    </GestureHandlerRootView>
  );
}
