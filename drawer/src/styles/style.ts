import { StyleSheet } from 'react-native';

export const mainStyles = StyleSheet.create({
  // โครงสร้างหลักและพื้นหลังกระดาษครีมวินเทจ
  container: {
    flex: 1,
    backgroundColor: '#F7F4EB', 
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingTop: 50,
    paddingBottom: 110, 
    alignItems: 'center',
  },
  
  // ส่วนหัวข้อ (Editorial Header)
  headerContainer: {
    alignItems: 'center',
    marginBottom: 35,
    width: '100%',
  },
  title: {
    fontFamily: 'Georgia', 
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 5,
    color: '#8C765C', // สีทองหม่น / น้ำตาลแชมเปญโบราณ
    textAlign: 'center',
  },
  ornamentalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    width: '70%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#D9CBB7',
  },
  dividerDot: {
    marginHorizontal: 10,
    color: '#C5A059', 
    fontSize: 12,
  },
  
  // กรอบรูปโปสการ์ดและตราประทับขี้ผึ้ง
  imageCardLayer: {
    shadowColor: '#5C4E3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 40,
    position: 'relative',
  },
  imageCard: {
    backgroundColor: '#FFFDF9', 
    padding: 14,
    paddingBottom: 20,
    borderRadius: 2, 
    borderWidth: 1,
    borderColor: '#E6DCCF',
  },
  portraitImage: {
    width: 220,
    height: 310,
    borderRadius: 1,
  },
  waxSeal: {
    position: 'absolute',
    bottom: -15,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A94A42', // สีแดงครั่ง/ขี้ผึ้งโบราณ
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8A3B34',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  waxSealText: {
    color: '#F4E3D3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // ส่วนเนื้อความนิตยสาร (Typography)
  textContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  quoteHeader: {
    fontFamily: 'Georgia',
    fontSize: 30,
    fontStyle: 'italic',
    color: '#3D3126', 
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  bodyText: {
    fontFamily: 'Georgia',
    fontSize: 15,
    lineHeight: 28,
    color: '#5C5043', // สีหมึกปากกาคอแร้งโบราณ
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  highlightText: {
    fontWeight: '700',
    color: '#2B2017',
  },
  
  // ปุ่มจดหมายเชิญหลัก
  primaryButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#C5A059', 
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 2,
    backgroundColor: '#FFFDF9',
    shadowColor: '#8C765C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryButtonText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '600',
    color: '#8C765C',
    textAlign: 'center',
  },
  
  // เส้นตกแต่งท้ายหน้า
  footerOrnament: {
    marginTop: 40,
  },
  flourishText: {
    color: '#D4C5B3',
    fontSize: 14,
    letterSpacing: 4,
  },
  
  // แถบเมนูด้านล่าง (Bottom Navigation Bar)
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: '#FFFDF9', 
    borderTopWidth: 1,
    borderTopColor: '#E6DCCF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
    shadowColor: '#5C4E3D',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  navIcon: {
    fontSize: 22,
    color: '#A89984', 
    marginBottom: 2,
  },
  navIconActive: {
    color: '#C5A059', 
  },
  navLabel: {
    fontFamily: 'Georgia',
    fontSize: 10,
    letterSpacing: 1,
    color: '#A89984',
  },
  navLabelActive: {
    color: '#4A3D33', 
    fontWeight: '600',
  },
});