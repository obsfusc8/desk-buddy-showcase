import React, { useState, useEffect } from 'react';
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
} from '../types';
import { BUILT_IN_QUOTES } from '../data/expressions';

interface OledScreenProps {
  currentScreen: ScreenId;
  expressionId: ExpressionId;
  petStats: PetStats;
  pomodoro: PomodoroState;
  stopwatchTime: number; // in centiseconds
  isStopwatchRunning: boolean;
  weather: WeatherData;
  settings: DeviceSettings;
  activeMessage: string | null;
  selectedMenuIndex: number;
  showPetStatsOverlay: boolean;
  isNightMode: boolean;
  gameType: GameType;
  reactionGame: ReactionGameState;
  jumpGame: JumpGameState;
  diceGame: DiceGameState;
  currentQuoteIndex: number;
  isSleeping: boolean;
  onJumpGameTap?: () => void;
}

export const OledScreen: React.FC<OledScreenProps> = ({
  currentScreen,
  expressionId,
  petStats,
  pomodoro,
  stopwatchTime,
  isStopwatchRunning,
  weather,
  settings,
  activeMessage,
  selectedMenuIndex,
  showPetStatsOverlay,
  isNightMode,
  gameType,
  reactionGame,
  jumpGame,
  diceGame,
  currentQuoteIndex,
  isSleeping,
}) => {
  // Real-time clock for display
  const [now, setNow] = useState(new Date());
  const [blink, setBlink] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [sparkleAnim, setSparkleAnim] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Idle animations: breathing, blinks, and subtle pupil saccades
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 3800 + Math.random() * 2000);

    const saccadeInterval = setInterval(() => {
      const dirs = [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 0 }];
      const pick = dirs[Math.floor(Math.random() * dirs.length)];
      setEyeOffset(pick);
    }, 2400);

    const sparkleInterval = setInterval(() => {
      setSparkleAnim((prev) => (prev + 1) % 4);
    }, 300);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(saccadeInterval);
      clearInterval(sparkleInterval);
    };
  }, []);

  // Format time according to 12h/24h setting
  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    let ampm = '';

    if (!settings.is24h) {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
    }
    const hrStr = hours.toString().padStart(2, '0');
    return { hrStr, minutes, seconds, ampm };
  };

  const { hrStr, minutes, seconds, ampm } = formatTime(now);
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dateStr = `${dayNames[now.getDay()]} ${now.getDate().toString().padStart(2, '0')} ${monthNames[now.getMonth()]}`;

  // Menu items in Settings Menu
  const menuItems = [
    `Brightness: ${settings.brightness}`,
    `Sound: ${settings.soundEnabled ? 'ON' : 'MUTED'}`,
    `Hourly Chime: ${settings.hourlyChime ? 'ON' : 'OFF'}`,
    `24h Clock: ${settings.is24h ? 'YES' : 'NO'}`,
    `Pet Mode: ${settings.petMode ? 'ACTIVE' : 'OFF'}`,
    `Auto Sleep: ${settings.autoSleep ? 'ENABLED' : 'DISABLED'}`,
    'WiFi Setup AP',
    'Save + Exit',
    'Reboot System',
  ];

  // Stopwatch formatting
  const formatStopwatch = (cs: number) => {
    const totalSec = Math.floor(cs / 100);
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    const hundredths = (cs % 100).toString().padStart(2, '0');
    return `${m}:${s}.${hundredths}`;
  };

  // Pomodoro time formatting
  const formatPomodoro = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Countdown calculations
  const calculateDaysUntil = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const diff = target - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return { days, hours, mins };
  };

  const countdown = calculateDaysUntil(settings.eventDate);

  // Render Face Eyes based on expression
  const renderFaceEyes = (id: ExpressionId) => {
    const activeExpr = isSleeping ? 13 : id;

    if (blink && !isSleeping && activeExpr !== 13) {
      // Blink animation
      return (
        <div className="flex items-center justify-between w-24 h-10 px-2">
          <div className="w-9 h-1 bg-[#d7f0ff] rounded-full shadow-[0_0_8px_#38bdf8]" />
          <div className="w-9 h-1 bg-[#d7f0ff] rounded-full shadow-[0_0_8px_#38bdf8]" />
        </div>
      );
    }

    switch (activeExpr) {
      case 1: // Happy: Joyful crescents
        return (
          <div className="relative flex items-center justify-between w-24 h-11 px-1">
            <div className="w-8 h-8 border-t-4 border-l-4 border-r-4 border-[#d7f0ff] rounded-t-full shadow-[0_0_8px_#38bdf8]" />
            <div className="w-8 h-8 border-t-4 border-l-4 border-r-4 border-[#d7f0ff] rounded-t-full shadow-[0_0_8px_#38bdf8]" />
            {/* Sparkles */}
            <div className={`absolute -top-1 left-2 text-[10px] text-[#facc15] ${sparkleAnim % 2 === 0 ? 'opacity-100 scale-110' : 'opacity-40 scale-90'}`}>✦</div>
            <div className={`absolute -top-1 right-2 text-[10px] text-[#facc15] ${sparkleAnim % 2 === 1 ? 'opacity-100 scale-110' : 'opacity-40 scale-90'}`}>✦</div>
          </div>
        );

      case 2: // Love: Heart eyes
        return (
          <div className="flex items-center justify-between w-24 h-10 px-1 text-2xl text-[#ff5a79] animate-pulse">
            <span className="drop-shadow-[0_0_8px_rgba(255,90,121,0.8)]">♥</span>
            <span className="drop-shadow-[0_0_8px_rgba(255,90,121,0.8)]">♥</span>
          </div>
        );

      case 3: // Star: 4-point stars
        return (
          <div className="flex items-center justify-between w-24 h-10 px-1 text-2xl text-[#fef08a]">
            <span className="drop-shadow-[0_0_8px_#facc15]">★</span>
            <span className="drop-shadow-[0_0_8px_#facc15]">★</span>
          </div>
        );

      case 4: // Wink
        return (
          <div className="flex items-center justify-between w-24 h-10 px-2">
            {/* Left wide eye */}
            <div className="relative w-8 h-9 bg-[#d7f0ff] rounded-[10px] flex items-center justify-center shadow-[0_0_8px_#38bdf8]">
              <div
                className="w-4 h-4 bg-[#080d16] rounded-full absolute"
                style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
              />
              <div className="w-1.5 h-1.5 bg-[#d7f0ff] rounded-full absolute top-1.5 left-1.5" />
            </div>
            {/* Right winking line */}
            <div className="w-8 h-1.5 bg-[#d7f0ff] rounded-full -rotate-12 shadow-[0_0_8px_#38bdf8]" />
          </div>
        );

      case 5: // Dizzy: Spirals
        return (
          <div className="flex items-center justify-between w-24 h-10 px-1 text-xl font-bold text-[#d7f0ff] animate-spin">
            <span>@</span>
            <span>@</span>
          </div>
        );

      case 6: // Angry: Angled downward brows
        return (
          <div className="flex flex-col items-center w-24">
            <div className="flex justify-between w-full px-1 mb-1">
              <div className="w-9 h-1.5 bg-[#d7f0ff] rotate-12 rounded-full" />
              <div className="w-9 h-1.5 bg-[#d7f0ff] -rotate-12 rounded-full" />
            </div>
            <div className="flex justify-between w-full px-2">
              <div className="w-7 h-6 bg-[#d7f0ff] rounded-b-md shadow-[0_0_6px_#38bdf8]" />
              <div className="w-7 h-6 bg-[#d7f0ff] rounded-b-md shadow-[0_0_6px_#38bdf8]" />
            </div>
          </div>
        );

      case 7: // Sad: Drooping eyes with tear
        return (
          <div className="relative flex items-center justify-between w-24 h-10 px-2">
            <div className="w-8 h-7 border-b-4 border-l-2 border-r-2 border-[#d7f0ff] rounded-b-full shadow-[0_0_6px_#38bdf8]" />
            <div className="w-8 h-7 border-b-4 border-l-2 border-r-2 border-[#d7f0ff] rounded-b-full shadow-[0_0_6px_#38bdf8]" />
            <div className="absolute right-1 bottom-0 w-1.5 h-2.5 bg-[#38bdf8] rounded-full animate-bounce" />
          </div>
        );

      case 8: // Sleepy: Drooping half-lidded
        return (
          <div className="flex items-center justify-between w-24 h-10 px-2">
            <div className="relative w-8 h-5 bg-[#d7f0ff] rounded-b-lg overflow-hidden">
              <div className="w-4 h-4 bg-[#080d16] rounded-full absolute bottom-0 left-2" />
            </div>
            <div className="relative w-8 h-5 bg-[#d7f0ff] rounded-b-lg overflow-hidden">
              <div className="w-4 h-4 bg-[#080d16] rounded-full absolute bottom-0 left-2" />
            </div>
          </div>
        );

      case 9: // Surprised: Big ovals with tiny pupil
        return (
          <div className="flex items-center justify-between w-24 h-11 px-2">
            <div className="w-8 h-10 border-2 border-[#d7f0ff] rounded-full flex items-center justify-center shadow-[0_0_6px_#38bdf8]">
              <div className="w-2 h-2 bg-[#d7f0ff] rounded-full" />
            </div>
            <div className="w-8 h-10 border-2 border-[#d7f0ff] rounded-full flex items-center justify-center shadow-[0_0_6px_#38bdf8]">
              <div className="w-2 h-2 bg-[#d7f0ff] rounded-full" />
            </div>
          </div>
        );

      case 10: // Smug
        return (
          <div className="flex flex-col items-center w-24">
            <div className="flex justify-between w-full px-2 mb-1">
              <div className="w-8 h-1 bg-[#d7f0ff] -rotate-6 rounded-full" />
              <div className="w-8 h-1 bg-[#d7f0ff] rotate-12 rounded-full" />
            </div>
            <div className="flex justify-between w-full px-2">
              <div className="w-8 h-4 bg-[#d7f0ff] rounded-t-lg" />
              <div className="w-8 h-3 bg-[#d7f0ff] rounded-t-lg" />
            </div>
          </div>
        );

      case 11: // Nervous: Jittering pupils & sweat drop
        return (
          <div className="relative flex items-center justify-between w-24 h-10 px-2">
            <div className="w-8 h-8 border border-[#d7f0ff] rounded-md flex items-center justify-center">
              <div className="w-3 h-3 bg-[#d7f0ff] rounded-full animate-ping" />
            </div>
            <div className="w-8 h-8 border border-[#d7f0ff] rounded-md flex items-center justify-center">
              <div className="w-3 h-3 bg-[#d7f0ff] rounded-full animate-ping" />
            </div>
            <div className="absolute -top-1 -right-1 text-xs text-[#38bdf8]">💧</div>
          </div>
        );

      case 12: // Cat: Slitted pupils + triangular ears
        return (
          <div className="flex flex-col items-center w-24">
            <div className="flex justify-between w-full px-1 text-[11px] font-bold text-[#d7f0ff]">
              <span>▲</span>
              <span>▲</span>
            </div>
            <div className="flex justify-between w-full px-2">
              <div className="w-8 h-8 bg-[#d7f0ff] rounded-full flex items-center justify-center">
                <div className="w-1.5 h-6 bg-[#080d16] rounded-full" />
              </div>
              <div className="w-8 h-8 bg-[#d7f0ff] rounded-full flex items-center justify-center">
                <div className="w-1.5 h-6 bg-[#080d16] rounded-full" />
              </div>
            </div>
          </div>
        );

      case 13: // Sleeping: Horizontal bars with floating zZZ
        return (
          <div className="relative flex items-center justify-between w-24 h-10 px-2">
            <div className="w-8 h-1 bg-[#94a3b8] rounded-full" />
            <div className="w-8 h-1 bg-[#94a3b8] rounded-full" />
            <div className="absolute -top-2 right-1 font-mono text-xs text-[#d7f0ff] animate-bounce">
              z<span className="text-[9px]">Z</span><span className="text-[7px]">z</span>
            </div>
          </div>
        );

      case 14: // Cute: Anime large pupils with reflections
        return (
          <div className="flex items-center justify-between w-24 h-11 px-1">
            <div className="relative w-9 h-10 bg-[#d7f0ff] rounded-2xl flex items-center justify-center shadow-[0_0_8px_#38bdf8]">
              <div className="w-6 h-7 bg-[#080d16] rounded-xl flex items-start justify-start p-1">
                <div className="w-2.5 h-2.5 bg-[#d7f0ff] rounded-full" />
                <div className="w-1 h-1 bg-[#d7f0ff] rounded-full ml-1 mt-3" />
              </div>
            </div>
            <div className="relative w-9 h-10 bg-[#d7f0ff] rounded-2xl flex items-center justify-center shadow-[0_0_8px_#38bdf8]">
              <div className="w-6 h-7 bg-[#080d16] rounded-xl flex items-start justify-start p-1">
                <div className="w-2.5 h-2.5 bg-[#d7f0ff] rounded-full" />
                <div className="w-1 h-1 bg-[#d7f0ff] rounded-full ml-1 mt-3" />
              </div>
            </div>
          </div>
        );

      case 0: // Default: Round friendly eyes
      default:
        return (
          <div className="flex items-center justify-between w-24 h-10 px-2">
            <div className="relative w-8 h-9 bg-[#d7f0ff] rounded-[10px] flex items-center justify-center shadow-[0_0_8px_#38bdf8]">
              <div
                className="w-4 h-4 bg-[#080d16] rounded-full absolute"
                style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
              />
              <div className="w-1.5 h-1.5 bg-[#d7f0ff] rounded-full absolute top-1.5 left-1.5" />
            </div>
            <div className="relative w-8 h-9 bg-[#d7f0ff] rounded-[10px] flex items-center justify-center shadow-[0_0_8px_#38bdf8]">
              <div
                className="w-4 h-4 bg-[#080d16] rounded-full absolute"
                style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
              />
              <div className="w-1.5 h-1.5 bg-[#d7f0ff] rounded-full absolute top-1.5 left-1.5" />
            </div>
          </div>
        );
    }
  };

  // Weather icon helper
  const renderWeatherIcon = (cond: WeatherData['condition']) => {
    switch (cond) {
      case 'sunny':
        return (
          <div className="relative w-7 h-7 flex items-center justify-center text-[#fef08a]">
            <span className="text-xl">☼</span>
          </div>
        );
      case 'rainy':
        return (
          <div className="flex flex-col items-center">
            <span className="text-base text-[#d7f0ff]">☁</span>
            <span className="text-[10px] text-[#38bdf8] leading-none">///</span>
          </div>
        );
      case 'thunder':
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm text-[#d7f0ff]">☁</span>
            <span className="text-xs text-[#facc15] font-bold">⚡</span>
          </div>
        );
      case 'snow':
        return <span className="text-lg text-[#d7f0ff]">❄</span>;
      case 'mist':
        return (
          <div className="flex flex-col items-center text-[9px] text-[#94a3b8] leading-none">
            <span>——</span>
            <span>———</span>
            <span>——</span>
          </div>
        );
      case 'cloudy':
      default:
        return <span className="text-lg text-[#d7f0ff]">☁</span>;
    }
  };

  // If a text message is active, display it over everything
  if (currentScreen === 'MESSAGE' && activeMessage) {
    return (
      <div className="relative w-full h-full bg-[#050810] text-[#d7f0ff] flex flex-col items-center justify-center p-2 font-mono select-none">
        <div className="text-xs text-[#38bdf8] flex items-center gap-1 mb-1 font-bold">
          <span>✉ MESSAGE FROM PHONE</span>
        </div>
        <div className="border border-[#38bdf8] p-2 bg-[#091122] rounded w-full text-center text-sm font-semibold shadow-[0_0_8px_rgba(56,189,248,0.3)]">
          "{activeMessage}"
        </div>
        <div className="text-[9px] text-[#64748b] mt-1.5">Tap pad to dismiss</div>
      </div>
    );
  }

  // If Settings Menu is open
  if (currentScreen === 'SETTINGS_MENU') {
    return (
      <div className="relative w-full h-full bg-[#050810] text-[#d7f0ff] flex flex-col p-1.5 font-mono select-none text-[11px]">
        <div className="flex justify-between items-center border-b border-[#1e293b] pb-0.5 mb-1 text-[10px] text-[#38bdf8] font-bold">
          <span>⚙ SETTINGS MENU</span>
          <span className="text-[9px] text-[#94a3b8]">DB v2.0</span>
        </div>
        <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
          {menuItems.slice(Math.max(0, selectedMenuIndex - 1), Math.max(0, selectedMenuIndex - 1) + 4).map((item, idx) => {
            const actualIdx = Math.max(0, selectedMenuIndex - 1) + idx;
            const isSelected = actualIdx === selectedMenuIndex;
            return (
              <div
                key={actualIdx}
                className={`px-1.5 py-0.5 rounded flex items-center justify-between text-[11px] ${
                  isSelected ? 'bg-[#d7f0ff] text-[#050810] font-bold shadow-[0_0_6px_#d7f0ff]' : 'text-[#cbd5e1]'
                }`}
              >
                <span>{isSelected ? `> ${item}` : `  ${item}`}</span>
              </div>
            );
          })}
        </div>
        <div className="text-[9px] text-[#64748b] border-t border-[#1e293b] pt-0.5 flex justify-between">
          <span>TAP: Next</span>
          <span>HOLD 2s: Select</span>
          <span>DBL: Exit</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full bg-[#050810] text-[#d7f0ff] flex flex-col select-none font-mono overflow-hidden transition-opacity duration-300 ${
        isNightMode ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {/* SCREEN 1: CLOCK */}
      {currentScreen === 'CLOCK' && (
        <div className="flex-1 flex flex-col justify-between p-2">
          {/* Header with live date and Wi-Fi indicator */}
          <div className="flex justify-between items-center text-[10px] text-[#94a3b8]">
            <span className="font-semibold tracking-wider text-[#d7f0ff]">{dateStr}</span>
            <div className="flex items-center gap-1.5">
              {settings.hourlyChime && <span className="text-[9px] text-[#facc15]" title="Hourly Chime Active">🔔</span>}
              <span className="text-[9px] text-[#38bdf8]">📶 ●●●●</span>
            </div>
          </div>

          {/* Big Time Display */}
          <div className="flex items-baseline justify-center gap-1 my-auto">
            <span className="text-3xl font-bold tracking-tight text-[#e0f2fe] drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
              {hrStr}:{minutes}
            </span>
            <span className="text-xs font-semibold text-[#38bdf8] w-5">{seconds}</span>
            {ampm && <span className="text-[10px] font-bold text-[#94a3b8] ml-0.5">{ampm}</span>}
          </div>

          {/* Bottom strip: minute progress bar & status ticker */}
          <div>
            {/* 60-second progress bar */}
            <div className="w-full bg-[#1e293b] h-1 rounded-full overflow-hidden mb-1">
              <div
                className="bg-[#38bdf8] h-full transition-all duration-300 shadow-[0_0_6px_#38bdf8]"
                style={{ width: `${(parseInt(seconds) / 60) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] text-[#64748b]">
              <span className="flex items-center gap-1 text-[#38bdf8]">
                ⏰ 07:00
              </span>
              <span className="text-[#94a3b8]">{weather.tempC}°C {weather.condition.toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: WEATHER */}
      {currentScreen === 'WEATHER' && (
        <div className="flex-1 flex flex-col justify-between p-2">
          <div className="flex justify-between items-center text-[10px] border-b border-[#1e293b] pb-1">
            <span className="font-bold text-[#38bdf8]">WEATHER NOW</span>
            <span className="text-[9px] text-[#94a3b8] truncate max-w-[70px]">{weather.city}</span>
          </div>

          <div className="flex items-center justify-between px-1 my-auto">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#f0f9ff] drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
                {weather.tempC}°C
              </span>
              <span className="text-[9px] text-[#94a3b8]">Feels {weather.feelsLikeC}°C</span>
            </div>

            <div className="flex flex-col items-center">
              {renderWeatherIcon(weather.condition)}
              <span className="text-[9px] text-[#cbd5e1] uppercase mt-0.5">{weather.condition}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[9px] text-[#94a3b8] pt-1 border-t border-[#1e293b]">
            <span className="flex items-center gap-1">
              💧 HUM {weather.humidity}%
            </span>
            <span>💨 {weather.windSpeedKmh} km/h</span>
          </div>
        </div>
      )}

      {/* SCREEN 3: 24H FORECAST */}
      {currentScreen === 'FORECAST' && (
        <div className="flex-1 flex flex-col justify-between p-2">
          <div className="flex justify-between items-center text-[10px] border-b border-[#1e293b] pb-0.5">
            <span className="font-bold text-[#38bdf8]">24H FORECAST</span>
            {weather.umbrellaNeeded ? (
              <span className="text-[9px] text-[#facc15] font-bold animate-pulse">☔ TAKE UMBRELLA</span>
            ) : (
              <span className="text-[9px] text-[#94a3b8]">SPARKLINE</span>
            )}
          </div>

          {/* Sparkline visualization */}
          <div className="my-auto">
            <div className="h-7 flex items-end justify-between px-1 gap-1">
              {weather.forecast24h.slice(0, 8).map((f, i) => {
                const heightPercent = Math.min(100, Math.max(20, ((f.tempC - 18) / 14) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                    <span className="text-[7px] text-[#94a3b8] mb-0.5">{f.tempC}°</span>
                    <div
                      className="w-full bg-[#38bdf8] rounded-t-sm transition-all duration-300 shadow-[0_0_4px_#38bdf8]"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[8px] text-[#64748b] mt-1 px-1">
              <span>NOW</span>
              <span>+6h</span>
              <span>+12h</span>
              <span>+18h</span>
              <span>+24h</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[8px] text-[#94a3b8] border-t border-[#1e293b] pt-0.5">
            <span>MIN: 19°C</span>
            <span>MAX: 29°C</span>
            <span>RAIN: 65%</span>
          </div>
        </div>
      )}

      {/* SCREEN 4: FACE (DESK BUDDY ANIMATED PET) */}
      {currentScreen === 'FACE' && (
        <div className="relative flex-1 flex flex-col items-center justify-center p-2">
          {/* If pet stats overlay is toggled via double tap */}
          {showPetStatsOverlay ? (
            <div className="w-full h-full flex flex-col justify-between text-[9px] font-mono">
              <div className="flex justify-between text-[10px] text-[#38bdf8] font-bold border-b border-[#1e293b] pb-0.5">
                <span>PET STATUS</span>
                <span>{isSleeping ? 'ASLEEP' : 'AWAKE'}</span>
              </div>
              <div className="flex flex-col gap-1 my-auto">
                <div className="flex justify-between items-center">
                  <span>FULLNESS:</span>
                  <div className="w-20 bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#4ade80] h-full" style={{ width: `${petStats.fullness}%` }} />
                  </div>
                  <span className="w-6 text-right">{petStats.fullness}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>ENERGY:</span>
                  <div className="w-20 bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#facc15] h-full" style={{ width: `${petStats.energy}%` }} />
                  </div>
                  <span className="w-6 text-right">{petStats.energy}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>AFFECTION:</span>
                  <div className="w-20 bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#f43f5e] h-full" style={{ width: `${petStats.affection}%` }} />
                  </div>
                  <span className="w-6 text-right">{petStats.affection}%</span>
                </div>
              </div>
              <div className="text-[8px] text-[#64748b] border-t border-[#1e293b] pt-0.5 flex justify-between">
                <span>Pets: {petStats.lifetimePets}</span>
                <span>Feeds: {petStats.lifetimeFeeds}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center my-auto transition-transform duration-700 hover:scale-105">
              {renderFaceEyes(expressionId)}
              {/* Mouth / smile indicator */}
              {!isSleeping && expressionId !== 6 && (
                <div className="w-4 h-1 bg-[#d7f0ff] rounded-full mt-2 shadow-[0_0_4px_#38bdf8]" />
              )}
              {expressionId === 6 && (
                <div className="w-5 h-1 bg-[#ef4444] rounded-full mt-2" />
              )}
            </div>
          )}
        </div>
      )}

      {/* SCREEN 5: POMODORO */}
      {currentScreen === 'POMODORO' && (
        <div className="flex-1 flex flex-col justify-between p-2">
          <div className="flex justify-between items-center text-[10px] border-b border-[#1e293b] pb-0.5">
            <span className="font-bold text-[#38bdf8]">POMODORO</span>
            <span className={`text-[9px] px-1 rounded ${pomodoro.isRunning ? 'bg-[#4ade80] text-black font-bold' : 'text-[#94a3b8]'}`}>
              {pomodoro.isRunning ? 'RUNNING' : 'PAUSED'}
            </span>
          </div>

          <div className="flex items-center justify-between px-2 my-auto">
            {/* Circular Gauge Ring representation */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeDasharray="94.2"
                  strokeDashoffset={94.2 - (94.2 * (pomodoro.timeLeft / (pomodoro.workDuration * 60)))}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[9px] font-bold text-[#d7f0ff]">
                R{pomodoro.roundsCompleted + 1}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-[#f0f9ff] drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                {formatPomodoro(pomodoro.timeLeft)}
              </span>
              <span className="text-[9px] text-[#94a3b8] uppercase font-semibold">
                {pomodoro.mode === 'work' ? 'FOCUS SESSION' : 'REST BREAK'}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[8px] text-[#64748b] border-t border-[#1e293b] pt-0.5">
            <span>HOLD: Start/Pause</span>
            <span>DBL: Reset</span>
            <span>★ Total: {petStats.lifetimePomodoros}</span>
          </div>
        </div>
      )}

      {/* SCREEN 6: STOPWATCH */}
      {currentScreen === 'STOPWATCH' && (
        <div className="flex-1 flex flex-col justify-between p-2">
          <div className="flex justify-between items-center text-[10px] border-b border-[#1e293b] pb-0.5">
            <span className="font-bold text-[#38bdf8]">STOPWATCH</span>
            <span className={`text-[9px] ${isStopwatchRunning ? 'text-[#4ade80] animate-pulse font-bold' : 'text-[#94a3b8]'}`}>
              {isStopwatchRunning ? 'ACTIVE' : 'STOPPED'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center my-auto">
            <span className="text-2xl font-bold text-[#f0f9ff] tracking-tight drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">
              {formatStopwatch(stopwatchTime)}
            </span>
            <span className="text-[9px] text-[#64748b] mt-0.5">MM : SS . CS</span>
          </div>

          <div className="flex justify-between items-center text-[8px] text-[#64748b] border-t border-[#1e293b] pt-0.5">
            <span>HOLD: Start / Stop</span>
            <span>DBL: Reset</span>
          </div>
        </div>
      )}

      {/* SCREEN 7: COUNTDOWN */}
      {currentScreen === 'COUNTDOWN' && (
        <div className="flex-1 flex flex-col justify-between p-2">
          <div className="flex justify-between items-center text-[10px] border-b border-[#1e293b] pb-0.5">
            <span className="font-bold text-[#38bdf8]">EVENT COUNTDOWN</span>
            <span className="text-[9px] text-[#94a3b8]">{settings.eventDate}</span>
          </div>

          <div className="flex flex-col items-center justify-center my-auto">
            <span className="text-xs text-[#facc15] font-bold uppercase tracking-wider mb-1">
              "{settings.eventName}"
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#f0f9ff] drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                {countdown.days}
              </span>
              <span className="text-[10px] text-[#94a3b8]">DAYS</span>
              <span className="text-sm font-semibold text-[#38bdf8] ml-1">
                {countdown.hours}h {countdown.mins}m
              </span>
            </div>
          </div>

          <div className="text-[8px] text-[#64748b] border-t border-[#1e293b] pt-0.5 text-center">
            Configurable via Web Portal (deskbuddy.local)
          </div>
        </div>
      )}

      {/* SCREEN 8: MOTIVATIONAL QUOTES */}
      {currentScreen === 'QUOTE' && (
        <div className="flex-1 flex flex-col justify-between p-2">
          <div className="flex justify-between items-center text-[10px] border-b border-[#1e293b] pb-0.5">
            <span className="font-bold text-[#38bdf8]">DAILY SPARK</span>
            <span className="text-[9px] text-[#94a3b8]">#{currentQuoteIndex + 1}/16</span>
          </div>

          <div className="my-auto px-1">
            <p className="text-[11px] text-[#e2e8f0] font-medium leading-tight italic">
              "{BUILT_IN_QUOTES[currentQuoteIndex]}"
            </p>
          </div>

          <div className="flex justify-between items-center text-[8px] text-[#64748b] border-t border-[#1e293b] pt-0.5">
            <span>DBL / HOLD: Next Quote</span>
            <span>No WiFi Needed</span>
          </div>
        </div>
      )}

      {/* SCREEN 9: GAMES */}
      {currentScreen === 'GAME' && (
        <div className="flex-1 flex flex-col justify-between p-2">
          <div className="flex justify-between items-center text-[10px] border-b border-[#1e293b] pb-0.5">
            <span className="font-bold text-[#38bdf8]">
              {gameType === 'REACTION' && 'GAME: REACTION TEST'}
              {gameType === 'JUMP' && 'GAME: JUMP RUNNER'}
              {gameType === 'DICE' && 'GAME: DICE & COIN'}
            </span>
            <span className="text-[8px] text-[#facc15]">DBL: Switch</span>
          </div>

          {/* Subgame 1: Reaction Test */}
          {gameType === 'REACTION' && (
            <div className="flex flex-col items-center justify-center my-auto">
              {reactionGame.phase === 'IDLE' && (
                <>
                  <span className="text-xs text-[#d7f0ff] font-bold">READY TO TEST?</span>
                  <span className="text-[9px] text-[#94a3b8] mt-1">HOLD 2s to begin</span>
                  {reactionGame.bestTimeMs && (
                    <span className="text-[9px] text-[#4ade80] mt-0.5">Best: {reactionGame.bestTimeMs}ms</span>
                  )}
                </>
              )}
              {reactionGame.phase === 'WAITING' && (
                <>
                  <span className="text-xs text-[#facc15] font-bold animate-pulse">WAIT FOR IT...</span>
                  <span className="text-[8px] text-[#64748b] mt-1">Do not tap yet</span>
                </>
              )}
              {reactionGame.phase === 'READY' && (
                <div className="bg-[#4ade80] text-black font-bold text-sm px-4 py-1.5 rounded animate-bounce">
                  TAP NOW!
                </div>
              )}
              {reactionGame.phase === 'FINISHED' && (
                <>
                  <span className="text-xl font-bold text-[#4ade80] drop-shadow-[0_0_8px_#4ade80]">
                    {reactionGame.reactionTimeMs} ms
                  </span>
                  <span className="text-[9px] text-[#94a3b8] mt-0.5">
                    Best: {reactionGame.bestTimeMs} ms
                  </span>
                </>
              )}
              {reactionGame.phase === 'TOO_EARLY' && (
                <>
                  <span className="text-xs text-[#ef4444] font-bold">TOO EARLY!</span>
                  <span className="text-[9px] text-[#94a3b8] mt-0.5">Hold 2s to try again</span>
                </>
              )}
            </div>
          )}

          {/* Subgame 2: Jump Runner */}
          {gameType === 'JUMP' && (
            <div className="relative w-full h-10 border-b border-[#38bdf8] flex items-end my-auto overflow-hidden">
              {/* Score header */}
              <div className="absolute top-0 right-1 text-[8px] text-[#d7f0ff]">
                SCORE: {jumpGame.score} | HI: {jumpGame.highScore}
              </div>

              {/* Buddy avatar */}
              <div
                className="absolute left-4 w-3.5 h-3.5 bg-[#38bdf8] rounded-sm transition-all duration-75 shadow-[0_0_4px_#38bdf8]"
                style={{ bottom: `${jumpGame.buddyY}px` }}
              >
                <div className="w-1 h-1 bg-black rounded-full ml-0.5 mt-0.5" />
              </div>

              {/* Obstacles */}
              {jumpGame.obstacles.map((obs, idx) => (
                <div
                  key={idx}
                  className="absolute bg-[#f43f5e] rounded-t-sm"
                  style={{
                    left: `${obs.x}px`,
                    width: `${obs.width}px`,
                    height: `${obs.height}px`,
                    bottom: 0,
                  }}
                />
              ))}

              {jumpGame.isGameOver && (
                <div className="absolute inset-0 bg-[#050810]/80 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-[#ef4444] font-bold">GAME OVER</span>
                  <span className="text-[8px] text-[#94a3b8]">Tap to restart</span>
                </div>
              )}
            </div>
          )}

          {/* Subgame 3: Dice & Coin */}
          {gameType === 'DICE' && (
            <div className="flex items-center justify-around my-auto px-2">
              {/* Dice representation */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-[#d7f0ff] rounded-md flex items-center justify-center text-lg font-bold shadow-[0_0_6px_#38bdf8]">
                  {diceGame.dieValue}
                </div>
                <span className="text-[8px] text-[#94a3b8] mt-1">D6 DIE</span>
              </div>

              {/* Coin flip */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-[#facc15] rounded-full flex items-center justify-center text-[10px] font-bold text-[#facc15] shadow-[0_0_6px_#facc15]">
                  {diceGame.coinValue === 'HEADS' ? 'H' : 'T'}
                </div>
                <span className="text-[8px] text-[#facc15] mt-1">{diceGame.coinValue}</span>
              </div>
            </div>
          )}

          <div className="text-[8px] text-[#64748b] border-t border-[#1e293b] pt-0.5 flex justify-between">
            <span>TAP: Play / Roll</span>
            <span>HOLD: Quit</span>
          </div>
        </div>
      )}

      {/* SCREEN 10: DIAGNOSTICS */}
      {currentScreen === 'DIAGNOSTICS' && (
        <div className="flex-1 flex flex-col justify-between p-2 text-[9px]">
          <div className="flex justify-between items-center text-[10px] border-b border-[#1e293b] pb-0.5">
            <span className="font-bold text-[#38bdf8]">SYSTEM DIAGNOSTICS</span>
            <span className="text-[#4ade80]">OTA OK</span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 my-auto">
            <div>
              <span className="text-[#64748b]">IP: </span>
              <span className="text-[#d7f0ff] font-semibold">192.168.1.108</span>
            </div>
            <div>
              <span className="text-[#64748b]">RSSI: </span>
              <span className="text-[#38bdf8] font-semibold">-58 dBm</span>
            </div>
            <div>
              <span className="text-[#64748b]">mDNS: </span>
              <span className="text-[#d7f0ff]">deskbuddy.local</span>
            </div>
            <div>
              <span className="text-[#64748b]">HEAP: </span>
              <span className="text-[#4ade80]">214,520 B</span>
            </div>
            <div>
              <span className="text-[#64748b]">UPTIME: </span>
              <span className="text-[#d7f0ff]">14h 28m 04s</span>
            </div>
            <div>
              <span className="text-[#64748b]">FLASH: </span>
              <span className="text-[#d7f0ff]">4MB NVS OK</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[8px] text-[#64748b] border-t border-[#1e293b] pt-0.5">
            <span>DBL: Reconnect WiFi</span>
            <span>HOLD 2s: Setup AP</span>
          </div>
        </div>
      )}
    </div>
  );
};
