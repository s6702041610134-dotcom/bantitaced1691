// 1. เพิ่ม Image เข้ามาใน import
import { Link } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { mainStyles } from "../style/style";

export default function Index() {
  return (
    <View style={[mainStyles.container, myStlye.vintageContainer]}> 
      
      {/* ชื่อหนังสือพิมพ์โบราณ */}
      <Text style={myStlye.newspaperTitle}>THE RETRO JOURNAL</Text>
      
      {/* เส้นคู่หัวข้อ */}
      <View style={myStlye.thickLine} />
      <View style={myStlye.thinLine} />

      {/* วันที่พิมพ์แบบย้อนยุค */}
      <Text style={myStlye.dateText}>LONDON, TUESDAY, JUNE 30, 1926 • PRICE TWO CENTS</Text>
      
      <View style={myStlye.thinLine} />

      {/* พาดหัวข่าวใหญ่ประจำวัน */}
      <Text style={myStlye.mainHeader}>
        A GRAND JOURNEY INTO THE NEW DIGITAL ERA
      </Text>
      
      {/* โซนลิงก์สารบัญข่าว */}
      <View style={myStlye.linkContainer}>
        <Link href="/education" style={myStlye.vintageLink}>📖 EDITORIAL</Link>
        <Text style={myStlye.verticalDivider}>|</Text>
        <Link href="/contact" style={myStlye.vintageLink}>📞 TELEGRAPH</Link>
      </View>

      <View style={myStlye.thinLine} />

      {/* ภาพประกอบวิวหอไอเฟลสไตล์วินเทจขาวดำ */}
      <View style={myStlye.imageFrame}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&auto=format&fit=crop' }}
          style={{ width: '100%', height: 180, alignSelf: 'center' }}
          resizeMode="cover"
        />
        <Text style={myStlye.imageCaption}>Figure 1: The majestic Eiffel Tower as seen on a misty morning.</Text>
      </View>

      {/* เนื้อหาข่าวแบบคอลัมน์ชิดขอบสองข้าง */}
      <Text style={myStlye.ced}>
        Great news has arrived across the ocean. The world is changing rapidly as new technology bridges the gap between machinery and human intelligence. Citizens from all around the globe are looking forward to what tomorrow might bring to this great era of art, culture, and deep evolution.
      </Text>
      
      <View style={myStlye.thickLine} />
    </View>
  );
}

const myStlye = StyleSheet.create({
  vintageContainer: {
    backgroundColor: '#F3EFE0', // สีครีมกระดาษเก่าถนอมสายตา
    padding: 20,
    flex: 1,
  },
  newspaperTitle: {
    fontFamily: 'serif',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    color: '#1A1A1A',
    letterSpacing: 1,
    marginTop: 5,
  },
  dateText: {
    fontFamily: 'serif',
    fontSize: 11,
    textAlign: 'center',
    color: '#4A4A4A',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginVertical: 2,
  },
  thickLine: {
    borderBottomWidth: 3,
    borderColor: '#1A1A1A',
    marginVertical: 2,
  },
  thinLine: {
    borderBottomWidth: 1,
    borderColor: '#1A1A1A',
    marginVertical: 2,
  },
  mainHeader: {
    fontFamily: 'serif',
    color: '#722F37', // สีแดงไวน์หม่นแบบหมึกเก่า
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 30,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  vintageLink: {
    fontFamily: 'serif',
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  verticalDivider: {
    marginHorizontal: 15,
    color: '#1A1A1A',
    fontSize: 15,
  },
  ced: {
    fontFamily: 'serif',
    color: '#2A2A2A',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
    marginVertical: 12,
  },
  imageFrame: {
    borderWidth: 1,
    borderColor: '#1A1A1A',
    padding: 6,
    backgroundColor: '#FFF',
    marginVertical: 10,
  },
  imageCaption: {
    fontFamily: 'serif',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#555',
    marginTop: 6,
  }
});