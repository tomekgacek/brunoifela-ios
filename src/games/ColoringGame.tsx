import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PALETTE = [
  '#e53935', '#fb8c00', '#fdd835', '#43a047',
  '#1e88e5', '#8e24aa', '#00acc1', '#e91e63',
  '#6d4c41', '#f8bbd0', '#212121', '#a5d6a7',
];

const ERASER = '__eraser__';

const COLORING_IMAGES = [
  { id: '1', label: 'Bruno i Fela', source: require('../../assets/game/kolorowanki/1_Bruno_i_Fela.jpeg') as number },
  { id: '2', label: 'Fela 2',       source: require('../../assets/game/kolorowanki/2_Fela.jpeg') as number },
  { id: '3', label: 'Fela 3',       source: require('../../assets/game/kolorowanki/3_Fela.jpeg') as number },
  { id: '4', label: 'Fela 4',       source: require('../../assets/game/kolorowanki/4_Fela.jpeg') as number },
  { id: '5', label: 'Fela 5',       source: require('../../assets/game/kolorowanki/5_Fela.jpeg') as number },
  { id: '6', label: 'Fela 6',       source: require('../../assets/game/kolorowanki/6_Fela.jpeg') as number },
  { id: '7', label: 'Fela 7',       source: require('../../assets/game/kolorowanki/7_Fela.jpeg') as number },
  { id: '8', label: 'Bruno 8',      source: require('../../assets/game/kolorowanki/8_Bruno.jpeg') as number },
  { id: '9', label: 'Bruno 9',      source: require('../../assets/game/kolorowanki/9_Bruno.jpeg') as number },
];

/** Grid resolution — fine enough for smooth painting, coarse enough for performance */
const COLS = 20;
const ROWS = 26;
const BRUSH = 1; // paints (2*BRUSH+1)^2 cells = 3x3 area

const STORAGE_KEY = 'brunoifela.coloring.v1';

type Props = { onRoundComplete: () => void };

export function ColoringGame({ onRoundComplete }: Props) {
  const { width: screenW } = useWindowDimensions();
  const [imageIdx, setImageIdx] = useState(0);
  const [activeColor, setActiveColor] = useState(PALETTE[0]);
  const [painted, setPainted] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const containerWidth = Math.max(100, screenW - 84);
  const cellW = containerWidth / COLS;
  const cellH = cellW;
  const gridH = cellH * ROWS;

  // Keep a ref so the PanResponder always has the current color
  const activeColorRef = useRef(activeColor);
  activeColorRef.current = activeColor;
  const doneRef = useRef(saved);
  doneRef.current = saved;

  const paintAt = useCallback((lx: number, ly: number) => {
    if (doneRef.current) return;
    const col = Math.min(COLS - 1, Math.max(0, Math.floor(lx / cellW)));
    const row = Math.min(ROWS - 1, Math.max(0, Math.floor(ly / cellH)));
    const keys: string[] = [];
    for (let dr = -BRUSH; dr <= BRUSH; dr++) {
      for (let dc = -BRUSH; dc <= BRUSH; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          keys.push(r + '-' + c);
        }
      }
    }
    const color = activeColorRef.current;
    setPainted((prev) => {
      const next = { ...prev };
      if (color === ERASER) {
        keys.forEach((k) => { delete next[k]; });
      } else {
        keys.forEach((k) => { next[k] = color; });
      }
      return next;
    });
  }, [cellW, cellH]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (e) => paintAt(e.nativeEvent.locationX, e.nativeEvent.locationY),
        onPanResponderMove: (e) => paintAt(e.nativeEvent.locationX, e.nativeEvent.locationY),
      }),
    [paintAt],
  );

  const resetColoring = (newIdx?: number) => {
    setPainted({});
    setSaved(false);
    if (newIdx !== undefined) setImageIdx(newIdx);
  };

  const handleSave = async () => {
    try {
      const data = JSON.stringify({ imageIdx, painted });
      await AsyncStorage.setItem(STORAGE_KEY + '.' + imageIdx, data);
    } catch {}
    setSaved(true);
    onRoundComplete();
  };

  const filledCount = Object.keys(painted).length;
  const pct = Math.round((filledCount / (COLS * ROWS)) * 100);

  return (
    <View style={s.wrap}>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pickerRow}>
        {COLORING_IMAGES.map((img, i) => (
          <Pressable key={img.id} onPress={() => resetColoring(i)} style={[s.pickerBtn, imageIdx === i && s.pickerBtnActive]}>
            <Text style={[s.pickerBtnText, imageIdx === i && s.pickerBtnTextActive]}>{img.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={s.stats}>Pomalowane: {pct}%{saved ? '  ✅ Zapisano!' : ''}</Text>

      {/* Color palette + eraser */}
      <View style={s.palette}>
        {PALETTE.map((color) => (
          <Pressable key={color} onPress={() => setActiveColor(color)}
            style={[s.swatch, { backgroundColor: color }, activeColor === color && s.swatchActive]} />
        ))}
        <Pressable onPress={() => setActiveColor(ERASER)}
          style={[s.swatch, s.eraserSwatch, activeColor === ERASER && s.swatchActive]}>
          <Text style={s.eraserText}>G</Text>
        </Pressable>
      </View>

      {/* Selected color indicator */}
      <View style={s.selectedColorRow}>
        <View style={[s.selectedColorDot, {
          backgroundColor: activeColor === ERASER ? '#f5e6be' : activeColor,
          borderWidth: activeColor === ERASER ? 1 : 0,
          borderColor: '#aaa',
        }]} />
        <Text style={s.selectedColorLabel}>
          {activeColor === ERASER ? 'Gumka' : 'Wybrany kolor'}
        </Text>
      </View>

      {/* Painting canvas — drag to paint */}
      <View
        style={[s.canvas, { width: containerWidth, height: gridH }]}
        {...panResponder.panHandlers}
      >
        <Image source={COLORING_IMAGES[imageIdx].source} style={{ width: containerWidth, height: gridH }} resizeMode="stretch" />
        {/* Painted cells overlay */}
        <View style={[{ position: 'absolute', top: 0, left: 0, width: containerWidth, height: gridH, flexDirection: 'row', flexWrap: 'wrap' }]} pointerEvents="none">
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            const color = painted[row + '-' + col];
            return (
              <View key={i} style={{ width: cellW, height: cellH, backgroundColor: color || 'transparent' }} />
            );
          })}
        </View>
      </View>

      <View style={s.actions}>
        <Pressable style={s.doneBtn} onPress={handleSave}>
          <Text style={s.doneBtnText}>💾 Zapisz rysunek</Text>
        </Pressable>
        <Pressable style={s.resetBtn} onPress={() => resetColoring()}>
          <Text style={s.resetBtnText}>Wyczyść</Text>
        </Pressable>
      </View>

      {saved && (
        <View style={s.savedBanner}>
          <Text style={s.savedBannerText}>🎨 Rysunek zapisany w aplikacji! Zapisanie do Zdjęć będzie dostępne w wersji finalnej.</Text>
          <Pressable onPress={() => setSaved(false)} style={s.savedBannerClose}>
            <Text style={s.savedBannerCloseText}>×</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  title: { color: '#3d2b18', fontWeight: '800', fontSize: 14, lineHeight: 20 },
  pickerRow: { gap: 6, paddingRight: 12 },
  pickerBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: '#e3c88f', backgroundColor: '#fff9ea' },
  pickerBtnActive: { backgroundColor: '#cb3f45', borderColor: '#cb3f45' },
  pickerBtnText: { fontWeight: '700', color: '#664d31', fontSize: 12 },
  pickerBtnTextActive: { color: '#fff' },
  stats: { color: '#644d33', fontWeight: '700', fontSize: 13 },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: '#212121', transform: [{ scale: 1.18 }] },
  eraserSwatch: { backgroundColor: '#fff9ea', borderColor: '#e3c88f', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  eraserText: { fontSize: 18 },
  selectedColorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectedColorDot: { width: 22, height: 22, borderRadius: 11 },
  selectedColorLabel: { color: '#644d33', fontWeight: '700', fontSize: 13 },
  canvas: { borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#e3c88f' },
  actions: { flexDirection: 'row', gap: 8 },
  doneBtn: { flex: 1, backgroundColor: '#2f8b5f', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontWeight: '800' },
  resetBtn: { flex: 1, backgroundColor: '#fff4d7', borderRadius: 10, borderWidth: 1, borderColor: '#ecd4a2', paddingVertical: 10, alignItems: 'center' },
  resetBtnText: { color: '#7a542f', fontWeight: '800' },
  savedBanner: { backgroundColor: '#2f8b5f', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  savedBannerText: { color: '#fff', fontWeight: '700', flex: 1, lineHeight: 20 },
  savedBannerClose: { paddingTop: 2 },
  savedBannerCloseText: { color: '#fff', fontSize: 20, fontWeight: '800' },
});
