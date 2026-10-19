import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { translations, type Language } from '../locales';

type Slot = {
  id: number;
  row: number;
  col: number;
  layer: number;
};

type Tile = Slot & {
  kind: number;
};

const PAIR_COUNT = 16;
const GAP = 4;
const SLOTS: Slot[] = [
  ...Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => ({ id: row * 6 + col, row, col, layer: 0 })),
  ).flat(),
  ...Array.from({ length: 2 }, (_, row) =>
    Array.from({ length: 4 }, (_, col) => ({
      id: 24 + row * 4 + col,
      row: row + 1,
      col: col + 1,
      layer: 1,
    })),
  ).flat(),
];

const TILE_KINDS = [
  { icon: '🌰', character: 'bruno' },
  { icon: '🛡️', character: 'bruno' },
  { icon: '📚', character: 'bruno' },
  { icon: '🍎', character: 'bruno' },
  { icon: '🌸', character: 'fela' },
  { icon: '🎨', character: 'fela' },
  { icon: '🪶', character: 'fela' },
  { icon: '🦋', character: 'fela' },
  { icon: '🌳', character: 'team' },
  { icon: '⭐', character: 'team' },
  { icon: '🗺️', character: 'team' },
  { icon: '🏕️', character: 'team' },
  { icon: '🍄', character: 'team' },
  { icon: '🍃', character: 'team' },
  { icon: '🌈', character: 'team' },
  { icon: '💛', character: 'team' },
] as const;

const CHARACTER_COLORS = {
  bruno: '#5881b5',
  fela: '#d66f91',
  team: '#66a677',
} as const;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getFreeTiles<T extends Slot>(tiles: T[], remainingIds: number[]): T[] {
  const remaining = new Set(remainingIds);
  return tiles.filter((tile) => {
    if (!remaining.has(tile.id)) return false;

    const isCovered = tiles.some((other) =>
      remaining.has(other.id) &&
      other.layer > tile.layer &&
      other.row === tile.row &&
      other.col === tile.col,
    );
    if (isCovered) return false;

    const leftBlocked = tiles.some((other) =>
      remaining.has(other.id) &&
      other.layer === tile.layer &&
      other.row === tile.row &&
      other.col === tile.col - 1,
    );
    const rightBlocked = tiles.some((other) =>
      remaining.has(other.id) &&
      other.layer === tile.layer &&
      other.row === tile.row &&
      other.col === tile.col + 1,
    );

    return !leftBlocked || !rightBlocked;
  });
}

function dealTiles(slots: Slot[]): Tile[] {
  const unassigned = new Set(slots.map((slot) => slot.id));
  const kindById = new Map<number, number>();
  let kind = 0;

  while (unassigned.size > 0) {
    const free = shuffle(getFreeTiles(slots, [...unassigned]));
    if (free.length < 2) {
      throw new Error('Unable to deal a solvable Mahjong board.');
    }

    const pair = free.slice(0, 2);
    pair.forEach((slot) => {
      kindById.set(slot.id, kind);
      unassigned.delete(slot.id);
    });
    kind = (kind + 1) % PAIR_COUNT;
  }

  return shuffle(slots.map((slot) => ({ ...slot, kind: kindById.get(slot.id)! })));
}

type Props = {
  language: Language;
  onRoundComplete: () => void;
};

export function MahjongGame({ language, onRoundComplete }: Props) {
  const t = translations[language];
  const { width: screenWidth } = useWindowDimensions();
  const tileWidth = Math.min(54, Math.floor((screenWidth - 64 - GAP * 5) / 6));
  const tileHeight = Math.round(tileWidth * 1.18);
  const boardWidth = tileWidth * 6 + GAP * 5;
  const boardHeight = tileHeight * 4 + GAP * 3 + Math.round(tileWidth * 0.18);
  const [tiles, setTiles] = useState<Tile[]>(() => dealTiles(SLOTS));
  const [remainingIds, setRemainingIds] = useState<number[]>(() => SLOTS.map((slot) => slot.id));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hintIds, setHintIds] = useState<number[]>([]);
  const [message, setMessage] = useState(t.mahjongInstructions);
  const [gameWon, setGameWon] = useState(false);

  const freeTiles = useMemo(() => getFreeTiles(tiles, remainingIds), [tiles, remainingIds]);
  const remainingSet = useMemo(() => new Set(remainingIds), [remainingIds]);
  const characterImages = {
    bruno: require('../../assets/game/landing-page/Bruno.png'),
    fela: require('../../assets/game/landing-page/Fela.png'),
    team: require('../../assets/game/fela_i_bruno.png'),
  };

  const newDeal = (slots: Slot[]) => {
    setTiles(dealTiles(slots));
    setRemainingIds(slots.map((slot) => slot.id));
    setSelectedId(null);
    setHintIds([]);
    setGameWon(false);
    setMessage(t.mahjongInstructions);
  };

  const handleTilePress = (tile: Tile) => {
    if (gameWon || !freeTiles.some((freeTile) => freeTile.id === tile.id)) return;
    setHintIds([]);

    if (selectedId === null) {
      setSelectedId(tile.id);
      setMessage(t.mahjongSelectPair);
      return;
    }

    if (selectedId === tile.id) {
      setSelectedId(null);
      setMessage(t.mahjongInstructions);
      return;
    }

    const selected = tiles.find((candidate) => candidate.id === selectedId);
    if (selected?.kind === tile.kind) {
      const nextRemaining = remainingIds.filter((id) => id !== selected.id && id !== tile.id);
      setRemainingIds(nextRemaining);
      setSelectedId(null);
      if (nextRemaining.length === 0) {
        setGameWon(true);
        setMessage(t.mahjongWon);
        onRoundComplete();
      } else {
        setMessage(t.mahjongPairFound);
      }
      return;
    }

    setSelectedId(tile.id);
    setMessage(t.mahjongNotPair);
  };

  const showHint = () => {
    const freeKinds = new Map<number, number[]>();
    freeTiles.forEach((tile) => {
      const ids = freeKinds.get(tile.kind) ?? [];
      ids.push(tile.id);
      freeKinds.set(tile.kind, ids);
    });
    const pair = [...freeKinds.values()].find((ids) => ids.length > 1);
    if (!pair) {
      setHintIds([]);
      setMessage(t.mahjongNoHint);
      return;
    }
    setHintIds(pair.slice(0, 2));
    setMessage(t.mahjongHintShown);
  };

  const shuffleRemaining = () => {
    const remainingSlots = tiles.filter((tile) => remainingSet.has(tile.id));
    const replacementTiles = dealTiles(remainingSlots);
    const replacementById = new Map(replacementTiles.map((tile) => [tile.id, tile.kind]));
    setTiles((current) => current.map((tile) => {
      const nextKind = replacementById.get(tile.id);
      return nextKind === undefined ? tile : { ...tile, kind: nextKind };
    }));
    setSelectedId(null);
    setHintIds([]);
    setMessage(t.mahjongShuffled);
  };

  const characterName = (character: (typeof TILE_KINDS)[number]['character']) =>
    character === 'bruno' ? 'Bruno' : character === 'fela' ? 'Fela' : t.mahjongTeam;

  return (
    <View style={styles.wrap}>
      <Text style={styles.instructions}>{message}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.stats}>{t.mahjongPairs}: {remainingIds.length / 2}/{PAIR_COUNT}</Text>
        <Text style={styles.stats}>{t.mahjongFree}: {freeTiles.length}</Text>
      </View>

      <View style={[styles.board, { width: boardWidth, height: boardHeight }]}>
        {tiles.filter((tile) => remainingSet.has(tile.id)).map((tile) => {
          const kind = TILE_KINDS[tile.kind];
          const isFree = freeTiles.some((freeTile) => freeTile.id === tile.id);
          const isSelected = selectedId === tile.id;
          const isHinted = hintIds.includes(tile.id);
          const layerOffset = tile.layer * Math.round(tileWidth * 0.18);
          return (
            <Pressable
              key={tile.id}
              accessibilityRole="button"
              accessibilityLabel={`${characterName(kind.character)}, ${t.mahjongTile}, ${isFree ? t.mahjongAvailable : t.mahjongBlocked}`}
              accessibilityState={{ disabled: !isFree }}
              disabled={!isFree}
              onPress={() => handleTilePress(tile)}
              style={[
                styles.tile,
                {
                  left: tile.col * (tileWidth + GAP) + layerOffset,
                  top: tile.row * (tileHeight + GAP) - layerOffset,
                  width: tileWidth,
                  height: tileHeight,
                  zIndex: tile.layer + 1,
                  borderColor: isSelected || isHinted ? '#df9a2d' : CHARACTER_COLORS[kind.character],
                  backgroundColor: isFree ? '#fff9e9' : '#d9c5a3',
                  opacity: isFree ? 1 : 0.72,
                },
                (isSelected || isHinted) && styles.tileHighlighted,
              ]}
            >
              <Text style={styles.tileIcon}>{kind.icon}</Text>
              <Image source={characterImages[kind.character]} style={styles.characterBadge} />
            </Pressable>
          );
        })}
      </View>

      {gameWon ? (
        <View style={styles.winCard}>
          <Text style={styles.winTitle}>{t.mahjongWon}</Text>
          <Pressable style={styles.primaryButton} onPress={() => newDeal(SLOTS)}>
            <Text style={styles.buttonText}>{t.mahjongPlayAgain}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={showHint}>
            <Text style={styles.buttonText}>{t.mahjongHint}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={shuffleRemaining}>
            <Text style={styles.secondaryButtonText}>{t.mahjongShuffle}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => newDeal(SLOTS)}>
            <Text style={styles.secondaryButtonText}>{t.mahjongNewGame}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  instructions: {
    width: '100%',
    color: '#5f4729',
    fontWeight: '700',
    textAlign: 'center',
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  stats: {
    color: '#644d33',
    fontSize: 13,
    fontWeight: '800',
  },
  board: {
    position: 'relative',
    alignSelf: 'center',
  },
  tile: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3d2b18',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2,
    elevation: 3,
  },
  tileHighlighted: {
    borderWidth: 3,
    transform: [{ translateY: -3 }],
  },
  tileIcon: {
    fontSize: 22,
  },
  characterBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#fff',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#2f8b5f',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButton: {
    backgroundColor: '#fff4d7',
    borderWidth: 1,
    borderColor: '#efd8a2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },
  secondaryButtonText: {
    color: '#5f4729',
    fontWeight: '800',
  },
  winCard: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  winTitle: {
    color: '#2f8b5f',
    fontSize: 18,
    fontWeight: '900',
  },
});
