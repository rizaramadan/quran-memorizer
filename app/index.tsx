import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quran Memorizer</Text>
      <Text style={styles.subtitle}>Memorize the Quran with ease</Text>
      <Text style={styles.arabic}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a5c2e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  arabic: {
    fontFamily: 'UthmanicHafs',
    fontSize: 32,
    color: '#1a5c2e',
    marginTop: 16,
  },
});
