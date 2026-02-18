import React, { useCallback } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import MushafSpread from '@/components/MushafSpread';
import { TOTAL_PAGES } from '@/services/quranData';

const TOTAL_SPREADS = TOTAL_PAGES / 2; // 302
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const spreadIndices = Array.from({ length: TOTAL_SPREADS }, (_, i) => i);

export default function HomeScreen() {
  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <View style={{ width: SCREEN_WIDTH }}>
        <MushafSpread spreadIndex={item} />
      </View>
    ),
    [],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback((item: number) => `spread-${item}`, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={spreadIndices}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        inverted
        getItemLayout={getItemLayout}
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={1}
        removeClippedSubviews
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
