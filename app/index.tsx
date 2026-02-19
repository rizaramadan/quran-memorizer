import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import MushafSpread from '@/components/MushafSpread';
import { TOTAL_PAGES } from '@/services/quranData';
import { useQuranStore } from '@/stores/quranStore';

const TOTAL_SPREADS = TOTAL_PAGES / 2; // 302
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const spreadIndices = Array.from({ length: TOTAL_SPREADS }, (_, i) => i);

export default function HomeScreen() {
  const currentSpread = useQuranStore((s) => s.currentSpread);
  const setCurrentSpread = useQuranStore((s) => s.setCurrentSpread);
  const [hydrated, setHydrated] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Wait for zustand persist hydration before rendering FlatList
    const unsub = useQuranStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // In case hydration already finished before effect ran
    if (useQuranStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const spread = Math.round(offsetX / SCREEN_WIDTH);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setCurrentSpread(spread);
      }, 300);
    },
    [setCurrentSpread],
  );

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

  if (!hydrated) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
        initialScrollIndex={currentSpread}
        onMomentumScrollEnd={handleMomentumScrollEnd}
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
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
