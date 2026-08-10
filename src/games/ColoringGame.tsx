import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const PALETTE = [
  '#e53935',
  '#fb8c00',
  '#fdd835',
  '#43a047',
  '#1e88e5',
  '#8e24aa',
  '#00acc1',
  '#e91e63',
  '#6d4c41',
  '#f8bbd0',
  '#212121',
  '#a5d6a7',
];

const COLORING_IMAGES = [
  {
    id: '1',
    label: 'Bruno i Fela',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/kolorowanki/1_Bruno_i_Fela.jpeg') as number,
  },
  {
    id: '2',
    label: 'Fela 2',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/kolorowanki/2_Fela.jpeg') as number,
  },
  {
    id: '3',
    label: 'Fela 3',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/kolorowanki/3_Fela.jpeg') as number,
  },
  {
    id: '4',
    label: 'Fela 4',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/kolorowanki/4_Fela.jpeg') as number,
  },
  {
    id: '5',
    label: 'Fela 5',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/kolorowanki/5_Fela.jpeg') as number,
  },
  {
    id: '6',
    label: 'Fela 6',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/kolorowanki/6_Fela.jpeg') as number,
  },
  {
    id: '7',
    label: 'Fela 7',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/kolorowanki/7_Fela.jpeg') as number,
  },
  {
    id: '8',
    label: 'Bruno 8',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/kolorowanki/8_Bruno.jpeg') as number,
  },
  {
    id: '9',
    label: 'Bruno 9',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/kolorowanki/9_Bruno.jpeg') as number,
  },
];

/** Grid dimensions — fine enough to paint, but few enough cells for smooth taps */
const COLS = 12;
const ROWS = 14;

/** Add 70% alpha to a 6-digit hex color */
function withAlpha(hex: string): string {
  return `${hex}b3`;
}

type Props = {
  onRoundComplete: () => void;
};

export function ColoringGame({ onRoundComplete }: Props) {
  const [imageIdx, setImageIdx] = useState(0);
  const [activeColor, setActiveColor] = useState(PALETTE[0]);
  const [painted, setPainted] = useState<Record<string, string>>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [done, setDone] = useState(false);

  const cellW = containerWidth > 0 ? containerWidth / COLS : 28;
  const cellH = cellW;
  const gridH = cellH * ROWS;

  const paintCell = (key: string) => {
    if (done) return;
    setPainted((prev) => {
      const next = { ...prev };
      if (next[key] === activeColor) {
        delete next[key];
      } else {
        next[key] = activeColor;
      }
      return next;
    });
  };

  const resetColoring = (newIdx?: number) => {
    setPainted({});
    setDone(false);
    if (newIdx !== undefined) setImageIdx(newIdx);
  };

  const handleDone = () => {
    setDone(true);
    onRoundComplete();
  };

  const filledCount = Object.keys(painted).length;
  const progressPct = Math.round((filledCount / (COLS * ROWS)) * 100);

  return (
    <View style={s.wrap}>
      <Text style={s.title}>
        Wybierz kolor, potem tapnij obszar na obrazku, aby go pomalowac!
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.pickerRow}
      >
        {COLORING_IMAGES.map((img, i) => (
          <Pressable
            key={img.id}
            onPress={() => resetColoring(i)}
            style={[s.pickerBtn, imageIdx === i && s.pickerBtnActive]}
          >
            <Text style={[s.pickerBtnText, imageIdx === i && s.pickerBtnTextActive]}>
              {img.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={s.stats}>Pomalowane: {progressPct}%{done ? '  Zapisano! 🎨' : ''}</Text>

      <View style={s.palette}>
        {PALETTE.map((color) => (
          <Pressable
            key={color}
            onPress={() => setActiveColor(color)}
            style={[
              s.swatch,
              { backgroundColor: color },
              activeColor === color && s.swatchActive,
            ]}
          />
        ))}
      </View>

      <View
        style={s.canvas}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Image
          source={COLORING_IMAGES[imageIdx].source}
          style={{ width: '100%', height: gridH }}
          resizeMode="stretch"
        />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { flexDirection: 'row', flexWrap: 'wrap' },
          ]}
        >
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            const key = `${row}-${col}`;
            const color = painted[key];
            return (
              <Pressable
                key={key}
                onPress={() => paintCell(key)}
                style={{
                  width: cellW,
                  height: cellH,
                  backgroundColor: color ? withAlpha(color) : 'transparent',
                  borderWidth: 0.3,
                  borderColor: 'rgba(0,0,0,0.07)',
                }}
              />
            );
          })}
        </View>
      </View>

      <View style={s.actions}>
        <Pressable style={s.doneBtn} onPress={handleDone}>
          <Text style={s.doneBtnText}>Gotowe! Zapisz rysunek</Text>
        </Pressable>
        <Pressable style={s.resetBtn} onPress={() => resetColoring()}>
          <Text style={s.resetBtnText}>Wyczysc</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  title: { color: '#3d2b18', fontWeight: '800', fontSize: 14, lineHeight: 20 },
  pickerRow: { gap: 6, paddingRight: 12 },
  pickerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e3c88f',
    backgroundColor: '#fff9ea',
  },
  pickerBtnActive: { backgroundColor: '#cb3f45', borderColor: '#cb3f45' },
  pickerBtnText: { fontWeight: '700', color: '#664d31', fontSize: 12 },
  pickerBtnTextActive: { color: '#fff' },
  stats: { color: '#644d33', fontWeight: '700', fontSize: 13 },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: '#212121',
    transform: [{ scale: 1.18 }],
  },
  canvas: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e3c88f',
  },
  actions: { flexDirection: 'row', gap: 8 },
  doneBtn: {
    flex: 1,
    backgroundColor: '#2f8b5f',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontWeight: '800' },
  resetBtn: {
    flex: 1,
    backgroundColor: '#fff4d7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ecd4a2',
    paddingVertical: 10,
    alignItems: 'center',
  },
  resetBtnText: { color: '#7a542f', fontWeight: '800' },
});
