import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import MushafSpread from '@/components/MushafSpread';
import NavBar from '@/components/NavBar';
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
  const flatListRef = useRef<FlatList>(null);
  const spreadRef = useRef(currentSpread);
  const lastTapRef = useRef<{ time: number; side: 'left' | 'right' } | null>(null);

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
      spreadRef.current = spread;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setCurrentSpread(spread);
      }, 300);
    },
    [setCurrentSpread],
  );

  const handleDoubleTap = useCallback(
    (side: 'left' | 'right') => {
      const now = Date.now();
      const last = lastTapRef.current;
      if (last && last.side === side && now - last.time < 400) {
        // Double tap detected — inverted FlatList: left = next spread, right = previous
        const current = spreadRef.current;
        const next = side === 'left' ? current + 1 : current - 1;
        if (next >= 0 && next < TOTAL_SPREADS) {
          flatListRef.current?.scrollToIndex({ index: next, animated: true });
          spreadRef.current = next;
          setCurrentSpread(next);
        }
        lastTapRef.current = null;
      } else {
        lastTapRef.current = { time: now, side };
      }
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

  const scrollToPage = useCallback(
    (page: number) => {
      const spread = Math.floor((page - 1) / 2);
      flatListRef.current?.scrollToIndex({ index: spread, animated: true });
      spreadRef.current = spread;
      setCurrentSpread(spread);
    },
    [setCurrentSpread],
  );

  const isDarkMode = useQuranStore((s) => s.isDarkMode);

  if (!hydrated) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <NavBar onNavigate={scrollToPage} />
      <FlatList
        ref={flatListRef}
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
      <Pressable
        style={styles.tapZoneLeft}
        onPress={() => handleDoubleTap('left')}
      />
      <Pressable
        style={styles.tapZoneRight}
        onPress={() => handleDoubleTap('right')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#141414',
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapZoneLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 60,
  },
  tapZoneRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
  },
});
