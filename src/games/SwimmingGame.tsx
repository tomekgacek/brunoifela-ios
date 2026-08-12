import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';

export interface SwimmingGameProps {
  character: 'bruno' | 'fela';
  lives: number;
  score: number;
  isPlaying: boolean;
  onGameOver: (finalScore: number) => void;
  onLivesChange: (newLives: number) => void;
  onScoreChange: (newScore: number) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height - 100; // Leave room for UI
const LANE_WIDTH = SCREEN_WIDTH / 3;
const LANE_HEIGHT = SCREEN_HEIGHT;
const PLAYER_SIZE = 50;
const OBSTACLE_SIZE = 45;
const PLAYER_START_LANE = 1; // Middle lane (0=left, 1=middle, 2=right)
const OBSTACLE_SPEED = 6;
const SPAWN_RATE = 800; // ms between obstacle spawns

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  type: 'log' | 'rock' | 'lilypad';
}

export const SwimmingGame: React.FC<SwimmingGameProps> = ({
  character,
  lives,
  score,
  isPlaying,
  onGameOver,
  onLivesChange,
  onScoreChange,
}) => {
  const [playerLane, setPlayerLane] = useState(PLAYER_START_LANE);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const obstacleIdRef = useRef(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const spawnLoopRef = useRef<NodeJS.Timeout | null>(null);
  const collisionCheckRef = useRef<NodeJS.Timeout | null>(null);
  const playerYRef = useRef(SCREEN_HEIGHT - PLAYER_SIZE - 40);
  const scoresPassedRef = useRef(0);

  const playerY = playerYRef.current;

  // Spawn obstacles at random lanes
  const spawnObstacle = useCallback(() => {
    if (!isPlaying) return;

    const obstacleTypes: Array<'log' | 'rock' | 'lilypad'> = [
      'log',
      'rock',
      'lilypad',
    ];
    const randomLane = Math.floor(Math.random() * 3);
    const randomType =
      obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

    setObstacles((prev) => [
      ...prev,
      {
        id: obstacleIdRef.current++,
        lane: randomLane,
        y: -OBSTACLE_SIZE,
        type: randomType,
      },
    ]);
  }, [isPlaying]);

  // Game loop: move obstacles down
  useEffect(() => {
    if (!isPlaying) return;

    gameLoopRef.current = setInterval(() => {
      setObstacles((prev) => {
        const updated = prev
          .map((obs) => ({
            ...obs,
            y: obs.y + OBSTACLE_SPEED,
          }))
          .filter((obs) => {
            // Check if obstacle passed the player without collision
            if (obs.y > playerY + PLAYER_SIZE && obs.y < playerY + PLAYER_SIZE + 20) {
              if (obs.lane !== playerLane) {
                scoresPassedRef.current += 1;
                onScoreChange(scoresPassedRef.current);
              }
            }
            // Remove if off-screen
            return obs.y < SCREEN_HEIGHT + OBSTACLE_SIZE;
          });

        return updated;
      });
    }, 30);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, playerLane, playerY, onScoreChange]);

  // Spawn obstacles periodically
  useEffect(() => {
    if (!isPlaying) return;

    spawnLoopRef.current = setInterval(spawnObstacle, SPAWN_RATE);

    return () => {
      if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);
    };
  }, [isPlaying, spawnObstacle]);

  // Collision detection
  useEffect(() => {
    if (!isPlaying || lives <= 0) return;

    collisionCheckRef.current = setInterval(() => {
      setObstacles((prev) => {
        // Check for collisions with current obstacles
        const collision = prev.some(
          (obs) =>
            obs.lane === playerLane &&
            obs.y < playerY + PLAYER_SIZE &&
            obs.y + OBSTACLE_SIZE > playerY
        );

        if (collision) {
          // Collision detected
          const newLives = lives - 1;
          onLivesChange(newLives);

          if (newLives <= 0) {
            onGameOver(scoresPassedRef.current);
          }

          // Clear obstacles for impact effect
          return [];
        }

        return prev;
      });
    }, 50);

    return () => {
      if (collisionCheckRef.current) clearInterval(collisionCheckRef.current);
    };
  }, [isPlaying, lives, playerLane, playerY, onLivesChange, onGameOver]);

  // Cleanup on unmount or when game ends
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);
      if (collisionCheckRef.current) clearInterval(collisionCheckRef.current);
    };
  }, []);

  const moveLeft = () => {
    if (playerLane > 0) setPlayerLane(playerLane - 1);
  };

  const moveRight = () => {
    if (playerLane < 2) setPlayerLane(playerLane + 1);
  };

  const playerXPos = playerLane * LANE_WIDTH + LANE_WIDTH / 2 - PLAYER_SIZE / 2;

  const getObstacleEmoji = (type: 'log' | 'rock' | 'lilypad') => {
    switch (type) {
      case 'log':
        return '🪵';
      case 'rock':
        return '🪨';
      case 'lilypad':
        return '🌿';
      default:
        return '●';
    }
  };

  return (
    <View style={styles.container}>
      {/* River background */}
      <View style={styles.river}>
        {/* Lane dividers */}
        <View style={[styles.laneHalf, styles.laneHalfLeft]} />
        <View style={[styles.laneHalf, styles.laneHalfRight]} />

        {/* Obstacles */}
        {obstacles.map((obs) => (
          <View
            key={obs.id}
            style={[
              styles.obstacle,
              {
                left: obs.lane * LANE_WIDTH + LANE_WIDTH / 2 - OBSTACLE_SIZE / 2,
                top: obs.y,
              },
            ]}
          >
            <Text style={styles.obstacleEmoji}>
              {getObstacleEmoji(obs.type)}
            </Text>
          </View>
        ))}

        {/* Player */}
        <View
          style={[
            styles.player,
            {
              left: playerXPos,
              top: playerY,
            },
          ]}
        >
          <Text style={styles.playerContent}>
            {character === 'bruno' ? '🧸' : '🧚'}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          style={({ pressed }) => [
            styles.controlBtn,
            pressed && styles.controlBtnPressed,
          ]}
          onPress={moveLeft}
        >
          <Text style={styles.controlBtnText}>←</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.controlBtn,
            pressed && styles.controlBtnPressed,
          ]}
          onPress={moveRight}
        >
          <Text style={styles.controlBtnText}>→</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  river: {
    flex: 1,
    backgroundColor: '#16a085',
    position: 'relative',
    overflow: 'hidden',
  },
  laneHalf: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: 0,
  },
  laneHalfLeft: {
    left: '33.33%',
  },
  laneHalfRight: {
    left: '66.66%',
  },
  obstacle: {
    position: 'absolute',
    width: OBSTACLE_SIZE,
    height: OBSTACLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  obstacleEmoji: {
    fontSize: 36,
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerContent: {
    fontSize: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 20,
  },
  controlBtn: {
    flex: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnPressed: {
    backgroundColor: 'rgba(200, 200, 200, 0.8)',
    transform: [{ scale: 0.95 }],
  },
  controlBtnText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
});
