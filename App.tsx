import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import {
  Animated,
  Alert,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { seasonEpisodes, seasonMapData, season2Episodes, season2MapData } from './src/data/season1';
import { allQuizzes } from './src/data/quiz';
import { Board, CellPos, createInitialBoard, swapAndResolve } from './src/games/match3';
import { PuzzleGame } from './src/games/PuzzleGame';
import { ColoringGame } from './src/games/ColoringGame';

const mapImage = require('./assets/game/mapa.jpeg');
const mapaS02Image = require('./assets/game/mapa_s02.png');
const brunoImage = require('./assets/game/bruno.jpeg');
const felaImage = require('./assets/game/fela.jpeg');
const splashImg = require('./assets/game/landing-page/Bruno_Fela_1.png');
const menuImg = require('./assets/game/landing-page/Bruno_Fela_2.png');
const dabBg = require('./assets/game/Dab.jpeg');
const brunoFaceImg = require('./assets/game/landing-page/Bruno.png');
const felaFaceImg  = require('./assets/game/landing-page/Fela.png');

// Images used as match-3 gems (one per cell type 0-4)
const GEM_IMAGES = [
  require('./assets/game/landing-page/Bruno.png'),
  require('./assets/game/landing-page/Fela.png'),
  require('./assets/game/Bruno_i_Fela.jpeg'),
  require('./assets/game/Dab.jpeg'),
  require('./assets/game/mapa.jpeg'),
] as const;

// Actual pixel dimensions of landing images
// Bruno_Fela_1.jpg: 750x920 (portrait)  Bruno_Fela_2.png: 1117x1408 (portrait)
const SPLASH_W = 750, SPLASH_H = 920;
const MENU_W = 1117, MENU_H = 1408;

type InnerScreen = 'mapa' | 'odcinki' | 'quiz' | 'gry';
type Screen = 'splash' | 'menu' | InnerScreen;
type GameTab = 'zrecznosciowa' | 'match3' | 'puzzle' | 'kolorowanki';

// Hit-areas as fractions of Bruno_Fela_2.png (1117x1408).
// Tuned to the four speech-bubble buttons: Odcinki (top-left), Quiz (top-right),
// Mapa (bottom-left), Gry (bottom-right).
const MENU_BUTTONS: { screen: InnerScreen; lf: number; tf: number; wf: number; hf: number }[] = [
  { screen: 'odcinki', lf: 0.14, tf: 0.30, wf: 0.35, hf: 0.25 },
  { screen: 'quiz',    lf: 0.51, tf: 0.30, wf: 0.35, hf: 0.25 },
  { screen: 'mapa',    lf: 0.14, tf: 0.52, wf: 0.35, hf: 0.25 },
  { screen: 'gry',     lf: 0.51, tf: 0.52, wf: 0.35, hf: 0.25 },
];

const STORAGE_KEYS = {
  quizScores: 'brunoifela.quizScores.v1',
  selectedEpisode: 'brunoifela.selectedEpisode.v1',
  dailyProgress: 'brunoifela.dailyProgress.v1',
};

const gemColors = ['#e25a5a', '#4ca76d', '#4d7ad3', '#e6b94c', '#9a66d9'];

function shuffleArray<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const { width: screenW, height: screenH } = useWindowDimensions();

  const [screen, setScreen] = useState<Screen>('splash');
  const [activeGameTab, setActiveGameTab] = useState<GameTab>('zrecznosciowa');
  const [fullscreenGame, setFullscreenGame] = useState<GameTab | null>(null);
  const [mapSeason, setMapSeason] = useState<1 | 2>(1);
  const [odcinkiSeason, setOdcinkiSeason] = useState<'all' | 1 | 2>('all');
  const [odcinkiDropdownOpen, setOdcinkiDropdownOpen] = useState(false);

  // Compute menu image rendered dimensions when in contain mode
  const menuImgRatio = MENU_W / MENU_H;
  const screenRatio = screenW / screenH;
  const menuRenderedW = menuImgRatio > screenRatio ? screenW : screenH * menuImgRatio;
  const menuRenderedH = menuImgRatio > screenRatio ? screenW / menuImgRatio : screenH;
  const menuOffsetX = (screenW - menuRenderedW) / 2;
  const menuOffsetY = (screenH - menuRenderedH) / 2;

  // Landing screen animations
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;
  const innerOpacity = useRef(new Animated.Value(0)).current;

  const [selectedLocationId, setSelectedLocationId] = useState<string>(seasonMapData[0].id);
  const [selectedEpisodeCode, setSelectedEpisodeCode] = useState<string>('S01E01');

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<Record<string, string>>({});
  const [shuffleTick, setShuffleTick] = useState(0);

  const [tapScore, setTapScore] = useState(0);
  const [tapTimeLeft, setTapTimeLeft] = useState(20);
  const [tapPlaying, setTapPlaying] = useState(false);
  const [tapBest, setTapBest] = useState(0);
  const [tapArenaWidth, setTapArenaWidth] = useState(300);
  const [tapArenaHeight, setTapArenaHeight] = useState(210);
  const [tapTarget, setTapTarget] = useState({ x: 120, y: 90 });
  const [tapTargetChar, setTapTargetChar] = useState<'bruno' | 'fela'>('bruno');

  const [matchBoard, setMatchBoard] = useState<Board>(createInitialBoard());
  const [matchSelected, setMatchSelected] = useState<CellPos | null>(null);
  const [matchScore, setMatchScore] = useState(0);
  const [matchMoves, setMatchMoves] = useState(18);

  const [dailyDate, setDailyDate] = useState(todayKey());
  const [dailyStars, setDailyStars] = useState(0);
  const [dailyRounds, setDailyRounds] = useState(0);

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackOpacity] = useState(new Animated.Value(0));

  // Tap game enhancements
  const tapBurstScale = useRef(new Animated.Value(0.3)).current;
  const tapBurstOpacity = useRef(new Animated.Value(0)).current;
  const [tapBurstPos, setTapBurstPos] = useState<{ x: number; y: number } | null>(null);
  const [tapGameOver, setTapGameOver] = useState(false);

  // Match-3 enhancements
  const matchFlashAnim = useRef(new Animated.Value(0)).current;
  const [matchGameOver, setMatchGameOver] = useState(false);

  // Animate in when screen changes
  useEffect(() => {
    if (screen === 'splash') {
      splashOpacity.setValue(0);
      Animated.timing(splashOpacity, { toValue: 1, duration: 750, useNativeDriver: true }).start();
    } else if (screen === 'menu') {
      menuOpacity.setValue(0);
      Animated.timing(menuOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } else {
      innerOpacity.setValue(0);
      Animated.timing(innerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [screen]);

  const handleSplashTap = () => {
    Animated.timing(splashOpacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(() =>
      setScreen('menu'),
    );
  };

  const handleMenuTap = (targetScreen: InnerScreen) => {
    Animated.timing(menuOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
      setScreen(targetScreen),
    );
  };

  const goToMenu = () => {
    Animated.timing(innerOpacity, { toValue: 0, duration: 280, useNativeDriver: true }).start(() => {
      menuOpacity.setValue(0);
      setScreen('menu');
    });
  };

  const selectedLocation = useMemo(
    () => seasonMapData.find((location) => location.id === selectedLocationId) ?? seasonMapData[0],
    [selectedLocationId],
  );

  const selectedEpisode =
    [...seasonEpisodes, ...season2Episodes].find((episode) => episode.code === selectedEpisodeCode) ??
    seasonEpisodes[0];

  const mapEvents = useMemo(
    () =>
      selectedLocation.events.filter(
        (event) => event.episode === selectedEpisodeCode || selectedEpisodeCode === 'all',
      ),
    [selectedEpisodeCode, selectedLocation.events],
  );

  const selectedQuiz = allQuizzes.find((quiz) => quiz.episodeCode === selectedEpisodeCode);

  const shuffledQuizQuestions = useMemo(() => {
    if (!selectedQuiz) {
      return [];
    }

    return selectedQuiz.questions.map((question) => {
      const taggedOptions = question.options.map((option, optionIndex) => ({
        option,
        isCorrect: optionIndex === question.correctIndex,
      }));
      const shuffled = shuffleArray(taggedOptions);
      return {
        id: question.id,
        question: question.question,
        options: shuffled.map((entry) => entry.option),
        correctIndex: shuffled.findIndex((entry) => entry.isCorrect),
      };
    });
  }, [selectedQuiz?.episodeCode, shuffleTick]);

  const totalStars = seasonEpisodes.reduce((sum, episode) => sum + (quizScores[episode.code] ?? 0), 0);
  const dailyStarsGoal = 10;
  const dailyRoundsGoal = 2;
  const dailyGoalDone = dailyStars >= dailyStarsGoal && dailyRounds >= dailyRoundsGoal;

  const unlockedEpisodeMap = useMemo(() => {
    const unlocked: Record<string, boolean> = {};
    // S01 — locked based on quiz scores
    seasonEpisodes.forEach((episode, index) => {
      if (index === 0) {
        unlocked[episode.code] = true;
        return;
      }
      const prevEpisodeCode = seasonEpisodes[index - 1].code;
      unlocked[episode.code] = unlocked[prevEpisodeCode] && (quizScores[prevEpisodeCode] ?? 0) >= 2;
    });
    // S02 — fully unlocked
    season2Episodes.forEach((episode) => {
      unlocked[episode.code] = true;
    });
    return unlocked;
  }, [quizScores]);

  const scoreToStars = (score: number) => {
    const full = '★'.repeat(score);
    const empty = '☆'.repeat(3 - score);
    return `${full}${empty}`;
  };

  const announce = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'pl-PL',
      rate: 1,
      pitch: 1.05,
    });
  };

  const showFeedback = (text: string) => {
    setFeedbackText(text);
    feedbackOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(feedbackOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(650),
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const [savedScoresRaw, savedEpisode, savedDailyRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.quizScores),
          AsyncStorage.getItem(STORAGE_KEYS.selectedEpisode),
          AsyncStorage.getItem(STORAGE_KEYS.dailyProgress),
        ]);

        if (savedScoresRaw) {
          const parsed = JSON.parse(savedScoresRaw) as Record<string, number>;
          if (parsed && typeof parsed === 'object') {
            const safeScores: Record<string, number> = {};
            seasonEpisodes.forEach((episode) => {
              const value = parsed[episode.code];
              if (typeof value === 'number' && value >= 0 && value <= 3) {
                safeScores[episode.code] = Math.floor(value);
              }
            });
            setQuizScores(safeScores);
          }
        }

        if (
          savedEpisode &&
          (savedEpisode === 'all' || seasonEpisodes.some((episode) => episode.code === savedEpisode))
        ) {
          setSelectedEpisodeCode(savedEpisode);
        }

        if (savedDailyRaw) {
          const parsedDaily = JSON.parse(savedDailyRaw) as {
            date: string;
            stars: number;
            rounds: number;
          };
          const today = todayKey();
          setDailyDate(today);
          if (parsedDaily?.date === today) {
            setDailyStars(typeof parsedDaily.stars === 'number' ? Math.max(0, parsedDaily.stars) : 0);
            setDailyRounds(typeof parsedDaily.rounds === 'number' ? Math.max(0, parsedDaily.rounds) : 0);
          } else {
            setDailyStars(0);
            setDailyRounds(0);
          }
        }
      } catch {
        // Ignore persistence errors and continue with in-memory defaults.
      }
    };

    loadPersistedState();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.quizScores, JSON.stringify(quizScores)).catch(() => {
      // Ignore persistence errors and continue with in-memory state.
    });
  }, [quizScores]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.selectedEpisode, selectedEpisodeCode).catch(() => {
      // Ignore persistence errors and continue with in-memory state.
    });
  }, [selectedEpisodeCode]);

  useEffect(() => {
    const today = todayKey();
    if (dailyDate !== today) {
      setDailyDate(today);
      setDailyStars(0);
      setDailyRounds(0);
      return;
    }

    const payload = JSON.stringify({
      date: dailyDate,
      stars: dailyStars,
      rounds: dailyRounds,
    });

    AsyncStorage.setItem(STORAGE_KEYS.dailyProgress, payload).catch(() => {
      // Ignore persistence errors and continue with in-memory state.
    });
  }, [dailyDate, dailyRounds, dailyStars]);

  useEffect(() => {
    // Lock redirect only matters for quiz
    if (screen !== 'quiz') return;
    if (selectedEpisodeCode === 'all') return;
    if (!unlockedEpisodeMap[selectedEpisodeCode]) {
      const firstUnlocked = seasonEpisodes.find((episode) => unlockedEpisodeMap[episode.code]);
      setSelectedEpisodeCode(firstUnlocked?.code ?? 'S01E01');
    }
  }, [screen, selectedEpisodeCode, unlockedEpisodeMap]);

  useEffect(() => {
    if (!tapPlaying) {
      return;
    }

    const timer = setInterval(() => {
      setTapTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setTapPlaying(false);
          setTapGameOver(true);
          announce('Koniec rundy');
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tapPlaying]);

  useEffect(() => {
    if (!tapPlaying && tapScore > tapBest) {
      setTapBest(tapScore);
      announce('Nowy rekord');
      showFeedback('Nowy rekord!');
    }
  }, [tapBest, tapPlaying, tapScore]);

  const moveTarget = () => {
    const targetSize = 64;
    const margin = 8;
    const maxX = Math.max(margin, tapArenaWidth - targetSize - margin);
    const maxY = Math.max(margin, tapArenaHeight - targetSize - margin);
    setTapTarget({
      x: margin + Math.random() * Math.max(1, maxX - margin),
      y: margin + Math.random() * Math.max(1, maxY - margin),
    });
    setTapTargetChar(Math.random() < 0.5 ? 'bruno' : 'fela');
  };

  const startTapGame = () => {
    setTapScore(0);
    setTapTimeLeft(20);
    setTapPlaying(true);
    setTapGameOver(false);
    setDailyRounds((current) => current + 1);
    announce('Start');
    moveTarget();
  };

  const hitTapTarget = () => {
    if (!tapPlaying) {
      return;
    }
    // Burst animation at current target position
    setTapBurstPos({ x: tapTarget.x, y: tapTarget.y });
    tapBurstScale.setValue(0.3);
    tapBurstOpacity.setValue(0.9);
    Animated.parallel([
      Animated.timing(tapBurstScale, { toValue: 2.8, duration: 420, useNativeDriver: true }),
      Animated.timing(tapBurstOpacity, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
    setTapScore((current) => current + 1);
    showFeedback('+1');
    announce('Brawo');
    moveTarget();
  };

  const submitQuiz = () => {
    if (!selectedQuiz) {
      return;
    }

    const score = shuffledQuizQuestions.reduce((sum, question) => {
      return sum + (quizAnswers[question.id] === question.correctIndex ? 1 : 0);
    }, 0);

    let feedbackText = 'Dobra proba!';
    if (score === 3) {
      feedbackText = 'Brawo! 3/3. Jestes mistrzem tego odcinka!';
    } else if (score === 2) {
      feedbackText = 'Super! 2/3. Odcinek zaliczony i kolejny odblokowany.';
    } else if (score === 1) {
      feedbackText = 'Masz 1/3. Sprobuj jeszcze raz, jest coraz lepiej!';
    } else if (score === 0) {
      feedbackText = 'Nic nie szkodzi! Posluchaj opowiesci i sprobuj ponownie.';
    }

    setQuizScores((current) => ({
      ...current,
      [selectedQuiz.episodeCode]: Math.max(current[selectedQuiz.episodeCode] ?? 0, score),
    }));
    setDailyStars((current) => current + score);

    if (score >= 2) {
      announce('Super wynik');
    } else {
      announce('Dobra proba');
    }
    showFeedback(`${score}/3`);

    setQuizFeedback((current) => ({
      ...current,
      [selectedQuiz.episodeCode]: feedbackText,
    }));
  };

  const resetQuiz = () => {
    if (!selectedQuiz) {
      return;
    }

    const nextAnswers = { ...quizAnswers };
    selectedQuiz.questions.forEach((question) => {
      delete nextAnswers[question.id];
    });
    setQuizAnswers(nextAnswers);
    setShuffleTick((current) => current + 1);
  };

  const resetMatch3 = () => {
    setMatchBoard(createInitialBoard());
    setMatchSelected(null);
    setMatchScore(0);
    setMatchMoves(18);
    setMatchGameOver(false);
    setDailyRounds((current) => current + 1);
    announce('Nowa plansza');
  };

  const onTapGem = (row: number, col: number) => {
    if (matchMoves <= 0) {
      announce('Koniec ruchow');
      return;
    }

    const pos = { row, col };
    if (!matchSelected) {
      setMatchSelected(pos);
      return;
    }

    if (matchSelected.row === row && matchSelected.col === col) {
      setMatchSelected(null);
      return;
    }

    const result = swapAndResolve(matchBoard, matchSelected, pos);
    const isAdjacent = Math.abs(matchSelected.row - row) + Math.abs(matchSelected.col - col) === 1;

    if (!isAdjacent) {
      setMatchSelected(pos);
      return;
    }

    setMatchMoves((current) => Math.max(0, current - 1));
    if (result.removed > 0) {
      setMatchBoard(result.board);
      setMatchScore((current) => current + result.removed);
      // Flash board briefly
      matchFlashAnim.setValue(0.75);
      Animated.timing(matchFlashAnim, { toValue: 0, duration: 380, useNativeDriver: true }).start();
      showFeedback(`+${result.removed}`);
      if (result.removed >= 6) {
        announce('Combo');
      } else {
        announce('Swietnie');
      }
    }
    if (matchMoves - 1 <= 0) setMatchGameOver(true);
    setMatchSelected(null);
  };

  const resetAllProgress = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.quizScores),
        AsyncStorage.removeItem(STORAGE_KEYS.selectedEpisode),
        AsyncStorage.removeItem(STORAGE_KEYS.dailyProgress),
      ]);
    } catch {
      // Ignore persistence errors and still reset in-memory state.
    }

    setQuizScores({});
    setQuizAnswers({});
    setQuizFeedback({});
    setSelectedEpisodeCode('S01E01');
    setSelectedLocationId(seasonMapData[0].id);
    setDailyDate(todayKey());
    setDailyStars(0);
    setDailyRounds(0);
    setShuffleTick((current) => current + 1);
    announce('Postep zresetowany');
  };

  const askResetProgress = () => {
    Alert.alert('Reset postepu', 'Czy na pewno chcesz wyzerowac caly postep gry?', [
      {
        text: 'Anuluj',
        style: 'cancel',
      },
      {
        text: 'Resetuj',
        style: 'destructive',
        onPress: () => {
          void resetAllProgress();
        },
      },
    ]);
  };

  if (screen === 'splash') {
    return (
      <Pressable
        style={{ flex: 1, backgroundColor: '#1b3d1b' }}
        onPress={handleSplashTap}
        accessibilityRole="button"
        accessibilityLabel="Dotknij, aby przejsc dalej"
      >
        <StatusBar style="light" />
        <Animated.View style={{ flex: 1, opacity: splashOpacity }}>
          <Image
            source={splashImg}
            style={{ width: screenW, height: screenH }}
            resizeMode="cover"
          />
        </Animated.View>
      </Pressable>
    );
  }

  if (screen === 'menu') {
    return (
      <Animated.View style={{ flex: 1, backgroundColor: '#2d5a1a', opacity: menuOpacity }}>
        <StatusBar style="light" />
        <Image
          source={menuImg}
          style={{ width: screenW, height: screenH }}
          resizeMode="contain"
        />
        <View style={StyleSheet.absoluteFillObject}>
          {MENU_BUTTONS.map(({ screen: targetScreen, lf, tf, wf, hf }) => (
            <Pressable
              key={targetScreen}
              onPress={() => handleMenuTap(targetScreen)}
              accessibilityRole="button"
              accessibilityLabel={targetScreen}
              style={{
                position: 'absolute',
                left: menuOffsetX + lf * menuRenderedW,
                top: menuOffsetY + tf * menuRenderedH,
                width: wf * menuRenderedW,
                height: hf * menuRenderedH,
              }}
            />
          ))}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: innerOpacity }}>
    <ImageBackground source={dabBg} style={{ flex: 1 }} resizeMode="cover">
    <SafeAreaView style={styles.safeAreaTransparent}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.screenTopBar}>
          <Pressable onPress={goToMenu} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Menu</Text>
          </Pressable>
          <View style={styles.topBarRight}>
            <Text style={styles.topBarStars}>⭐ {totalStars}/30</Text>
            <Pressable onPress={askResetProgress} style={styles.resetProgressButton}>
              <Text style={styles.resetProgressButtonText}>Reset</Text>
            </Pressable>
          </View>
        </View>

        {screen === 'quiz' && (
          <View style={styles.dailyGoalCard}>
            <Text style={styles.dailyGoalTitle}>Dzienny cel</Text>
            <Text style={styles.dailyGoalText}>
              Gwiazdki: {dailyStars}/{dailyStarsGoal} | Rundy: {dailyRounds}/{dailyRoundsGoal}
            </Text>
            <Text style={styles.dailyGoalBadge}>{dailyGoalDone ? 'Cel ukonczony! 🎉' : 'Dzialaj dalej!'}</Text>
          </View>
        )}

        <Animated.View style={[styles.feedbackToast, { opacity: feedbackOpacity }]}>
          <Text style={styles.feedbackToastText}>{feedbackText}</Text>
        </Animated.View>

        {screen === 'quiz' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.episodePicker}>
            <Pressable
              onPress={() => setSelectedEpisodeCode('all')}
              style={[styles.episodeChip, selectedEpisodeCode === 'all' && styles.episodeChipActive]}
            >
              <Text style={[styles.episodeChipText, selectedEpisodeCode === 'all' && styles.episodeChipTextActive]}>
                Wszystkie
              </Text>
            </Pressable>
            {[...seasonEpisodes, ...season2Episodes].map((episode) => (
              <Pressable
                key={episode.code}
                onPress={() => setSelectedEpisodeCode(episode.code)}
                disabled={!unlockedEpisodeMap[episode.code]}
                style={[
                  styles.episodeChip,
                  selectedEpisodeCode === episode.code && styles.episodeChipActive,
                  !unlockedEpisodeMap[episode.code] && styles.episodeChipLocked,
                ]}
              >
                <Text
                  style={[
                    styles.episodeChipText,
                    selectedEpisodeCode === episode.code && styles.episodeChipTextActive,
                    !unlockedEpisodeMap[episode.code] && styles.episodeChipTextLocked,
                  ]}
                >
                  {unlockedEpisodeMap[episode.code] ? episode.code : `${episode.code} 🔒`}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {screen === 'mapa' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Mapa przygod</Text>

            {/* Season selector */}
            <View style={styles.mapSeasonSelector}>
              <Pressable
                style={[styles.mapSeasonBtn, mapSeason === 1 && styles.mapSeasonBtnActive]}
                onPress={() => {
                  setMapSeason(1);
                  setSelectedLocationId(seasonMapData[0].id);
                }}
              >
                <Text style={[styles.mapSeasonBtnText, mapSeason === 1 && styles.mapSeasonBtnTextActive]}>
                  🌳 Sezon 1
                </Text>
              </Pressable>
              <Pressable
                style={[styles.mapSeasonBtn, mapSeason === 2 && styles.mapSeasonBtnActive]}
                onPress={() => {
                  setMapSeason(2);
                  setSelectedLocationId(season2MapData[0].id);
                }}
              >
                <Text style={[styles.mapSeasonBtnText, mapSeason === 2 && styles.mapSeasonBtnTextActive]}>
                  ☀️ Sezon 2
                </Text>
              </Pressable>
            </View>

            <ImageBackground
              source={mapSeason === 1 ? mapImage : mapaS02Image}
              style={[styles.map, { aspectRatio: mapSeason === 1 ? 1632 / 1006 : 1536 / 1024 }]}
              imageStyle={{ resizeMode: 'cover' }}
            >
              {(mapSeason === 1 ? seasonMapData : season2MapData).map((location) => {
                const isSelected = selectedLocationId === location.id;
                return (
                  <Pressable
                    key={location.id}
                    onPress={() => setSelectedLocationId(location.id)}
                    style={[
                      styles.pin,
                      {
                        left: `${location.x}%`,
                        top: `${location.y}%`,
                        backgroundColor: isSelected ? '#cb3f45' : '#ffffff',
                      },
                    ]}
                  >
                    <Text style={styles.pinEmoji}>{location.icon}</Text>
                  </Pressable>
                );
              })}
            </ImageBackground>

            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>
                {selectedLocation.icon} {selectedLocation.name}
              </Text>
              {mapEvents.length === 0 ? (
                <Text style={styles.factText}>Brak wydarzen dla tego miejsca.</Text>
              ) : (
                mapEvents.map((event, index) => (
                  <Text key={`${selectedLocation.id}-${index}`} style={styles.factText}>
                    • {event.episode}: {event.action}
                  </Text>
                ))
              )}
            </View>
          </View>
        )}
        {screen === 'odcinki' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Odcinki</Text>

            {/* Season dropdown */}
            <View style={{ zIndex: 20 }}>
              <Pressable
                style={styles.dropdownTrigger}
                onPress={() => setOdcinkiDropdownOpen((o) => !o)}
              >
                <Text style={styles.dropdownTriggerText}>
                  {odcinkiSeason === 'all' ? 'Oba sezony' : `Sezon ${odcinkiSeason}`}
                </Text>
                <Text style={styles.dropdownArrow}>{odcinkiDropdownOpen ? '▲' : '▼'}</Text>
              </Pressable>
              {odcinkiDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {([{ label: 'Oba sezony', value: 'all' }, { label: 'Sezon 1', value: 1 }, { label: 'Sezon 2', value: 2 }] as { label: string; value: 'all' | 1 | 2 }[]).map((opt) => (
                    <Pressable
                      key={String(opt.value)}
                      style={[styles.dropdownItem, odcinkiSeason === opt.value && styles.dropdownItemActive]}
                      onPress={() => { setOdcinkiSeason(opt.value); setOdcinkiDropdownOpen(false); }}
                    >
                      <Text style={[styles.dropdownItemText, odcinkiSeason === opt.value && styles.dropdownItemTextActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {(odcinkiSeason === 'all' || odcinkiSeason === 1) && (
              <>
                <View style={styles.seasonHeader}>
                  <Text style={styles.seasonHeaderText}>🌳 Sezon 1 — Lesna Szkola</Text>
                </View>
                {seasonEpisodes.map((episode) => (
                  <View key={episode.code} style={styles.missionCard}>
                    <Text style={styles.missionTitle}>{episode.code} — {episode.title}</Text>
                    <Text style={styles.missionText}>{episode.description}</Text>
                  </View>
                ))}
              </>
            )}

            {(odcinkiSeason === 'all' || odcinkiSeason === 2) && (
              <>
                <View style={[styles.seasonHeader, odcinkiSeason === 'all' ? { marginTop: 6 } : {}]}>
                  <Text style={styles.seasonHeaderText}>☀️ Sezon 2 — Wakacyjne Przygody</Text>
                </View>
                {season2Episodes.map((episode) => (
                  <View key={episode.code} style={styles.missionCard}>
                    <Text style={styles.missionTitle}>{episode.code} — {episode.title}</Text>
                    <Text style={styles.missionText}>{episode.description}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
        {screen === 'quiz' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Mini quiz sezonu 1</Text>
            <Text style={styles.sectionDescription}>
              3 pytania na odcinek. Najlepszy wynik zapisuje sie jako gwiazdki.
            </Text>
            {selectedEpisodeCode === 'all' ? (
              <View style={styles.nextSeasonCard}>
                <Text style={styles.nextSeasonTitle}>Wybierz konkretny odcinek</Text>
                <Text style={styles.nextSeasonText}>
                  Aby rozwiazac quiz, wybierz S01E01-S01E10 z paska filtrow.
                </Text>
              </View>
            ) : !unlockedEpisodeMap[selectedEpisodeCode] ? (
              <View style={styles.nextSeasonCard}>
                <Text style={styles.nextSeasonTitle}>Odcinek zablokowany</Text>
                <Text style={styles.nextSeasonText}>
                  Aby odblokowac ten odcinek, zdobadz minimum 2/3 gwiazdki w poprzednim.
                </Text>
              </View>
            ) : !selectedQuiz ? (
              <View style={styles.nextSeasonCard}>
                <Text style={styles.nextSeasonTitle}>Brak pytan</Text>
                <Text style={styles.nextSeasonText}>Dla tego odcinka quiz nie zostal jeszcze przygotowany.</Text>
              </View>
            ) : (
              <>
                <View style={styles.nextSeasonCard}>
                  <Text style={styles.nextSeasonTitle}>
                    {selectedEpisode.code} - najlepszy wynik: {quizScores[selectedEpisode.code] ?? 0}/3 ({scoreToStars(
                      quizScores[selectedEpisode.code] ?? 0,
                    )})
                  </Text>
                  {quizFeedback[selectedEpisode.code] ? (
                    <Text style={styles.quizFeedbackText}>{quizFeedback[selectedEpisode.code]}</Text>
                  ) : null}
                </View>

                {shuffledQuizQuestions.map((question, questionIndex) => (
                  <View key={question.id} style={styles.quizCard}>
                    <Text style={styles.quizQuestion}>
                      {questionIndex + 1}. {question.question}
                    </Text>
                    <View style={styles.quizOptionsWrap}>
                      {question.options.map((option, optionIndex) => {
                        const isSelected = quizAnswers[question.id] === optionIndex;
                        return (
                          <Pressable
                            key={`${question.id}-${optionIndex}`}
                            onPress={() =>
                              setQuizAnswers((current) => ({
                                ...current,
                                [question.id]: optionIndex,
                              }))
                            }
                            style={[styles.quizOption, isSelected && styles.quizOptionSelected]}
                          >
                            <Text style={[styles.quizOptionText, isSelected && styles.quizOptionTextSelected]}>
                              {option}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}

                <View style={styles.quizActions}>
                  <Pressable style={styles.quizPrimaryButton} onPress={submitQuiz}>
                    <Text style={styles.quizPrimaryButtonText}>Sprawdz wynik</Text>
                  </Pressable>
                  <Pressable style={styles.quizSecondaryButton} onPress={resetQuiz}>
                    <Text style={styles.quizSecondaryButtonText}>Wyczysc odpowiedzi</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}
        {screen === 'gry' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Minigry</Text>
            <Text style={styles.sectionDescription}>Wybierz grę — otworzy się w pełnym ekranie.</Text>
            <View style={styles.gameTabsGrid}>
              {(
                [
                  { id: 'zrecznosciowa', label: 'Zręcznościowa' },
                  { id: 'match3', label: 'Match-3' },
                  { id: 'puzzle', label: 'Puzzle' },
                  { id: 'kolorowanki', label: 'Kolorowanki' },
                ] as { id: GameTab; label: string }[]
              ).map((g) => (
                <Pressable
                  key={g.id}
                  style={[styles.gameTab, activeGameTab === g.id && styles.gameTabActive]}
                  onPress={() => {
                    setActiveGameTab(g.id);
                    setFullscreenGame(g.id);
                  }}
                >
                  <Text style={[styles.gameTabText, activeGameTab === g.id && styles.gameTabTextActive]}>
                    {g.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>

    {/* ---- Fullscreen game modal ---- */}
    <Modal
      visible={fullscreenGame !== null}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => setFullscreenGame(null)}
    >
      <ImageBackground source={dabBg} style={{ flex: 1 }} resizeMode="cover">
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <View style={styles.fsHeader}>
            <Text style={styles.fsTitle}>
              {fullscreenGame === 'zrecznosciowa' ? 'Zrecznosciowa' :
               fullscreenGame === 'match3' ? 'Match-3' :
               fullscreenGame === 'puzzle' ? 'Puzzle' : 'Kolorowanki'}
            </Text>
            <Pressable onPress={() => setFullscreenGame(null)} style={styles.fsCloseBtn}>
              <Text style={styles.fsCloseBtnText}>✕ Zamknij</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 30, gap: 10 }}>
            {fullscreenGame === 'zrecznosciowa' && (
              <View style={styles.nextSeasonCard}>
                {tapGameOver ? (
                  <View style={styles.gameEndCard}>
                    <Text style={styles.gameEndEmoji}>🎉</Text>
                    <Text style={styles.gameEndTitle}>Gratulacje!</Text>
                    <Text style={styles.gameEndScore}>Twój wynik: {tapScore} punktów</Text>
                    {tapScore > 0 && tapScore >= tapBest && (
                      <Text style={styles.gameEndRecord}>🏆 Nowy rekord!</Text>
                    )}
                    <View style={styles.gameEndButtons}>
                      <Pressable style={styles.gameEndBtn} onPress={startTapGame}>
                        <Text style={styles.gameEndBtnText}>Zagraj ponownie</Text>
                      </Pressable>
                      <Pressable style={[styles.gameEndBtn, styles.gameEndBtnSecondary]} onPress={() => setTapGameOver(false)}>
                        <Text style={styles.gameEndBtnTextSecondary}>Zamknij</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.nextSeasonText}>Wynik: {tapScore} | Rekord: {tapBest}</Text>
                    <View
                      style={styles.tapArenaFs}
                      onLayout={(event) => {
                        const { width, height } = event.nativeEvent.layout;
                        setTapArenaWidth(width);
                        setTapArenaHeight(height);
                      }}
                    >
                      <Pressable
                        onPress={hitTapTarget}
                        style={[styles.tapTarget, { left: tapTarget.x, top: tapTarget.y }]}
                      >
                        <Image
                          source={tapTargetChar === 'bruno' ? brunoFaceImg : felaFaceImg}
                          style={styles.tapFaceImage}
                          resizeMode="cover"
                        />
                      </Pressable>
                      {tapBurstPos && (
                        <Animated.View
                          pointerEvents="none"
                          style={[styles.tapBurst, {
                            left: tapBurstPos.x + 32 - 36,
                            top: tapBurstPos.y + 32 - 36,
                            opacity: tapBurstOpacity,
                            transform: [{ scale: tapBurstScale }],
                          }]}
                        />
                      )}
                    </View>
                    {tapPlaying && (
                      <View style={styles.tapTimerWrap}>
                        <Text style={styles.tapTimerNumber}>{tapTimeLeft}</Text>
                        <View style={styles.tapTimerTrack}>
                          <View style={[styles.tapTimerFill, { width: `${(tapTimeLeft / 20) * 100}%` as `${number}%` }]} />
                        </View>
                      </View>
                    )}
                    <Pressable style={styles.quizPrimaryButton} onPress={startTapGame}>
                      <Text style={styles.quizPrimaryButtonText}>
                        {tapPlaying ? 'Restart rundy' : 'Start rundy'}
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            )}

            {fullscreenGame === 'match3' && (
              <View style={styles.nextSeasonCard}>
                {matchGameOver ? (
                  <View style={styles.gameEndCard}>
                    <Text style={styles.gameEndEmoji}>🌟</Text>
                    <Text style={styles.gameEndTitle}>Gratulacje!</Text>
                    <Text style={styles.gameEndScore}>Wynik: {matchScore} pkt w 18 ruchach</Text>
                    <View style={styles.gameEndButtons}>
                      <Pressable style={styles.gameEndBtn} onPress={resetMatch3}>
                        <Text style={styles.gameEndBtnText}>Zagraj ponownie</Text>
                      </Pressable>
                      <Pressable style={[styles.gameEndBtn, styles.gameEndBtnSecondary]} onPress={() => setMatchGameOver(false)}>
                        <Text style={styles.gameEndBtnTextSecondary}>Zamknij</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.nextSeasonText}>Punkty: {matchScore} | Ruchy: {matchMoves}</Text>
                    <View style={{ position: 'relative' }}>
                      <View style={styles.matchBoardWrap}>
                        {matchBoard.map((row, rowIndex) => (
                          <View key={`fsrow-${rowIndex}`} style={styles.matchRowLg}>
                            {row.map((cell, colIndex) => {
                              const isSelected =
                                matchSelected?.row === rowIndex && matchSelected?.col === colIndex;
                              return (
                                <Pressable
                                  key={`fscell-${rowIndex}-${colIndex}`}
                                  onPress={() => onTapGem(rowIndex, colIndex)}
                                  style={[styles.matchCellLg, isSelected && styles.matchCellSelected]}
                                >
                                  <Image source={GEM_IMAGES[cell]} style={styles.gemImage} resizeMode="cover" />
                                </Pressable>
                              );
                            })}
                          </View>
                        ))}
                      </View>
                      <Animated.View
                        pointerEvents="none"
                        style={[styles.matchFlashOverlay, { opacity: matchFlashAnim }]}
                      />
                    </View>
                    <Pressable style={styles.quizSecondaryButton} onPress={resetMatch3}>
                      <Text style={styles.quizSecondaryButtonText}>Nowa plansza</Text>
                    </Pressable>
                  </>
                )}
              </View>
            )}

            {fullscreenGame === 'puzzle' && (
              <View style={styles.nextSeasonCard}>
                <PuzzleGame
                  onRoundComplete={() => {
                    setDailyRounds((c) => c + 1);
                    announce('Brawo, puzzle rozwiazane');
                    showFeedback('Puzzle!');
                  }}
                />
              </View>
            )}

            {fullscreenGame === 'kolorowanki' && (
              <View style={styles.nextSeasonCard}>
                <ColoringGame
                  onRoundComplete={() => {
                    setDailyRounds((c) => c + 1);
                    announce('Swietny rysunek');
                    showFeedback('Brawo!');
                  }}
                />
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </Modal>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5e6be',
  },
  safeAreaTransparent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  welcomeWrap: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  welcomeCard: {
    backgroundColor: '#fff8e8',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#efd8a2',
    padding: 20,
    gap: 12,
  },
  welcomeAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: '#fff',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#3f2d17',
  },
  welcomeText: {
    color: '#644d33',
    lineHeight: 22,
  },
  welcomeButton: {
    marginTop: 8,
    backgroundColor: '#cb3f45',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  welcomeButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  headerCard: {
    backgroundColor: '#fff8e8',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#efd8a2',
  },
  characterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3f2d17',
  },
  subtitle: {
    marginTop: 6,
    color: '#5d4a2f',
    fontSize: 14,
  },
  starsSummary: {
    marginTop: 8,
    color: '#2e6947',
    fontSize: 14,
    fontWeight: '700',
  },
  dailyGoalCard: {
    marginTop: 0,
    backgroundColor: 'rgba(232, 246, 234, 0.92)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#b8dfbe',
    padding: 10,
    gap: 3,
  },
  dailyGoalTitle: {
    color: '#1f6c46',
    fontWeight: '800',
  },
  dailyGoalText: {
    color: '#2c6548',
    fontSize: 13,
  },
  dailyGoalBadge: {
    color: '#2f8b5f',
    fontWeight: '800',
    marginTop: 2,
  },
  resetProgressButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#fff0f0',
    borderColor: '#e8b1b1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetProgressButtonText: {
    color: '#a73535',
    fontWeight: '800',
    fontSize: 13,
  },
  feedbackToast: {
    alignSelf: 'center',
    backgroundColor: '#1f6c46',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  feedbackToastText: {
    color: '#fff',
    fontWeight: '800',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff4d7',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#efd8a2',
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#cb3f45',
  },
  tabText: {
    fontWeight: '700',
    color: '#734f2c',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  episodePicker: {
    gap: 8,
    paddingVertical: 4,
    paddingRight: 16,
  },
  episodeChip: {
    backgroundColor: '#fff4d7',
    borderWidth: 1,
    borderColor: '#efd8a2',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  episodeChipActive: {
    backgroundColor: '#cb3f45',
    borderColor: '#cb3f45',
  },
  episodeChipLocked: {
    backgroundColor: '#f1ead8',
    borderColor: '#dfd2b5',
  },
  episodeChipText: {
    fontWeight: '700',
    color: '#7a542f',
  },
  episodeChipTextActive: {
    color: '#fff',
  },
  episodeChipTextLocked: {
    color: '#9e8c73',
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 248, 232, 0.93)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#efd8a2',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#402b15',
  },
  sectionDescription: {
    color: '#6c5538',
    fontSize: 14,
  },
  map: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d7c69d',
    backgroundColor: '#f6f4ee',
  },
  mapImageStyle: {
    resizeMode: 'contain',
  },
  mapSeasonSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  mapSeasonBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3c88f',
    backgroundColor: '#fff9ea',
    alignItems: 'center',
  },
  mapSeasonBtnActive: {
    backgroundColor: '#cb3f45',
    borderColor: '#cb3f45',
  },
  mapSeasonBtnText: {
    fontWeight: '700',
    color: '#664d31',
  },
  mapSeasonBtnTextActive: {
    color: '#fff',
  },
  seasonHeader: {
    backgroundColor: 'rgba(47,143,91,0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderLeftWidth: 3,
    borderLeftColor: '#2f8f5b',
  },
  seasonHeaderText: {
    fontWeight: '800',
    color: '#1f5f43',
    fontSize: 14,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,248,232,0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#efd8a2',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownTriggerText: {
    fontWeight: '700',
    color: '#734f2c',
    fontSize: 15,
  },
  dropdownArrow: {
    color: '#734f2c',
    fontWeight: '800',
    fontSize: 12,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    backgroundColor: '#fff8e8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#efd8a2',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ddb0',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(203,63,69,0.1)',
  },
  dropdownItemText: {
    fontWeight: '700',
    color: '#734f2c',
  },
  dropdownItemTextActive: {
    color: '#cb3f45',
  },
  pin: {
    position: 'absolute',
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -18,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  pinEmoji: {
    fontSize: 15,
  },
  detailCard: {
    backgroundColor: '#fff1ca',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8cb8f',
    gap: 6,
  },
  detailTitle: {
    fontWeight: '800',
    color: '#442d11',
    fontSize: 16,
    marginBottom: 4,
  },
  factText: {
    color: '#5a4428',
    lineHeight: 20,
  },
  missionCard: {
    backgroundColor: '#fff2d3',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ecd4a2',
    padding: 12,
    gap: 8,
  },
  missionTitle: {
    fontWeight: '800',
    color: '#3d2b18',
    fontSize: 15,
  },
  missionText: {
    color: '#644d33',
    lineHeight: 20,
  },
  nextSeasonCard: {
    marginTop: 6,
    backgroundColor: 'rgba(255, 242, 211, 0.93)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ecd4a2',
    padding: 12,
    gap: 8,
  },
  nextSeasonTitle: {
    fontWeight: '800',
    color: '#3d2b18',
    fontSize: 15,
  },
  nextSeasonText: {
    color: '#644d33',
    lineHeight: 20,
  },
  quizCard: {
    backgroundColor: '#fff2d3',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ecd4a2',
    padding: 12,
    gap: 10,
  },
  quizQuestion: {
    color: '#3d2b18',
    fontWeight: '800',
    fontSize: 15,
    lineHeight: 22,
  },
  quizOptionsWrap: {
    gap: 8,
  },
  quizOption: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e3c88f',
    backgroundColor: '#fff9ea',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  quizOptionSelected: {
    backgroundColor: '#cb3f45',
    borderColor: '#cb3f45',
  },
  quizOptionText: {
    color: '#664d31',
    fontWeight: '700',
  },
  quizOptionTextSelected: {
    color: '#ffffff',
  },
  quizActions: {
    marginTop: 4,
    gap: 8,
  },
  quizFeedbackText: {
    marginTop: 8,
    color: '#2a744d',
    lineHeight: 20,
    fontWeight: '700',
  },
  quizPrimaryButton: {
    backgroundColor: '#2f8b5f',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  quizPrimaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  quizSecondaryButton: {
    backgroundColor: '#fff4d7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ecd4a2',
    paddingVertical: 11,
    alignItems: 'center',
  },
  quizSecondaryButtonText: {
    color: '#7a542f',
    fontWeight: '800',
  },
  screenTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 248, 232, 0.90)',
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  backBtn: {
    backgroundColor: '#fff4d7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#efd8a2',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backBtnText: {
    color: '#734f2c',
    fontWeight: '800',
    fontSize: 14,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarStars: {
    color: '#2e6947',
    fontWeight: '700',
    fontSize: 14,
  },
  gameTabsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gameTab: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e3c88f',
    backgroundColor: '#fff9ea',
    paddingVertical: 9,
    alignItems: 'center',
  },
  gameTabActive: {
    backgroundColor: '#cb3f45',
    borderColor: '#cb3f45',
  },
  gameTabText: {
    color: '#664d31',
    fontWeight: '800',
  },
  gameTabTextActive: {
    color: '#fff',
  },
  tapArena: {
    marginTop: 8,
    height: 210,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3c88f',
    backgroundColor: '#fff9ea',
    position: 'relative',
    overflow: 'hidden',
  },
  tapTarget: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  tapTargetText: {
    color: '#fff',
    fontWeight: '800',
  },
  tapBurst: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffd54f',
    borderWidth: 3,
    borderColor: '#ff6f00',
  },
  tapTimerWrap: {
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  tapTimerNumber: {
    fontSize: 52,
    fontWeight: '900',
    color: '#cb3f45',
    lineHeight: 58,
  },
  tapTimerTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0d9a6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tapTimerFill: {
    height: '100%',
    backgroundColor: '#cb3f45',
    borderRadius: 4,
  },
  matchFlashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffd700',
    borderRadius: 10,
    pointerEvents: 'none',
  } as object,
  gameEndCard: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 10,
  },
  gameEndEmoji: { fontSize: 60 },
  gameEndTitle: { fontSize: 28, fontWeight: '900', color: '#3a2000' },
  gameEndScore: { fontSize: 18, fontWeight: '700', color: '#644d33', textAlign: 'center' },
  gameEndRecord: { fontSize: 16, fontWeight: '800', color: '#cb3f45' },
  gameEndButtons: { flexDirection: 'row', gap: 10, marginTop: 6 },
  gameEndBtn: {
    backgroundColor: '#cb3f45',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  gameEndBtnSecondary: {
    backgroundColor: '#fff4d7',
    borderWidth: 1,
    borderColor: '#ecd4a2',
  },
  gameEndBtnText: { color: '#fff', fontWeight: '800' },
  gameEndBtnTextSecondary: { color: '#7a542f', fontWeight: '800' },
  matchBoardWrap: {
    alignSelf: 'center',
    gap: 6,
  },
  matchRow: {
    flexDirection: 'row',
    gap: 6,
  },
  matchCell: {
    width: 42,
    height: 42,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
  },
  matchCellSelected: {
    borderColor: '#202020',
    borderWidth: 3,
  },
  matchCellLg: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
  },
  matchRowLg: {
    flexDirection: 'row',
    gap: 6,
  },
  gemImage: {
    width: '100%',
    height: '100%',
  },
  tapFaceImage: {
    width: 64,
    height: 64,
  },
  tapArenaFs: {
    height: 380,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3c88f',
    backgroundColor: 'rgba(255, 249, 234, 0.9)',
    position: 'relative',
    overflow: 'hidden',
    marginTop: 8,
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandBtn: {
    backgroundColor: '#fff4d7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecd4a2',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  expandBtnText: {
    fontSize: 18,
    color: '#734f2c',
    fontWeight: '800',
  },
  fsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 248, 232, 0.93)',
    margin: 12,
    marginBottom: 4,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#efd8a2',
  },
  fsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#402b15',
  },
  fsCloseBtn: {
    backgroundColor: '#cb3f45',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fsCloseBtnText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
