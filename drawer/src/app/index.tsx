import { usePathname, useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { mainStyles } from "../styles/style";

export default function Index() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={mainStyles.container}>
      <ScrollView style={mainStyles.scrollView} contentContainerStyle={mainStyles.contentContainer}>
        
        {/* Editorial Header */}
        <View style={mainStyles.headerContainer}>
          <Text style={mainStyles.title}>THE REGENCY CHRONICLE</Text>
          <View style={mainStyles.ornamentalDivider}>
            <View style={mainStyles.line} />
            <Text style={mainStyles.dividerDot}>⚜</Text>
            <View style={mainStyles.line} />
          </View>
        </View>

        {/* Vintage Portrait Card Frame */}
        <View style={mainStyles.imageCardLayer}>
          <View style={mainStyles.imageCard}>
            <Image 
              source={require('../images/1.png')} 
              style={mainStyles.portraitImage}
              resizeMode="cover"
            />
            <View style={mainStyles.waxSeal}>
              <Text style={mainStyles.waxSealText}>⚜</Text>
            </View>
          </View>
        </View>

        {/* Luxury Vintage Editorial Typography Section */}
        <View style={mainStyles.textContainer}>
          <Text style={mainStyles.quoteHeader}>Do you know her?</Text>
          
          <Text style={mainStyles.bodyText}>
            Her name is <Text style={mainStyles.highlightText}>Bantita Bonyarid</Text>, a name that echoes wisdom and quiet grace.
          </Text>
          
          <Text style={mainStyles.bodyText}>
            She is drawn to art and the essence of Thai culture, to subtle details shaped by time, patterns, stories, and memories that continue to breathe.
          </Text>
          
          <Text style={mainStyles.bodyText}>
            Vintage objects and retro aesthetics, from both Eastern and Western worlds, become her source of inspiration, weaving together the identity and sensibility she carries.
          </Text>
        </View>

        <TouchableOpacity style={mainStyles.primaryButton} activeOpacity={0.7} onPress={() => router.replace('/education')}>
          <Text style={mainStyles.primaryButtonText}>READ CORRESPONDENCE</Text>
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