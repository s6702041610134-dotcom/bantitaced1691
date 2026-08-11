// components/card.tsx — song result rendered as a torn theater ticket stub

import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const COLORS = {
  curtainRed: "#7A1B2E",
  curtainRedDark: "#5C1220",
  gilt: "#C9A227",
  parchment: "#F3E7C9",
  ink: "#241512",
};

type Song = {
  id: number | string;
  artist: string;
  track: string;
  cover_url: string;
  preview_url: string;
};

type CardProps = {
  song: Song;
};

export default function Card(props: CardProps) {
  const router = useRouter();

  return (
    <View style={styles.ticket} key={props.song.id}>
      <View style={styles.stub}>
        <Text style={styles.stubLabel}>ADMIT{"\n"}ONE</Text>
      </View>

      <View style={styles.perforation} />

      <View style={styles.body}>
        <Image
          style={styles.cover}
          source={{ uri: props.song.cover_url }}
        />
        <View style={styles.info}>
          <Text style={styles.artist} numberOfLines={1}>
            {props.song.artist}
          </Text>
          <Text style={styles.track} numberOfLines={2}>
            {props.song.track}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/preview",
                params: {
                  artist: props.song.artist,
                  track: props.song.track,
                  cover_url: props.song.cover_url,
                  preview_url: props.song.preview_url,
                },
              })
            }
          >
            <Text style={styles.buttonText}>Preview ▸</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    flexDirection: "row",
    backgroundColor: COLORS.parchment,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.curtainRedDark,
    overflow: "hidden",
  },
  stub: {
    width: 44,
    backgroundColor: COLORS.curtainRed,
    alignItems: "center",
    justifyContent: "center",
  },
  stubLabel: {
    color: COLORS.gilt,
    fontFamily: "CinzelDecorative_700Bold",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 12,
  },
  perforation: {
    width: 0,
    borderLeftWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.curtainRedDark,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  cover: {
    width: 64,
    height: 64,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.curtainRedDark,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  artist: {
    fontFamily: "EBGaramond_600SemiBold",
    color: COLORS.ink,
    fontSize: 16,
  },
  track: {
    fontFamily: "EBGaramond_400Regular",
    fontStyle: "italic",
    color: COLORS.ink,
    fontSize: 14,
    marginBottom: 8,
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.curtainRedDark,
    borderWidth: 1,
    borderColor: COLORS.gilt,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: COLORS.gilt,
    fontFamily: "EBGaramond_600SemiBold",
    fontSize: 12,
  },
});