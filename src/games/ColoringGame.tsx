import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';

const PALETTE = [
  '#e53935', '#fb8c00', '#fdd835', '#43a047',
  '#1e88e5', '#8e24aa', '#00acc1', '#e91e63',
  '#6d4c41', '#f8bbd0', '#212121', '#a5d6a7',
];

const ERASER = '__eraser__';

const COLORING_IMAGES = [
  { id: '0', label: 'Bruno i Fela 0', source: require('../../assets/game/kolorowanki/0_Brno_i_Fela.png') as number },
  { id: '1', label: 'Bruno i Fela', source: require('../../assets/game/kolorowanki/1_Bruno_i_Fela.jpeg') as number },
  { id: '2', label: 'Fela 2',       source: require('../../assets/game/kolorowanki/2_Fela.jpeg') as number },
  { id: '3', label: 'Fela 3',       source: require('../../assets/game/kolorowanki/3_Fela.jpeg') as number },
  { id: '4', label: 'Fela 4',       source: require('../../assets/game/kolorowanki/4_Fela.jpeg') as number },
  { id: '5', label: 'Fela 5',       source: require('../../assets/game/kolorowanki/5_Fela.jpeg') as number },
  { id: '6', label: 'Fela 6',       source: require('../../assets/game/kolorowanki/6_Fela.jpeg') as number },
  { id: '7', label: 'Fela 7',       source: require('../../assets/game/kolorowanki/7_Fela.jpeg') as number },
  { id: '8', label: 'Bruno 8',      source: require('../../assets/game/kolorowanki/8_Bruno.jpeg') as number },
  { id: '9', label: 'Bruno 9',      source: require('../../assets/game/kolorowanki/9_Bruno.jpeg') as number },
  { id: '10', label: 'Wakacje',     source: require('../../assets/game/kolorowanki/10_Wakacje.png') as number },
];

/** Canvas aspect ratio (height/width), tuned to the coloring page artwork */
const CANVAS_ASPECT = 38 / 30;

const STORAGE_KEY = 'brunoifela.coloring.v2';

type Dot = { id: number; x: number; y: number; color: string; radius: number };

type BrushSize = 'thin' | 'normal' | 'thick';
const BRUSH_SIZE_FACTORS: Record<BrushSize, number> = { thin: 0.55, normal: 1, thick: 1.7 };
const BRUSH_SIZE_LABELS: Record<BrushSize, string> = { thin: 'Cienki', normal: 'Średni', thick: 'Gruby' };

type Props = { onRoundComplete: () => void };

export function ColoringGame({ onRoundComplete }: Props) {
  const { width: screenW } = useWindowDimensions();
  const [imageIdx, setImageIdx] = useState(0);
  const [activeColor, setActiveColor] = useState(PALETTE[0]);
  const [brushSize, setBrushSize] = useState<BrushSize>('normal');
  const [dots, setDots] = useState<Dot[]>([]);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const containerWidth = Math.max(100, screenW - 84);
  const gridH = containerWidth * CANVAS_ASPECT;
  // Brush stamp radius, scaled to canvas size and the chosen thickness.
  const brushRadius = containerWidth * 0.032 * BRUSH_SIZE_FACTORS[brushSize];

  // Keep a ref so the PanResponder always has the current color/size
  const activeColorRef = useRef(activeColor);
  activeColorRef.current = activeColor;
  const brushRadiusRef = useRef(brushRadius);
  brushRadiusRef.current = brushRadius;
  const doneRef = useRef(saved);
  doneRef.current = saved;
  const canvasRef = useRef<View | null>(null);
  const dotIdRef = useRef(0);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const stampAt = useCallback((x: number, y: number) => {
    const radius = brushRadiusRef.current;
    if (activeColorRef.current === ERASER) {
      setDots((prev) => prev.filter((d) => Math.hypot(d.x - x, d.y - y) > radius));
    } else {
      const color = activeColorRef.current;
      setDots((prev) => [...prev, { id: dotIdRef.current++, x, y, color, radius }]);
    }
  }, []);

  // Paints a continuous stroke: interpolates between the last touch point and
  // the new one so fast finger movement still produces an unbroken brush line.
  const paintAt = useCallback((x: number, y: number) => {
    if (doneRef.current) return;
    const last = lastPointRef.current;
    if (last) {
      const dist = Math.hypot(x - last.x, y - last.y);
      const step = Math.max(2, brushRadiusRef.current * 0.5);
      const steps = Math.max(1, Math.round(dist / step));
      for (let i = 1; i <= steps; i += 1) {
        const t = i / steps;
        stampAt(last.x + (x - last.x) * t, last.y + (y - last.y) * t);
      }
    } else {
      stampAt(x, y);
    }
    lastPointRef.current = { x, y };
  }, [stampAt]);

  const endStroke = useCallback(() => {
    lastPointRef.current = null;
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (e) => paintAt(e.nativeEvent.locationX, e.nativeEvent.locationY),
        onPanResponderMove: (e) => paintAt(e.nativeEvent.locationX, e.nativeEvent.locationY),
        onPanResponderRelease: endStroke,
        onPanResponderTerminate: endStroke,
      }),
    [paintAt, endStroke],
  );

  const resetColoring = (newIdx?: number) => {
    setDots([]);
    lastPointRef.current = null;
    setSaved(false);
    if (newIdx !== undefined) setImageIdx(newIdx);
  };

  const askForMediaPermission = async () => {
    const current = await MediaLibrary.getPermissionsAsync(true);
    if (current.granted) {
      return true;
    }

    const requested = await MediaLibrary.requestPermissionsAsync(true);
    if (requested.granted) {
      return true;
    }

    if (!requested.canAskAgain) {
      Alert.alert(
        'Brak dostępu do Zdjęć',
        'Aby zapisywać rysunki, włącz dostęp do Zdjęć w ustawieniach iOS.',
        [
          { text: 'Anuluj', style: 'cancel' },
          {
            text: 'Ustawienia',
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ],
      );
    }

    return false;
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const hasPermission = await askForMediaPermission();
      if (!hasPermission) {
        setIsSaving(false);
        return;
      }

      if (!canvasRef.current) {
        throw new Error('canvas-not-ready');
      }

      const imageUri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      await MediaLibrary.saveToLibraryAsync(imageUri);

      const data = JSON.stringify({ imageIdx, dots });
      await AsyncStorage.setItem(STORAGE_KEY + '.' + imageIdx, data);

      setSaved(true);
      onRoundComplete();
    } catch {
      Alert.alert('Nie udało się zapisać', 'Wystąpił problem podczas zapisu rysunku do Zdjęć. Spróbuj ponownie.');
    } finally {
      setIsSaving(false);
    }
  };

  // Rough coverage estimate from brush-stamp count (not exact, just for feedback).
  const canvasArea = containerWidth * gridH;
  const brushArea = Math.PI * brushRadius * brushRadius;
  const pct = Math.min(100, Math.round((dots.length * brushArea * 0.45) / canvasArea * 100));

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

      {/* Brush thickness picker */}
      <View style={s.brushSizeRow}>
        {(Object.keys(BRUSH_SIZE_FACTORS) as BrushSize[]).map((size) => (
          <Pressable
            key={size}
            onPress={() => setBrushSize(size)}
            style={[s.brushSizeBtn, brushSize === size && s.brushSizeBtnActive]}
          >
            <View style={[s.brushSizeDot, {
              width: 10 + BRUSH_SIZE_FACTORS[size] * 10,
              height: 10 + BRUSH_SIZE_FACTORS[size] * 10,
              borderRadius: 999,
              backgroundColor: brushSize === size ? '#fff' : '#7a542f',
            }]} />
            <Text style={[s.brushSizeText, brushSize === size && s.brushSizeTextActive]}>
              {BRUSH_SIZE_LABELS[size]}
            </Text>
          </Pressable>
        ))}
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
        ref={(node) => {
          canvasRef.current = node;
        }}
        style={[s.canvas, { width: containerWidth, height: gridH }]}
        {...panResponder.panHandlers}
      >
        <Image source={COLORING_IMAGES[imageIdx].source} style={{ width: containerWidth, height: gridH }} resizeMode="stretch" />
        {/* Render each brush stamp as an overlapping circle at its real touch position — a continuous freehand stroke, not a pixel grid */}
        {dots.map((dot) => (
          <View
            key={dot.id}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: dot.x - dot.radius,
              top: dot.y - dot.radius,
              width: dot.radius * 2,
              height: dot.radius * 2,
              borderRadius: dot.radius,
              backgroundColor: dot.color + 'cc',
            }}
          />
        ))}
      </View>

      <View style={s.actions}>
        <Pressable style={[s.doneBtn, isSaving && s.doneBtnDisabled]} onPress={handleSave} disabled={isSaving}>
          <Text style={s.doneBtnText}>{isSaving ? 'Zapisywanie...' : '💾 Zapisz rysunek'}</Text>
        </Pressable>
        <Pressable style={s.resetBtn} onPress={() => resetColoring()}>
          <Text style={s.resetBtnText}>Wyczyść</Text>
        </Pressable>
      </View>

      {saved && (
        <View style={s.savedBanner}>
          <Text style={s.savedBannerText}>🎨 Rysunek zapisany do Zdjęć.</Text>
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
  brushSizeRow: { flexDirection: 'row', gap: 8 },
  brushSizeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e3c88f',
    backgroundColor: '#fff9ea',
  },
  brushSizeBtnActive: { backgroundColor: '#cb3f45', borderColor: '#cb3f45' },
  brushSizeDot: { backgroundColor: '#7a542f' },
  brushSizeText: { fontWeight: '700', color: '#664d31', fontSize: 12 },
  brushSizeTextActive: { color: '#fff' },
  selectedColorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectedColorDot: { width: 22, height: 22, borderRadius: 11 },
  selectedColorLabel: { color: '#644d33', fontWeight: '700', fontSize: 13 },
  canvas: { borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#e3c88f' },
  actions: { flexDirection: 'row', gap: 8 },
  doneBtn: { flex: 1, backgroundColor: '#2f8b5f', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  doneBtnDisabled: { opacity: 0.7 },
  doneBtnText: { color: '#fff', fontWeight: '800' },
  resetBtn: { flex: 1, backgroundColor: '#fff4d7', borderRadius: 10, borderWidth: 1, borderColor: '#ecd4a2', paddingVertical: 10, alignItems: 'center' },
  resetBtnText: { color: '#7a542f', fontWeight: '800' },
  savedBanner: { backgroundColor: '#2f8b5f', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  savedBannerText: { color: '#fff', fontWeight: '700', flex: 1, lineHeight: 20 },
  savedBannerClose: { paddingTop: 2 },
  savedBannerCloseText: { color: '#fff', fontSize: 20, fontWeight: '800' },
});
