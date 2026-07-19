import { usePathname, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { mainStyles } from "../styles/style";

export default function Contact() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={mainStyles.container}>
      <ScrollView style={mainStyles.scrollView} contentContainerStyle={mainStyles.contentContainer}>
        
        <View style={mainStyles.headerContainer}>
          <Text style={mainStyles.title}>SOCIETY CORRESPONDENCE</Text>
          <View style={mainStyles.ornamentalDivider}>
            <View style={mainStyles.line} />
            <Text style={mainStyles.dividerDot}>⚜</Text>
            <View style={mainStyles.line} />
          </View>
        </View>

        <View style={mainStyles.textContainer}>
          <Text style={mainStyles.quoteHeader}>Get in Touch</Text>
          
          <Text style={mainStyles.bodyText}>
            Should you wish to send a letter, inquire about art, or discuss digital creation, please reach out through our high society channels.
          </Text>

          <View style={{ marginVertical: 20, alignItems: 'center' }}>
            <Text style={[mainStyles.bodyText, { marginBottom: 8 }]}><Text style={mainStyles.highlightText}>Email:</Text> bantita.b@mail.com</Text>
            <Text style={[mainStyles.bodyText, { marginBottom: 8 }]}><Text style={mainStyles.highlightText}>Location:</Text> Bangkok, Thailand</Text>
          </View>
        </View>

        <TouchableOpacity style={mainStyles.primaryButton} activeOpacity={0.7} onPress={() => router.replace('/')}>
          <Text style={mainStyles.primaryButtonText}>RETURN HOME</Text>
        </TouchableOpacity>

        <View style={mainStyles.footerOrnament}>
          <Text style={mainStyles.flourishText}>❖   ⚜   ❖</Text>
        </View>

      </ScrollView>

      {/* 3-Button Navigation Bar */}
      <View style={mainStyles.navigationBar}>
        <TouchableOpacity style={mainStyles.navItem} onPress={() => router.replace('/')}>
          <Text style={[mainStyles.navIcon, (pathname === '/' || pathname === '/index') && mainStyles.navIconActive]}>🏛</Text>
          <Text style={[mainStyles.navLabel, (pathname === '/' || pathname === '/index') && mainStyles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={mainStyles.navItem} onPress={() => router.replace('/education')}>
          <Text style={[mainStyles.navIcon, pathname === '/education' && mainStyles.navIconActive]}>⚜</Text>
          <Text style={[mainStyles.navLabel, pathname === '/education' && mainStyles.navLabelActive]}>Education</Text>
        </TouchableOpacity>

        <TouchableOpacity style={mainStyles.navItem} onPress={() => router.replace('/interest')}>
          <Text style={[mainStyles.navIcon, pathname === '/interest' && mainStyles.navIconActive]}>❧</Text>
          <Text style={[mainStyles.navLabel, pathname === '/interest' && mainStyles.navLabelActive]}>Interest</Text>
        </TouchableOpacity>

        <TouchableOpacity style={mainStyles.navItem} onPress={() => router.replace('/contact')}>
          <Text style={[mainStyles.navIcon, pathname === '/contact' && mainStyles.navIconActive]}>✉</Text>
          <Text style={[mainStyles.navLabel, pathname === '/contact' && mainStyles.navLabelActive]}>Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}