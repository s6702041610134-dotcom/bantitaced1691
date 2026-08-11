// app/preview.tsx — video/audio preview staged like a curtained puppet theater
// Run: npx expo install expo-video

import { useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const COLORS = {
  curtainRed: "#7A1B2E",
  curtainRedDark: "#5C1220",
  gilt: "#C9A227",
  giltBright: "#E8C765",
  parchment: "#F3E7C9",
  ink: "#241512",
};

const Preview = () => {
  const windowWidth = useWindowDimensions().width;
  const { artist, track, cover_url, preview_url } = useLocalSearchParams();
  const mediaSource = preview_url;
  const player = useVideoPlayer(mediaSource, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.play();
  });

  return (
    <View style={styles.stage}>
      <Text style={styles.eyebrow}>✦ Now Appearing ✦</Text>
      <Text style={styles.artist}>{artist}</Text>
      <Text style={styles.track}>{track}</Text>

      <Image style={styles.cover} source={{ uri: cover_url }} />

      <View style={styles.curtainFrame}>
        <View style={styles.curtainLeft} />
        <VideoView
          style={[styles.screen, { width: windowWidth - 120 }]}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
        />
        <View style={styles.curtainRightPanel} />
      </View>
    </View>
  );
};

export default Preview;

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: COLORS.curtainRed,
    alignItems: "center",
    paddingTop: 32,
  },
  eyebrow: {
    color: COLORS.giltBright,
    fontFamily: "EBGaramond_600SemiBold",
    letterSpacing: 3,
    fontSize: 12,
    textTransform: "uppercase",
  },
  artist: {
    fontFamily: "CinzelDecorative_700Bold",
    color: COLORS.gilt,
    fontSize: 24,
    marginTop: 6,
    textAlign: "center",
  },
  track: {
    fontFamily: "EBGaramond_400Regular",
    fontStyle: "italic",
    color: "#F6EFDD",
    fontSize: 16,
    marginBottom: 14,
    textAlign: "center",
  },
  cover: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gilt,
    marginBottom: 18,
  },
  curtainFrame: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: COLORS.gilt,
    borderRadius: 14,
    padding: 6,
  },
  curtainLeft: {
    width: 22,
    backgroundColor: COLORS.curtainRedDark,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  curtainRightPanel: {
    width: 22,
    backgroundColor: COLORS.curtainRedDark,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  screen: {
    backgroundColor: "black",
  },
});
