// index.tsx — "Wonderful Showtime" themed Apple iTunes search screen
// Fonts: run `npx expo install @expo-google-fonts/cinzel-decorative @expo-google-fonts/eb-garamond expo-font`
// then load 'CinzelDecorative_700Bold' and 'EBGaramond_400Regular' / 'EBGaramond_600SemiBold' before rendering.

import Card from "@/components/card";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// ---- Design tokens: "Wonderful Showtime" palette ----
const COLORS = {
  curtainRed: "#7A1B2E",
  curtainRedDark: "#5C1220",
  gilt: "#C9A227",
  giltBright: "#E8C765",
  parchment: "#F3E7C9",
  ink: "#241512",
  ivory: "#F6EFDD",
};

// Shape of one result item returned by the iTunes Search API
type ITunesResult = {
  trackId: number;
  artistName: string;
  trackName: string;
  artworkUrl100: string;
  previewUrl: string;
};

export default function Index() {
  const [data, setData] = useState<ITunesResult[]>([]);
  const [count, setCount] = useState(0);
  const [entity, setEntity] = useState(false);
  const [term, setTerm] = useState("");

  const windowWidth = useWindowDimensions().width;

  const getData = () => {
    if (term === "") {
      return;
    }
    setData([]);
    const trackType = "&entity=" + (entity ? "musicVideo" : "musicTrack");
    const song = "term=" + term;
    const url =
      "https://itunes.apple.com/search?" + song + trackType + "&limit=5";
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        setData(json.results);
        setCount(json.resultCount);
      });
  };

  return (
    <View style={styles.stage}>
      {/* Marquee title, diamond backdrop */}
      <View style={styles.marquee}>
        <Text style={styles.eyebrow}>✦ An Engagement Of ✦</Text>
        <Text style={styles.title}>Apple iTunes</Text>
        <Text style={styles.titleScript}>({count} discovered)</Text>
      </View>

      {/* The "cabinet" — carved gold-frame box that holds the search form */}
      <View style={styles.cabinet}>
        <View style={styles.cabinetInner}>
          <Text style={styles.label}>Song</Text>
          <TextInput
            value={term}
            style={styles.input}
            placeholder="Name the tune…"
            placeholderTextColor="#8a7a5c"
            onChangeText={(text) => setTerm(text)}
          />

          <View style={styles.row}>
            <Text style={styles.label}>{entity ? "Video" : "Audio"}</Text>
            <Switch
              trackColor={{ true: COLORS.gilt, false: "#8a7a5c" }}
              thumbColor={COLORS.parchment}
              value={entity}
              onValueChange={(value) => setEntity(value)}
            />
          </View>

          <TouchableOpacity onPress={() => getData()} style={styles.button}>
            <Text style={styles.buttonText}>✦ Raise The Curtain ✦</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results — ticket-stub cards */}
      <ScrollView style={{ width: "100%" }}>
        <FlatList
          data={data}
          scrollEnabled={false}
          keyExtractor={(item: ITunesResult, index: number) => String(index)}
          renderItem={({ item }: { item: ITunesResult }) => {
            const song = {
              id: item.trackId,
              artist: item.artistName,
              track: item.trackName,
              cover_url: item.artworkUrl100,
              preview_url: item.previewUrl,
            };
            return <Card song={song} />;
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: COLORS.curtainRed,
    alignItems: "center",
  },
  marquee: {
    width: "100%",
    paddingTop: 36,
    paddingBottom: 20,
    alignItems: "center",
    backgroundColor: COLORS.curtainRed,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gilt,
  },
  eyebrow: {
    color: COLORS.giltBright,
    fontFamily: "EBGaramond_600SemiBold",
    letterSpacing: 3,
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    color: COLORS.gilt,
    fontFamily: "CinzelDecorative_700Bold",
    fontSize: 34,
    textAlign: "center",
  },
  titleScript: {
    color: COLORS.ivory,
    fontFamily: "EBGaramond_400Regular",
    fontStyle: "italic",
    fontSize: 16,
    marginTop: 4,
  },
  cabinet: {
    width: "92%",
    marginTop: 20,
    backgroundColor: COLORS.gilt,
    borderRadius: 14,
    padding: 4,
  },
  cabinetInner: {
    backgroundColor: COLORS.parchment,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.curtainRedDark,
    padding: 16,
  },
  label: {
    fontFamily: "EBGaramond_600SemiBold",
    color: COLORS.ink,
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.curtainRedDark,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    backgroundColor: "#fff",
    fontFamily: "EBGaramond_400Regular",
    fontSize: 16,
    color: COLORS.ink,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  button: {
    backgroundColor: COLORS.curtainRedDark,
    borderWidth: 1.5,
    borderColor: COLORS.gilt,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.giltBright,
    fontFamily: "EBGaramond_600SemiBold",
    fontSize: 15,
    letterSpacing: 1,
  },
});