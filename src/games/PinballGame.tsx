import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { translations, type Language } from '../locales';

type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';
type BoardId = 'forest' | 'school' | 'river';
type GameStatus = 'ready' | 'playing' | 'paused' | 'over';
type Bumper = { x: number; y: number; icon: string; color: string };
type Ball = { x: number; y: number; vx: number; vy: number };
type GameState = {
  ball: Ball;
  score: number;
  lives: number;
  status: GameStatus;
  bumperCooldown: number[];
};
type Props = { language: Language; onRoundComplete: (score: number) => void };

const BOARD_LAYOUTS: Record<BoardId, { background: string; bumpers: Bumper[] }> = {
  forest: {
    background: '#dcebc9',
    bumpers: [
      { x: 25, y: 22, icon: '🌳', color: '#78a763' },
      { x: 72, y: 28, icon: '🍄', color: '#e9894d' },
      { x: 49, y: 46, icon: '🌰', color: '#d5a649' },
      { x: 22, y: 54, icon: '🌼', color: '#e5c852' },
      { x: 77, y: 57, icon: '🦋', color: '#8b79c4' },
    ],
  },
  school: {
    background: '#f4e3ba',
    bumpers: [
      { x: 50, y: 20, icon: '🔔', color: '#d4a940' },
      { x: 27, y: 35, icon: '📚', color: '#7995c4' },
      { x: 73, y: 35, icon: '✏️', color: '#df7887' },
      { x: 50, y: 52, icon: '⭐', color: '#e5c852' },
      { x: 25, y: 59, icon: '🍎', color: '#dc6a57' },
      { x: 75, y: 59, icon: '🎒', color: '#73ad72' },
    ],
  },
  river: {
    background: '#cde9ed',
    bumpers: [
      { x: 30, y: 23, icon: '🐟', color: '#67a8d1' },
      { x: 70, y: 26, icon: '🐚', color: '#e9899d' },
      { x: 50, y: 42, icon: '💧', color: '#67a8d1' },
      { x: 25, y: 54, icon: '🪷', color: '#c97ca8' },
      { x: 75, y: 55, icon: '🌿', color: '#73ad72' },
      { x: 50, y: 63, icon: '⭐', color: '#e5c852' },
    ],
  },
};

const DIFFICULTY_CONFIG: Record<Difficulty, { gravity: number; launch: number; lives: number }> = {
  easy: { gravity: 0.11, launch: 2.8, lives: 4 },
  normal: { gravity: 0.15, launch: 3.2, lives: 3 },
  hard: { gravity: 0.2, launch: 3.7, lives: 3 },
  expert: { gravity: 0.25, launch: 4.1, lives: 2 },
};

const LEFT_BRUNO = require('../../assets/game/landing-page/Bruno.png');
const RIGHT_FELA = require('../../assets/game/landing-page/Fela.png');

function createGame(lives: number, status: GameStatus = 'ready'): GameState {
  return {
    ball: { x: 50, y: 86, vx: 0, vy: 0 },
    score: 0,
    lives,
    status,
    bumperCooldown: [],
  };
}

export function PinballGame({ language, onRoundComplete }: Props) {
  const t = translations[language];
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const boardWidth = Math.min(350, screenWidth - 48);
  const boardHeight = Math.min(480, Math.max(330, screenHeight * 0.5));
  const [boardId, setBoardId] = useState<BoardId>('forest');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [game, setGame] = useState<GameState>(() => createGame(DIFFICULTY_CONFIG.normal.lives));
  const [flippers, setFlippers] = useState({ left: false, right: false });
  const [bestScore, setBestScore] = useState(0);
  const flippersRef = useRef(flippers);
  const difficultyRef = useRef(difficulty);
  const gameRef = useRef(game);
  const reportedGameOver = useRef(false);
  flippersRef.current = flippers;
  difficultyRef.current = difficulty;
  gameRef.current = game;

  useEffect(() => {
    if (game.status !== 'playing') return undefined;
    const timer = setInterval(() => {
      const current = gameRef.current;
      if (current.status !== 'playing') return;

      const config = DIFFICULTY_CONFIG[difficultyRef.current];
      let { x, y, vx, vy } = current.ball;
      vy = Math.min(5.5, vy + config.gravity);
      x += vx;
      y += vy;
      let score = current.score;
      const cooldown = current.bumperCooldown.map((value) => Math.max(0, value - 1));

      if (x < 5) { x = 5; vx = Math.abs(vx) * 0.88; }
      if (x > 95) { x = 95; vx = -Math.abs(vx) * 0.88; }
      if (y < 3) { y = 3; vy = Math.abs(vy) * 0.85; }

      BOARD_LAYOUTS[boardId].bumpers.forEach((bumper, index) => {
        const dx = x - bumper.x;
        const dy = y - bumper.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= 7 || distance === 0) return;
        const nx = dx / distance;
        const ny = dy / distance;
        const velocityAlongNormal = vx * nx + vy * ny;
        if (velocityAlongNormal < 0) {
          vx -= 1.8 * velocityAlongNormal * nx;
          vy -= 1.8 * velocityAlongNormal * ny;
        }
        x = bumper.x + nx * 7;
        y = bumper.y + ny * 7;
        if ((cooldown[index] ?? 0) === 0) {
          score += 10;
          cooldown[index] = 8;
        }
      });

      const heldFlippers = flippersRef.current;
      if (y > 79 && y < 91 && vy > 0) {
        if (heldFlippers.left && x >= 18 && x <= 53) {
          vy = -4.8;
          vx += 0.42;
          y = 78;
          score += 5;
        } else if (heldFlippers.right && x >= 47 && x <= 82) {
          vy = -4.8;
          vx -= 0.42;
          y = 78;
          score += 5;
        }
      }

      if (y > 102) {
        const lives = current.lives - 1;
        if (lives <= 0) {
          setGame({ ...current, ball: { x, y, vx, vy }, score, lives: 0, status: 'over', bumperCooldown: cooldown });
          return;
        }
        x = 50;
        y = 86;
        vx = 0;
        vy = -config.launch;
        setGame({ ...current, ball: { x, y, vx, vy }, score, lives, bumperCooldown: cooldown });
        return;
      }

      setGame({
        ...current,
        ball: { x, y, vx, vy },
        score,
        bumperCooldown: cooldown,
      });
    }, 40);
    return () => clearInterval(timer);
  }, [boardId, game.status]);

  useEffect(() => {
    setBestScore((current) => Math.max(current, game.score));
  }, [game.score]);

  useEffect(() => {
    if (game.status !== 'over' || reportedGameOver.current) return;
    reportedGameOver.current = true;
    onRoundComplete(game.score);
  }, [game.score, game.status, onRoundComplete]);

  const startGame = (nextDifficulty = difficulty, nextBoard = boardId) => {
    setDifficulty(nextDifficulty);
    setBoardId(nextBoard);
    setFlippers({ left: false, right: false });
    reportedGameOver.current = false;
    const nextGame = createGame(DIFFICULTY_CONFIG[nextDifficulty].lives, 'playing');
    nextGame.ball = { x: 50, y: 86, vx: (Math.random() - 0.5) * 0.4, vy: -DIFFICULTY_CONFIG[nextDifficulty].launch };
    setGame(nextGame);
  };

  const boardOptions: { value: BoardId; label: string }[] = [
    { value: 'forest', label: t.pinballForest },
    { value: 'school', label: t.pinballSchool },
    { value: 'river', label: t.pinballRiver },
  ];
  const difficultyOptions: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: t.easy },
    { value: 'normal', label: t.normal },
    { value: 'hard', label: t.hardDifficulty },
    { value: 'expert', label: t.expertDifficulty },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.instructions}>{t.pinballInstructions}</Text>
      <Text style={styles.label}>{t.gameDifficulty}</Text>
      <View style={styles.optionsRow}>
        {difficultyOptions.map(({ value, label }) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: difficulty === value }}
            onPress={() => startGame(value)}
            style={[styles.option, difficulty === value && styles.optionActive]}
          >
            <Text style={[styles.optionText, difficulty === value && styles.optionTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>{t.pinballBoard}</Text>
      <View style={styles.optionsRow}>
        {boardOptions.map(({ value, label }) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: boardId === value }}
            onPress={() => startGame(difficulty, value)}
            style={[styles.boardOption, boardId === value && styles.optionActive]}
          >
            <Text style={[styles.optionText, boardId === value && styles.optionTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>{t.score}: {game.score}</Text>
        <Text style={styles.stat}>{t.record}: {bestScore}</Text>
        <Text style={styles.stat}>{t.pinballLives}: {'⚪'.repeat(game.lives)}</Text>
      </View>

      <View style={[
        styles.table,
        { width: boardWidth, height: boardHeight, backgroundColor: BOARD_LAYOUTS[boardId].background },
      ]}>
        <View style={styles.tableRailLeft} />
        <View style={styles.tableRailRight} />
        {BOARD_LAYOUTS[boardId].bumpers.map((bumper, index) => (
          <View
            key={`${boardId}-${index}`}
            style={[
              styles.bumper,
              { left: `${bumper.x}%`, top: `${bumper.y}%`, backgroundColor: bumper.color },
            ]}
          >
            <Text style={styles.bumperIcon}>{bumper.icon}</Text>
          </View>
        ))}
        <View style={[styles.flipper, styles.leftFlipper, flippers.left && styles.flipperActive]} />
        <View style={[styles.flipper, styles.rightFlipper, flippers.right && styles.flipperActive]} />
        <View style={[styles.ball, { left: `${game.ball.x}%`, top: `${game.ball.y}%` }]} />
        {game.status === 'ready' && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>{t.pinballReady}</Text>
          </View>
        )}
        {game.status === 'over' && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>{t.pinballGameOver}: {game.score}</Text>
          </View>
        )}
        {game.status === 'paused' && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>{t.pinballPaused}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        {game.status === 'playing' ? (
          <Pressable style={styles.startButton} onPress={() => setGame((current) => ({ ...current, status: 'paused' }))}>
            <Text style={styles.startText}>{t.pinballPause}</Text>
          </Pressable>
        ) : game.status === 'paused' ? (
          <Pressable style={styles.startButton} onPress={() => setGame((current) => ({ ...current, status: 'playing' }))}>
            <Text style={styles.startText}>{t.tetrisResume}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.startButton} onPress={() => startGame()}>
            <Text style={styles.startText}>{game.status === 'over' ? t.playAgain : t.pinballStart}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.flipperControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.pinballLeftFlipper}
          onPressIn={() => setFlippers((current) => ({ ...current, left: true }))}
          onPressOut={() => setFlippers((current) => ({ ...current, left: false }))}
          style={[styles.flipperButton, flippers.left && styles.flipperButtonActive]}
        >
          <Image source={LEFT_BRUNO} style={styles.characterImage} />
          <Text style={styles.flipperLabel}>{t.pinballLeftFlipper}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.pinballRightFlipper}
          onPressIn={() => setFlippers((current) => ({ ...current, right: true }))}
          onPressOut={() => setFlippers((current) => ({ ...current, right: false }))}
          style={[styles.flipperButton, flippers.right && styles.flipperButtonActive]}
        >
          <Image source={RIGHT_FELA} style={styles.characterImage} />
          <Text style={styles.flipperLabel}>{t.pinballRightFlipper}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, paddingVertical: 4 },
  instructions: { color: '#5f4729', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  label: { color: '#644d33', fontSize: 12, fontWeight: '900' },
  optionsRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6 },
  option: { minWidth: 62, alignItems: 'center', backgroundColor: '#fff4d7', borderColor: '#efd8a2', borderRadius: 16, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 6 },
  boardOption: { minWidth: 80, alignItems: 'center', backgroundColor: '#fff4d7', borderColor: '#efd8a2', borderRadius: 16, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  optionActive: { backgroundColor: '#2f8b5f', borderColor: '#2f8b5f' },
  optionText: { color: '#644d33', fontSize: 11, fontWeight: '800' },
  optionTextActive: { color: '#fff' },
  statsRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  stat: { color: '#644d33', fontSize: 12, fontWeight: '900' },
  table: { overflow: 'hidden', borderColor: '#66834f', borderRadius: 20, borderWidth: 6 },
  tableRailLeft: { position: 'absolute', top: '2%', bottom: '6%', left: '4%', width: 5, backgroundColor: '#729168', borderRadius: 4 },
  tableRailRight: { position: 'absolute', top: '2%', bottom: '6%', right: '4%', width: 5, backgroundColor: '#729168', borderRadius: 4 },
  bumper: { position: 'absolute', width: 38, height: 38, marginLeft: -19, marginTop: -19, alignItems: 'center', justifyContent: 'center', borderColor: '#fff7df', borderRadius: 20, borderWidth: 3, elevation: 3 },
  bumperIcon: { fontSize: 20 },
  ball: { position: 'absolute', width: 16, height: 16, marginLeft: -8, marginTop: -8, backgroundColor: '#fff', borderColor: '#84919b', borderRadius: 8, borderWidth: 2, elevation: 4 },
  flipper: { position: 'absolute', bottom: '12%', width: '25%', height: 9, backgroundColor: '#ae7350', borderColor: '#70452e', borderRadius: 8, borderWidth: 2 },
  leftFlipper: { left: '19%', transform: [{ rotate: '14deg' }] },
  rightFlipper: { right: '19%', transform: [{ rotate: '-14deg' }] },
  flipperActive: { backgroundColor: '#f3c85b', borderColor: '#bd842c' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#243c35aa', paddingHorizontal: 25 },
  overlayText: { color: '#fff', fontSize: 17, fontWeight: '900', textAlign: 'center' },
  actionsRow: { alignItems: 'center' },
  startButton: { minWidth: 150, alignItems: 'center', backgroundColor: '#2f8b5f', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  startText: { color: '#fff', fontWeight: '900' },
  flipperControls: { width: '100%', flexDirection: 'row', justifyContent: 'space-around', gap: 12 },
  flipperButton: { flex: 1, minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff4d7', borderColor: '#efd8a2', borderRadius: 12, borderWidth: 1, padding: 8 },
  flipperButtonActive: { backgroundColor: '#f5dc8c', borderColor: '#bd842c' },
  characterImage: { width: 32, height: 32, borderRadius: 16 },
  flipperLabel: { color: '#644d33', fontSize: 11, fontWeight: '900' },
});
