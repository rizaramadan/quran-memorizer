import React from 'react';
import { StyleSheet, View } from 'react-native';
import MushafPage from '@/components/MushafPage';

interface MushafSpreadProps {
  spreadIndex: number;
}

/**
 * Displays two MushafPage components side-by-side in RTL reading order.
 * Right page = odd number, left page = even number.
 * Spread index 0: right=page 1, left=page 2
 * Spread index 1: right=page 3, left=page 4
 */
function MushafSpread({ spreadIndex }: MushafSpreadProps) {
  const rightPage = spreadIndex * 2 + 1; // odd page (right side)
  const leftPage = spreadIndex * 2 + 2;  // even page (left side)

  return (
    <View style={styles.container}>
      <View style={styles.pageWrapper}>
        <MushafPage pageNumber={leftPage} />
      </View>
      <View style={styles.divider} />
      <View style={styles.pageWrapper}>
        <MushafPage pageNumber={rightPage} />
      </View>
    </View>
  );
}

export default React.memo(MushafSpread);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  pageWrapper: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
});
