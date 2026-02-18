import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getPage, MushafLine, MushafWord } from '@/services/quranData';
import { useQuranStore } from '@/stores/quranStore';

interface MushafPageProps {
  pageNumber: number;
}

/** Bismillah text used for basmala lines */
const BASMALA_TEXT = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

/**
 * Check if a word contains an ayah-end marker (Arabic numeral at end).
 * Words ending an ayah have the ayah number appended, e.g. "ٱلرَّحِيمِ ١"
 */
function hasAyahEndMarker(word: string): boolean {
  return /[\u0660-\u0669\u06F0-\u06F9\u0661-\u0669]+\s*$/.test(word) ||
    /\s[٠-٩١٢٣٤٥٦٧٨٩]+$/.test(word);
}

function parseLocation(location: string) {
  const parts = location.split(':');
  return { surah: parseInt(parts[0]), ayah: parseInt(parts[1]), wordIndex: parseInt(parts[2]) };
}

function renderTextLine(
  line: MushafLine,
  lineIndex: number,
  activeAyah: { surah: number; ayah: number } | null,
  setActiveAyah: (surah: number, ayah: number) => void,
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
            <Pressable
              key={`${word.location}-${wordIndex}`}
              onPress={() => setActiveAyah(loc.surah, loc.ayah)}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Text
                style={[
                  styles.word,
                  isActive && styles.activeWord,
                  hasAyahEndMarker(word.word) && styles.ayahEndWord,
                ]}
              >
                {word.word}
              </Text>
            </Pressable>
          );
        }

        return (
          <Text
            key={`${word.location}-${wordIndex}`}
            style={[
              styles.word,
              hasAyahEndMarker(word.word) && styles.ayahEndWord,
            ]}
          >
            {word.word}
          </Text>
        );
      })}
    </View>
  );
}

function renderSurahHeader(line: MushafLine, lineIndex: number) {
  return (
    <View key={lineIndex} style={styles.surahHeader}>
      <Text style={styles.surahHeaderText}>{line.text}</Text>
    </View>
  );
}

function renderBasmala(line: MushafLine, lineIndex: number) {
  return (
    <View key={lineIndex} style={styles.basmalaLine}>
      <Text style={styles.basmalaText}>{BASMALA_TEXT}</Text>
    </View>
  );
}

export default function MushafPage({ pageNumber }: MushafPageProps) {
  const page = getPage(pageNumber);
  const activeAyah = useQuranStore((s) => s.activeAyah);
  const setActiveAyah = useQuranStore((s) => s.setActiveAyah);

  return (
    <View style={styles.container}>
      <View style={styles.linesContainer}>
        {page.lines.map((line, index) => {
          switch (line.type) {
            case 'surah-header':
              return renderSurahHeader(line, index);
            case 'basmala':
              return renderBasmala(line, index);
            case 'text':
              return renderTextLine(line, index, activeAyah, setActiveAyah);
            default:
              return null;
          }
        })}
      </View>
      <Text style={styles.pageNumber}>{pageNumber}</Text>
    </View>
  );
}

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
    color: '#E8E8E8',
    paddingHorizontal: 2,
    lineHeight: 40,
  },
  activeWord: {
    color: '#8B0000',
  },
  ayahEndWord: {
    color: '#E8E8E8',
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
});
