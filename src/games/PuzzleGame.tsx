import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const GRID = 3;
const CELLS = GRID * GRID;

type Difficulty = 'easy' | 'normal' | 'hard';

// Empty (missing) tile count per difficulty — more empty slots make it easier to slide pieces around.
const DIFFICULTY_EMPTY_COUNT: Record<Difficulty, number> = {
  hard: 1,
  normal: 2,
  easy: 3,
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Łatwy',
  normal: 'Średni',
  hard: 'Trudny',
};

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
  {
    id: 'felaibruno2',
    label: 'Fela i Bruno',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/fela_i_bruno.png') as number,
  },
  {
    id: 'wakacje',
    label: 'Wakacje',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    source: require('../../assets/game/Wakacje.png') as number,
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

/** Solved layout for a given empty-slot count: tiles 1..N in order, then N zeros (empty/missing). */
function getSolvedLayout(emptyCount: number): number[] {
  const filledCount = CELLS - emptyCount;
  return Array.from({ length: CELLS }, (_, i) => (i < filledCount ? i + 1 : 0));
}

function scramble(steps: number, emptyCount: number): number[] {
  const tiles = getSolvedLayout(emptyCount);
  for (let i = 0; i < steps; i++) {
    const emptyIndices = tiles.reduce<number[]>((acc, v, idx) => (v === 0 ? [...acc, idx] : acc), []);
    const empty = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const neighbors = getNeighbors(empty).filter((n) => tiles[n] !== 0);
    if (neighbors.length === 0) continue;
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[empty], tiles[pick]] = [tiles[pick], tiles[empty]];
  }
  return tiles;
}

/** Solved when every present (non-missing) tile sits in its original spot — empty slots are interchangeable. */
function isSolved(tiles: number[], emptyCount: number): boolean {
  const solvedRef = getSolvedLayout(emptyCount);
  return tiles.every((t, i) => solvedRef[i] === 0 || t === solvedRef[i]);
}

type Props = {
  onRoundComplete: () => void;
};

export function PuzzleGame({ onRoundComplete }: Props) {
  const [imageIdx, setImageIdx] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('hard');
  const [tiles, setTiles] = useState<number[]>(() => scramble(80, DIFFICULTY_EMPTY_COUNT.hard));
  const [moveCount, setMoveCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [setupStep, setSetupStep] = useState<'difficulty' | 'image' | 'play'>('difficulty');
  const [hasStarted, setHasStarted] = useState(false);

  const emptyCount = DIFFICULTY_EMPTY_COUNT[difficulty];

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
    if (tiles[idx] === 0) return;
    const emptyNeighbor = getNeighbors(idx).find((n) => tiles[n] === 0);
    if (emptyNeighbor === undefined) return;

    const next = [...tiles];
    [next[idx], next[emptyNeighbor]] = [next[emptyNeighbor], next[idx]];
    setTiles(next);
    setMoveCount((c) => c + 1);

    if (isSolved(next, emptyCount)) {
      setSolved(true);
      onRoundComplete();
    }
  };

  const resetPuzzle = (newImageIdx?: number, newDifficulty?: Difficulty) => {
    const effectiveDifficulty = newDifficulty ?? difficulty;
    setTiles(scramble(80, DIFFICULTY_EMPTY_COUNT[effectiveDifficulty]));
    setMoveCount(0);
    setSolved(false);
    if (newImageIdx !== undefined) {
      setImageIdx(newImageIdx);
    }
    if (newDifficulty !== undefined) {
      setDifficulty(newDifficulty);
    }
  };

  const chooseDifficulty = (level: Difficulty) => {
    resetPuzzle(undefined, level);
    setSetupStep(hasStarted ? 'play' : 'image');
  };

  const chooseImage = (newImageIdx: number) => {
    resetPuzzle(newImageIdx);
    setHasStarted(true);
    setSetupStep('play');
  };

  if (setupStep === 'difficulty') {
    return (
      <View style={s.wrap}>
        <Text style={s.title}>Wybierz poziom trudności</Text>
        <View style={s.choiceGrid}>
          {(Object.keys(DIFFICULTY_EMPTY_COUNT) as Difficulty[]).map((level) => (
            <Pressable
              key={level}
              onPress={() => chooseDifficulty(level)}
              style={[s.choiceBtn, difficulty === level && s.pickerBtnActive]}
            >
              <Text style={[s.choiceBtnText, difficulty === level && s.pickerBtnTextActive]}>
                {DIFFICULTY_LABELS[level]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  if (setupStep === 'image') {
    return (
      <View style={s.wrap}>
        <Text style={s.title}>Wybierz rysunek do puzzli</Text>
        <View style={s.imageGrid}>
          {PUZZLE_IMAGES.map((img, i) => (
            <Pressable
              key={img.id}
              onPress={() => chooseImage(i)}
              style={[s.imageChoice, imageIdx === i && s.imageChoiceActive]}
            >
              <Image source={img.source} style={s.imageChoicePreview} resizeMode="cover" />
              <Text style={[s.pickerBtnText, imageIdx === i && s.pickerBtnTextActive]}>
                {img.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Układaj kafelki, aż obrazek będzie kompletny!</Text>
      <View style={s.statsRow}>
        <Text style={s.stats}>Ruchy: {moveCount}</Text>
        <Text style={s.stats}>{currentImage.label} · {DIFFICULTY_LABELS[difficulty]}</Text>
      </View>

      {/* Board */}
      <View style={s.boardSection}>
        <View
          style={s.board}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
        {tiles.map((tile, idx) => {
          if (tile === 0) {
            return (
              <View
                key={`empty-${idx}`}
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

      <View style={s.actionsRow}>
        <Pressable style={s.resetBtn} onPress={() => setSetupStep('image')}>
          <Text style={s.resetBtnText}>Zmień Puzzle</Text>
        </Pressable>
        <Pressable style={s.resetBtn} onPress={() => setSetupStep('difficulty')}>
          <Text style={s.resetBtnText}>Zmień Poziom</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 12 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  statsButtons: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
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
  choiceGrid: { gap: 8 },
  choiceBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3c88f',
    backgroundColor: '#fff9ea',
    alignItems: 'center',
  },
  choiceBtnText: { fontWeight: '800', color: '#664d31', fontSize: 16 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageChoice: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3c88f',
    backgroundColor: '#fff9ea',
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 8,
    gap: 7,
  },
  imageChoiceActive: { backgroundColor: '#cb3f45', borderColor: '#cb3f45' },
  imageChoicePreview: { width: '100%', height: 92 },
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
  boardSection: {
    position: 'relative',
    marginTop: 2,
    marginBottom: 2,
  },
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
    flex: 1,
    backgroundColor: '#fff4d7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ecd4a2',
    paddingVertical: 10,
    marginTop: 4,
    alignItems: 'center',
  },
  actionsRow: { flexDirection: 'row', gap: 8 },
  resetBtnText: { color: '#7a542f', fontWeight: '800' },
});
