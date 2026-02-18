import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getPage, MushafLine, MushafWord } from '@/services/quranData';

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

function renderTextLine(line: MushafLine, lineIndex: number) {
  if (!line.words) return null;

  return (
    <View key={lineIndex} style={styles.textLine}>
      {line.words.map((word: MushafWord, wordIndex: number) => (
        <Text
          key={`${word.location}-${wordIndex}`}
          style={[
            styles.word,
            hasAyahEndMarker(word.word) && styles.ayahEndWord,
          ]}
        >
          {word.word}
        </Text>
      ))}
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
              return renderTextLine(line, index);
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
