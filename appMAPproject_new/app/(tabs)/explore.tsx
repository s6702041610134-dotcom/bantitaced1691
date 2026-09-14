import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Travel Stories</Text>
      <Text style={styles.text}>Coming soon...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.oldLace,
    padding: 20,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    color: Colors.freshlyRoasted,
    marginBottom: 8,
  },
  text: {
    fontFamily: 'Inter_400Regular',
    color: 'rgba(75, 46, 31, 0.7)',
  }
});
