import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Contact() {
  return (
    <ScrollView style={styles.modernContainer}>
      
      {/* หมวดหมู่ / แท็ก */}
      <Text style={styles.categoryTag}>📞 TELEGRAPH</Text>
      
      {/* หัวข้อประจำหน้า */}
      <Text style={styles.pageTitle}>Contact Me</Text>
      
      <View style={styles.separator} />

      {/* ข้อความเนื้อหา */}
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
    backgroundColor: '#FAFAFA', // สี Off-white คุมโทนทั้งแอป
    paddingHorizontal: 24,
    paddingTop: 30,
    flex: 1,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C', // สีส้มอิฐ (เทเลกราฟ/โทรเลข) แทนสีแดงสดเดิม ให้ลุคโมเดิร์นและดูเป็นมิตร
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A', // สี Slate เข้มสุดเท่
    textAlign: 'left', // จัดชิดซ้ายเข้าชุดกับหน้าอื่น
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0', // เส้นแบ่งแบบบาง คลีนตา
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26, // เว้นบรรทัดให้อ่านง่าย สบายตา
    color: '#334155',
    textAlign: 'left',
  },
});