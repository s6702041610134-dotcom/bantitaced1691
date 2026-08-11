import { Link } from "expo-router";
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../utils/crud-api";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=200&q=80";

type CardProps = {
  phone: {
    id: string;
    name: string;
    sect: string;
    tel: string;
    img?: string;
  };
  index?: number;
  refresh: () => void;
};

export default function Card({ phone, index, refresh }: CardProps) {
  const delPhone = async (id: string) => {
    Alert.alert(
      "CONFIRM DELETION",
      `Delete blueprint record for ${phone.name || "this contact"}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete("/phones/" + id);
              refresh();
            } catch (err) {
              console.log("Delete error:", err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formattedIndex =
    index !== undefined ? (index + 1 < 10 ? `0${index + 1}` : `${index + 1}`) : "01";

  const displayImage = phone.img && phone.img.trim() !== "" ? phone.img : DEFAULT_AVATAR;

  return (
    <View style={styles.cardContainer}>
      {/* Blueprint Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.indexTag}>
          <Text style={styles.indexText}>SPEC #{formattedIndex}</Text>
        </View>

        <View style={styles.sectBadge}>
          <Text style={styles.sectText}>{phone.sect || "CED"}</Text>
        </View>
      </View>

      {/* Main Info Section with Photo Thumbnail */}
      <View style={styles.bodySection}>
        <Link
          href={{
            pathname: "/phoneDetail",
            params: {
              id: phone.id,
              name: phone.name,
              sect: phone.sect,
              tel: phone.tel,
              img: displayImage,
            },
          }}
          asChild
        >
          <TouchableOpacity activeOpacity={0.8} style={styles.avatarWrapper}>
            <Image source={{ uri: displayImage }} style={styles.avatarImage} />
          </TouchableOpacity>
        </Link>

        <View style={styles.infoWrapper}>
          <Text style={styles.nameText}>{phone.name}</Text>
          <View style={styles.telRow}>
            <Text style={styles.telLabel}>TEL: </Text>
            <Text style={styles.telValue}>{phone.tel}</Text>
          </View>
        </View>
      </View>

      {/* Blueprint Grid Divider Line */}
      <View style={styles.gridDivider} />

      {/* Action Buttons Row */}
      <View style={styles.actionRow}>
        <Link
          href={{
            pathname: "/phoneDetail",
            params: {
              id: phone.id,
              name: phone.name,
              sect: phone.sect,
              tel: phone.tel,
              img: displayImage,
            },
          }}
          asChild
        >
          <TouchableOpacity style={styles.viewBtn} activeOpacity={0.8}>
            <Text style={styles.viewBtnText}>VIEW SPEC 🔍</Text>
          </TouchableOpacity>
        </Link>

        <View style={styles.btnGroup}>
          <Link
            href={{
              pathname: "/editPhone",
              params: {
                id: phone.id,
                name: phone.name,
                sect: phone.sect,
                tel: phone.tel,
                img: phone.img || "",
              },
            }}
            asChild
          >
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <Text style={styles.editBtnText}>EDIT</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            onPress={() => delPhone(phone.id)}
            style={styles.deleteBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteBtnText}>DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#103565",
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#4E86C7",
    padding: 14,
    elevation: 5,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 4px 12px rgba(0,0,0,0.4)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }),
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  indexTag: {
    backgroundColor: "#0B264A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#2A6BC2",
  },
  indexText: {
    color: "#EAF2FB",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.2,
  },
  sectBadge: {
    backgroundColor: "#D8232A",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#F4D976",
  },
  sectText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  bodySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#F4D976",
    backgroundColor: "#0B264A",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  infoWrapper: {
    flex: 1,
  },
  nameText: {
    color: "#F4D976",
    fontSize: 20,
    fontWeight: "bold",
    fontStyle: "italic",
    letterSpacing: 0.5,
    marginBottom: 2,
    ...(Platform.OS === "web"
      ? { textShadow: "1px 1px 2px #000000" }
      : {
          textShadowColor: "#000000",
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }),
  },
  telRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  telLabel: {
    color: "#4E86C7",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  telValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  gridDivider: {
    height: 1,
    backgroundColor: "#2A6BC260",
    marginVertical: 8,
    borderStyle: "dashed",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  viewBtn: {
    backgroundColor: "#0B264A",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#4E86C7",
  },
  viewBtnText: {
    color: "#EAF2FB",
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  btnGroup: {
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    backgroundColor: "#F4D976",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D8232A",
  },
  editBtnText: {
    color: "#0F3260",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1,
  },
  deleteBtn: {
    backgroundColor: "#D8232A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#F4D976",
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1,
  },
});