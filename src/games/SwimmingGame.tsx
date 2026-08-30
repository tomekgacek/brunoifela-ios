import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const riverVideo = require('../../assets/game/rzeka_plynie.mp4');
const riverImage = require('../../assets/game/rzeka.png');
const brunoFaceImg = require('../../assets/game/Bruno_w_wodzie.png');
const felaFaceImg = require('../../assets/game/Fela_w_wodzie.png');

// Lane positions as fraction of screen width (matches river image layout)
// River occupies ~20%-80% of image width; dividers at ~35% and ~65%
const LANE_X_FRACTIONS = [0.275, 0.50, 0.725];

// Bottom-anchor the swimmer so tall transparent sprites sit naturally in the lane.
const PLAYER_BASELINE_FRACTION = 0.82;
const OBSTACLE_SIZE = 74;
const FRAME_MS = 30;

type Difficulty = 'easy' | 'normal';

const DIFFICULTY_CONFIG: Record<Difficulty, {
  playerHeightFraction: number;
  minPlayerHeight: number;
  maxPlayerHeight: number;
  collisionTopPad: number;
  collisionBottomPad: number;
  obstacleSpeed: number;
  spawnMs: number;
}> = {
  easy: {
    playerHeightFraction: 0.155,
    minPlayerHeight: 76,
    maxPlayerHeight: 116,
    collisionTopPad: 22,
    collisionBottomPad: 30,
    obstacleSpeed: 3,
    spawnMs: 1650,
  },
  normal: {
    playerHeightFraction: 0.155,
    minPlayerHeight: 76,
    maxPlayerHeight: 116,
    collisionTopPad: 22,
    collisionBottomPad: 30,
    obstacleSpeed: 4,
    spawnMs: 1500,
  },
};

type ObstacleType = 'log' | 'rock' | 'leaf' | 'flower' | 'pinecone' | 'heart';
// Hazards cost a life on collision; the rest are collectibles worth bonus points.
const HAZARD_TYPES: ObstacleType[] = ['log', 'rock'];
const MAX_LIVES = 3;
const COLLECTIBLE_BONUS_POINTS: Record<'leaf' | 'flower' | 'pinecone', number> = {
  leaf: 3,
  flower: 5,
  pinecone: 4,
};

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  type: ObstacleType;
}

interface ScorePopupItem {
  id: number;
  x: number;
  y: number;
  label: string;
}

// Floating text that rises and fades out, then removes itself.
const ScorePopup: React.FC<{ item: ScorePopupItem; onDone: (id: number) => void }> = ({ item, onDone }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -60, duration: 700, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start(() => onDone(item.id));
  }, [item.id, onDone, opacity, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.scorePopup,
        { left: item.x - 30, top: item.y, opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.scorePopupText}>{item.label}</Text>
    </Animated.View>
  );
};

export interface SwimmingGameProps {
  character: 'bruno' | 'fela';
  initialDifficulty?: Difficulty;
  onClose: () => void;
  onRoundComplete: (score: number) => void;
}

export const SwimmingGame: React.FC<SwimmingGameProps> = ({
  character,
  initialDifficulty = 'normal',
  onClose,
  onRoundComplete,
}) => {
  const { width: W, height: H } = useWindowDimensions();

  const [playerLane, setPlayerLane] = useState(1);
  const playerLaneRef = useRef(1);

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [difficulty] = useState<Difficulty>(initialDifficulty);
  const [scorePopups, setScorePopups] = useState<ScorePopupItem[]>([]);
  const scorePopupIdRef = useRef(0);

  const removeScorePopup = useCallback((id: number) => {
    setScorePopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const obstacleIdRef = useRef(0);

  const hitFlash = useRef(new Animated.Value(0)).current;
  const settings = DIFFICULTY_CONFIG[difficulty];

  const faceImg = character === 'bruno' ? brunoFaceImg : felaFaceImg;
  const faceAsset = Image.resolveAssetSource(faceImg);
  const spriteAspectRatio = faceAsset.width > 0 && faceAsset.height > 0
    ? faceAsset.width / faceAsset.height
    : 0.7;
  const playerHeight = Math.max(
    settings.minPlayerHeight,
    Math.min(settings.maxPlayerHeight, H * settings.playerHeightFraction),
  );
  const playerWidth = playerHeight * spriteAspectRatio;
  const playerX = W * LANE_X_FRACTIONS[playerLane] - playerWidth / 2;
  const playerY = H * PLAYER_BASELINE_FRACTION - playerHeight;

  const triggerHit = useCallback(() => {
    hitFlash.setValue(0.6);
    Animated.timing(hitFlash, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  }, [hitFlash]);

  const endGame = useCallback((finalScore: number) => {
    gameOverRef.current = true;
    setGameOver(true);
    setBestScore((prev) => Math.max(prev, finalScore));
    onRoundComplete(finalScore);
  }, [onRoundComplete]);

  // Spawn obstacle — leaf/flower/pinecone are bonus-point collectibles, hearts are a very rare extra life, logs/rocks are hazards to dodge.
  const spawnObstacle = useCallback(() => {
    if (gameOverRef.current) return;
    const lane = Math.floor(Math.random() * 3);
    const r = Math.random();
    let type: ObstacleType;
    if (r < 0.03) type = 'heart';
    else if (r < 0.23) type = 'leaf';
    else if (r < 0.38) type = 'flower';
    else if (r < 0.53) type = 'pinecone';
    else type = Math.random() < 0.5 ? 'log' : 'rock';
    setObstacles((prev) => [
      ...prev,
      { id: obstacleIdRef.current++, lane, y: -OBSTACLE_SIZE, type },
    ]);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    const loop = setInterval(() => {
      if (gameOverRef.current) return;
      setObstacles((prev) => {
        const currentLane = playerLaneRef.current;
        const pY = H * PLAYER_BASELINE_FRACTION - playerHeight;
        let hitOccurred = false;
        const newPopups: ScorePopupItem[] = [];

        const updated = prev
          .map((obs) => ({ ...obs, y: obs.y + settings.obstacleSpeed }))
          .filter((obs) => {
            if (
              HAZARD_TYPES.includes(obs.type) &&
              obs.lane !== currentLane &&
              obs.y > pY + playerHeight &&
              obs.y < pY + playerHeight + settings.obstacleSpeed + 2
            ) {
              scoreRef.current += 1;
              setScore(scoreRef.current);
            }
            return obs.y < H + OBSTACLE_SIZE;
          })
          .filter((obs) => {
            const overlapsPlayer =
              obs.lane === currentLane &&
              obs.y + OBSTACLE_SIZE > pY + settings.collisionTopPad &&
              obs.y < pY + playerHeight - settings.collisionBottomPad;

            if (!overlapsPlayer) return true;

            if (obs.type === 'heart') {
              if (livesRef.current < MAX_LIVES) {
                livesRef.current += 1;
                setLives(livesRef.current);
                newPopups.push({
                  id: scorePopupIdRef.current++,
                  x: W * LANE_X_FRACTIONS[obs.lane],
                  y: obs.y,
                  label: '+1 ❤️',
                });
              }
              return false;
            }

            if (!HAZARD_TYPES.includes(obs.type)) {
              const points = COLLECTIBLE_BONUS_POINTS[obs.type as 'leaf' | 'flower' | 'pinecone'];
              scoreRef.current += points;
              setScore(scoreRef.current);
              newPopups.push({
                id: scorePopupIdRef.current++,
                x: W * LANE_X_FRACTIONS[obs.lane],
                y: obs.y,
                label: `+${points}`,
              });
              return false;
            }

            hitOccurred = true;
            return false;
          });

        if (newPopups.length > 0) {
          setScorePopups((prev2) => [...prev2, ...newPopups]);
        }

        if (hitOccurred && !gameOverRef.current) {
          const newLives = livesRef.current - 1;
          livesRef.current = newLives;
          setLives(newLives);
          if (newLives <= 0) {
            endGame(scoreRef.current);
          } else {
            triggerHit();
          }
        }

        return updated;
      });
    }, FRAME_MS);

    return () => clearInterval(loop);
  }, [gameOver, H, W, playerHeight, settings, triggerHit, endGame]);

  // Spawn loop
  useEffect(() => {
    if (gameOver) return;
    const spawn = setInterval(spawnObstacle, settings.spawnMs);
    return () => clearInterval(spawn);
  }, [gameOver, settings.spawnMs, spawnObstacle]);

  const moveLeft = () => {
    setPlayerLane((prev) => {
      const next = Math.max(0, prev - 1);
      playerLaneRef.current = next;
      return next;
    });
  };

  const moveRight = () => {
    setPlayerLane((prev) => {
      const next = Math.min(2, prev + 1);
      playerLaneRef.current = next;
      return next;
    });
  };

  const restartGame = () => {
    setObstacles([]);
    setLives(MAX_LIVES);
    livesRef.current = MAX_LIVES;
    setScore(0);
    scoreRef.current = 0;
    setPlayerLane(1);
    playerLaneRef.current = 1;
    gameOverRef.current = false;
    setGameOver(false);
  };

  const obstacleEmoji = (type: ObstacleType) => {
    if (type === 'log') return '🪵';
    if (type === 'rock') return '🪨';
    if (type === 'flower') return '🌸';
    if (type === 'pinecone') return '🌰';
    if (type === 'heart') return '❤️';
    return '🍃';
  };

  const heartStr = '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, MAX_LIVES - lives));
  const riverPlayer = useVideoPlayer(riverVideo, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <View style={styles.fullscreen}>
      <VideoView
        player={riverPlayer}
        style={StyleSheet.absoluteFillObject}
        nativeControls={false}
        contentFit="cover"
        pointerEvents="none"
      />

      {/* Hit flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[styles.hitOverlay, { opacity: hitFlash }]}
      />

      {/* Lives overlay top-left */}
      <View style={styles.livesOverlay}>
        <Text style={styles.livesText}>{heartStr}</Text>
      </View>

      {/* Score overlay top-right */}
      <View style={styles.scoreOverlay}>
        <Text style={styles.scoreText}>⭐ {score}</Text>
      </View>

      {/* Close button */}
      <Pressable style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>✕</Text>
      </Pressable>

      {/* Obstacles */}
      {!gameOver && obstacles.map((obs) => (
        <View
          key={obs.id}
          style={[
            styles.obstacle,
            {
              left: W * LANE_X_FRACTIONS[obs.lane] - OBSTACLE_SIZE / 2,
              top: obs.y,
            },
          ]}
        >
          <Text style={styles.obstacleText}>{obstacleEmoji(obs.type)}</Text>
        </View>
      ))}

      {/* Floating +N score popups shown when a collectible is picked up */}
      {!gameOver && scorePopups.map((popup) => (
        <ScorePopup key={popup.id} item={popup} onDone={removeScorePopup} />
      ))}

      {/* Player */}
      {!gameOver && (
        <Image
          source={faceImg}
          style={[
            styles.player,
            {
              left: playerX,
              top: playerY,
              width: playerWidth,
              height: playerHeight,
            },
          ]}
          resizeMode="contain"
        />
      )}

      {/* Game Over */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <View style={styles.gameOverCard}>
            <Image source={riverImage} style={styles.gameOverRiverImage} resizeMode="cover" />
            <Text style={styles.gameOverTitle}>Koniec gry!</Text>
            <Text style={styles.gameOverScore}>Wynik: {score} pkt (ominięte przeszkody + zebrane skarby)</Text>
            {score > 0 && score >= bestScore && (
              <Text style={styles.gameOverRecord}>🏆 Nowy rekord!</Text>
            )}
            <Pressable style={styles.gameOverBtn} onPress={restartGame}>
              <Text style={styles.gameOverBtnText}>Zagraj ponownie</Text>
            </Pressable>
            <Pressable style={[styles.gameOverBtn, styles.gameOverBtnSecondary]} onPress={onClose}>
              <Text style={styles.gameOverBtnTextSecondary}>Wróć do menu</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Arrow controls */}
      {!gameOver && (
        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [styles.arrowBtn, pressed && styles.arrowBtnPressed]}
            onPress={moveLeft}
          >
            <Text style={styles.arrowText}>←</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.arrowBtn, pressed && styles.arrowBtnPressed]}
            onPress={moveRight}
          >
            <Text style={styles.arrowText}>→</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
  },
  hitOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ff0000',
  },
  livesOverlay: {
    position: 'absolute',
    top: '5%',
    left: '3%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  livesText: {
    fontSize: 22,
  },
  scoreOverlay: {
    position: 'absolute',
    top: '5%',
    right: '3%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  closeBtn: {
    position: 'absolute',
    top: '5%',
    alignSelf: 'center',
    left: '46%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  player: {
    position: 'absolute',
  },
  obstacle: {
    position: 'absolute',
    width: OBSTACLE_SIZE,
    height: OBSTACLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  obstacleText: {
    fontSize: 52,
  },
  scorePopup: {
    position: 'absolute',
    zIndex: 10,
  },
  scorePopupText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffd54f',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  controls: {
    position: 'absolute',
    bottom: '5%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '8%',
  },
  arrowBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  arrowBtnPressed: {
    backgroundColor: 'rgba(200,200,200,0.9)',
    transform: [{ scale: 0.92 }],
  },
  arrowText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  gameOverCard: {
    backgroundColor: '#fff8e8',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#efd8a2',
    padding: 28,
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 340,
  },
  gameOverEmoji: {
    fontSize: 56,
  },
  gameOverRiverImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#efd8a2',
  },
  gameOverTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#3f2d17',
  },
  gameOverScore: {
    fontSize: 16,
    color: '#5d4a2f',
    textAlign: 'center',
  },
  gameOverRecord: {
    fontSize: 16,
    color: '#d4a017',
    fontWeight: '800',
  },
  gameOverBtn: {
    width: '100%',
    backgroundColor: '#cb3f45',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  gameOverBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  gameOverBtnSecondary: {
    backgroundColor: '#f0e6d0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  gameOverBtnTextSecondary: {
    color: '#5d4a2f',
    fontWeight: '700',
    fontSize: 15,
  },
});
