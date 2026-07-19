import { usePathname, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { mainStyles } from "../styles/style";

export default function Interest() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={mainStyles.container}>
      <ScrollView style={mainStyles.scrollView} contentContainerStyle={mainStyles.contentContainer}>
        
        {/* Editorial Header */}
        <View style={mainStyles.headerContainer}>
          <Text style={mainStyles.title}>THE ELEGANT PURSUITS</Text>
          <View style={mainStyles.ornamentalDivider}>
            <View style={mainStyles.line} />
            <Text style={mainStyles.dividerDot}>⚜</Text>
            <View style={mainStyles.line} />
          </View>
        </View>

        {/* Content Section */}
        <View style={mainStyles.textContainer}>
          <Text style={mainStyles.quoteHeader}>Her Inspirations</Text>
          
          <Text style={mainStyles.bodyText}>
            A deep appreciation for <Text style={mainStyles.highlightText}>Thai culture and historical arts</Text> forms the core of her creative expression. She finds beauty in the delicate craftsmanship, timeless patterns, and narratives that traditional heritage carries forward.
          </Text>

          <Text style={[mainStyles.flourishText, { textAlign: 'center', marginVertical: 16 }]}>❧   ❧   ❧</Text>
          
          <Text style={mainStyles.bodyText}>
            Beyond local traditions, her heart is drawn to the charm of <Text style={mainStyles.highlightText}>vintage objects and retro aesthetics</Text>. Whether it is the nostalgic elegance of the West or the serene subtlety of the East, these fragments of the past serve as a constant source of inspiration, shaping her unique identity.
          </Text>
        </View>

        <TouchableOpacity style={mainStyles.primaryButton} activeOpacity={0.7} onPress={() => router.replace('/contact')}>
          <Text style={mainStyles.primaryButtonText}>CONTINUE TO CONTACT</Text>
        </TouchableOpacity>

        <View style={mainStyles.footerOrnament}>
          <Text style={mainStyles.flourishText}>❖   ⚜   ❖</Text>
        </View>

      </ScrollView>

      {/* Updated 4-Button Navigation Bar */}
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