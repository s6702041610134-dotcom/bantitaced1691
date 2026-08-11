import Card from "@/components/card";
import MetallicSpiderBg from "@/components/MetallicSpiderBg";
import api from "../utils/crud-api";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PhoneItem = {
  id: string;
  name: string;
  sect: string;
  tel: string;
  img?: string;
};

export default function Index() {
  const [data, setData] = useState<PhoneItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/phones");
      setData(response.data);
    } catch (err) {
      console.log("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MetallicSpiderBg>
      <SafeAreaView style={styles.container}>
        {/* Top Legend Keys */}
        <View style={styles.topLegendRow}>
          <View style={styles.legendLeft}>
            <Text style={styles.legendText}>Pics Used</Text>
            <Text style={styles.legendSubtext}>MARVEL / AXIOS CRUD</Text>
            <Text style={styles.legendSubtext}>Freehand Work</Text>
          </View>

          <View style={styles.legendRight}>
            <Text style={styles.legendRightText}>Font,</Text>
            <Text style={styles.legendRightText}>Title Textures,</Text>
            <Text style={styles.legendRightText}>Freestyle Work,</Text>
          </View>
        </View>

        {/* Main Logo Title Lockup */}
        <View style={styles.logoLockupContainer}>
          {/* Studio Red Badge */}
          <View style={styles.studioBadge}>
            <Text style={styles.studioBadgeText}>MARVEL STUDIOS</Text>
          </View>

          {/* Spider-Man Main Title */}
          <Text style={styles.mainSpiderTitle}>SPIDER-MAN</Text>
          <Text style={styles.subtitleTag}>BRAND NEW DAY • PHONE DIRECTORY</Text>
        </View>

        {/* Add Button & Annotations Section */}
        <View style={styles.ctaRow}>
          <View style={styles.chalkAnnotationBox}>
            <Text style={styles.chalkText}>⚡ ok, this is scary</Text>
          </View>

          <Pressable
            onPress={() => router.push("/addPhone")}
            style={({ pressed }) => [
              styles.addPhoneBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.addPhoneBtnText}>+ ADD NEW PHONE</Text>
          </Pressable>

          <View style={styles.chalkAnnotationBox}>
            <Text style={styles.chalkText}>too dramatic? 🕸️</Text>
          </View>
        </View>

        {/* Main List / Content */}
        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color="#F4D976" />
            <Text style={styles.loadingText}>LOADING BLUEPRINT REVISION...</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              data.length === 0 ? styles.emptyListStyle : styles.listStyle
            }
            refreshing={loading}
            onRefresh={getData}
            ListEmptyComponent={
              <View style={styles.emptyCardContainer}>
                <Text style={styles.spiderChalkIcon}>🕷️</Text>
                <Text style={styles.emptyTitleText}>NO SPECIFICATIONS FOUND</Text>
                <Text style={styles.emptySubtitleText}>
                  Tap "+ ADD NEW PHONE" to add your first blueprint contact.
                </Text>
                <Text style={styles.emptyChalkNote}>too futuristic?</Text>
              </View>
            }
            renderItem={({ item, index }) => {
              const phone = {
                id: item.id,
                name: item.name,
                sect: item.sect,
                tel: item.tel,
                img: item.img,
              };
              return <Card phone={phone} index={index} refresh={getData} />;
            }}
            ListFooterComponent={
              <View style={styles.footerWatermark}>
                <Text style={styles.sykoLogo}>sykoworlds.</Text>
                <Text style={styles.disclaimerText}>
                  This presentation is intellectual property of Sykoworlds and whoever retains the rights of the commissions. Do not reuse without permission. All rights reserved.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </MetallicSpiderBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  topLegendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  legendLeft: {
    alignItems: "flex-start",
  },
  legendText: {
    color: "#EAF2FB",
    fontSize: 10,
    fontWeight: "bold",
  },
  legendSubtext: {
    color: "#EAF2FB80",
    fontSize: 9,
  },
  legendRight: {
    alignItems: "flex-end",
  },
  legendRightText: {
    color: "#EAF2FB80",
    fontSize: 9,
  },
  logoLockupContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  studioBadge: {
    backgroundColor: "#D8232A",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "#FFFFFF",
    marginBottom: 4,
  },
  studioBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  mainSpiderTitle: {
    fontSize: 34,
    fontWeight: "900",
    fontStyle: "italic",
    color: "#D8232A",
    letterSpacing: 1,
    textAlign: "center",
    ...(Platform.OS === "web"
      ? { textShadow: "2px 2px 1px #F4D976" }
      : {
          textShadowColor: "#F4D976",
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 1,
        }),
  },
  subtitleTag: {
    color: "#F4D976",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 2,
    marginTop: 2,
    textAlign: "center",
  },
  ctaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  chalkAnnotationBox: {
    opacity: 0.8,
  },
  chalkText: {
    color: "#EAF2FB90",
    fontSize: 10,
    fontStyle: "italic",
  },
  addPhoneBtn: {
    backgroundColor: "#D8232A",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#F4D976",
    elevation: 4,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 3px 8px rgba(0,0,0,0.3)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }),
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  addPhoneBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1.2,
  },
  listStyle: {
    paddingBottom: 20,
  },
  emptyListStyle: {
    flexGrow: 1,
    justifyContent: "center",
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#F4D976",
    marginTop: 10,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: "bold",
  },
  emptyCardContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginHorizontal: 16,
    backgroundColor: "#103565",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#4E86C780",
    borderStyle: "dashed",
  },
  spiderChalkIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitleText: {
    color: "#F4D976",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  emptySubtitleText: {
    color: "#EAF2FB",
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
  },
  emptyChalkNote: {
    color: "#EAF2FB60",
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 12,
  },
  footerWatermark: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 10,
  },
  sykoLogo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.9,
  },
  disclaimerText: {
    color: "#EAF2FB70",
    fontSize: 8,
    textAlign: "center",
    lineHeight: 11,
  },
});