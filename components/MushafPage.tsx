import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getPage, MushafLine, MushafWord } from '@/services/quranData';
import { useQuranStore } from '@/stores/quranStore';
import { downloadAyah, isDownloaded, playAyah, pauseAudio, prefetchAyah } from '@/services/audioService';

interface MushafPageProps {
  pageNumber: number;
}

/** Bismillah text used for basmala lines */
const BASMALA_TEXT = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

/**
 * Split a word into its text and ayah-end marker (Arabic numeral at end).
 * Words ending an ayah have the ayah number appended, e.g. "ٱلرَّحِيمِ ١"
 * Returns null if no marker found.
 */
function splitAyahMarker(word: string): { text: string; marker: string } | null {
  const match = word.match(/^(.*?)\s+([٠-٩\u0660-\u0669\u06F0-\u06F9]+)\s*$/);
  if (match) {
    return { text: match[1], marker: match[2] };
  }
  return null;
}

function AyahMarkerButton({ marker, surah, ayah, isDarkMode }: { marker: string; surah: number; ayah: number; isDarkMode?: boolean }) {
  const bookmarks = useQuranStore((s) => s.bookmarks);
  const toggleBookmark = useQuranStore((s) => s.toggleBookmark);
  const isBookmarked = bookmarks.includes(`${surah}:${ayah}`);

  return (
    <Pressable onPress={() => toggleBookmark(surah, ayah)}>
      <Text style={[
        styles.ayahMarker,
        isDarkMode && styles.ayahMarkerDark,
        isBookmarked && styles.ayahMarkerBookmarked,
      ]}>
        {' ' + marker}
      </Text>
    </Pressable>
  );
}

function parseLocation(location: string) {
  const parts = location.split(':');
  return { surah: parseInt(parts[0]), ayah: parseInt(parts[1]), wordIndex: parseInt(parts[2]) };
}

type DlState = null | 'downloading' | 'done';

function FirstWord({
  word,
  wordIndex,
  surah,
  ayah,
  isActive,
  setActiveAyah,
  isDarkMode,
}: {
  word: MushafWord;
  wordIndex: number;
  surah: number;
  ayah: number;
  isActive: boolean;
  setActiveAyah: (surah: number, ayah: number) => void;
  isDarkMode?: boolean;
}) {
  const split = splitAyahMarker(word.word);
  const [dlState, setDlState] = useState<DlState>(null);
  const [progress, setProgress] = useState(0);
  const readyRef = useRef(false);
  const pressingRef = useRef(false);
  const playingRef = useRef(false);
  const dlStateRef = useRef<DlState>(null);

  useEffect(() => {
    if (isActive) {
      isDownloaded(surah, ayah).then((v) => { readyRef.current = v; });
    }
  }, [isActive, surah, ayah]);

  // Auto-hide "done" badge after 2s
  useEffect(() => {
    if (dlState === 'done') {
      const t = setTimeout(() => { setDlState(null); dlStateRef.current = null; }, 2000);
      return () => clearTimeout(t);
    }
  }, [dlState]);

  const doDownload = useCallback(async (autoPlay: boolean) => {
    if (readyRef.current || dlStateRef.current === 'downloading') return;
    dlStateRef.current = 'downloading';
    setDlState('downloading');
    setProgress(0);
    const minDelay = new Promise(r => setTimeout(r, 2000));
    await downloadAyah(surah, ayah, setProgress);
    readyRef.current = true;
    prefetchAyah(surah, ayah + 1);
    await minDelay;

    if (autoPlay && pressingRef.current) {
      dlStateRef.current = null;
      setDlState(null);
      playingRef.current = true;
      await playAyah(surah, ayah);
    } else {
      dlStateRef.current = 'done';
      setDlState('done');
    }
  }, [surah, ayah]);

  const handlePress = useCallback(() => {
    setActiveAyah(surah, ayah);
    doDownload(false);
  }, [surah, ayah, setActiveAyah, doDownload]);

  const handleLongPress = useCallback(async () => {
    if (!isActive) {
      setActiveAyah(surah, ayah);
    }
    pressingRef.current = true;

    if (readyRef.current) {
      playingRef.current = true;
      await playAyah(surah, ayah);
      prefetchAyah(surah, ayah + 1);
      return;
    }

    doDownload(true);
  }, [isActive, surah, ayah, setActiveAyah, doDownload]);

  const handlePressOut = useCallback(() => {
    pressingRef.current = false;
    if (playingRef.current) {
      playingRef.current = false;
      pauseAudio();
    }
  }, []);

  return (
    <Pressable
      key={`${word.location}-${wordIndex}`}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressOut={handlePressOut}
    >
      {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
        <View>
          <Text style={[
            styles.word,
            isDarkMode && styles.wordDark,
            hovered && !pressed && !isActive && (isDarkMode ? styles.hoveredWordDark : styles.hoveredWord),
            isActive && !pressed && (isDarkMode ? styles.activeWordDark : styles.activeWord),
            pressed && (isDarkMode ? styles.pressedWordDark : styles.pressedWord),
          ]}>
            {split ? split.text : word.word}
          </Text>
          {split && <AyahMarkerButton marker={split.marker} surah={surah} ayah={ayah} isDarkMode={isDarkMode} />}
          {dlState === 'downloading' && (
            <View style={styles.badge}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
            </View>
          )}
          {dlState === 'done' && (
            <View style={[styles.badge, styles.doneBadge]}>
              <Text style={styles.doneBadgeText}>✓</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

function renderTextLine(
  line: MushafLine,
  lineIndex: number,
  activeAyah: { surah: number; ayah: number } | null,
  setActiveAyah: (surah: number, ayah: number) => void,
  isDarkMode?: boolean,
) {
  if (!line.words) return null;

  return (
    <View key={lineIndex} style={styles.textLine}>
      {line.words.map((word: MushafWord, wordIndex: number) => {
        const loc = parseLocation(word.location);
        const isFirstWord = loc.wordIndex === 1;
        const isActive = activeAyah !== null &&
          activeAyah.surah === loc.surah &&
          activeAyah.ayah === loc.ayah;

        if (isFirstWord) {
          return (
            <FirstWord
              key={`${word.location}-${wordIndex}`}
              word={word}
              wordIndex={wordIndex}
              surah={loc.surah}
              ayah={loc.ayah}
              isActive={isActive}
              setActiveAyah={setActiveAyah}
              isDarkMode={isDarkMode}
            />
          );
        }

        const split = splitAyahMarker(word.word);
        return (
          <React.Fragment key={`${word.location}-${wordIndex}`}>
            <Text style={[styles.word, isDarkMode && styles.wordDark]}>
              {split ? split.text : word.word}
            </Text>
            {split && <AyahMarkerButton marker={split.marker} surah={loc.surah} ayah={loc.ayah} isDarkMode={isDarkMode} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function renderSurahHeader(line: MushafLine, lineIndex: number, isDarkMode?: boolean) {
  return (
    <View key={lineIndex} style={styles.surahHeader}>
      <Text style={[styles.surahHeaderText, isDarkMode && styles.darkText]}>{line.text}</Text>
    </View>
  );
}

function renderBasmala(line: MushafLine, lineIndex: number, isDarkMode?: boolean) {
  return (
    <View key={lineIndex} style={styles.basmalaLine}>
      <Text style={[styles.basmalaText, isDarkMode && styles.darkText]}>{BASMALA_TEXT}</Text>
    </View>
  );
}

function MushafPage({ pageNumber }: MushafPageProps) {
  const page = getPage(pageNumber);
  const activeAyah = useQuranStore((s) => s.activeAyah);
  const setActiveAyah = useQuranStore((s) => s.setActiveAyah);
  const isDarkMode = useQuranStore((s) => s.isDarkMode);

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.linesContainer}>
        {page.lines.map((line, index) => {
          switch (line.type) {
            case 'surah-header':
              return renderSurahHeader(line, index, isDarkMode);
            case 'basmala':
              return renderBasmala(line, index, isDarkMode);
            case 'text':
              return renderTextLine(line, index, activeAyah, setActiveAyah, isDarkMode);
            default:
              return null;
          }
        })}
      </View>
      <Text style={[styles.pageNumber, isDarkMode && styles.pageNumberDark]}>{pageNumber}</Text>
    </View>
  );
}

export default React.memo(MushafPage);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  linesContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textLine: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  word: {
    fontFamily: 'UthmanicHafs',
    fontSize: 22,
    color: '#F5F5F5',
    paddingHorizontal: 2,
    lineHeight: 40,
  },
  hoveredWord: {
    color: '#8B0000',
  },
  activeWord: {
    color: '#5C0000',
  },
  pressedWord: {
    color: '#2A0000',
  },
  ayahMarker: {
    fontFamily: 'UthmanicHafs',
    fontSize: 22,
    color: '#333333',
    paddingHorizontal: 1,
    lineHeight: 40,
  },
  badge: {
    alignSelf: 'center',
    minWidth: 28,
    alignItems: 'center',
    marginTop: 2,
  },
  doneBadge: {
    backgroundColor: '#5C0000',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  doneBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  progressBar: {
    width: 28,
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: 3,
    backgroundColor: '#5C0000',
    borderRadius: 2,
  },
  surahHeader: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  surahHeaderText: {
    fontFamily: 'UthmanicHafs',
    fontSize: 24,
    color: '#333333',
  },
  basmalaLine: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  basmalaText: {
    fontFamily: 'UthmanicHafs',
    fontSize: 22,
    color: '#333333',
  },
  pageNumber: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999999',
    paddingBottom: 4,
  },
  containerDark: {
    backgroundColor: '#141414',
  },
  wordDark: {
    color: '#1a1a1a',
  },
  hoveredWordDark: {
    color: '#ff6b6b',
  },
  activeWordDark: {
    color: '#ff4d4d',
  },
  pressedWordDark: {
    color: '#ff3333',
  },
  ayahMarkerDark: {
    color: 'rgba(255,255,255,0.5)',
  },
  ayahMarkerBookmarked: {
    color: '#1677ff',
  },
  darkText: {
    color: 'rgba(255,255,255,0.65)',
  },
  pageNumberDark: {
    color: 'rgba(255,255,255,0.35)',
  },
});
