import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { translations, type Language } from '../locales';

const COLUMNS = 10;
const ROWS = 18;
const EMPTY_BOARD: Board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));

type Board = (string | null)[][];
type Difficulty = 'easy' | 'normal' | 'hard';
type GameStatus = 'ready' | 'playing' | 'paused' | 'over';
type Piece = {
  shape: number[][];
  color: string;
  icon: string;
};
type GameState = {
  board: Board;
  piece: Piece;
  nextPiece: Piece;
  x: number;
  y: number;
  status: GameStatus;
  score: number;
  lines: number;
  level: number;
};
type Props = {
  language: Language;
  onRoundComplete: (score: number) => void;
};

const PIECES: Piece[] = [
  { shape: [[1, 1, 1, 1]], color: '#67a8d1', icon: '💧' },
  { shape: [[1, 1], [1, 1]], color: '#efc34d', icon: '🌼' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#a582c4', icon: '🍇' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#e9894d', icon: '🍂' },
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#73ad72', icon: '🍃' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#df7887', icon: '🌸' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#6f8fc2', icon: '⭐' },
];

const DIFFICULTY_SPEED: Record<Difficulty, number> = {
  easy: 850,
  normal: 600,
  hard: 400,
};

function randomPiece(): Piece {
  const piece = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { ...piece, shape: piece.shape.map((row) => [...row]) };
}

function createGame(status: GameStatus = 'ready'): GameState {
  return {
    board: EMPTY_BOARD.map((row) => [...row]),
    piece: randomPiece(),
    nextPiece: randomPiece(),
    x: 3,
    y: 0,
    status,
    score: 0,
    lines: 0,
    level: 1,
  };
}

function isValid(board: Board, piece: Piece, x: number, y: number): boolean {
  return piece.shape.every((row, shapeY) =>
    row.every((cell, shapeX) => {
      if (!cell) return true;
      const boardX = x + shapeX;
      const boardY = y + shapeY;
      return boardX >= 0 && boardX < COLUMNS && boardY < ROWS &&
        (boardY < 0 || board[boardY][boardX] === null);
    }),
  );
}

function rotatePiece(piece: Piece): Piece {
  const shape = piece.shape[0].map((_, column) =>
    piece.shape.map((row) => row[column]).reverse(),
  );
  return { ...piece, shape };
}

function lockPiece(game: GameState, piece: Piece, x: number, y: number): GameState {
  const board = game.board.map((row) => [...row]);
  piece.shape.forEach((row, shapeY) => {
    row.forEach((cell, shapeX) => {
      if (cell && y + shapeY >= 0) board[y + shapeY][x + shapeX] = piece.color;
    });
  });

  const remainingRows = board.filter((row) => row.some((cell) => cell === null));
  const clearedLines = ROWS - remainingRows.length;
  const nextBoard = [
    ...Array.from({ length: clearedLines }, () => Array(COLUMNS).fill(null)),
    ...remainingRows,
  ];
  const nextLines = game.lines + clearedLines;
  const nextPiece = game.nextPiece;
  const spawnX = Math.floor((COLUMNS - nextPiece.shape[0].length) / 2);
  const isOver = !isValid(nextBoard, nextPiece, spawnX, 0);

  return {
    ...game,
    board: nextBoard,
    piece: nextPiece,
    nextPiece: randomPiece(),
    x: spawnX,
    y: 0,
    status: isOver ? 'over' : game.status,
    score: game.score + [0, 100, 300, 500, 800][clearedLines] * game.level,
    lines: nextLines,
    level: Math.floor(nextLines / 10) + 1,
  };
}

function advance(game: GameState): GameState {
  if (isValid(game.board, game.piece, game.x, game.y + 1)) {
    return { ...game, y: game.y + 1 };
  }
  return lockPiece(game, game.piece, game.x, game.y);
}

export function TetrisGame({ language, onRoundComplete }: Props) {
  const t = translations[language];
  const { width: screenWidth } = useWindowDimensions();
  const cellSize = Math.min(34, Math.floor((screenWidth - 48 - 68) / COLUMNS));
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [game, setGame] = useState<GameState>(() => createGame());
  const [bestScore, setBestScore] = useState(0);
  const reportedGameOver = useRef(false);

  useEffect(() => {
    if (game.status !== 'playing') return undefined;
    const timer = setInterval(() => {
      setGame((current) => current.status === 'playing' ? advance(current) : current);
    }, Math.max(100, DIFFICULTY_SPEED[difficulty] - (game.level - 1) * 45));
    return () => clearInterval(timer);
  }, [difficulty, game.level, game.status]);

  useEffect(() => {
    setBestScore((current) => Math.max(current, game.score));
  }, [game.score]);

  useEffect(() => {
    if (game.status !== 'over' || reportedGameOver.current) return;
    reportedGameOver.current = true;
    onRoundComplete(game.score);
  }, [game.score, game.status, onRoundComplete]);

  const startGame = (nextDifficulty = difficulty) => {
    setDifficulty(nextDifficulty);
    reportedGameOver.current = false;
    setGame(createGame('playing'));
  };

  const move = (deltaX: number, deltaY: number) => {
    setGame((current) => {
      if (current.status !== 'playing') return current;
      const x = current.x + deltaX;
      const y = current.y + deltaY;
      return isValid(current.board, current.piece, x, y)
        ? { ...current, x, y }
        : deltaY > 0 ? lockPiece(current, current.piece, current.x, current.y) : current;
    });
  };

  const rotate = () => {
    setGame((current) => {
      if (current.status !== 'playing') return current;
      const piece = rotatePiece(current.piece);
      const wallKick = [0, -1, 1, -2, 2].find((offset) =>
        isValid(current.board, piece, current.x + offset, current.y),
      );
      return wallKick === undefined ? current : { ...current, piece, x: current.x + wallKick };
    });
  };

  const hardDrop = () => {
    setGame((current) => {
      if (current.status !== 'playing') return current;
      let y = current.y;
      while (isValid(current.board, current.piece, current.x, y + 1)) y += 1;
      return lockPiece(
        { ...current, score: current.score + (y - current.y) * 2 },
        current.piece,
        current.x,
        y,
      );
    });
  };

  const visibleBoard = game.board.map((row) => [...row]);
  game.piece.shape.forEach((row, shapeY) => {
    row.forEach((cell, shapeX) => {
      const x = game.x + shapeX;
      const y = game.y + shapeY;
      if (cell && y >= 0 && y < ROWS && x >= 0 && x < COLUMNS) {
        visibleBoard[y][x] = game.piece.color;
      }
    });
  });

  const difficultyOptions: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: t.easy },
    { value: 'normal', label: t.normal },
    { value: 'hard', label: t.hardDifficulty },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.instructions}>{t.tetrisInstructions}</Text>

      <View style={styles.difficultyPicker}>
        <Text style={styles.difficultyLabel}>{t.gameDifficulty}</Text>
        <View style={styles.difficultyOptions}>
          {difficultyOptions.map(({ value, label }) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: difficulty === value }}
              onPress={() => startGame(value)}
              style={[styles.difficultyButton, difficulty === value && styles.difficultyButtonActive]}
            >
              <Text style={[styles.difficultyText, difficulty === value && styles.difficultyTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>{t.score}: {game.score}</Text>
        <Text style={styles.stat}>{t.record}: {bestScore}</Text>
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>{t.tetrisLines}: {game.lines}</Text>
        <Text style={styles.stat}>{t.tetrisLevel}: {game.level}</Text>
      </View>

      <View style={styles.gameArea}>
        <View style={[styles.board, { width: cellSize * COLUMNS, height: cellSize * ROWS }]}>
          {visibleBoard.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.boardRow}>
              {row.map((color, columnIndex) => (
                <View
                  key={`cell-${rowIndex}-${columnIndex}`}
                  style={[
                    styles.cell,
                    { width: cellSize, height: cellSize },
                    color ? { backgroundColor: color, borderColor: '#ffffff88' } : undefined,
                  ]}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.sidePanel}>
          <Text style={styles.nextLabel}>{t.tetrisNext}</Text>
          <View style={styles.nextPiece}>
            {game.nextPiece.shape.map((row, rowIndex) => (
              <View key={`next-row-${rowIndex}`} style={styles.nextRow}>
                {row.map((cell, columnIndex) => (
                  <View
                    key={`next-cell-${rowIndex}-${columnIndex}`}
                    style={[
                      styles.nextCell,
                      cell ? { backgroundColor: game.nextPiece.color } : styles.nextCellEmpty,
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
          <Text style={styles.pieceIcon}>{game.piece.icon}</Text>
        </View>
      </View>

      {game.status === 'ready' && <Text style={styles.status}>{t.tetrisReady}</Text>}
      {game.status === 'paused' && <Text style={styles.status}>{t.tetrisPaused}</Text>}
      {game.status === 'over' && (
        <Text style={styles.gameOver}>{t.tetrisGameOver}: {game.score}</Text>
      )}

      <View style={styles.actions}>
        {game.status === 'playing' ? (
          <Pressable style={styles.primaryButton} onPress={() => setGame((current) => ({ ...current, status: 'paused' }))}>
            <Text style={styles.primaryButtonText}>{t.tetrisPause}</Text>
          </Pressable>
        ) : game.status === 'paused' ? (
          <Pressable style={styles.primaryButton} onPress={() => setGame((current) => ({ ...current, status: 'playing' }))}>
            <Text style={styles.primaryButtonText}>{t.tetrisResume}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.primaryButton} onPress={() => startGame()}>
            <Text style={styles.primaryButtonText}>
              {game.status === 'over' ? t.playAgain : t.start}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <ControlButton label={t.tetrisLeft} icon="◀" onPress={() => move(-1, 0)} disabled={game.status !== 'playing'} />
          <ControlButton label={t.tetrisRotate} icon="⟳" onPress={rotate} disabled={game.status !== 'playing'} />
          <ControlButton label={t.tetrisRight} icon="▶" onPress={() => move(1, 0)} disabled={game.status !== 'playing'} />
        </View>
        <View style={styles.controlRow}>
          <ControlButton label={t.tetrisDown} icon="▼" onPress={() => move(0, 1)} disabled={game.status !== 'playing'} />
          <ControlButton label={t.tetrisDrop} icon="⤓" onPress={hardDrop} disabled={game.status !== 'playing'} />
        </View>
      </View>
    </View>
  );
}

function ControlButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[styles.controlButton, disabled && styles.controlButtonDisabled]}
    >
      <Text style={styles.controlIcon}>{icon}</Text>
      <Text style={styles.controlLabel}>{label}</Text>
    </Pressable>
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
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  difficultyPicker: {
    width: '100%',
    gap: 6,
  },
  difficultyLabel: {
    color: '#644d33',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  difficultyOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  difficultyButton: {
    minWidth: 78,
    alignItems: 'center',
    backgroundColor: '#fff4d7',
    borderColor: '#efd8a2',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  difficultyButtonActive: {
    backgroundColor: '#2f8b5f',
    borderColor: '#2f8b5f',
  },
  difficultyText: {
    color: '#644d33',
    fontSize: 12,
    fontWeight: '800',
  },
  difficultyTextActive: {
    color: '#fff',
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    color: '#644d33',
    fontSize: 13,
    fontWeight: '900',
  },
  gameArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  board: {
    overflow: 'hidden',
    backgroundColor: '#263c35',
    borderColor: '#66834f',
    borderRadius: 10,
    borderWidth: 3,
  },
  boardRow: {
    flexDirection: 'row',
  },
  cell: {
    borderColor: '#ffffff12',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 1,
  },
  sidePanel: {
    width: 56,
    alignItems: 'center',
    gap: 8,
  },
  nextLabel: {
    color: '#644d33',
    fontSize: 12,
    fontWeight: '900',
  },
  nextPiece: {
    minHeight: 76,
    minWidth: 56,
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#fff8e9',
    borderColor: '#efd8a2',
    borderRadius: 8,
    borderWidth: 1,
  },
  nextRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nextCell: {
    width: 12,
    height: 12,
    margin: 1,
    borderRadius: 3,
  },
  nextCellEmpty: {
    backgroundColor: 'transparent',
  },
  pieceIcon: {
    fontSize: 24,
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
  primaryButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
  controls: {
    alignItems: 'center',
    gap: 7,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  controlButton: {
    minWidth: 72,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff4d7',
    borderColor: '#efd8a2',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  controlButtonDisabled: {
    opacity: 0.55,
  },
  controlIcon: {
    color: '#4e3b25',
    fontSize: 18,
    fontWeight: '900',
  },
  controlLabel: {
    color: '#644d33',
    fontSize: 10,
    fontWeight: '800',
  },
});
