/**
 * Desk Buddy v2.0 - Windows XP Terminal & Desktop Edition
 * Authentic Windows XP Luna UI + Command Prompt (cmd.exe) Hardware Terminal
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScreenId,
  ExpressionId,
  PetStats,
  PomodoroState,
  WeatherData,
  DeviceSettings,
  GameType,
  ReactionGameState,
  JumpGameState,
  DiceGameState,
} from './types';
import { InteractiveDevice } from './components/InteractiveDevice';
import { CircuitWorkbench } from './components/CircuitWorkbench';
import { WebDashboard } from './components/WebDashboard';
import { ExpressionGallery } from './components/ExpressionGallery';
import { ManualDocs } from './components/ManualDocs';
import { PortfolioShowcase } from './components/PortfolioShowcase';
import { soundEngine } from './services/soundEffects';
import { BUILT_IN_QUOTES } from './data/expressions';
import {
  Terminal,
  Cpu,
  Monitor,
  Globe,
  BookOpen,
  Smile,
  Volume2,
  VolumeX,
  Power,
  Wifi,
  Clock,
  Sparkles,
  Layers,
  Folder,
  HardDrive,
  ExternalLink,
  Minimize2,
  Square,
  X,
  ChevronRight,
  Download,
  Package,
  Check,
  Copy,
  GitBranch,
} from 'lucide-react';

const SCREEN_ROTATION: ScreenId[] = [
  'CLOCK',
  'WEATHER',
  'FORECAST',
  'FACE',
  'POMODORO',
  'STOPWATCH',
  'COUNTDOWN',
  'QUOTE',
  'GAME',
  'DIAGNOSTICS',
];

export default function App() {
  const [currentView, setCurrentView] = useState<'showcase' | 'simulator' | 'circuit' | 'portal' | 'expressions' | 'manual'>('showcase');
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const [terminalColorTheme, setTerminalColorTheme] = useState<'green' | 'amber' | 'cyan' | 'white'>('green');
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);

  // OLED Screen & State
  const [screenIndex, setScreenIndex] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('CLOCK');
  const [expressionId, setExpressionId] = useState<ExpressionId>(0);
  const [isSleeping, setIsSleeping] = useState(false);
  const [showPetStatsOverlay, setShowPetStatsOverlay] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  // Pet Stats
  const [petStats, setPetStats] = useState<PetStats>({
    fullness: 82,
    energy: 90,
    affection: 78,
    lifetimePets: 46,
    lifetimeFeeds: 18,
    lifetimePomodoros: 14,
  });

  // Pomodoro
  const [pomodoro, setPomodoro] = useState<PomodoroState>({
    mode: 'work',
    timeLeft: 25 * 60,
    isRunning: false,
    roundsCompleted: 1,
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    roundsBeforeLongBreak: 4,
  });

  // Stopwatch
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  // Quotes
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Games
  const [gameType, setGameType] = useState<GameType>('REACTION');
  const [reactionGame, setReactionGame] = useState<ReactionGameState>({
    phase: 'IDLE',
    startTime: 0,
    reactionTimeMs: null,
    bestTimeMs: 198,
  });

  const [jumpGame, setJumpGame] = useState<JumpGameState>({
    buddyY: 0,
    velocity: 0,
    isJumping: false,
    obstacles: [{ x: 120, width: 6, height: 10 }],
    score: 0,
    highScore: 24,
    isGameOver: false,
  });

  const [diceGame, setDiceGame] = useState<DiceGameState>({
    dieValue: 5,
    coinValue: 'HEADS',
    isRolling: false,
  });

  // Weather Data
  const [weather, setWeather] = useState<WeatherData>({
    city: 'San Francisco, US',
    tempC: 22,
    feelsLikeC: 23,
    humidity: 62,
    windSpeedKmh: 14,
    condition: 'sunny',
    description: 'Clear sky with gentle breeze',
    forecast24h: [
      { hourOffset: 0, tempC: 22, condition: 'sunny', rainChance: 5 },
      { hourOffset: 3, tempC: 25, condition: 'sunny', rainChance: 5 },
      { hourOffset: 6, tempC: 27, condition: 'cloudy', rainChance: 15 },
      { hourOffset: 9, tempC: 24, condition: 'rainy', rainChance: 55 },
      { hourOffset: 12, tempC: 20, condition: 'rainy', rainChance: 70 },
      { hourOffset: 15, tempC: 19, condition: 'cloudy', rainChance: 25 },
      { hourOffset: 18, tempC: 18, condition: 'sunny', rainChance: 10 },
      { hourOffset: 21, tempC: 21, condition: 'sunny', rainChance: 5 },
    ],
    umbrellaNeeded: true,
    lastUpdated: '10 min ago',
  });

  // Device Settings
  const [settings, setSettings] = useState<DeviceSettings>({
    brightness: 220,
    nightBrightness: 25,
    nightWindowStart: 22,
    nightWindowEnd: 7,
    soundEnabled: true,
    hourlyChime: false,
    is24h: false,
    petMode: true,
    autoSleep: true,
    dimDelaySeconds: 90,
    sleepDelaySeconds: 600,
    timeZone: 'EST5EDT',
    cityName: 'San Francisco',
    apiKey: '9a8f23b...',
    eventName: 'Project Launch',
    eventDate: '2026-12-31',
  });

  // Clock in system tray
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setCurrentTimeStr(`${h}:${m} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const lastInteractionRef = useRef(Date.now());
  const registerInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (isSleeping) setIsSleeping(false);
  }, [isSleeping]);

  // Pomodoro countdown loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (pomodoro.isRunning && isPoweredOn) {
      timer = setInterval(() => {
        setPomodoro((prev) => {
          if (prev.timeLeft <= 1) {
            soundEngine.playAlarmTone();
            const nextMode = prev.mode === 'work' ? 'break' : 'work';
            const nextRounds = prev.mode === 'work' ? prev.roundsCompleted + 1 : prev.roundsCompleted;
            return {
              ...prev,
              mode: nextMode,
              timeLeft: nextMode === 'work' ? prev.workDuration * 60 : prev.breakDuration * 60,
              roundsCompleted: nextRounds,
            };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [pomodoro.isRunning, isPoweredOn]);

  // Stopwatch timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isStopwatchRunning && isPoweredOn) {
      timer = setInterval(() => {
        setStopwatchTime((t) => t + 1);
      }, 10);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStopwatchRunning, isPoweredOn]);

  // Jump Game loop
  useEffect(() => {
    let loop: NodeJS.Timeout | null = null;
    if (currentScreen === 'GAME' && gameType === 'JUMP' && !jumpGame.isGameOver && isPoweredOn) {
      loop = setInterval(() => {
        setJumpGame((prev) => {
          let newY = prev.buddyY + prev.velocity;
          let newVelocity = prev.velocity - 1.2;
          if (newY <= 0) {
            newY = 0;
            newVelocity = 0;
          }
          let newObstacles = prev.obstacles.map((obs) => ({ ...obs, x: obs.x - 3 }));
          if (newObstacles.length > 0 && newObstacles[0].x < -10) {
            newObstacles = [{ x: 130 + Math.random() * 40, width: 6, height: 8 + Math.random() * 6 }];
          }
          let hit = false;
          newObstacles.forEach((obs) => {
            if (obs.x < 18 && obs.x > 8 && newY < obs.height) hit = true;
          });
          if (hit) {
            soundEngine.playHitSound();
            return {
              ...prev,
              buddyY: newY,
              velocity: newVelocity,
              isGameOver: true,
              highScore: Math.max(prev.score, prev.highScore),
            };
          }
          return {
            ...prev,
            buddyY: newY,
            velocity: newVelocity,
            obstacles: newObstacles,
            score: prev.score + 1,
          };
        });
      }, 50);
    }
    return () => {
      if (loop) clearInterval(loop);
    };
  }, [currentScreen, gameType, jumpGame.isGameOver, isPoweredOn]);

  // Auto sleep
  useEffect(() => {
    const sleepCheck = setInterval(() => {
      const idleTime = Date.now() - lastInteractionRef.current;
      if (idleTime > 35000 && !isSleeping && !pomodoro.isRunning && !isStopwatchRunning && currentScreen === 'FACE') {
        setIsSleeping(true);
      }
    }, 5000);
    return () => clearInterval(sleepCheck);
  }, [isSleeping, pomodoro.isRunning, isStopwatchRunning, currentScreen]);

  // Derived mood
  useEffect(() => {
    if (currentScreen === 'FACE' && !isSleeping) {
      if (petStats.affection > 85 && petStats.fullness > 70) setExpressionId(2);
      else if (petStats.fullness < 25) setExpressionId(7);
      else if (petStats.energy < 30) setExpressionId(8);
      else if (petStats.affection < 30) setExpressionId(11);
    }
  }, [petStats, currentScreen, isSleeping]);

  // Gestures
  const handleGesture = (gesture: 'TAP' | 'DOUBLE_TAP' | 'HOLD_2S' | 'TRIPLE_TAP' | 'HOLD_5S') => {
    registerInteraction();
    if (!isPoweredOn) return;

    if (activeMessage && (gesture === 'TAP' || gesture === 'DOUBLE_TAP')) {
      setActiveMessage(null);
      return;
    }

    if (gesture === 'TAP') {
      if (currentScreen === 'SETTINGS_MENU') {
        setSelectedMenuIndex((prev) => (prev + 1) % 9);
        soundEngine.playTapClick();
        return;
      }
      if (currentScreen === 'GAME') {
        if (gameType === 'REACTION') {
          if (reactionGame.phase === 'READY') {
            const reaction = Date.now() - reactionGame.startTime;
            soundEngine.playStartupJingle();
            setReactionGame((prev) => ({
              ...prev,
              phase: 'FINISHED',
              reactionTimeMs: reaction,
              bestTimeMs: prev.bestTimeMs ? Math.min(prev.bestTimeMs, reaction) : reaction,
            }));
          } else if (reactionGame.phase === 'WAITING') {
            soundEngine.playHitSound();
            setReactionGame((prev) => ({ ...prev, phase: 'TOO_EARLY' }));
          }
          return;
        }
        if (gameType === 'JUMP') {
          if (jumpGame.isGameOver) {
            setJumpGame({
              buddyY: 0,
              velocity: 0,
              isJumping: false,
              obstacles: [{ x: 120, width: 6, height: 10 }],
              score: 0,
              highScore: jumpGame.highScore,
              isGameOver: false,
            });
          } else if (jumpGame.buddyY <= 2) {
            soundEngine.playJumpSound();
            setJumpGame((prev) => ({ ...prev, velocity: 7, isJumping: true }));
          }
          return;
        }
        if (gameType === 'DICE') {
          soundEngine.playDiceRoll();
          setDiceGame({
            dieValue: Math.floor(Math.random() * 6) + 1,
            coinValue: Math.random() > 0.5 ? 'HEADS' : 'TAILS',
            isRolling: false,
          });
          return;
        }
      }
      const nextIdx = (screenIndex + 1) % SCREEN_ROTATION.length;
      setScreenIndex(nextIdx);
      setCurrentScreen(SCREEN_ROTATION[nextIdx]);
      setShowPetStatsOverlay(false);
      return;
    }

    if (gesture === 'DOUBLE_TAP') {
      if (currentScreen === 'SETTINGS_MENU') {
        setCurrentScreen(SCREEN_ROTATION[screenIndex]);
        soundEngine.playTone(800, 0.05, 'triangle');
        return;
      }
      if (currentScreen === 'CLOCK') {
        setSettings((prev) => ({ ...prev, is24h: !prev.is24h }));
        return;
      }
      if (currentScreen === 'WEATHER' || currentScreen === 'FORECAST') {
        soundEngine.playTone(1300, 0.06, 'sine');
        setWeather((prev) => ({ ...prev, tempC: prev.tempC === 22 ? 23 : 22, lastUpdated: 'Just now' }));
        return;
      }
      if (currentScreen === 'FACE') {
        setShowPetStatsOverlay((prev) => !prev);
        return;
      }
      if (currentScreen === 'POMODORO') {
        setPomodoro((prev) => ({ ...prev, isRunning: false, timeLeft: prev.workDuration * 60 }));
        return;
      }
      if (currentScreen === 'STOPWATCH') {
        setIsStopwatchRunning(false);
        setStopwatchTime(0);
        return;
      }
      if (currentScreen === 'QUOTE') {
        setCurrentQuoteIndex((prev) => (prev + 1) % BUILT_IN_QUOTES.length);
        return;
      }
      if (currentScreen === 'GAME') {
        const games: GameType[] = ['REACTION', 'JUMP', 'DICE'];
        setGameType(games[(games.indexOf(gameType) + 1) % games.length]);
        return;
      }
    }

    if (gesture === 'HOLD_2S') {
      soundEngine.playGestureConfirm();
      if (currentScreen === 'SETTINGS_MENU') {
        if (selectedMenuIndex === 1) {
          const muted = soundEngine.toggleMute();
          setIsMuted(muted);
          setSettings((prev) => ({ ...prev, soundEnabled: !muted }));
        } else if (selectedMenuIndex === 2) {
          setSettings((prev) => ({ ...prev, hourlyChime: !prev.hourlyChime }));
        } else if (selectedMenuIndex === 3) {
          setSettings((prev) => ({ ...prev, is24h: !prev.is24h }));
        } else if (selectedMenuIndex === 7) {
          setCurrentScreen(SCREEN_ROTATION[screenIndex]);
        }
        return;
      }
      if (currentScreen === 'FACE') {
        soundEngine.playPetPurr();
        setExpressionId(2);
        setPetStats((prev) => ({
          ...prev,
          affection: Math.min(100, prev.affection + 15),
          lifetimePets: prev.lifetimePets + 1,
        }));
        setTimeout(() => setExpressionId(1), 2200);
        return;
      }
      if (currentScreen === 'POMODORO') {
        setPomodoro((prev) => ({ ...prev, isRunning: !prev.isRunning }));
        return;
      }
      if (currentScreen === 'STOPWATCH') {
        setIsStopwatchRunning((prev) => !prev);
        return;
      }
      if (currentScreen === 'WEATHER') {
        setCurrentScreen('FORECAST');
        setScreenIndex(2);
        return;
      }
      if (currentScreen === 'FORECAST') {
        setCurrentScreen('WEATHER');
        setScreenIndex(1);
        return;
      }
      if (currentScreen === 'QUOTE') {
        setCurrentQuoteIndex((prev) => (prev + 1) % BUILT_IN_QUOTES.length);
        return;
      }
      if (currentScreen === 'GAME' && gameType === 'REACTION') {
        setReactionGame((prev) => ({ ...prev, phase: 'WAITING' }));
        setTimeout(() => {
          soundEngine.playReactionReady();
          setReactionGame((prev) => ({ ...prev, phase: 'READY', startTime: Date.now() }));
        }, 1800 + Math.random() * 2000);
        return;
      }
    }

    if (gesture === 'TRIPLE_TAP') {
      const muted = soundEngine.toggleMute();
      setIsMuted(muted);
      setSettings((prev) => ({ ...prev, soundEnabled: !muted }));
      return;
    }

    if (gesture === 'HOLD_5S') {
      setCurrentScreen('SETTINGS_MENU');
      setSelectedMenuIndex(0);
      return;
    }
  };

  const handleFeedPet = () => {
    registerInteraction();
    setPetStats((prev) => ({
      ...prev,
      fullness: Math.min(100, prev.fullness + 25),
      lifetimeFeeds: prev.lifetimeFeeds + 1,
    }));
    setExpressionId(1);
  };

  const handleTriggerMood = (moodId: ExpressionId) => {
    registerInteraction();
    setExpressionId(moodId);
    if (currentScreen !== 'FACE') {
      setCurrentScreen('FACE');
      setScreenIndex(3);
    }
  };

  const handleSendMessage = (msg: string) => {
    registerInteraction();
    setActiveMessage(msg);
    setCurrentScreen('MESSAGE');
  };

  const handlePowerToggle = () => {
    if (!isPoweredOn) {
      setIsPoweredOn(true);
      soundEngine.playStartupJingle();
      setIsSleeping(false);
    } else {
      setIsPoweredOn(false);
      soundEngine.playTone(300, 0.1, 'sawtooth');
    }
  };

  // Terminal color text class helper
  const getTerminalTextColor = () => {
    switch (terminalColorTheme) {
      case 'green':
        return 'xp-cmd-green';
      case 'amber':
        return 'xp-cmd-amber';
      case 'cyan':
        return 'xp-cmd-cyan';
      case 'white':
      default:
        return 'text-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#004e98] flex flex-col font-sans relative pb-10 select-none overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 20%, #1e70bf 0%, #004e98 70%, #002d5a 100%)',
      }}
    >
      {/* Windows XP Desktop Top Bar & Status */}
      <div className="bg-[#002f6c]/80 backdrop-blur-sm px-4 py-1.5 border-b border-[#3c82ea]/40 flex items-center justify-between text-xs text-white">
        <div className="flex items-center gap-3 font-mono">
          <span className="font-bold flex items-center gap-1.5 text-sky-300">
            <Terminal className="w-4 h-4 text-emerald-400" />
            C:\WINDOWS\system32\cmd.exe — DeskBuddy v2.0
          </span>
          <span className="text-[#93c5fd] hidden sm:inline">
            [ESP32-S3 Super Mini @ 240MHz · 4MB NVS · SH1106 OLED]
          </span>
        </div>

        {/* Phosphor Theme Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#bfdbfe] hidden sm:inline font-mono">CRT Phosphor:</span>
          <div className="flex items-center gap-1 bg-[#051838] p-0.5 rounded border border-[#1e4b8a]">
            <button
              onClick={() => setTerminalColorTheme('green')}
              className={`w-4 h-4 rounded-full bg-[#00ff66] transition-transform ${terminalColorTheme === 'green' ? 'scale-110 ring-1 ring-white' : 'opacity-60'}`}
              title="Green Matrix CRT"
            />
            <button
              onClick={() => setTerminalColorTheme('amber')}
              className={`w-4 h-4 rounded-full bg-[#ffb000] transition-transform ${terminalColorTheme === 'amber' ? 'scale-110 ring-1 ring-white' : 'opacity-60'}`}
              title="Amber Phosphor CRT"
            />
            <button
              onClick={() => setTerminalColorTheme('cyan')}
              className={`w-4 h-4 rounded-full bg-[#38bdf8] transition-transform ${terminalColorTheme === 'cyan' ? 'scale-110 ring-1 ring-white' : 'opacity-60'}`}
              title="Cyan Cyber CRT"
            />
            <button
              onClick={() => setTerminalColorTheme('white')}
              className={`w-4 h-4 rounded-full bg-white transition-transform ${terminalColorTheme === 'white' ? 'scale-110 ring-1 ring-white' : 'opacity-60'}`}
              title="Classic White DOS"
            />
          </div>
        </div>
      </div>

      {/* Main Windows XP Application Window Frame */}
      <div className="max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 flex-1 flex flex-col">
        <div className="bg-[#ece9d8] rounded-t-lg border-2 border-[#0055ea] shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">
          {/* Windows XP Luna Blue Title Bar */}
          <div className="xp-titlebar px-3 py-2 flex items-center justify-between select-none">
            {/* Window Title & Icon */}
            <div className="flex items-center gap-2 text-white font-bold text-xs tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <div className="w-4 h-4 bg-black border border-gray-400 rounded-sm flex items-center justify-center font-mono text-[9px] text-emerald-400 font-bold">
                C:\
              </div>
              <span className="truncate">
                Command Prompt — [DESK BUDDY v2.0 HARDWARE & TERMINAL WORKBENCH]
              </span>
            </div>

            {/* Iconic XP Window Control Buttons */}
            <div className="flex items-center gap-1">
              <button
                className="xp-control-btn w-5 h-5 flex items-center justify-center text-white text-xs font-bold"
                title="Minimize"
              >
                <div className="w-2.5 h-0.5 bg-white mb-0.5" />
              </button>
              <button
                className="xp-control-btn w-5 h-5 flex items-center justify-center text-white text-xs font-bold"
                title="Maximize"
              >
                <div className="w-2.5 h-2.5 border border-white" />
              </button>
              <button
                onClick={() => handlePowerToggle()}
                className="xp-close-btn w-5 h-5 flex items-center justify-center text-white text-xs font-bold leading-none"
                title="Power Toggle / Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Windows XP Classic Menu Bar */}
          <div className="bg-[#ece9d8] border-b border-[#d4d0c8] px-3 py-1 flex items-center gap-4 text-xs text-black font-sans">
            <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-sm cursor-pointer">File</span>
            <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-sm cursor-pointer">Edit</span>
            <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-sm cursor-pointer">View</span>
            <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-sm cursor-pointer">Terminal</span>
            <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-sm cursor-pointer">Hardware</span>
            <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-sm cursor-pointer">Help</span>
          </div>

          {/* Windows XP Command Prompt / Navigation Toolbar */}
          <div className="bg-[#e4e0cd] px-3 py-2 border-b border-[#b5b09e] flex flex-wrap items-center justify-between gap-2">
            {/* View Switchers styled as XP Command Buttons */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setCurrentView('showcase')}
                className={`xp-btn px-3 py-1 flex items-center gap-1.5 font-bold ${
                  currentView === 'showcase' ? '!border-[#e59700] !bg-[#ffd880]' : ''
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-blue-700" />
                <span>[F1: SHOWCASE.EXE]</span>
              </button>

              <button
                onClick={() => setCurrentView('simulator')}
                className={`xp-btn px-3 py-1 flex items-center gap-1.5 font-bold ${
                  currentView === 'simulator' ? '!border-[#e59700] !bg-[#ffd880]' : ''
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-purple-700" />
                <span>[F2: SIMULATOR.EXE]</span>
              </button>

              <button
                onClick={() => setCurrentView('circuit')}
                className={`xp-btn px-3 py-1 flex items-center gap-1.5 font-bold ${
                  currentView === 'circuit' ? '!border-[#e59700] !bg-[#ffd880]' : ''
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                <span>[F3: CIRCUIT_CAD.EXE]</span>
              </button>

              <button
                onClick={() => setCurrentView('portal')}
                className={`xp-btn px-3 py-1 flex items-center gap-1.5 font-bold ${
                  currentView === 'portal' ? '!border-[#e59700] !bg-[#ffd880]' : ''
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-sky-700" />
                <span>[F4: WEB_PORTAL.EXE]</span>
              </button>

              <button
                onClick={() => setCurrentView('expressions')}
                className={`xp-btn px-3 py-1 flex items-center gap-1.5 font-bold ${
                  currentView === 'expressions' ? '!border-[#e59700] !bg-[#ffd880]' : ''
                }`}
              >
                <Smile className="w-3.5 h-3.5 text-pink-700" />
                <span>[F5: MOOD_PICS.EXE]</span>
              </button>

              <button
                onClick={() => setCurrentView('manual')}
                className={`xp-btn px-3 py-1 flex items-center gap-1.5 font-bold ${
                  currentView === 'manual' ? '!border-[#e59700] !bg-[#ffd880]' : ''
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>[F6: README.TXT]</span>
              </button>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                isPoweredOn ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-red-100 text-red-900 border-red-400'
              }`}>
                PWR: {isPoweredOn ? 'ONLINE' : 'OFFLINE'}
              </span>
              <button
                onClick={() => {
                  const muted = soundEngine.toggleMute();
                  setIsMuted(muted);
                  setSettings((prev) => ({ ...prev, soundEnabled: !muted }));
                }}
                className="xp-btn px-2 py-0.5 flex items-center gap-1"
                title="Buzzer Mute Toggle"
              >
                {isMuted ? <VolumeX className="w-3 h-3 text-red-600" /> : <Volume2 className="w-3 h-3 text-blue-700" />}
                <span>{isMuted ? 'MUTE' : 'AUDIO'}</span>
              </button>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="xp-btn px-2.5 py-0.5 flex items-center gap-1.5 font-bold !bg-[#1b5e20] !text-white !border-[#0d3813] shadow-sm hover:brightness-110"
                title="Export & GitHub Repository Packager"
              >
                <Package className="w-3.5 h-3.5 text-lime-300" />
                <span>EXPORT / GITHUB</span>
              </button>
            </div>
          </div>

          {/* Windows XP Command Prompt Terminal Screen Area */}
          <div className="xp-cmd-terminal p-4 sm:p-6 min-h-[620px] flex flex-col gap-6 overflow-y-auto">
            {/* Classic DOS / Command Prompt Boot Header */}
            <div className={`font-mono text-xs leading-relaxed border-b border-[#222] pb-3 ${getTerminalTextColor()}`}>
              <div>Microsoft Windows XP [Version 5.1.2600.5512 Service Pack 3]</div>
              <div>(C) Copyright 1985-2001 Microsoft Corp. All rights reserved.</div>
              <div className="mt-1 flex items-center gap-2">
                <span>C:\DESKBUDDY&gt;</span>
                <span className="text-white font-bold">
                  RUN {currentView.toUpperCase()}.BAT --PORT=3000 --TARGET=ESP32-S3
                </span>
                <span className="inline-block w-2 h-4 bg-white animate-pulse" />
              </div>
            </div>

            {/* Render View Components */}
            <div className="flex-1">
              {currentView === 'showcase' && (
                <PortfolioShowcase
                  onNavigateToSimulator={() => setCurrentView('simulator')}
                  onNavigateToCircuit={() => setCurrentView('circuit')}
                />
              )}

              {currentView === 'simulator' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <InteractiveDevice
                      currentScreen={currentScreen}
                      expressionId={expressionId}
                      petStats={petStats}
                      pomodoro={pomodoro}
                      stopwatchTime={stopwatchTime}
                      isStopwatchRunning={isStopwatchRunning}
                      weather={weather}
                      settings={settings}
                      activeMessage={activeMessage}
                      selectedMenuIndex={selectedMenuIndex}
                      showPetStatsOverlay={showPetStatsOverlay}
                      isNightMode={false}
                      gameType={gameType}
                      reactionGame={reactionGame}
                      jumpGame={jumpGame}
                      diceGame={diceGame}
                      currentQuoteIndex={currentQuoteIndex}
                      isSleeping={isSleeping}
                      onGesture={handleGesture}
                      onPowerToggle={handlePowerToggle}
                      isPoweredOn={isPoweredOn}
                    />
                  </div>

                  <div className="lg:col-span-7 flex flex-col gap-4 font-mono text-xs">
                    {/* Screen Selector Box in XP Terminal Style */}
                    <div className="p-4 bg-[#111622] border border-[#2a3c5a] rounded-lg">
                      <div className="flex justify-between items-center text-[#38bdf8] border-b border-[#22334d] pb-2 mb-3">
                        <span className="font-bold">OLED SCREEN DISPLAY SELECTOR (10 MODES)</span>
                        <span className="text-white">Active: {currentScreen}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {SCREEN_ROTATION.map((scr, idx) => (
                          <button
                            key={scr}
                            onClick={() => {
                              setScreenIndex(idx);
                              setCurrentScreen(scr);
                              soundEngine.playTapClick();
                            }}
                            className={`p-2 rounded border text-left transition-all ${
                              currentScreen === scr
                                ? 'bg-[#1e3a63] border-[#60a5fa] text-white font-bold'
                                : 'bg-[#080d17] border-[#1b2b44] text-[#94a3b8] hover:border-[#38bdf8] hover:text-white'
                            }`}
                          >
                            <span className="text-[10px] text-[#64748b] block">{idx + 1}.</span>
                            <span className="truncate block font-semibold">{scr}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hardware Gesture Shortcut Pad */}
                    <div className="p-4 bg-[#111622] border border-[#2a3c5a] rounded-lg">
                      <div className="flex justify-between items-center text-[#facc15] border-b border-[#22334d] pb-2 mb-3">
                        <span className="font-bold">CAPACITIVE TOUCH PAD SIMULATOR</span>
                        <span className="text-[#94a3b8]">GPIO 4 (RTC Ext0)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <button
                          onClick={() => handleGesture('HOLD_2S')}
                          className="p-2.5 bg-[#0a111e] hover:bg-[#16253d] border border-[#233857] rounded text-left transition-colors"
                        >
                          <span className="text-[#f43f5e] font-bold block">♥ Pet Buddy</span>
                          <span className="text-[10px] text-[#94a3b8]">Hold 2s on Face</span>
                        </button>

                        <button
                          onClick={() => {
                            setPomodoro((p) => ({ ...p, isRunning: !p.isRunning }));
                            soundEngine.playGestureConfirm();
                          }}
                          className="p-2.5 bg-[#0a111e] hover:bg-[#16253d] border border-[#233857] rounded text-left transition-colors"
                        >
                          <span className="text-[#38bdf8] font-bold block">
                            {pomodoro.isRunning ? '⏸ Pause' : '▶ Start'}
                          </span>
                          <span className="text-[10px] text-[#94a3b8]">Pomodoro 25m</span>
                        </button>

                        <button
                          onClick={() => handleGesture('HOLD_5S')}
                          className="p-2.5 bg-[#0a111e] hover:bg-[#16253d] border border-[#233857] rounded text-left transition-colors"
                        >
                          <span className="text-[#facc15] font-bold block">⚙ Menu</span>
                          <span className="text-[10px] text-[#94a3b8]">Hold 5s on Pad</span>
                        </button>

                        <button
                          onClick={() => {
                            handleTriggerMood(14);
                            soundEngine.playTone(900, 0.1, 'sine');
                          }}
                          className="p-2.5 bg-[#0a111e] hover:bg-[#16253d] border border-[#233857] rounded text-left transition-colors"
                        >
                          <span className="text-[#e879f9] font-bold block">✨ Cute Anime</span>
                          <span className="text-[10px] text-[#94a3b8]">Trigger ID 14</span>
                        </button>
                      </div>
                    </div>

                    {/* Telemetry Bar */}
                    <div className="p-3 bg-[#0a101a] border border-[#1b283d] rounded flex items-center justify-between text-[#cbd5e1]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>PET SIMULATION ENGINE: ONLINE</span>
                      </div>
                      <div className="flex gap-4">
                        <span>Fullness: <strong className="text-emerald-400">{petStats.fullness}%</strong></span>
                        <span>Energy: <strong className="text-yellow-400">{petStats.energy}%</strong></span>
                        <span>Affection: <strong className="text-rose-400">{petStats.affection}%</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentView === 'circuit' && <CircuitWorkbench />}

              {currentView === 'portal' && (
                <WebDashboard
                  settings={settings}
                  onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
                  petStats={petStats}
                  onFeedPet={handleFeedPet}
                  onTriggerMood={handleTriggerMood}
                  onSendMessage={handleSendMessage}
                  onTogglePomodoro={() => setPomodoro((prev) => ({ ...prev, isRunning: !prev.isRunning }))}
                  onResetPomodoro={() => setPomodoro((prev) => ({ ...prev, isRunning: false, timeLeft: prev.workDuration * 60 }))}
                  isPomodoroRunning={pomodoro.isRunning}
                />
              )}

              {currentView === 'expressions' && (
                <ExpressionGallery
                  currentExpressionId={expressionId}
                  onSelectExpression={(id) => {
                    setExpressionId(id);
                    setCurrentScreen('FACE');
                    setScreenIndex(3);
                  }}
                />
              )}

              {currentView === 'manual' && <ManualDocs />}
            </div>

            {/* Terminal Status / Prompt Footer */}
            <div className={`pt-3 border-t border-[#1e1e1e] flex justify-between items-center font-mono text-[11px] ${getTerminalTextColor()}`}>
              <div>
                STATUS: READY · 400kHz I2C · GPIO 4 RTC WAKE · FREE HEAP: 214KB
              </div>
              <div>PRESS F1-F6 OR CLICK TOOLBAR BUTTONS TO SWITCH PROGRAMS</div>
            </div>
          </div>

          {/* Windows XP Classic Status Bar */}
          <div className="bg-[#ece9d8] border-t border-[#d4d0c8] px-3 py-1 flex items-center justify-between text-xs text-black font-sans">
            <div className="flex items-center gap-4">
              <span>Ready</span>
              <span className="text-gray-400">|</span>
              <span className="font-mono text-[11px]">C:\DESKBUDDY\SRC\DeskBuddy20.ino</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span>LINES: 1420</span>
              <span className="text-gray-400">|</span>
              <span>U8G2_SH1106_128X64_NONAME_F_HW_I2C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Windows XP Start Menu Popup */}
      {startMenuOpen && (
        <div className="fixed bottom-9 left-1 w-72 bg-white rounded-t-lg border-2 border-[#0055ea] shadow-2xl z-50 flex flex-col overflow-hidden font-sans">
          {/* Start Menu Header */}
          <div className="bg-gradient-to-r from-[#0058e6] to-[#3a93ff] p-3 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white bg-amber-400 flex items-center justify-center font-bold text-black text-sm">
              DB
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">Desk Buddy User</div>
              <div className="text-[10px] text-sky-200 font-mono">ESP32-S3 Super Mini</div>
            </div>
          </div>

          {/* Start Menu Items */}
          <div className="p-2 flex flex-col gap-1 text-xs text-black bg-[#f6f6f6]">
            <button
              onClick={() => { setCurrentView('showcase'); setStartMenuOpen(false); }}
              className="p-2 hover:bg-[#316ac5] hover:text-white rounded flex items-center gap-2.5 text-left"
            >
              <Terminal className="w-4 h-4 text-blue-600" />
              <div>
                <strong className="block">Showcase Overview</strong>
                <span className="text-[10px] opacity-75">Portfolio presentation deck</span>
              </div>
            </button>

            <button
              onClick={() => { setCurrentView('simulator'); setStartMenuOpen(false); }}
              className="p-2 hover:bg-[#316ac5] hover:text-white rounded flex items-center gap-2.5 text-left"
            >
              <Monitor className="w-4 h-4 text-purple-600" />
              <div>
                <strong className="block">Device Simulator</strong>
                <span className="text-[10px] opacity-75">10-screen OLED & touch pad</span>
              </div>
            </button>

            <button
              onClick={() => { setCurrentView('circuit'); setStartMenuOpen(false); }}
              className="p-2 hover:bg-[#316ac5] hover:text-white rounded flex items-center gap-2.5 text-left"
            >
              <Cpu className="w-4 h-4 text-emerald-600" />
              <div>
                <strong className="block">Circuit CAD Suite</strong>
                <span className="text-[10px] opacity-75">Schematics, traces & DSO probe</span>
              </div>
            </button>

            <button
              onClick={() => { setCurrentView('portal'); setStartMenuOpen(false); }}
              className="p-2 hover:bg-[#316ac5] hover:text-white rounded flex items-center gap-2.5 text-left"
            >
              <Globe className="w-4 h-4 text-sky-600" />
              <div>
                <strong className="block">Internet Explorer (deskbuddy.local)</strong>
                <span className="text-[10px] opacity-75">Web companion portal</span>
              </div>
            </button>

            <button
              onClick={() => { setCurrentView('expressions'); setStartMenuOpen(false); }}
              className="p-2 hover:bg-[#316ac5] hover:text-white rounded flex items-center gap-2.5 text-left"
            >
              <Smile className="w-4 h-4 text-pink-600" />
              <div>
                <strong className="block">15 Faces Gallery</strong>
                <span className="text-[10px] opacity-75">OLED expression animations</span>
              </div>
            </button>

            <button
              onClick={() => { setCurrentView('manual'); setStartMenuOpen(false); }}
              className="p-2 hover:bg-[#316ac5] hover:text-white rounded flex items-center gap-2.5 text-left"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <div>
                <strong className="block">Notepad (MANUAL.TXT)</strong>
                <span className="text-[10px] opacity-75">Setup guide & pin definitions</span>
              </div>
            </button>

            <button
              onClick={() => { setIsExportModalOpen(true); setStartMenuOpen(false); }}
              className="p-2 hover:bg-[#316ac5] hover:text-white rounded flex items-center gap-2.5 text-left border border-emerald-400 bg-emerald-50/70"
            >
              <Package className="w-4 h-4 text-emerald-700" />
              <div>
                <strong className="block text-emerald-900">Pack & Export to GitHub</strong>
                <span className="text-[10px] text-emerald-700">Download ZIP & Git push instructions</span>
              </div>
            </button>
          </div>

          {/* Start Menu Footer */}
          <div className="bg-[#e4e0cd] p-2 border-t border-[#b5b09e] flex justify-between items-center text-xs">
            <button
              onClick={() => { handlePowerToggle(); setStartMenuOpen(false); }}
              className="flex items-center gap-1.5 text-red-700 font-bold hover:underline"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Turn Off Hardware</span>
            </button>
            <span className="text-[10px] text-gray-500 font-mono">Windows XP</span>
          </div>
        </div>
      )}

      {/* Windows XP Classic Taskbar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-9 xp-taskbar z-50 flex items-center justify-between px-1 select-none text-white border-t border-[#3f8cf3]/60">
        <div className="flex items-center gap-1.5 h-full">
          {/* Iconic Windows XP Start Button */}
          <button
            onClick={() => setStartMenuOpen((prev) => !prev)}
            className="xp-start-btn h-8 px-4 flex items-center gap-2 font-bold text-sm tracking-wide text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] italic"
          >
            {/* Windows XP 4-color flag logo */}
            <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 rotate-12">
              <span className="w-1.5 h-1.5 bg-[#f44336] rounded-tl-sm" />
              <span className="w-1.5 h-1.5 bg-[#4caf50] rounded-tr-sm" />
              <span className="w-1.5 h-1.5 bg-[#2196f3] rounded-bl-sm" />
              <span className="w-1.5 h-1.5 bg-[#ffeb3b] rounded-br-sm" />
            </div>
            <span>start</span>
          </button>

          {/* Taskbar Running Program Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-xl h-full py-0.5">
            <button
              onClick={() => setCurrentView('showcase')}
              className={`h-7 px-3 flex items-center gap-1.5 text-xs font-semibold ${
                currentView === 'showcase' ? 'xp-task-tab-active' : 'xp-task-tab-inactive'
              }`}
            >
              <Terminal className="w-3 h-3 text-emerald-300" />
              <span className="truncate max-w-[110px]">Showcase.exe</span>
            </button>

            <button
              onClick={() => setCurrentView('simulator')}
              className={`h-7 px-3 flex items-center gap-1.5 text-xs font-semibold ${
                currentView === 'simulator' ? 'xp-task-tab-active' : 'xp-task-tab-inactive'
              }`}
            >
              <Monitor className="w-3 h-3 text-purple-300" />
              <span className="truncate max-w-[110px]">Simulator.exe</span>
            </button>

            <button
              onClick={() => setCurrentView('circuit')}
              className={`h-7 px-3 flex items-center gap-1.5 text-xs font-semibold ${
                currentView === 'circuit' ? 'xp-task-tab-active' : 'xp-task-tab-inactive'
              }`}
            >
              <Cpu className="w-3 h-3 text-cyan-300" />
              <span className="truncate max-w-[110px]">Circuit_CAD.exe</span>
            </button>

            <button
              onClick={() => setCurrentView('portal')}
              className={`h-7 px-3 flex items-center gap-1.5 text-xs font-semibold ${
                currentView === 'portal' ? 'xp-task-tab-active' : 'xp-task-tab-inactive'
              }`}
            >
              <Globe className="w-3 h-3 text-sky-300" />
              <span className="truncate max-w-[110px]">deskbuddy.local</span>
            </button>

            <button
              onClick={() => setCurrentView('expressions')}
              className={`h-7 px-3 flex items-center gap-1.5 text-xs font-semibold ${
                currentView === 'expressions' ? 'xp-task-tab-active' : 'xp-task-tab-inactive'
              }`}
            >
              <Smile className="w-3 h-3 text-pink-300" />
              <span className="truncate max-w-[110px]">15_Faces.exe</span>
            </button>

            <button
              onClick={() => setCurrentView('manual')}
              className={`h-7 px-3 flex items-center gap-1.5 text-xs font-semibold ${
                currentView === 'manual' ? 'xp-task-tab-active' : 'xp-task-tab-inactive'
              }`}
            >
              <BookOpen className="w-3 h-3 text-amber-300" />
              <span className="truncate max-w-[110px]">Manual.txt</span>
            </button>
          </div>
        </div>

        {/* Windows XP Notification Area (System Tray) */}
        <div className="xp-tray h-7 px-3 rounded-l flex items-center gap-3 text-xs font-sans">
          {/* Sound Mute Icon */}
          <button
            onClick={() => {
              const muted = soundEngine.toggleMute();
              setIsMuted(muted);
              setSettings((prev) => ({ ...prev, soundEnabled: !muted }));
            }}
            title={isMuted ? 'Muted (Click to restore)' : 'Volume: 100%'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-300" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
          </button>

          {/* Wi-Fi Icon */}
          <div className="flex items-center gap-0.5 text-white" title="Connected: HomeNet_5G (-58 dBm)">
            <Wifi className="w-3.5 h-3.5 text-sky-200" />
          </div>

          {/* Hardware Chip Status */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-300" title="ESP32-S3 OK">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>S3</span>
          </div>

          {/* Real-time Clock */}
          <div className="font-sans text-xs text-white tracking-wide pl-1 border-l border-white/20">
            {currentTimeStr}
          </div>
        </div>
      </div>

      {/* Windows XP Export & GitHub Packager Modal Dialog */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#ece9d8] rounded-t-lg border-2 border-[#0055ea] shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden font-sans text-black">
            {/* XP Modal Titlebar */}
            <div className="xp-titlebar px-3 py-1.5 flex items-center justify-between select-none">
              <div className="flex items-center gap-2 text-white font-bold text-xs tracking-wide">
                <Package className="w-4 h-4 text-amber-300" />
                <span>Pack & Upload to GitHub — Desk Buddy v2.0</span>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="xp-close-btn w-5 h-5 flex items-center justify-center text-white text-xs font-bold leading-none"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex flex-col gap-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Notification Banner */}
              <div className="p-3 bg-[#eff6ff] rounded border border-[#bfdbfe] flex items-start gap-3">
                <GitBranch className="w-5 h-5 text-[#2563eb] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1e40af] text-sm mb-0.5">
                    Project Ready for GitHub Deployment
                  </div>
                  <p className="text-[#334155] leading-relaxed">
                    The entire project has been packaged with complete Arduino C++ firmware (<code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono">firmware/DeskBuddy_ESP32S3_v2.0.ino</code>), React 19 web simulator, CAD schematics, BOM, and MIT License.
                  </p>
                </div>
              </div>

              {/* Option 1: Direct 1-Click ZIP Download */}
              <div className="bg-white p-3.5 rounded border border-[#7f9db9] shadow-inner flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">1</span>
                    <strong className="text-emerald-800 text-sm">Download Complete ZIP Archive</strong>
                  </div>
                  <span className="font-mono text-[11px] text-gray-500">104 KB · Ready</span>
                </div>
                <p className="text-gray-600">
                  Directly download the clean production pack containing the complete source tree, firmware, and documentation.
                </p>
                <div className="pt-1">
                  <a
                    href="/desk-buddy-v2-complete.zip"
                    download="desk-buddy-v2-complete.zip"
                    className="xp-btn inline-flex items-center gap-2 px-4 py-2 font-bold !bg-[#2e7d32] !text-white !border-[#1b5e20] hover:brightness-110 shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download desk-buddy-v2-complete.zip</span>
                  </a>
                </div>
              </div>

              {/* Option 2: AI Studio 1-Click GitHub Export */}
              <div className="bg-white p-3.5 rounded border border-[#7f9db9] shadow-inner flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">2</span>
                  <strong className="text-blue-900 text-sm">1-Click AI Studio Export to GitHub</strong>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Google AI Studio features a direct GitHub integration in the menu:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 font-mono text-[11px] bg-gray-50 p-2.5 rounded border border-gray-200">
                  <li>Look at the top-right header of Google AI Studio.</li>
                  <li>Click on the <strong>Settings (⚙️) / Export</strong> menu.</li>
                  <li>Click <strong>&quot;Export to GitHub&quot;</strong>.</li>
                  <li>Select your repository name (e.g., <code className="bg-white px-1 rounded border">desk-buddy-v2</code>) and click Create.</li>
                </ol>
              </div>

              {/* Option 3: Git CLI Push (Local repo is already initialized) */}
              <div className="bg-white p-3.5 rounded border border-[#7f9db9] shadow-inner flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">3</span>
                    <strong className="text-purple-900 text-sm">Push via Git CLI (Repository Already Initialized)</strong>
                  </div>
                  <button
                    onClick={() => {
                      const cmd = `git remote add origin https://github.com/<your-username>/desk-buddy-v2.git\ngit branch -M main\ngit push -u origin main`;
                      navigator.clipboard.writeText(cmd);
                      setCopiedGitCmd(true);
                      setTimeout(() => setCopiedGitCmd(false), 2000);
                    }}
                    className="xp-btn px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5"
                  >
                    {copiedGitCmd ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedGitCmd ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>
                <p className="text-gray-600">
                  If you created an empty repo on GitHub (<code className="font-mono">github.com/new</code>), copy and paste these commands:
                </p>
                <pre className="p-2.5 bg-[#0f172a] text-[#38bdf8] font-mono text-[11px] rounded overflow-x-auto leading-relaxed border border-slate-700">
{`# 1. Add your GitHub remote
git remote add origin https://github.com/<your-username>/desk-buddy-v2.git

# 2. Push all branches & commits
git branch -M main
git push -u origin main`}
                </pre>
              </div>
            </div>

            {/* Modal XP Dialog Buttons Footer */}
            <div className="bg-[#e4e0cd] px-4 py-2.5 border-t border-[#b5b09e] flex justify-end gap-2">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="xp-btn px-5 py-1 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
