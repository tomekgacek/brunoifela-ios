export type CellValue = 0 | 1 | 2 | 3 | 4;
export type Board = CellValue[][];

export type CellPos = {
  row: number;
  col: number;
};

const ROWS = 6;
const COLS = 6;
const COLORS = 5;

function randomCell(): CellValue {
  return Math.floor(Math.random() * COLORS) as CellValue;
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row] as CellValue[]);
}

function keyOf(row: number, col: number): string {
  return `${row}-${col}`;
}

function findMatches(board: Board): Set<string> {
  const matches = new Set<string>();

  for (let row = 0; row < ROWS; row += 1) {
    let start = 0;
    while (start < COLS) {
      let end = start + 1;
      while (end < COLS && board[row][end] === board[row][start]) {
        end += 1;
      }
      if (end - start >= 3) {
        for (let col = start; col < end; col += 1) {
          matches.add(keyOf(row, col));
        }
      }
      start = end;
    }
  }

  for (let col = 0; col < COLS; col += 1) {
    let start = 0;
    while (start < ROWS) {
      let end = start + 1;
      while (end < ROWS && board[end][col] === board[start][col]) {
        end += 1;
      }
      if (end - start >= 3) {
        for (let row = start; row < end; row += 1) {
          matches.add(keyOf(row, col));
        }
      }
      start = end;
    }
  }

  return matches;
}

function collapseBoard(board: Board, matches: Set<string>): { next: Board; removed: number } {
  const temp: (CellValue | null)[][] = board.map((row) => row.map((value) => value));

  matches.forEach((key) => {
    const [rowStr, colStr] = key.split('-');
    const row = Number(rowStr);
    const col = Number(colStr);
    temp[row][col] = null;
  });

  const next: Board = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => 0 as CellValue));

  for (let col = 0; col < COLS; col += 1) {
    const columnValues: CellValue[] = [];
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      const value = temp[row][col];
      if (value !== null) {
        columnValues.push(value);
      }
    }

    while (columnValues.length < ROWS) {
      columnValues.push(randomCell());
    }

    for (let row = ROWS - 1; row >= 0; row -= 1) {
      next[row][col] = columnValues[ROWS - 1 - row];
    }
  }

  return { next, removed: matches.size };
}

function resolveBoard(board: Board): { board: Board; removed: number } {
  let current = cloneBoard(board);
  let totalRemoved = 0;

  while (true) {
    const matches = findMatches(current);
    if (matches.size === 0) {
      break;
    }
    const collapsed = collapseBoard(current, matches);
    current = collapsed.next;
    totalRemoved += collapsed.removed;
  }

  return { board: current, removed: totalRemoved };
}

export function createInitialBoard(): Board {
  const raw: Board = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => randomCell() as CellValue),
  );

  return resolveBoard(raw).board;
}

function isAdjacent(a: CellPos, b: CellPos): boolean {
  const dRow = Math.abs(a.row - b.row);
  const dCol = Math.abs(a.col - b.col);
  return dRow + dCol === 1;
}

export function swapAndResolve(board: Board, first: CellPos, second: CellPos): { board: Board; removed: number } {
  if (!isAdjacent(first, second)) {
    return { board, removed: 0 };
  }

  const next = cloneBoard(board);
  const tmp = next[first.row][first.col];
  next[first.row][first.col] = next[second.row][second.col];
  next[second.row][second.col] = tmp;

  const matches = findMatches(next);
  if (matches.size === 0) {
    return { board, removed: 0 };
  }

  return resolveBoard(next);
}
