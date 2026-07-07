import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        // สไตล์ร่วมสำหรับทุกหน้าจอ (Modern Minimal Header)
        headerStyle: {
          backgroundColor: '#FAFAFA', // สีเดียวกับพื้นหลังแอป ดูกลืนเป็นแผ่นเดียวกัน
        },
        headerShadowVisible: false, // ปิดเงา/เส้นใต้หนา ๆ ของแถบด้านบน เพื่อความคลีน
        headerTintColor: '#0F172A',  // สีปุ่มย้อนกลับ (Back Button) เป็นสี Slate เข้ม
        headerTitleStyle: {
          fontWeight: '700',         // ปรับหัวข้อให้หนาพอดี ๆ สไตล์มินิมอล
          fontSize: 18,
        },
      }}
    >
      {/* หน้าแรก: ซ่อนแถบด้านบนไปเลย เพราะเรามีชื่อสำนักพิมพ์ตัวใหญ่ในหน้าเว็บแล้ว */}
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      
      {/* หน้า Education */}
      <Stack.Screen 
        name="education" 
        options={{ 
          title: "Education" 
        }} 
      />
      
      {/* หน้า Contact */}
      <Stack.Screen 
        name="contact" 
        options={{ 
          title: "Contact" 
        }} 
      />
    </Stack>
  );
}