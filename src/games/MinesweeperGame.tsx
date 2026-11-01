import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { translations, type Language } from '../locales';

type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';
type GameStatus = 'ready' | 'playing' | 'won' | 'lost';
type Cell = { mine: boolean; adjacent: number; revealed: boolean; flagged: boolean };
type BoardConfig = { rows: number; columns: number; mines: number };
type Props = { language: Language; onRoundComplete: (score: number) => void };

const BOARD_CONFIG: Record<Difficulty, BoardConfig> = {
  easy: { rows: 8, columns: 8, mines: 10 },
  normal: { rows: 10, columns: 10, mines: 16 },
  hard: { rows: 12, columns: 12, mines: 24 },
  expert: { rows: 14, columns: 14, mines: 36 },
};

function createBoard({ rows, columns, mines }: BoardConfig): Cell[][] {
  const board: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ({
      mine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
    })),
  );
  const positions = Array.from({ length: rows * columns }, (_, index) => index);
  for (let index = positions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [positions[index], positions[swapIndex]] = [positions[swapIndex], positions[index]];
  }
  positions.slice(0, mines).forEach((position) => {
    board[Math.floor(position / columns)][position % columns].mine = true;
  });

  board.forEach((row, y) => row.forEach((cell, x) => {
    if (cell.mine) return;
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        const neighbor = board[y + offsetY]?.[x + offsetX];
        if (neighbor?.mine) cell.adjacent += 1;
      }
    }
  }));
  return board;
}

function safeFirstCell(board: Cell[][], row: number, column: number): Cell[][] {
  if (!board[row][column].mine) return board;
  const nextBoard = board.map((cells) => cells.map((cell) => ({ ...cell })));
  nextBoard[row][column].mine = false;
  const replacement = nextBoard.flatMap((cells, y) =>
    cells.map((cell, x) => ({ cell, y, x })),
  ).find(({ cell, y, x }) => !cell.mine && (y !== row || x !== column));
  if (replacement) replacement.cell.mine = true;

  nextBoard.forEach((cells, y) => cells.forEach((cell, x) => {
    if (cell.mine) {
      cell.adjacent = 0;
      return;
    }
    cell.adjacent = 0;
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        if (nextBoard[y + offsetY]?.[x + offsetX]?.mine) cell.adjacent += 1;
      }
    }
  }));
  return nextBoard;
}

function revealArea(board: Cell[][], row: number, column: number): Cell[][] {
  const nextBoard = board.map((cells) => cells.map((cell) => ({ ...cell })));
  const queue = [[row, column]];
  while (queue.length > 0) {
    const [y, x] = queue.pop()!;
    const cell = nextBoard[y]?.[x];
    if (!cell || cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.adjacent === 0) {
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          if (offsetY !== 0 || offsetX !== 0) queue.push([y + offsetY, x + offsetX]);
        }
      }
    }
  }
  return nextBoard;
}

const NUMBER_COLORS = ['#426d45', '#4b78bd', '#cb5a45', '#7951a0', '#87573b', '#399998', '#403d43', '#777'];

export function MinesweeperGame({ language, onRoundComplete }: Props) {
  const t = translations[language];
  const { width: screenWidth } = useWindowDimensions();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const config = BOARD_CONFIG[difficulty];
  const cellSize = Math.min(42, Math.floor((screenWidth - 36) / config.columns));
  const [board, setBoard] = useState<Cell[][]>(() => createBoard(BOARD_CONFIG.easy));
  const [status, setStatus] = useState<GameStatus>('ready');
  const [flagMode, setFlagMode] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const reportedWin = useRef(false);
  const longPressHandled = useRef(false);

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status === 'won' && !reportedWin.current) {
      reportedWin.current = true;
      onRoundComplete(Math.max(1, config.mines * 10 - seconds));
    }
  }, [config.mines, onRoundComplete, seconds, status]);

  const startGame = (nextDifficulty = difficulty) => {
    setDifficulty(nextDifficulty);
    setBoard(createBoard(BOARD_CONFIG[nextDifficulty]));
    setStatus('ready');
    setFlagMode(false);
    setSeconds(0);
    reportedWin.current = false;
  };

  const toggleFlag = (row: number, column: number) => {
    if (status === 'won' || status === 'lost') return;
    setBoard((current) => current.map((cells, y) =>
      cells.map((cell, x) => y === row && x === column && !cell.revealed
        ? { ...cell, flagged: !cell.flagged }
        : cell),
    ));
  };

  const revealCell = (row: number, column: number) => {
    if (flagMode || status === 'won' || status === 'lost') {
      if (flagMode) toggleFlag(row, column);
      return;
    }
    const startingBoard = status === 'ready' ? safeFirstCell(board, row, column) : board;
    const selected = startingBoard[row][column];
    if (selected.revealed || selected.flagged) return;

    if (selected.mine) {
      setBoard(startingBoard.map((cells) => cells.map((cell) =>
        cell.mine ? { ...cell, revealed: true } : cell,
      )));
      setStatus('lost');
      return;
    }

    const nextBoard = revealArea(startingBoard, row, column);
    setBoard(nextBoard);
    setStatus('playing');
    const safeCells = nextBoard.flat().filter((cell) => cell.revealed).length;
    if (safeCells === config.rows * config.columns - config.mines) setStatus('won');
  };

  const flaggedCount = board.flat().filter((cell) => cell.flagged).length;
  const difficultyOptions: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: t.easy },
    { value: 'normal', label: t.normal },
    { value: 'hard', label: t.hardDifficulty },
    { value: 'expert', label: t.expertDifficulty },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.instructions}>{t.minesweeperInstructions}</Text>
      <Text style={styles.difficultyLabel}>{t.gameDifficulty}</Text>
      <View style={styles.difficultyRow}>
        {difficultyOptions.map(({ value, label }) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: difficulty === value }}
            onPress={() => startGame(value)}
            style={[styles.difficultyButton, difficulty === value && styles.difficultyButtonActive]}
          >
            <Text style={[styles.difficultyText, difficulty === value && styles.activeText]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>{t.minesweeperMines}: {config.mines}</Text>
        <Text style={styles.stat}>{t.minesweeperFlags}: {flaggedCount}</Text>
        <Text style={styles.stat}>⏱ {seconds}s</Text>
      </View>

      <View style={[styles.board, { width: cellSize * config.columns }]}>
        {board.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((cell, columnIndex) => (
              <Pressable
                key={`${rowIndex}-${columnIndex}`}
                accessibilityRole="button"
                accessibilityLabel={cell.revealed ? `${rowIndex + 1}, ${columnIndex + 1}, ${cell.mine ? t.minesweeperMines : cell.adjacent}` : `${rowIndex + 1}, ${columnIndex + 1}`}
                onPressIn={() => {
                  longPressHandled.current = false;
                }}
                onPress={() => {
                  if (longPressHandled.current) {
                    longPressHandled.current = false;
                    return;
                  }
                  revealCell(rowIndex, columnIndex);
                }}
                onLongPress={() => {
                  longPressHandled.current = true;
                  toggleFlag(rowIndex, columnIndex);
                }}
                delayLongPress={300}
                style={[
                  styles.cell,
                  { width: cellSize, height: cellSize },
                  cell.revealed && styles.revealedCell,
                  cell.flagged && styles.flaggedCell,
                ]}
              >
                <Text style={[
                  styles.cellText,
                  cell.adjacent > 0 && styles.number,
                  cell.adjacent > 0 && { color: NUMBER_COLORS[cell.adjacent - 1] },
                ]}>
                  {cell.flagged && !cell.revealed ? '🚩' : cell.revealed && cell.mine ? '🌰' : cell.revealed && cell.adjacent > 0 ? cell.adjacent : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      {status === 'ready' && <Text style={styles.message}>{t.minesweeperReady}</Text>}
      {status === 'won' && <Text style={styles.winMessage}>{t.minesweeperWon}</Text>}
      {status === 'lost' && <Text style={styles.lossMessage}>{t.minesweeperLost}</Text>}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setFlagMode((current) => !current)}
          style={[styles.actionButton, flagMode && styles.flagModeActive]}
        >
          <Text style={styles.actionText}>{flagMode ? t.minesweeperRevealMode : t.minesweeperFlagMode}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => startGame()} style={styles.actionButton}>
          <Text style={styles.actionText}>{t.minesweeperNewGame}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 9, paddingVertical: 4 },
  instructions: { color: '#5f4729', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  difficultyLabel: { color: '#644d33', fontSize: 13, fontWeight: '800' },
  difficultyRow: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  difficultyButton: { minWidth: 62, alignItems: 'center', backgroundColor: '#fff4d7', borderColor: '#efd8a2', borderRadius: 16, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 6 },
  difficultyButtonActive: { backgroundColor: '#2f8b5f', borderColor: '#2f8b5f' },
  difficultyText: { color: '#644d33', fontSize: 11, fontWeight: '800' },
  activeText: { color: '#fff' },
  statsRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  stat: { color: '#644d33', fontSize: 12, fontWeight: '900' },
  board: { overflow: 'hidden', borderColor: '#66834f', borderRadius: 8, borderWidth: 3 },
  row: { flexDirection: 'row' },
  cell: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#dcebc9', borderColor: '#95ae7b', borderWidth: 1, padding: 0 },
  revealedCell: { backgroundColor: '#f8f0d9', borderColor: '#d9cba8' },
  flaggedCell: { backgroundColor: '#f5d894' },
  cellText: { fontSize: 17, fontWeight: '900' },
  number: { fontSize: 15 },
  message: { color: '#644d33', fontWeight: '800', textAlign: 'center' },
  winMessage: { color: '#2f8b5f', fontWeight: '900', textAlign: 'center' },
  lossMessage: { color: '#a34332', fontWeight: '900', textAlign: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  actionButton: { minWidth: 130, alignItems: 'center', backgroundColor: '#2f8b5f', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  flagModeActive: { backgroundColor: '#cb8d2d' },
  actionText: { color: '#fff', fontSize: 12, fontWeight: '900' },
});
