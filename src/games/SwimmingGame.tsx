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
const brunoFaceImg = require('../../assets/game/Bruno_w_wodzie.png');
const felaFaceImg = require('../../assets/game/Fela_w_wodzie.png');

// Lane positions as fraction of screen width (matches river image layout)
// River occupies ~20%-80% of image width; dividers at ~35% and ~65%
const LANE_X_FRACTIONS = [0.275, 0.50, 0.725];

// Bottom-anchor the swimmer so tall transparent sprites sit naturally in the lane.
const PLAYER_BASELINE_FRACTION = 0.82;
const PLAYER_HEIGHT_FRACTION = 0.26;
const MIN_PLAYER_HEIGHT = 128;
const MAX_PLAYER_HEIGHT = 190;
const OBSTACLE_SIZE = 54;
const OBSTACLE_SPEED = 5;
const FRAME_MS = 30;
const SPAWN_MS = 1100;

type ObstacleType = 'log' | 'rock' | 'lilypad';

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  type: ObstacleType;
}

export interface SwimmingGameProps {
  character: 'bruno' | 'fela';
  onClose: () => void;
  onRoundComplete: (score: number) => void;
}

export const SwimmingGame: React.FC<SwimmingGameProps> = ({
  character,
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

  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const obstacleIdRef = useRef(0);

  const hitFlash = useRef(new Animated.Value(0)).current;

  const faceImg = character === 'bruno' ? brunoFaceImg : felaFaceImg;
  const faceAsset = Image.resolveAssetSource(faceImg);
  const spriteAspectRatio = faceAsset.width > 0 && faceAsset.height > 0
    ? faceAsset.width / faceAsset.height
    : 0.7;
  const playerHeight = Math.max(
    MIN_PLAYER_HEIGHT,
    Math.min(MAX_PLAYER_HEIGHT, H * PLAYER_HEIGHT_FRACTION),
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

  // Spawn obstacle
  const spawnObstacle = useCallback(() => {
    if (gameOverRef.current) return;
    const types: ObstacleType[] = ['log', 'rock', 'lilypad'];
    const lane = Math.floor(Math.random() * 3);
    const type = types[Math.floor(Math.random() * types.length)];
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

        const updated = prev
          .map((obs) => ({ ...obs, y: obs.y + OBSTACLE_SPEED }))
          .filter((obs) => {
            if (obs.y > pY + playerHeight && obs.y < pY + playerHeight + OBSTACLE_SPEED + 2) {
              if (obs.lane !== currentLane) {
                scoreRef.current += 1;
                setScore(scoreRef.current);
              }
            }
            return obs.y < H + OBSTACLE_SIZE;
          })
          .filter((obs) => {
            const collides =
              obs.lane === currentLane &&
              obs.y + OBSTACLE_SIZE > pY + 10 &&
              obs.y < pY + playerHeight - 18;
            if (collides) hitOccurred = true;
            return !collides;
          });

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
  }, [gameOver, H, playerHeight, triggerHit, endGame]);

  // Spawn loop
  useEffect(() => {
    if (gameOver) return;
    const spawn = setInterval(spawnObstacle, SPAWN_MS);
    return () => clearInterval(spawn);
  }, [gameOver, spawnObstacle]);

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
    setLives(3);
    livesRef.current = 3;
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
    return '🌿';
  };

  const heartStr = '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, 3 - lives));
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
            <Text style={styles.gameOverEmoji}>🏊</Text>
            <Text style={styles.gameOverTitle}>Koniec gry!</Text>
            <Text style={styles.gameOverScore}>Wynik: {score} ominiętych przeszkód</Text>
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
    fontSize: 40,
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
