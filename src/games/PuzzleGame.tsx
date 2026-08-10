import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const GRID = 3;
const SOLVED: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 0];

const PUZZLE_IMAGES = [
  {
    id: 'brunopng',
    label: 'Bruno',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/landing-page/Bruno.png') as number,
  },
  {
    id: 'felapng',
    label: 'Fela',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/landing-page/Fela.png') as number,
  },
  {
    id: 'razem',
    label: 'Bruno i Fela',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/Bruno_i_Fela.jpeg') as number,
  },
  {
    id: 'dab',
    label: 'Wielki Dab',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/Dab.jpeg') as number,
  },
];

function getNeighbors(idx: number): number[] {
  const row = Math.floor(idx / GRID);
  const col = idx % GRID;
  const result: number[] = [];
  if (row > 0) result.push(idx - GRID);
  if (row < GRID - 1) result.push(idx + GRID);
  if (col > 0) result.push(idx - 1);
  if (col < GRID - 1) result.push(idx + 1);
  return result;
}

function scramble(steps: number): number[] {
  const tiles = [...SOLVED];
  for (let i = 0; i < steps; i++) {
    const empty = tiles.indexOf(0);
    const neighbors = getNeighbors(empty);
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[empty], tiles[pick]] = [tiles[pick], tiles[empty]];
  }
  return tiles;
}

function isSolved(tiles: number[]): boolean {
  return tiles.every((t, i) => t === SOLVED[i]);
}

type Props = {
  onRoundComplete: () => void;
};

export function PuzzleGame({ onRoundComplete }: Props) {
  const [imageIdx, setImageIdx] = useState(0);
  const [tiles, setTiles] = useState<number[]>(() => scramble(80));
  const [moveCount, setMoveCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const tileSize = containerWidth > 0 ? Math.floor(containerWidth / GRID) : 80;
  const boardSize = tileSize * GRID;
  const currentImage = PUZZLE_IMAGES[imageIdx];

  // Compute cover-mode crop offsets based on the actual image aspect ratio
  // so tiles show the correct portions without distortion.
  const imageDims = useMemo(() => {
    try {
      const src = Image.resolveAssetSource(currentImage.source);
      return { w: src.width || 1, h: src.height || 1 };
    } catch {
      return { w: 1, h: 1 };
    }
  }, [currentImage.source]);

  const aspect = imageDims.w / imageDims.h;
  let cropRenderedW = boardSize;
  let cropRenderedH = boardSize;
  let cropX = 0;
  let cropY = 0;
  if (aspect > 1.02) {
    // landscape — scale to fill height, crop sides
    cropRenderedW = boardSize * aspect;
    cropX = (cropRenderedW - boardSize) / 2;
  } else if (aspect < 0.98) {
    // portrait — scale to fill width, crop top/bottom
    cropRenderedH = boardSize / aspect;
    cropY = (cropRenderedH - boardSize) / 2;
  }

  const handleTileTap = (idx: number) => {
    if (solved) return;
    const emptyIdx = tiles.indexOf(0);
    if (!getNeighbors(idx).includes(emptyIdx)) return;

    const next = [...tiles];
    [next[emptyIdx], next[idx]] = [next[idx], next[emptyIdx]];
    setTiles(next);
    setMoveCount((c) => c + 1);

    if (isSolved(next)) {
      setSolved(true);
      onRoundComplete();
    }
  };

  const resetPuzzle = (newImageIdx?: number) => {
    setTiles(scramble(80));
    setMoveCount(0);
    setSolved(false);
    if (newImageIdx !== undefined) setImageIdx(newImageIdx);
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Ukladaj kafelki, az obrazek bedzie kompletny!</Text>

      <View style={s.pickerRow}>
        {PUZZLE_IMAGES.map((img, i) => (
          <Pressable
            key={img.id}
            onPress={() => resetPuzzle(i)}
            style={[s.pickerBtn, imageIdx === i && s.pickerBtnActive]}
          >
            <Text style={[s.pickerBtnText, imageIdx === i && s.pickerBtnTextActive]}>
              {img.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={s.statsRow}>
        <Text style={s.stats}>Ruchy: {moveCount}</Text>
        <Pressable onPress={() => setShowPreview((v) => !v)} style={s.previewBtn}>
          <Text style={s.previewBtnText}>{showPreview ? '× Ukryj' : '👁️ Podgląd'}</Text>
        </Pressable>
      </View>

      {showPreview && (
        <View style={s.previewBox}>
          <Image
            source={currentImage.source}
            style={s.previewImage}
            resizeMode="contain"
          />
          <Text style={s.previewLabel}>Tak powinien wyglądać gotowy obrazek ↑</Text>
        </View>
      )}

      <View style={{ position: 'relative' }}>
        <View
          style={s.board}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
        {tiles.map((tile, idx) => {
          if (tile === 0) {
            return (
              <View
                key="empty"
                style={[s.tile, { width: tileSize, height: tileSize, backgroundColor: '#e8d9b8' }]}
              />
            );
          }

          const origIdx = tile - 1;
          const origRow = Math.floor(origIdx / GRID);
          const origCol = origIdx % GRID;

          return (
            <Pressable
              key={tile}
              onPress={() => handleTileTap(idx)}
              style={[s.tile, { width: tileSize, height: tileSize, overflow: 'hidden' }]}
            >
              <Image
                source={currentImage.source}
                style={{
                  width: cropRenderedW,
                  height: cropRenderedH,
                  position: 'absolute',
                  top: -origRow * tileSize - cropY,
                  left: -origCol * tileSize - cropX,
                }}
                resizeMode="stretch"
              />
            </Pressable>
          );
        })}
        </View>

        {solved && (
          <View style={s.solvedOverlay}>
            <Text style={s.solvedEmoji}>🎉</Text>
            <Text style={s.solvedTitle}>Brawo!</Text>
            <Text style={s.solvedSub}>Puzzle ułożone za {moveCount} ruchów!</Text>
            <Pressable style={s.solvedBtn} onPress={() => resetPuzzle()}>
              <Text style={s.solvedBtnText}>Nowe układanie</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Pressable style={s.resetBtn} onPress={() => resetPuzzle()}>
        <Text style={s.resetBtnText}>Nowe ukladanie</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewBtn: {
    backgroundColor: '#fff4d7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e3c88f',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewBtnText: {
    color: '#734f2c',
    fontWeight: '800',
    fontSize: 13,
  },
  previewBox: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#c9a97a',
    backgroundColor: '#f6f4ee',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewLabel: {
    color: '#7a542f',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  title: { color: '#3d2b18', fontWeight: '800', fontSize: 14, lineHeight: 20 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
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
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#c9a97a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tile: {},
  solvedOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 240, 180, 0.93)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  solvedEmoji: { fontSize: 52 },
  solvedTitle: { fontSize: 28, fontWeight: '900', color: '#3a2000' },
  solvedSub: { fontSize: 15, fontWeight: '700', color: '#644d33' },
  solvedBtn: {
    backgroundColor: '#cb3f45',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  solvedBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  resetBtn: {
    backgroundColor: '#fff4d7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ecd4a2',
    paddingVertical: 10,
    alignItems: 'center',
  },
  resetBtnText: { color: '#7a542f', fontWeight: '800' },
});
