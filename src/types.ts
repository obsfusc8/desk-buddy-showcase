/**
 * Types and interfaces for Desk Buddy v2.0
 */

export type ScreenId =
  | 'CLOCK'
  | 'WEATHER'
  | 'FORECAST'
  | 'FACE'
  | 'POMODORO'
  | 'STOPWATCH'
  | 'COUNTDOWN'
  | 'QUOTE'
  | 'GAME'
  | 'DIAGNOSTICS'
  | 'SETTINGS_MENU'
  | 'MESSAGE';

export type ExpressionId =
  | 0  // Default
  | 1  // Happy
  | 2  // Love
  | 3  // Star
  | 4  // Wink
  | 5  // Dizzy
  | 6  // Angry
  | 7  // Sad
  | 8  // Sleepy
  | 9  // Surprised
  | 10 // Smug
  | 11 // Nervous
  | 12 // Cat
  | 13 // Sleeping
  | 14 // Cute
  ;

export interface ExpressionMeta {
  id: ExpressionId;
  name: string;
  description: string;
  moodCategory: 'neutral' | 'happy' | 'playful' | 'dramatic' | 'resting';
  color: string;
}

export interface PetStats {
  fullness: number;   // 0 - 100 (decays ~10h)
  energy: number;     // 0 - 100 (decays ~14h)
  affection: number;  // 0 - 100 (decays ~16h)
  lifetimePets: number;
  lifetimeFeeds: number;
  lifetimePomodoros: number;
}

export type PomodoroMode = 'work' | 'break' | 'long_break';

export interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  roundsCompleted: number;
  workDuration: number; // minutes (default 25)
  breakDuration: number; // minutes (default 5)
  longBreakDuration: number; // minutes (default 15)
  roundsBeforeLongBreak: number; // default 4
}

export interface WeatherData {
  city: string;
  tempC: number;
  feelsLikeC: number;
  humidity: number; // %
  windSpeedKmh: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'thunder' | 'snow' | 'mist';
  description: string;
  forecast24h: {
    hourOffset: number;
    tempC: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'thunder' | 'snow' | 'mist';
    rainChance: number;
  }[];
  umbrellaNeeded: boolean;
  lastUpdated: string;
}

export interface DeviceSettings {
  brightness: number; // 0 - 255
  nightBrightness: number;
  nightWindowStart: number; // hour (e.g. 22)
  nightWindowEnd: number;   // hour (e.g. 7)
  soundEnabled: boolean;
  hourlyChime: boolean;
  is24h: boolean;
  petMode: boolean;
  autoSleep: boolean;
  dimDelaySeconds: number;
  sleepDelaySeconds: number;
  timeZone: string;
  cityName: string;
  apiKey: string;
  eventName: string;
  eventDate: string;
}

export type GameType = 'REACTION' | 'JUMP' | 'DICE';

export interface ReactionGameState {
  phase: 'IDLE' | 'WAITING' | 'READY' | 'FINISHED' | 'TOO_EARLY';
  startTime: number;
  reactionTimeMs: number | null;
  bestTimeMs: number | null;
}

export interface JumpGameState {
  buddyY: number;
  velocity: number;
  isJumping: boolean;
  obstacles: { x: number; width: number; height: number }[];
  score: number;
  highScore: number;
  isGameOver: boolean;
}

export interface DiceGameState {
  dieValue: number;
  coinValue: 'HEADS' | 'TAILS';
  isRolling: boolean;
}

export interface CircuitSignalTrace {
  id: string;
  name: string;
  source: string;
  destination: string;
  pinNumber: string;
  voltage: string;
  signalType: 'I2C_DATA' | 'I2C_CLOCK' | 'DIGITAL_INTERRUPT' | 'PWM_AUDIO' | 'POWER_3V3' | 'POWER_BATT' | 'GROUND';
  color: string;
  description: string;
  frequency: string;
  dutyCycle?: string;
  active: boolean;
}

export interface CircuitComponent {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  description: string;
  pins: { pin: string; name: string; connectedTo: string; type: string }[];
  voltageRange: string;
  currentDraw: string;
}
