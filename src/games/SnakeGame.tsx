import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { translations, type Language } from '../locales';

const COLUMNS = 15;
const ROWS = 18;
type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';
type Character = 'bruno' | 'fela';
const DIFFICULTY_SPEED: Record<Difficulty, number> = {
  easy: 240,
  normal: 170,
  hard: 115,
  expert: 85,
};

type Position = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';
type GameStatus = 'ready' | 'playing' | 'paused' | 'over';

const DIRECTION_DELTAS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

const CHARACTER_IMAGES: Record<Character, number> = {
  bruno: require('../../assets/game/landing-page/Bruno.png'),
  fela: require('../../assets/game/landing-page/Fela.png'),
};

function createSnake(): Position[] {
  const y = Math.floor(ROWS / 2);
  const x = Math.floor(COLUMNS / 2);
  return [{ x, y }, { x: x - 1, y }, { x: x - 2, y }];
}

function createFood(snake: Position[]): Position | null {
  const occupied = new Set(snake.map(({ x, y }) => `${x},${y}`));
  const available: Position[] = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLUMNS; x += 1) {
      if (!occupied.has(`${x},${y}`)) available.push({ x, y });
    }
  }
  return available.length === 0 ? null : available[Math.floor(Math.random() * available.length)];
}

type Props = {
  language: Language;
  onRoundComplete: (score: number) => void;
};

export function SnakeGame({ language, onRoundComplete }: Props) {
  const t = translations[language];
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const cellSize = Math.max(12, Math.min(24, Math.floor((screenWidth - 64) / COLUMNS), Math.floor((screenHeight - 390) / ROWS)));
  const boardWidth = cellSize * COLUMNS;
  const boardHeight = cellSize * ROWS;

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [character, setCharacter] = useState<Character>('bruno');
  const initialSnake = createSnake();
  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [food, setFood] = useState<Position | null>(() => createFood(initialSnake));
  const [direction, setDirection] = useState<Direction>('right');
  const [status, setStatus] = useState<GameStatus>('ready');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const directionRef = useRef(direction);
  const queuedDirectionRef = useRef(direction);
  const scoreRef = useRef(0);

  const updateStatus = (nextStatus: GameStatus) => {
    setStatus(nextStatus);
  };

  const startGame = () => {
    const nextSnake = createSnake();
    const nextFood = createFood(nextSnake);
    snakeRef.current = nextSnake;
    foodRef.current = nextFood;
    directionRef.current = 'right';
    queuedDirectionRef.current = 'right';
    scoreRef.current = 0;
    setSnake(nextSnake);
    setFood(nextFood);
    setDirection('right');
    setScore(0);
    updateStatus('playing');
  };

  const changeDirection = (nextDirection: Direction) => {
    if (nextDirection === OPPOSITE_DIRECTIONS[directionRef.current]) return;
    queuedDirectionRef.current = nextDirection;
    setDirection(nextDirection);
  };

  useEffect(() => {
    if (status !== 'playing') return undefined;

    const timer = setInterval(() => {
      const currentSnake = snakeRef.current;
      directionRef.current = queuedDirectionRef.current;
      const delta = DIRECTION_DELTAS[directionRef.current];
      const nextHead = { x: currentSnake[0].x + delta.x, y: currentSnake[0].y + delta.y };
      const currentFood = foodRef.current;
      const eatsFood = currentFood !== null && currentFood.x === nextHead.x && currentFood.y === nextHead.y;
      const collisionBody = eatsFood ? currentSnake : currentSnake.slice(0, -1);
      const hitWall = nextHead.x < 0 || nextHead.x >= COLUMNS || nextHead.y < 0 || nextHead.y >= ROWS;
      const hitSnake = collisionBody.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

      if (hitWall || hitSnake) {
        updateStatus('over');
        onRoundComplete(scoreRef.current);
        return;
      }

      const nextSnake = [nextHead, ...currentSnake.slice(0, eatsFood ? undefined : -1)];
      snakeRef.current = nextSnake;
      setSnake(nextSnake);

      if (eatsFood) {
        const nextScore = scoreRef.current + 1;
        scoreRef.current = nextScore;
        setScore(nextScore);
        setBestScore((currentBest) => Math.max(currentBest, nextScore));
        const nextFood = createFood(nextSnake);
        foodRef.current = nextFood;
        setFood(nextFood);
        if (nextFood === null) {
          updateStatus('over');
          onRoundComplete(nextScore);
        }
      }
    }, DIFFICULTY_SPEED[difficulty]);

    return () => clearInterval(timer);
  }, [difficulty, onRoundComplete, status]);

  const controlButtons: { direction: Direction; label: string; icon: string }[] = [
    { direction: 'up', label: t.snakeUp, icon: '▲' },
    { direction: 'left', label: t.snakeLeft, icon: '◀' },
    { direction: 'down', label: t.snakeDown, icon: '▼' },
    { direction: 'right', label: t.snakeRight, icon: '▶' },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.instructions}>{t.snakeInstructions}</Text>

      <View style={styles.pickers}>
        <Text style={styles.pickerTitle}>{t.gameDifficulty}</Text>
        <View style={styles.pickerRow}>
          {([
            { value: 'easy', label: t.easy },
            { value: 'normal', label: t.normal },
            { value: 'hard', label: t.hardDifficulty },
            { value: 'expert', label: t.expertDifficulty },
          ] as { value: Difficulty; label: string }[]).map(({ value, label }) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: difficulty === value }}
              onPress={() => {
                setDifficulty(value);
                startGame();
              }}
              style={[styles.pickerButton, difficulty === value && styles.pickerButtonActive]}
            >
              <Text style={[styles.pickerButtonText, difficulty === value && styles.pickerButtonTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.pickerTitle}>{t.snakeCharacter}</Text>
        <View style={styles.pickerRow}>
          {(['bruno', 'fela'] as Character[]).map((nextCharacter) => (
            <Pressable
              key={nextCharacter}
              accessibilityRole="button"
              accessibilityState={{ selected: character === nextCharacter }}
              onPress={() => setCharacter(nextCharacter)}
              style={[styles.characterButton, character === nextCharacter && styles.pickerButtonActive]}
            >
              <Image source={CHARACTER_IMAGES[nextCharacter]} style={styles.characterImage} />
              <Text style={[styles.pickerButtonText, character === nextCharacter && styles.pickerButtonTextActive]}>
                {nextCharacter === 'bruno' ? t.bruno : t.fela}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.stats}>{t.score}: {score}</Text>
        <Text style={styles.stats}>{t.record}: {bestScore}</Text>
      </View>

      <View style={[styles.boardWall, { width: boardWidth + 10, height: boardHeight + 10 }]}>
       <View style={[styles.board, { width: boardWidth, height: boardHeight }]}>
        {food && (
          <Text style={[styles.food, {
            left: food.x * cellSize,
            top: food.y * cellSize,
            width: cellSize,
            height: cellSize,
            fontSize: cellSize * 0.8,
          }]}>
            🌰
          </Text>
        )}
        {snake.map((segment, index) => (
          <View
            key={`${segment.x}-${segment.y}-${index}`}
            style={[styles.segment, {
              left: segment.x * cellSize,
              top: segment.y * cellSize,
              width: cellSize,
              height: cellSize,
            }]}
          >
            {index === 0 ? (
              <Image source={CHARACTER_IMAGES[character]} style={styles.snakeHead} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: cellSize * 0.65 }}>{index % 2 === 0 ? '🍃' : '🌿'}</Text>
            )}
          </View>
        ))}
        </View>
      </View>

      {status === 'ready' && <Text style={styles.status}>{t.snakeReady}</Text>}
      {status === 'paused' && <Text style={styles.status}>{t.snakePaused}</Text>}
      {status === 'over' && <Text style={styles.gameOver}>{t.snakeGameOver}: {score}</Text>}

      <View style={styles.actions}>
        {status === 'playing' ? (
          <Pressable style={styles.primaryButton} onPress={() => updateStatus('paused')}>
            <Text style={styles.buttonText}>{t.snakePause}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.primaryButton} onPress={startGame}>
            <Text style={styles.buttonText}>{status === 'over' ? t.playAgain : t.start}</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.controls}>
        {[controlButtons.slice(0, 1), controlButtons.slice(1)].map((row, rowIndex) => (
          <View key={`control-row-${rowIndex}`} style={styles.controlRow}>
            {row.map(({ direction: nextDirection, label, icon }) => (
              <Pressable
                key={nextDirection}
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={() => changeDirection(nextDirection)}
                style={[
                  styles.controlButton,
                  direction === nextDirection && status === 'playing' && styles.controlButtonActive,
                ]}
              >
                <Text style={styles.controlButtonText}>{icon}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  pickers: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  pickerTitle: {
    color: '#644d33',
    fontSize: 13,
    fontWeight: '800',
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  pickerButton: {
    minWidth: 76,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    backgroundColor: '#fff4d7',
    borderColor: '#efd8a2',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pickerButtonActive: {
    backgroundColor: '#2f8b5f',
    borderColor: '#2f8b5f',
  },
  pickerButtonText: {
    color: '#644d33',
    fontSize: 12,
    fontWeight: '800',
  },
  pickerButtonTextActive: {
    color: '#fff',
  },
  characterButton: {
    minWidth: 104,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    backgroundColor: '#fff4d7',
    borderColor: '#efd8a2',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  characterImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  instructions: {
    color: '#5f4729',
    fontWeight: '700',
    textAlign: 'center',
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stats: {
    color: '#644d33',
    fontSize: 14,
    fontWeight: '900',
  },
  boardWall: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#66834f',
    borderColor: '#3e5e3a',
    borderRadius: 10,
    borderWidth: 3,
    padding: 2,
  },
  board: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#d5e6bd',
  },
  segment: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#78a763',
    borderColor: '#527e49',
    borderRadius: 7,
    borderWidth: 1,
  },
  snakeHead: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  food: {
    position: 'absolute',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  status: {
    color: '#644d33',
    fontWeight: '800',
  },
  gameOver: {
    color: '#a34332',
    fontSize: 17,
    fontWeight: '900',
  },
  actions: {
    alignItems: 'center',
  },
  primaryButton: {
    minWidth: 150,
    alignItems: 'center',
    backgroundColor: '#2f8b5f',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
  },
  controls: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 6,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  controlButton: {
    width: 76,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff4d7',
    borderColor: '#efd8a2',
    borderRadius: 10,
    borderWidth: 1,
  },
  controlButtonActive: {
    backgroundColor: '#e5f1dc',
    borderColor: '#78a763',
  },
  controlButtonText: {
    color: '#4e3b25',
    fontSize: 28,
    fontWeight: '900',
  },
});
