import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { translations, type Language } from '../locales';

const COLUMNS = 15;
const ROWS = 18;
const TICK_MS = 170;
const INITIAL_SNAKE: Position[] = [
  { x: 7, y: 9 },
  { x: 6, y: 9 },
  { x: 5, y: 9 },
];

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

const BRUNO_IMAGE = require('../../assets/game/landing-page/Bruno.png');

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
  const cellSize = Math.max(12, Math.min(24, Math.floor((screenWidth - 48) / COLUMNS), Math.floor((screenHeight - 350) / ROWS)));
  const boardWidth = cellSize * COLUMNS;
  const boardHeight = cellSize * ROWS;

  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position | null>(() => createFood(INITIAL_SNAKE));
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
    const nextSnake = [...INITIAL_SNAKE];
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
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [onRoundComplete, status]);

  const controlButtons: { direction: Direction; label: string; icon: string }[] = [
    { direction: 'up', label: t.snakeUp, icon: '▲' },
    { direction: 'left', label: t.snakeLeft, icon: '◀' },
    { direction: 'down', label: t.snakeDown, icon: '▼' },
    { direction: 'right', label: t.snakeRight, icon: '▶' },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.instructions}>{t.snakeInstructions}</Text>

      <View style={styles.statsRow}>
        <Text style={styles.stats}>{t.score}: {score}</Text>
        <Text style={styles.stats}>{t.record}: {bestScore}</Text>
      </View>

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
              <Image source={BRUNO_IMAGE} style={styles.snakeHead} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: cellSize * 0.65 }}>{index % 2 === 0 ? '🍃' : '🌿'}</Text>
            )}
          </View>
        ))}
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
  board: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#d5e6bd',
    borderColor: '#66834f',
    borderRadius: 12,
    borderWidth: 3,
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
    width: 52,
    height: 42,
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
    fontSize: 18,
    fontWeight: '900',
  },
});
