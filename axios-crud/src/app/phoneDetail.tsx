import MetallicSpiderBg from "@/components/MetallicSpiderBg";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=400&q=80";

export default function PhoneDetail() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    sect?: string;
    tel?: string;
    img?: string;
  }>();

  const router = useRouter();
  const id = params.id || "";
  const name = params.name || "Unknown Specimen";
  const sect = params.sect || "CED";
  const tel = params.tel || "N/A";
  const img = params.img && params.img.trim() !== "" ? params.img : DEFAULT_AVATAR;

  return (
    <MetallicSpiderBg>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Top Legend Bar */}
          <View style={styles.legendHeader}>
            <Text style={styles.legendLeft}>Pics Used: MARVEL / AXIOS CRUD</Text>
            <Text style={styles.legendRight}>Font, Title Textures, Freestyle Work</Text>
          </View>

          {/* Blueprint Spec Card */}
          <View style={styles.detailCard}>
            {/* Top Header Badge */}
            <View style={styles.badgeWrapper}>
              <View style={styles.studioBadge}>
                <Text style={styles.studioText}>MARVEL STUDIOS</Text>
              </View>
            </View>

            <Text style={styles.spiderTitle}>SPIDER-MAN</Text>
            <Text style={styles.subHeaderTag}>FULL BLUEPRINT SPECIFICATION SHEET</Text>

            {/* Photo Display Container */}
            <View style={styles.imageFrameContainer}>
              <Image
                source={{ uri: img }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.photoCaptionBadge}>
                <Text style={styles.photoCaptionText}>CONFIDENTIAL SPECIMEN PHOTO</Text>
              </View>
            </View>

            {/* Contact Details List */}
            <View style={styles.detailsGroup}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>SPEC ID:</Text>
                <Text style={styles.detailValue}>{id || "N/A"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>NAME:</Text>
                <Text style={styles.nameHighlight}>{name}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>DEPARTMENT:</Text>
                <View style={styles.sectBadge}>
                  <Text style={styles.sectBadgeText}>{sect}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>TELEPHONE:</Text>
                <Text style={styles.telValue}>{tel}</Text>
              </View>
            </View>

            {/* Blueprint Annotations */}
            <View style={styles.annotationBox}>
              <Text style={styles.chalkText}>⚡ "ok, this spec is verified"</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.backBtnText}>⬅ BACK</Text>
              </TouchableOpacity>

              <Link
                href={{
                  pathname: "/editPhone",
                  params: { id, name, sect, tel, img },
                }}
                asChild
              >
                <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
                  <Text style={styles.editBtnText}>✏️ EDIT SPEC</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerWatermark}>
            <Text style={styles.sykoLogo}>sykoworlds.</Text>
            <Text style={styles.disclaimerText}>
              This presentation is intellectual property of Sykoworlds and whoever retains the rights of the commissions. Do not reuse without permission. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </MetallicSpiderBg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContainer: {
    padding: 16,
    flexGrow: 1,
    justifyContent: "space-between",
  },
  legendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  legendLeft: {
    color: "#EAF2FB80",
    fontSize: 9,
  },
  legendRight: {
    color: "#EAF2FB80",
    fontSize: 9,
  },
  detailCard: {
    backgroundColor: "#103565",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#4E86C7",
    padding: 18,
    elevation: 5,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 4px 14px rgba(0,0,0,0.4)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }),
  },
  badgeWrapper: {
    alignItems: "center",
    marginBottom: 4,
  },
  studioBadge: {
    backgroundColor: "#D8232A",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "#FFFFFF",
  },
  studioText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  spiderTitle: {
    color: "#D8232A",
    fontSize: 26,
    fontWeight: "900",
    fontStyle: "italic",
    textAlign: "center",
    letterSpacing: 1,
    ...(Platform.OS === "web"
      ? { textShadow: "1px 1px 1px #F4D976" }
      : {
          textShadowColor: "#F4D976",
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 1,
        }),
  },
  subHeaderTag: {
    color: "#F4D976",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 16,
    marginTop: 2,
  },
  imageFrameContainer: {
    alignItems: "center",
    marginBottom: 16,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#F4D976",
    backgroundColor: "#0B264A",
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  photoCaptionBadge: {
    backgroundColor: "#0B264A",
    width: "100%",
    paddingVertical: 4,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#4E86C760",
  },
  photoCaptionText: {
    color: "#F4D976",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1.2,
  },
  detailsGroup: {
    backgroundColor: "#0B264A",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2A6BC260",
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#2A6BC230",
  },
  detailLabel: {
    color: "#4E86C7",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  detailValue: {
    color: "#EAF2FB",
    fontSize: 12,
    fontWeight: "500",
  },
  nameHighlight: {
    color: "#F4D976",
    fontSize: 16,
    fontWeight: "bold",
    fontStyle: "italic",
  },
  sectBadge: {
    backgroundColor: "#D8232A",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sectBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  telValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  annotationBox: {
    alignItems: "center",
    marginVertical: 4,
  },
  chalkText: {
    color: "#EAF2FB80",
    fontSize: 11,
    fontStyle: "italic",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  backBtn: {
    flex: 1,
    backgroundColor: "#0B264A",
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2A6BC2",
  },
  backBtnText: {
    color: "#EAF2FB",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 1,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#F4D976",
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D8232A",
  },
  editBtnText: {
    color: "#0F3260",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 1,
  },
  footerWatermark: {
    alignItems: "center",
    marginTop: 20,
  },
  sykoLogo: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
    opacity: 0.9,
  },
  disclaimerText: {
    color: "#EAF2FB70",
    fontSize: 8,
    textAlign: "center",
    lineHeight: 11,
    marginTop: 2,
  },
});