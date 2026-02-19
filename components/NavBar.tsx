import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SURAH_DATA, JUZ_DATA, findPageForAyah } from '@/services/quranData';
import { useQuranStore } from '@/stores/quranStore';

interface NavBarProps {
  onNavigate: (page: number) => void;
}

type DropdownType = 'surah' | 'juz' | 'bookmarks' | null;

export default function NavBar({ onNavigate }: NavBarProps) {
  const [open, setOpen] = useState<DropdownType>(null);
  const isDarkMode = useQuranStore((s) => s.isDarkMode);
  const toggleDarkMode = useQuranStore((s) => s.toggleDarkMode);
  const bookmarks = useQuranStore((s) => s.bookmarks);
  const toggleBookmark = useQuranStore((s) => s.toggleBookmark);

  const t = isDarkMode ? dark : light;

  const handleSelect = (page: number) => {
    setOpen(null);
    onNavigate(page);
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, { backgroundColor: t.barBg, borderBottomColor: t.border }]}>
        <View style={styles.barLeft}>
          <Pressable
            style={[styles.button, open === 'juz' && { backgroundColor: t.btnActiveBg }]}
            onPress={() => setOpen(open === 'juz' ? null : 'juz')}
          >
            <Text style={[styles.buttonText, { color: open === 'juz' ? t.btnActiveText : t.btnText }]}>
              Juz
            </Text>
          </Pressable>
          <Pressable
            style={[styles.button, open === 'surah' && { backgroundColor: t.btnActiveBg }]}
            onPress={() => setOpen(open === 'surah' ? null : 'surah')}
          >
            <Text style={[styles.buttonText, { color: open === 'surah' ? t.btnActiveText : t.btnText }]}>
              Surah
            </Text>
          </Pressable>
          <Pressable
            style={[styles.button, open === 'bookmarks' && { backgroundColor: t.btnActiveBg }]}
            onPress={() => setOpen(open === 'bookmarks' ? null : 'bookmarks')}
          >
            <Text style={[styles.buttonText, { color: open === 'bookmarks' ? t.btnActiveText : t.btnText }]}>
              Bookmarks{bookmarks.length > 0 ? ` (${bookmarks.length})` : ''}
            </Text>
          </Pressable>
        </View>
        <Pressable style={styles.themeToggle} onPress={toggleDarkMode}>
          <Text style={styles.themeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </Pressable>
      </View>

      {open !== null && (
        <>
          <Pressable style={styles.backdrop} onPress={() => setOpen(null)} />
          <View style={[styles.dropdown, { backgroundColor: t.dropBg, borderColor: t.border }, open === 'surah' && styles.dropdownSurah, open === 'bookmarks' && styles.dropdownBookmarks]}>
            <ScrollView>
              {open === 'juz' &&
                JUZ_DATA.map((j) => (
                  <Pressable key={j.number} style={[styles.item, { borderBottomColor: t.divider }]} onPress={() => handleSelect(j.startPage)}>
                    <Text style={[styles.itemText, { color: t.text }]}>Juz {j.number}</Text>
                    <Text style={[styles.pageHint, { color: t.hint, backgroundColor: t.tagBg }]}>p.{j.startPage}</Text>
                  </Pressable>
                ))}
              {open === 'surah' &&
                SURAH_DATA.map((s) => (
                  <Pressable key={s.number} style={[styles.item, { borderBottomColor: t.divider }]} onPress={() => handleSelect(s.startPage)}>
                    <View style={styles.surahInfo}>
                      <Text style={[styles.itemTextArabic, { color: t.text }]}>{s.name}</Text>
                      <Text style={[styles.itemTextLatin, { color: t.subtext }]}>{s.latin}</Text>
                    </View>
                    <Text style={[styles.pageHint, { color: t.hint, backgroundColor: t.tagBg }]}>p.{s.startPage}</Text>
                  </Pressable>
                ))}
              {open === 'bookmarks' && bookmarks.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: t.subtext }]}>No bookmarks yet</Text>
                  <Text style={[styles.emptyHint, { color: t.hint }]}>Tap an ayah number to bookmark</Text>
                </View>
              )}
              {open === 'bookmarks' &&
                bookmarks.map((key) => {
                  const [s, a] = key.split(':').map(Number);
                  const surah = SURAH_DATA.find((x) => x.number === s);
                  const page = findPageForAyah(s, a);
                  return (
                    <View key={key} style={[styles.item, { borderBottomColor: t.divider }]}>
                      <Pressable style={styles.bookmarkInfo} onPress={() => page && handleSelect(page)}>
                        <Text style={[styles.itemText, { color: t.text }]}>
                          {surah?.latin || `Surah ${s}`} : {a}
                        </Text>
                        {page && <Text style={[styles.pageHint, { color: t.hint, backgroundColor: t.tagBg }]}>p.{page}</Text>}
                      </Pressable>
                      <Pressable style={styles.removeBtn} onPress={() => toggleBookmark(s, a)}>
                        <Text style={styles.removeText}>x</Text>
                      </Pressable>
                    </View>
                  );
                })}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
}

const light = {
  barBg: '#ffffff',
  border: '#f0f0f0',
  btnText: 'rgba(0,0,0,0.65)',
  btnActiveBg: '#1677ff',
  btnActiveText: '#fff',
  dropBg: '#ffffff',
  divider: '#f5f5f5',
  text: 'rgba(0,0,0,0.88)',
  subtext: 'rgba(0,0,0,0.45)',
  hint: 'rgba(0,0,0,0.45)',
  tagBg: '#fafafa',
};

const dark = {
  barBg: '#141414',
  border: '#303030',
  btnText: 'rgba(255,255,255,0.65)',
  btnActiveBg: '#1668dc',
  btnActiveText: '#fff',
  dropBg: '#1f1f1f',
  divider: '#303030',
  text: 'rgba(255,255,255,0.85)',
  subtext: 'rgba(255,255,255,0.45)',
  hint: 'rgba(255,255,255,0.45)',
  tagBg: '#2a2a2a',
};

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 100,
  },
  bar: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  barLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  themeToggle: {
    padding: 6,
    borderRadius: 6,
  },
  themeIcon: {
    fontSize: 16,
  },
  backdrop: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 101,
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    left: 12,
    maxHeight: 400,
    width: 200,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 102,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  dropdownSurah: {
    width: 240,
  },
  dropdownBookmarks: {
    width: 260,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  surahInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
  },
  itemTextArabic: {
    fontSize: 18,
  },
  itemTextLatin: {
    fontSize: 11,
    marginTop: 1,
  },
  pageHint: {
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bookmarkInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeText: {
    fontSize: 14,
    color: '#ff4d4f',
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  emptyHint: {
    fontSize: 11,
    marginTop: 4,
  },
});
