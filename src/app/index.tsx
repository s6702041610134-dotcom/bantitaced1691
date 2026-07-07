import { Link } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { mainStyles } from "../style/style";

export default function Index() {
  return (
    <ScrollView style={[mainStyles.container, styles.modernContainer]}> 
      
      {/* ส่วนหัวแอปพลิเคชันแบบมินิมอล */}
      <View style={styles.headerSection}>
        <Text style={styles.appTitle}>THE RETRO JOURNAL</Text>
        <Text style={styles.dateText}>LONDON • TUESDAY, JUNE 30, 1926 • $0.02</Text>
      </View>
      
      <View style={styles.separator} />

      {/* พาดหัวข่าวใหญ่ ดีไซน์โมเดิร์นเข้มดุดัน */}
      <Text style={styles.mainHeader}>
        A GRAND JOURNEY INTO THE NEW DIGITAL ERA
      </Text>
      
      {/* โซนลิงก์สารบัญข่าว เปลี่ยนเป็นปุ่มแบบ Capsule แท็บยอดฮิต */}
      <View style={styles.chipContainer}>
        <Link href="/education" style={styles.chipLink}>
          <Text style={styles.chipText}>📖 EDITORIAL</Text>
        </Link>
        <Link href="/contact" style={styles.chipLink}>
          <Text style={styles.chipText}>📞 TELEGRAPH</Text>
        </Link>
      </View>

      {/* ภาพประกอบ ตัดขอบมนสไตล์โมเดิร์นพร้อมเงาซอฟต์ ๆ */}
      <View style={styles.imageCard}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&auto=format&fit=crop' }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        <Text style={styles.captionText}>Figure 1: The majestic Eiffel Tower as seen on a misty morning.</Text>
      </View>

      {/* เนื้อหาข่าว จัดช่องไฟ (Line Height) ให้อ่านง่าย สบายตา */}
      <Text style={styles.bodyText}>
        Great news has arrived across the ocean. The world is changing rapidly as new technology bridges the gap between machinery and human intelligence. Citizens from all around the globe are looking forward to what tomorrow might bring to this great era of art, culture, and deep evolution.
      </Text>
      
      <View style={styles.footerSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modernContainer: {
    backgroundColor: '#FAFAFA', // สีขาว Off-white สบายตาแบบแอปยุคใหม่
    paddingHorizontal: 24,
    paddingTop: 20,
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800', // หนาและคมชัด (Ultra Bold)
    letterSpacing: 2,  // เพิ่มระยะห่างตัวอักษรให้ดู Luxury
    color: '#0F172A',  // สี Slate เข้มเกือบดำ ดูโมเดิร์นกว่าดำสนิท
    textAlign: 'center',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',  // สีเทา Slate ละมุนตา
    letterSpacing: 1,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0', // เส้นแบ่งแบบบาง ๆ คลีน ๆ
    marginBottom: 20,
  },
  mainHeader: {
    color: '#1E1B4B', // สีน้ำเงินเข้ม Midnight Blue แทนสีแดงไวน์เก่า
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'left', // เปลี่ยนจากตรงกลางเป็นชิดซ้าย เพิ่ม Look แบบนิตยสารสมัยใหม่
    lineHeight: 34,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 12, // ใช้ gap แทนการใส่เส้นแบ่งโบราณ
    marginBottom: 20,
  },
  chipLink: {
    backgroundColor: '#F1F5F9', // พื้นหลังปุ่มแบบปุยเมฆ
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20, // ทำมุมโค้งมนแบบ Capsule
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16, // ลบมุมแหลมออก ให้ดูสมาร์ทโฟนเฟรนด์ลี่
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2, // เงาสำหรับ Android
    marginBottom: 20,
  },
  mainImage: {
    width: '100%',
    height: 220, // เพิ่มความสูงภาพให้เต็มตาขึ้น
  },
  captionText: {
    fontSize: 12,
    color: '#64748B',
    padding: 12,
    textAlign: 'left',
    lineHeight: 16,
    backgroundColor: '#F8FAFC',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26, // เว้นบรรทัดกว้างขึ้นเพื่อให้อ่านง่าย (Readability)
    color: '#334155',
    textAlign: 'left', // เลิกใช้ justify ที่ทำให้ช่องไฟเพี้ยน เปลี่ยนเป็นชิดซ้ายสไตล์เว็บยุคใหม่
    marginBottom: 32,
  },
  footerSpace: {
    height: 40, // เผื่อพื้นที่ด้านล่างสุดให้ไม่ติดขอบจอเกินไป
  }
});