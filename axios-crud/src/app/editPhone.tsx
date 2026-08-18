import MetallicSpiderBg from "@/components/MetallicSpiderBg";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RadioButton } from "react-native-paper";
import api from "../utils/crud-api";

const PRESET_AVATARS = [
  {
    name: "Spider-Man",
    url: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Miles Morales",
    url: "https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Classic Suit",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80",
  },
];

const EditPhone = () => {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    sect?: string;
    tel?: string;
    img?: string;
  }>();

  const router = useRouter();
  const id = params.id || "";
  const [newName, setNewName] = useState(params.name || "");
  const [newSect, setNewSect] = useState(params.sect || "CED");
  const [newTel, setNewTel] = useState(params.tel || "");
  const [newImg, setNewImg] = useState(params.img || PRESET_AVATARS[0].url);

  const updatePhone = async () => {
    if (newName.trim() === "" || newSect.trim() === "" || newTel.trim() === "") {
      Alert.alert("MISSING INFORMATION", "Please fill in all phone details.");
      return;
    }
    try {
      await api.put("/phones/" + id, {
        name: newName.trim(),
        sect: newSect,
        tel: newTel.trim(),
        img: newImg.trim(),
      });
      router.replace("/");
    } catch (err) {
      console.log("UPDATE ERROR:", err);
      Alert.alert("ERROR", "Failed to update phone record.");
    }
  };

  return (
    <MetallicSpiderBg>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Top Blueprint Legend Header */}
          <View style={styles.legendHeader}>
            <Text style={styles.legendLeft}>Pics Used: MARVEL / AXIOS CRUD</Text>
            <Text style={styles.legendRight}>Font, Title Textures, Freestyle Work</Text>
          </View>

          {/* Blueprint Specification Card */}
          <View style={styles.specCardContainer}>
            {/* Studio Badge */}
            <View style={styles.badgeWrapper}>
              <View style={styles.studioBadge}>
                <Text style={styles.studioText}>MARVEL STUDIOS</Text>
              </View>
            </View>

            <Text style={styles.spiderTitle}>SPIDER-MAN</Text>
            <Text style={styles.cardHeaderTag}>SPECIFICATION REVISION • EDIT ITEM</Text>

            {/* Live Image Preview & Avatar Selector */}
            <View style={styles.imagePreviewSection}>
              <Text style={styles.label}>SPECIMEN PHOTO / AVATAR</Text>
              <View style={styles.previewFrame}>
                <Image
                  source={{
                    uri: newImg.trim() !== "" ? newImg : PRESET_AVATARS[0].url,
                  }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </View>

              {/* Presets Row */}
              <Text style={styles.presetTitle}>SELECT PRESET AVATAR:</Text>
              <View style={styles.presetRow}>
                {PRESET_AVATARS.map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.presetBtn,
                      newImg === preset.url && styles.presetBtnSelected,
                    ]}
                    onPress={() => setNewImg(preset.url)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.presetBtnText,
                        newImg === preset.url && styles.presetBtnTextSelected,
                      ]}
                    >
                      {preset.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Input: Image URL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>IMAGE URL (CUSTOM PHOTO)</Text>
              <TextInput
                style={styles.input}
                value={newImg}
                onChangeText={(text) => setNewImg(text)}
                placeholder="https://images.unsplash.com/..."
                placeholderTextColor="#4E86C780"
                autoCapitalize="none"
              />
            </View>

            {/* Input: Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={(text) => setNewName(text)}
                placeholder="Your Name"
                placeholderTextColor="#4E86C780"
              />
            </View>

            {/* Radio Group */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DEPARTMENT / SECTION</Text>
              <RadioButton.Group
                value={newSect}
                onValueChange={(value: string) => setNewSect(value)}
              >
                <View style={styles.radioRow}>
                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      newSect === "CED" && styles.radioOptionSelected,
                    ]}
                    onPress={() => setNewSect("CED")}
                    activeOpacity={0.8}
                  >
                    <RadioButton value="CED" color="#D8232A" uncheckedColor="#4E86C7" />
                    <Text style={styles.radioLabel}>CED</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      newSect === "TCT" && styles.radioOptionSelected,
                    ]}
                    onPress={() => setNewSect("TCT")}
                    activeOpacity={0.8}
                  >
                    <RadioButton value="TCT" color="#D8232A" uncheckedColor="#4E86C7" />
                    <Text style={styles.radioLabel}>TCT</Text>
                  </TouchableOpacity>
                </View>
              </RadioButton.Group>
            </View>

            {/* Input: Tel */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TELEPHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                value={newTel}
                onChangeText={(text) => setNewTel(text)}
                placeholder="Phone No."
                placeholderTextColor="#4E86C780"
                keyboardType="phone-pad"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.cancelBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => updatePhone()}
                style={styles.submitBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.submitBtnText}>UPDATE INFO</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Blueprint Footer Watermark */}
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
};

export default EditPhone;

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
    marginBottom: 12,
  },
  legendLeft: {
    color: "#EAF2FB80",
    fontSize: 9,
  },
  legendRight: {
    color: "#EAF2FB80",
    fontSize: 9,
  },
  specCardContainer: {
    backgroundColor: "#103565",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#4E86C7",
    padding: 20,
    elevation: 5,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 4px 12px rgba(0,0,0,0.3)" }
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
    fontSize: 24,
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
  cardHeaderTag: {
    color: "#F4D976",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 16,
    marginTop: 2,
  },
  imagePreviewSection: {
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#0B264A",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A6BC260",
  },
  previewFrame: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#F4D976",
    marginVertical: 10,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  presetTitle: {
    color: "#EAF2FB80",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  presetRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  presetBtn: {
    backgroundColor: "#103565",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#4E86C7",
  },
  presetBtnSelected: {
    backgroundColor: "#D8232A",
    borderColor: "#F4D976",
  },
  presetBtnText: {
    color: "#EAF2FB",
    fontSize: 10,
    fontWeight: "bold",
  },
  presetBtnTextSelected: {
    color: "#FFFFFF",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#F4D976",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#2A6BC2",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: "#0B264A",
    color: "#FFFFFF",
    fontSize: 14,
  },
  radioRow: {
    flexDirection: "row",
    gap: 10,
  },
  radioOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B264A",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2A6BC2",
  },
  radioOptionSelected: {
    borderColor: "#D8232A",
    backgroundColor: "#D8232A20",
  },
  radioLabel: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 2,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#0B264A",
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2A6BC2",
  },
  cancelBtnText: {
    color: "#EAF2FB",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 1,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: "#F4D976",
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D8232A",
  },
  submitBtnText: {
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