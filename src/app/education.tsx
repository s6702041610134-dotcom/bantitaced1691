import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Education() {
  return (
    <ScrollView style={styles.modernContainer}>
      
      {/* หมวดหมู่บทความ */}
      <Text style={styles.categoryTag}>📖 EDITORIAL</Text>
      
      {/* หัวข้อประจำหน้า */}
      <Text style={styles.pageTitle}>Education</Text>
      
      <View style={styles.separator} />

      {/* เนื้อหาบทความ */}
      <Text style={styles.bodyText}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Proin sed 
        consequat magna. Curabitur vel nisl id lectus tempor dictum vel sit 
        amet eros.
      </Text>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modernContainer: {
    backgroundColor: '#FAFAFA', // สี Off-white คลีน ๆ สบายตาแบบเดียวกับหน้าแรก
    paddingHorizontal: 24,
    paddingTop: 30,
    flex: 1,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7', // สีฟ้าคราม ให้ความรู้สึกทันสมัยและเป็นหมวดหมู่การศึกษา
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A', // สี Slate เข้มเข้มดุดัน
    textAlign: 'left', // ปรับมาชิดซ้ายตามสไตล์โมเดิร์น
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0', // เส้นแบ่งแบบบาง เรียบหรู
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26, // ช่องไฟกว้างขึ้นทำให้อ่านง่าย ไม่ติดกันเป็นพืด
    color: '#334155', // สีเทาเข้ม สบายตากว่าสีดำสนิท
    textAlign: 'left',
  },
});