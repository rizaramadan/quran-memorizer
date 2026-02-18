import { StyleSheet, View } from 'react-native';
import MushafPage from '@/components/MushafPage';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <MushafPage pageNumber={1} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
