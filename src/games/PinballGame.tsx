import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { translations, type Language } from '../locales';

type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';
type GameStatus = 'ready' | 'playing' | 'paused' | 'over';
type Target = { x: number; y: number; radius: number; points: number };
type Ball = { x: number; y: number; vx: number; vy: number };
type ScorePopupItem = { id: number; x: number; y: number; points: number };
type GameState = {
  ball: Ball;
  score: number;
  lives: number;
  status: GameStatus;
  bumperCooldown: number[];
  litTargets: boolean[];
};
type Props = { language: Language; onRoundComplete: (score: number) => void };

const FOREST_TARGETS: Target[] = [
  { x: 35, y: 26, radius: 4, points: 15 },
  { x: 50, y: 22, radius: 4, points: 25 },
  { x: 65, y: 26, radius: 4, points: 15 },
  { x: 29, y: 39, radius: 5, points: 10 },
  { x: 50, y: 33, radius: 5, points: 20 },
  { x: 72, y: 39, radius: 5, points: 10 },
  { x: 30, y: 55, radius: 4.5, points: 8 },
  { x: 50, y: 48, radius: 4.5, points: 14 },
  { x: 72, y: 55, radius: 4.5, points: 8 },
  { x: 23, y: 65, radius: 3, points: 5 },
  { x: 77, y: 65, radius: 3, points: 5 },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { gravity: number; launch: number; lives: number }> = {
  easy: { gravity: 0.24, launch: 6.2, lives: 4 },
  normal: { gravity: 0.3, launch: 6.5, lives: 3 },
  hard: { gravity: 0.34, launch: 7, lives: 3 },
  expert: { gravity: 0.4, launch: 7.4, lives: 2 },
};

const BALL_RADIUS = 15;
const DRAIN_LEFT = 43;
const DRAIN_RIGHT = 57;

function getRailBounds(y: number): { left: number; right: number } {
  const funnelProgress = Math.max(0, Math.min(1, (y - 66) / 23));
  const left = 9 + funnelProgress * 8;
  return { left, right: 100 - left };
}

const LEFT_BRUNO = require('../../assets/game/landing-page/Bruno.png');
const RIGHT_FELA = require('../../assets/game/landing-page/Fela.png');
const FOREST_PINBALL = require('../../assets/game/ForestPinball.png');

function ScorePopup({ item, onDone }: { item: ScorePopupItem; onDone: (id: number) => void }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -60, duration: 700, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onDone(item.id);
    });
  }, [item.id, onDone, opacity, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.scorePopup,
        { left: `${item.x}%`, top: `${item.y}%`, opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.scorePopupText}>+{item.points}</Text>
    </Animated.View>
  );
}

function createGame(lives: number, status: GameStatus = 'ready'): GameState {
  return {
    ball: { x: 50, y: 86, vx: 0, vy: 0 },
    score: 0,
    lives,
    status,
    bumperCooldown: [],
    litTargets: FOREST_TARGETS.map(() => false),
  };
}

export function PinballGame({ language, onRoundComplete }: Props) {
  const t = translations[language];
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const boardWidth = Math.min(350, screenWidth - 48, Math.floor((screenHeight - 320) / 1.5));
  const boardHeight = boardWidth * 1.5;
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [game, setGame] = useState<GameState>(() => createGame(DIFFICULTY_CONFIG.normal.lives));
  const [flippers, setFlippers] = useState({ left: false, right: false });
  const [bestScore, setBestScore] = useState(0);
  const [scorePopups, setScorePopups] = useState<ScorePopupItem[]>([]);
  const scorePopupIdRef = useRef(0);
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
      vy = Math.min(7.5, vy + config.gravity);
      x += vx;
      y += vy;
      let score = current.score;
      const newPopups: ScorePopupItem[] = [];
      const cooldown = current.bumperCooldown.map((value) => Math.max(0, value - 1));
      const litTargets = [...current.litTargets];

      if (x < 8) { x = 8; vx = Math.abs(vx) * 0.92; }
      if (x > 92) { x = 92; vx = -Math.abs(vx) * 0.92; }
      if (y < 3) { y = 3; vy = Math.abs(vy) * 0.9; }

      FOREST_TARGETS.forEach((target, index) => {
        const dx = (x - target.x) * boardWidth / 100;
        const dy = (y - target.y) * boardHeight / 100;
        const distance = Math.hypot(dx, dy);
        const collisionRadius = target.radius * boardWidth / 100 + BALL_RADIUS;
        if (distance >= collisionRadius) return;
        const speed = Math.hypot(vx * boardWidth / 100, vy * boardHeight / 100);
        const nx = distance > 0 ? dx / distance : speed > 0 ? -(vx * boardWidth / 100) / speed : 0;
        const ny = distance > 0 ? dy / distance : speed > 0 ? -(vy * boardHeight / 100) / speed : -1;
        const velocityAlongNormal = vx * boardWidth / 100 * nx + vy * boardHeight / 100 * ny;
        if (velocityAlongNormal < 0) {
          vx -= 1.8 * velocityAlongNormal * nx * 100 / boardWidth;
          vy -= 1.8 * velocityAlongNormal * ny * 100 / boardHeight;
        }
        x = target.x + nx * collisionRadius * 100 / boardWidth;
        y = target.y + ny * collisionRadius * 100 / boardHeight;
        litTargets[index] = true;
        if ((cooldown[index] ?? 0) === 0) {
          score += target.points;
          newPopups.push({ id: scorePopupIdRef.current++, x: target.x, y: target.y, points: target.points });
          cooldown[index] = 12;
        }
      });

      const railBounds = getRailBounds(y);
      const ballRadiusX = BALL_RADIUS * 100 / boardWidth;
      const ballRadiusY = BALL_RADIUS * 100 / boardHeight;
      if (x < railBounds.left + ballRadiusX) {
        x = railBounds.left + ballRadiusX;
        vx = Math.abs(vx) * 0.82;
      } else if (x > railBounds.right - ballRadiusX) {
        x = railBounds.right - ballRadiusX;
        vx = -Math.abs(vx) * 0.82;
      }

      const heldFlippers = flippersRef.current;
      if (y > 82 && y < 94 && vy > 0) {
        if (x < DRAIN_LEFT && x >= railBounds.left) {
          y = 82;
          if (heldFlippers.left) {
            vy = -7.2;
            vx += 0.55;
            score += 5;
            newPopups.push({ id: scorePopupIdRef.current++, x: 30, y: 84, points: 5 });
          } else {
            vx = Math.max(vx, 0.65);
            vy = 0.7;
          }
        } else if (x > DRAIN_RIGHT && x <= railBounds.right) {
          y = 82;
          if (heldFlippers.right) {
            vy = -7.2;
            vx -= 0.55;
            score += 5;
            newPopups.push({ id: scorePopupIdRef.current++, x: 70, y: 84, points: 5 });
          } else {
            vx = Math.min(vx, -0.65);
            vy = 0.7;
          }
        }
      }

      if (y > 96 && x >= DRAIN_LEFT && x <= DRAIN_RIGHT) {
        if (newPopups.length > 0) setScorePopups((popups) => [...popups, ...newPopups]);
        const lives = current.lives - 1;
        if (lives <= 0) {
          setGame({ ...current, ball: { x, y, vx, vy }, score, lives: 0, status: 'over', bumperCooldown: cooldown, litTargets });
          return;
        }
        x = 50;
        y = 90;
        vx = 0;
        vy = -config.launch;
        setGame({ ...current, ball: { x, y, vx, vy }, score, lives, bumperCooldown: cooldown, litTargets });
        return;
      }

      if (y > 92) {
        y = 92;
        vy = -Math.abs(vy) * 0.55;
      }

      if (newPopups.length > 0) setScorePopups((popups) => [...popups, ...newPopups]);
      setGame({
        ...current,
        ball: { x, y, vx: Math.max(-8, Math.min(8, vx)), vy: Math.max(-8, Math.min(8, vy)) },
        score,
        bumperCooldown: cooldown,
        litTargets,
      });
    }, 40);
    return () => clearInterval(timer);
  }, [boardWidth, boardHeight, game.status]);

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
    setFlippers({ left: false, right: false });
    setScorePopups([]);
    reportedGameOver.current = false;
    const nextGame = createGame(DIFFICULTY_CONFIG[nextDifficulty].lives, 'playing');
    nextGame.ball = { x: 50, y: 89, vx: (Math.random() - 0.5) * 0.5, vy: -DIFFICULTY_CONFIG[nextDifficulty].launch };
    setGame(nextGame);
  };

  const removeScorePopup = useCallback((id: number) => {
    setScorePopups((popups) => popups.filter((popup) => popup.id !== id));
  }, []);

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
      <View style={styles.statsRow}>
        <Text style={styles.stat}>{t.score}: {game.score}</Text>
        <Text style={styles.stat}>{t.record}: {bestScore}</Text>
        <Text style={styles.stat}>{t.pinballLives}: {'⚪'.repeat(game.lives)}</Text>
      </View>

      <ImageBackground
        source={FOREST_PINBALL}
        resizeMode="stretch"
        imageStyle={styles.tableImage}
        style={[styles.table, { width: boardWidth, height: boardHeight }]}
      >
        {FOREST_TARGETS.map((target, index) => game.litTargets[index] ? (
          <View
            key={`target-glow-${index}`}
            pointerEvents="none"
            style={[
              styles.targetGlow,
              { left: `${target.x}%`, top: `${target.y}%` },
            ]}
          />
        ) : null)}
        <View style={[styles.flipperGlow, styles.leftFlipper, flippers.left && styles.flipperActive]} />
        <View style={[styles.flipperGlow, styles.rightFlipper, flippers.right && styles.flipperActive]} />
        <View style={[styles.ball, { left: `${game.ball.x}%`, top: `${game.ball.y}%` }]} />
        {scorePopups.map((popup) => (
          <ScorePopup key={popup.id} item={popup} onDone={removeScorePopup} />
        ))}
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
      </ImageBackground>

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
  table: { overflow: 'hidden', borderColor: '#66834f', borderRadius: 20, borderWidth: 4 },
  tableImage: { borderRadius: 16 },
  targetGlow: { position: 'absolute', width: 34, height: 34, marginLeft: -17, marginTop: -17, backgroundColor: '#fff36b99', borderColor: '#fff9ae', borderRadius: 20, borderWidth: 2, shadowColor: '#ffeb3b', shadowOpacity: 1, shadowRadius: 16, elevation: 10 },
  ball: { position: 'absolute', width: BALL_RADIUS * 2, height: BALL_RADIUS * 2, marginLeft: -BALL_RADIUS, marginTop: -BALL_RADIUS, backgroundColor: '#fff', borderColor: '#84919b', borderRadius: BALL_RADIUS, borderWidth: 2, shadowColor: '#fff', shadowOpacity: 0.9, shadowRadius: 5, elevation: 5 },
  scorePopup: { position: 'absolute', zIndex: 10, marginLeft: -30, marginTop: -16 },
  scorePopupText: { color: '#ffd54f', fontSize: 26, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  flipperGlow: { position: 'absolute', top: '86%', width: '31%', height: '4%', borderColor: '#ffe47b', borderRadius: 12, borderWidth: 2 },
  leftFlipper: { left: '15%', transform: [{ rotate: '24deg' }] },
  rightFlipper: { right: '15%', transform: [{ rotate: '-24deg' }] },
  flipperActive: { backgroundColor: '#ffe47b88', borderColor: '#fff8c4', shadowColor: '#fff6a4', shadowOpacity: 0.95, shadowRadius: 12, elevation: 8 },
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
