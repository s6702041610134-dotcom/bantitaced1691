import { usePathname, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { mainStyles } from "../styles/style";

export default function Education() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={mainStyles.container}>
      <ScrollView style={mainStyles.scrollView} contentContainerStyle={mainStyles.contentContainer}>
        
        <View style={mainStyles.headerContainer}>
          <Text style={mainStyles.title}>THE ACADEMIC CHRONICLES</Text>
          <View style={mainStyles.ornamentalDivider}>
            <View style={mainStyles.line} />
            <Text style={mainStyles.dividerDot}>⚜</Text>
            <View style={mainStyles.line} />
          </View>
        </View>

        <View style={mainStyles.textContainer}>
          <Text style={mainStyles.quoteHeader}>Where she from?</Text>
          
          <Text style={mainStyles.bodyText}>
            During my senior high school years, I studied at a school often joked about for having “a flagpole that resembles the Eiffel Tower.” That place was <Text style={mainStyles.highlightText}>Suratpittaya School</Text>.
          </Text>
          
          <Text style={mainStyles.bodyText}>
            I was enrolled in the Mathematics–English program, and my childhood fascination with LEGO led me to become part of the robotics club. It was a space where an ordinary student like me was given the chance to learn, create, and compete in various competitions.
          </Text>

          <Text style={[mainStyles.flourishText, { textAlign: 'center', marginVertical: 16 }]}>❧   ❧   ❧</Text>

          <Text style={mainStyles.bodyText}>
            Those opportunities did not come by chance. They came from a teacher who saw potential and chose to open a door beyond the classroom walls.
          </Text>
          
          <Text style={mainStyles.bodyText}>
            From that single act of trust, a quiet inspiration began to grow— one that shaped my dream of <Text style={mainStyles.highlightText}>becoming a teacher</Text>, so that one day, I too could pass on opportunities just as I once received.
          </Text>

          <Text style={[mainStyles.flourishText, { textAlign: 'center', marginVertical: 16 }]}>⚜</Text>

          <Text style={mainStyles.bodyText}>
            Today, I am a student at the <Text style={mainStyles.highlightText}>Faculty of Technical Education</Text>, Department of Computer Education, <Text style={mainStyles.highlightText}>King Mongkut’s University of Technology North Bangkok</Text>, walking the path I once imagined for myself.
          </Text>
        </View>

        <TouchableOpacity style={mainStyles.primaryButton} activeOpacity={0.7} onPress={() => router.replace('/contact')}>
          <Text style={mainStyles.primaryButtonText}>SEND CORRESPONDENCE</Text>
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