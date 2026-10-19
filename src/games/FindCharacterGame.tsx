import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { translations, type Language } from '../locales';

type Character = 'bruno' | 'fela';
type SceneItem = {
  id: number;
  kind: 'bruno' | 'fela' | 'decoration';
  decoration?: string;
};

const COLUMNS = 8;
const TOTAL_ROUNDS = 5;
const FOREST_DECORATIONS = ['🌳', '🌲', '🌿', '🍄', '🌼', '🪵', '🪨', '🍃', '🌸', '🦋', '🌱', '☀️'];

const CHARACTER_ASSETS = {
  bruno: require('../../assets/game/landing-page/Bruno.png'),
  fela: require('../../assets/game/landing-page/Fela.png'),
} as const;

function createScene(target: Character, round: number): SceneItem[] {
  const total = COLUMNS * (7 + round);
  const items: SceneItem[] = Array.from({ length: total }, (_, id) => {
    const roll = Math.random();
    if (roll < 0.58) return { id, kind: 'decoration', decoration: FOREST_DECORATIONS[Math.floor(Math.random() * FOREST_DECORATIONS.length)] };
    return { id, kind: target === 'bruno' ? 'fela' : 'bruno' };
  });

  const targetId = Math.floor(Math.random() * total);
  items[targetId] = { id: targetId, kind: target };
  return items;
}

type Props = {
  language: Language;
  onRoundComplete: () => void;
};

export function FindCharacterGame({ language, onRoundComplete }: Props) {
  const t = translations[language];
  const { width: screenWidth } = useWindowDimensions();
  const [target, setTarget] = useState<Character>('bruno');
  const [round, setRound] = useState(1);
  const [scene, setScene] = useState<SceneItem[]>(() => createScene('bruno', 1));
  const [foundId, setFoundId] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState(t.findCharacterPrompt);

  const tileSize = Math.max(28, Math.min(40, Math.floor((screenWidth - 68 - (COLUMNS - 1) * 4) / COLUMNS)));
  const targetImage = target === 'bruno' ? CHARACTER_ASSETS.bruno : CHARACTER_ASSETS.fela;
  const targetName = target === 'bruno' ? t.bruno : t.fela;
  const correctLabel = target === 'bruno' ? t.findBrunoFound : t.findFelaFound;

  const sceneRows = useMemo(() => {
    const rows: SceneItem[][] = [];
    for (let index = 0; index < scene.length; index += COLUMNS) {
      rows.push(scene.slice(index, index + COLUMNS));
    }
    return rows;
  }, [scene]);

  const startGame = (character: Character) => {
    setTarget(character);
    setRound(1);
    setScene(createScene(character, 1));
    setFoundId(null);
    setGameComplete(false);
    setMistakes(0);
    setMessage(t.findCharacterPrompt);
  };

  const selectItem = (item: SceneItem) => {
    if (foundId !== null || gameComplete) return;
    if (item.kind !== target) {
      setMistakes((count) => count + 1);
      setMessage(t.findCharacterTryAgain);
      return;
    }

    setFoundId(item.id);
    if (round === TOTAL_ROUNDS) {
      setGameComplete(true);
      setMessage(t.findCharacterComplete);
      onRoundComplete();
      return;
    }
    setMessage(correctLabel);
  };

  const nextRound = () => {
    const next = round + 1;
    setRound(next);
    setScene(createScene(target, next));
    setFoundId(null);
    setMessage(t.findCharacterPrompt);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.targetCard}>
        <View style={styles.targetCopy}>
          <Text style={styles.eyebrow}>{t.findCharacterTarget}</Text>
          <Text style={styles.targetName}>{targetName}</Text>
          <Text style={styles.instructions}>{t.findCharacterInstructions}</Text>
        </View>
        <Image source={targetImage} style={styles.targetImage} resizeMode="cover" />
      </View>

      <View style={styles.characterPicker}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: target === 'bruno' }}
          onPress={() => startGame('bruno')}
          style={[styles.characterButton, target === 'bruno' && styles.brunoSelected]}
        >
          <Image source={CHARACTER_ASSETS.bruno} style={styles.characterButtonImage} />
          <Text style={styles.characterButtonText}>{t.bruno}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: target === 'fela' }}
          onPress={() => startGame('fela')}
          style={[styles.characterButton, target === 'fela' && styles.felaSelected]}
        >
          <Image source={CHARACTER_ASSETS.fela} style={styles.characterButtonImage} />
          <Text style={styles.characterButtonText}>{t.fela}</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.stats}>{t.findCharacterRound}: {round}/{TOTAL_ROUNDS}</Text>
        <Text style={styles.stats}>{t.findCharacterMistakes}: {mistakes}</Text>
      </View>

      <View style={[styles.scene, { padding: 5 }]}>
        {sceneRows.map((row, rowIndex) => (
          <View key={`scene-row-${rowIndex}`} style={styles.sceneRow}>
            {row.map((item) => {
              const isFound = item.id === foundId;
              const isCharacter = item.kind !== 'decoration';
              const asset = item.kind === 'decoration' ? undefined : CHARACTER_ASSETS[item.kind];
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={t.findCharacterSceneItem}
                  onPress={() => selectItem(item)}
                  style={[
                    styles.sceneTile,
                    {
                      width: tileSize,
                      height: tileSize,
                      backgroundColor: item.id % 2 === 0 ? '#e3edcb' : '#d7e7be',
                    },
                    isFound && styles.foundTile,
                  ]}
                >
                  {isCharacter && asset ? (
                    <Image source={asset} style={{ width: tileSize - 5, height: tileSize - 5, borderRadius: 7 }} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: tileSize * 0.57 }}>{item.decoration}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={[styles.status, foundId !== null && styles.success]}>{message}</Text>
      {foundId !== null && !gameComplete && (
        <Pressable style={styles.nextButton} onPress={nextRound}>
          <Text style={styles.nextButtonText}>{t.findCharacterNextRound}</Text>
        </Pressable>
      )}
      {gameComplete && (
        <Pressable style={styles.nextButton} onPress={() => startGame(target)}>
          <Text style={styles.nextButtonText}>{t.findCharacterPlayAgain}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    alignItems: 'center',
  },
  targetCard: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff8e8',
    borderRadius: 14,
    padding: 10,
    gap: 8,
  },
  targetCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: '#785e3e',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  targetName: {
    color: '#3d2b18',
    fontSize: 21,
    fontWeight: '900',
  },
  instructions: {
    color: '#5f4729',
    fontSize: 12,
    lineHeight: 16,
  },
  targetImage: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e3c88f',
  },
  characterPicker: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 8,
  },
  characterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e3c88f',
    backgroundColor: '#fff9ea',
  },
  brunoSelected: {
    borderColor: '#5881b5',
    backgroundColor: '#eaf2fc',
  },
  felaSelected: {
    borderColor: '#d66f91',
    backgroundColor: '#fcecf1',
  },
  characterButtonImage: {
    width: 25,
    height: 25,
    borderRadius: 8,
  },
  characterButtonText: {
    color: '#4e3b25',
    fontWeight: '800',
  },
  statsRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stats: {
    color: '#644d33',
    fontSize: 13,
    fontWeight: '800',
  },
  scene: {
    alignSelf: 'center',
    backgroundColor: '#a3bd83',
    borderRadius: 12,
    gap: 3,
  },
  sceneRow: {
    flexDirection: 'row',
    gap: 3,
  },
  sceneTile: {
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  foundTile: {
    borderWidth: 3,
    borderColor: '#ffc43d',
    transform: [{ scale: 1.12 }],
    zIndex: 1,
  },
  status: {
    color: '#5f4729',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  success: {
    color: '#2f8b5f',
    fontSize: 15,
    fontWeight: '900',
  },
  nextButton: {
    backgroundColor: '#2f8b5f',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
});
