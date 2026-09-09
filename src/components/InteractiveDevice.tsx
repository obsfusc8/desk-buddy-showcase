import React, { useState, useRef, useEffect } from 'react';
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
import { OledScreen } from './OledScreen';
import { soundEngine } from '../services/soundEffects';
import { Volume2, VolumeX, Power, Sparkles, Fingerprint, RefreshCw } from 'lucide-react';

interface InteractiveDeviceProps {
  currentScreen: ScreenId;
  expressionId: ExpressionId;
  petStats: PetStats;
  pomodoro: PomodoroState;
  stopwatchTime: number;
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
  onGesture: (gesture: 'TAP' | 'DOUBLE_TAP' | 'HOLD_2S' | 'TRIPLE_TAP' | 'HOLD_5S') => void;
  onPowerToggle: () => void;
  isPoweredOn: boolean;
}

export const InteractiveDevice: React.FC<InteractiveDeviceProps> = ({
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
  onGesture,
  onPowerToggle,
  isPoweredOn,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const [isPadTouched, setIsPadTouched] = useState(false);
  const [touchFeedbackLabel, setTouchFeedbackLabel] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100

  // Touch tracking refs
  const touchStartTimeRef = useRef<number>(0);
  const tapCountRef = useRef<number>(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMuteToggle = () => {
    const newState = soundEngine.toggleMute();
    setIsMuted(newState);
  };

  const showFeedback = (label: string) => {
    setTouchFeedbackLabel(label);
    setTimeout(() => setTouchFeedbackLabel(null), 1200);
  };

  // Direct touch pad handlers
  const handlePadMouseDown = () => {
    if (!isPoweredOn) return;
    setIsPadTouched(true);
    touchStartTimeRef.current = Date.now();
    setHoldProgress(0);

    // Track hold duration
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - touchStartTimeRef.current;
      if (elapsed >= 5000) {
        // Hold 5s reached!
        clearInterval(holdIntervalRef.current!);
        holdIntervalRef.current = null;
        setHoldProgress(100);
        showFeedback('HOLD 5s (Menu)');
        soundEngine.playMenuOpen();
        onGesture('HOLD_5S');
      } else if (elapsed >= 2000 && elapsed < 2100) {
        // Just reached 2s hold
        soundEngine.playGestureConfirm();
        showFeedback('HOLD 2s (Action)');
      } else {
        setHoldProgress(Math.min(100, (elapsed / 5000) * 100));
      }
    }, 50);
  };

  const handlePadMouseUp = () => {
    if (!isPoweredOn) return;
    setIsPadTouched(false);
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    const duration = Date.now() - touchStartTimeRef.current;
    setHoldProgress(0);

    if (duration >= 5000) {
      // Already handled during hold
      return;
    } else if (duration >= 1800) {
      // Hold 2s
      onGesture('HOLD_2S');
      return;
    }

    // Tap handling with double / triple tap detection window
    tapCountRef.current += 1;

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    tapTimerRef.current = setTimeout(() => {
      if (tapCountRef.current === 1) {
        soundEngine.playTapClick();
        showFeedback('Single Tap');
        onGesture('TAP');
      } else if (tapCountRef.current === 2) {
        soundEngine.playDoubleTapChirp();
        showFeedback('Double Tap');
        onGesture('DOUBLE_TAP');
      } else if (tapCountRef.current >= 3) {
        soundEngine.playTone(1760, 0.1, 'triangle');
        showFeedback('Triple Tap (Mute)');
        onGesture('TRIPLE_TAP');
        setIsMuted(soundEngine.isMuted);
      }
      tapCountRef.current = 0;
    }, 280);
  };

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Outer Companion Hardware Enclosure - Windows XP Styled Hardware Prototype */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#f0eee4] via-[#e2dfd4] to-[#d4d0c4] rounded-2xl p-5 border-2 border-[#b0aa9b] shadow-[0_15px_35px_rgba(0,0,0,0.25)] flex flex-col items-center select-none transition-all">
        {/* Subtle screw details on corners */}
        <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full border border-[#8b877a] bg-[#c8c4b6] flex items-center justify-center text-[7px] text-[#555246] rotate-45 shadow-xs">+</div>
        <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full border border-[#8b877a] bg-[#c8c4b6] flex items-center justify-center text-[7px] text-[#555246] -rotate-12 shadow-xs">+</div>
        <div className="absolute bottom-3 left-3 w-2.5 h-2.5 rounded-full border border-[#8b877a] bg-[#c8c4b6] flex items-center justify-center text-[7px] text-[#555246] rotate-12 shadow-xs">+</div>
        <div className="absolute bottom-3 right-3 w-2.5 h-2.5 rounded-full border border-[#8b877a] bg-[#c8c4b6] flex items-center justify-center text-[7px] text-[#555246] rotate-90 shadow-xs">+</div>

        {/* Top Header Strip: Brand & Hardware Status */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0058e6] animate-ping" />
            <span className="font-mono text-xs font-bold tracking-wider text-[#222222] uppercase">
              DESK BUDDY <span className="text-[#0058e6]">v2.0</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mute button */}
            <button
              onClick={handleMuteToggle}
              title={isMuted ? 'Unmute Piezo Buzzer' : 'Mute Piezo Buzzer'}
              className="xp-btn p-1 text-black"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-600" /> : <Volume2 className="w-3.5 h-3.5 text-blue-700" />}
            </button>

            {/* Power slide switch indicator */}
            <button
              onClick={onPowerToggle}
              title={isPoweredOn ? 'Power Off' : 'Power On'}
              className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${
                isPoweredOn
                  ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-bold'
                  : 'bg-red-100 border-red-500 text-red-800'
              }`}
            >
              <Power className="w-3 h-3" />
              <span>{isPoweredOn ? 'PWR ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* OLED Display Screen Glass & Bezel */}
        <div className="relative w-full aspect-[2/1] bg-[#000000] rounded-lg p-2.5 border-4 border-[#827d71] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9),0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center overflow-hidden">
          {/* Subtle screen scanline / glass reflection overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent z-10" />
          <div className="absolute inset-0 pointer-events-none oled-grid opacity-30 z-10" />

          {isPoweredOn ? (
            <OledScreen
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
              isNightMode={isNightMode}
              gameType={gameType}
              reactionGame={reactionGame}
              jumpGame={jumpGame}
              diceGame={diceGame}
              currentQuoteIndex={currentQuoteIndex}
              isSleeping={isSleeping}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center font-mono text-[#555555] text-xs">
              <Power className="w-6 h-6 mb-1 opacity-40" />
              <span>POWERED OFF</span>
              <span className="text-[10px] mt-0.5 text-gray-500">Click PWR ON to boot</span>
            </div>
          )}
        </div>

        {/* Display Glass Footer Info */}
        <div className="w-full flex items-center justify-between mt-2 px-1 text-[10px] font-mono text-gray-600">
          <span>SH1106 128×64 OLED</span>
          <span className="text-blue-800 font-bold flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
            I²C 400kHz · 3.3V
          </span>
        </div>

        {/* Lower Hardware Controls: TTP223 Capacitive Touch Pad & Buzzer Grill */}
        <div className="w-full grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-[#b8b3a5] items-center">
          {/* Left: Speaker Grill */}
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#d6d2c4] rounded-lg border border-[#a29d8e] shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5d5a4f]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#5d5a4f]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#5d5a4f]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#5d5a4f]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#0058e6]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#5d5a4f]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#5d5a4f]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#5d5a4f]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#5d5a4f]" />
            </div>
            <span className="text-[9px] font-mono text-gray-600 mt-1">PIEZO (GPIO 7)</span>
          </div>

          {/* Center: Interactive TTP223 Capacitive Touch Pad */}
          <div className="flex flex-col items-center">
            <div
              onMouseDown={handlePadMouseDown}
              onMouseUp={handlePadMouseUp}
              onTouchStart={handlePadMouseDown}
              onTouchEnd={handlePadMouseUp}
              className={`relative w-16 h-16 rounded-full cursor-pointer transition-all flex flex-col items-center justify-center border-2 select-none active:scale-95 ${
                isPadTouched
                  ? 'bg-gradient-to-tr from-blue-600 to-sky-400 border-blue-300 shadow-[0_0_15px_rgba(0,88,230,0.7)] scale-95'
                  : 'bg-gradient-to-tr from-[#ece9d8] to-[#ffffff] border-[#7f9db9] hover:border-[#0058e6] shadow-[0_2px_6px_rgba(0,0,0,0.2)]'
              }`}
            >
              {/* Radial hold progress meter */}
              {holdProgress > 0 && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="#0058e6"
                    strokeWidth="3"
                    strokeDasharray="113.1"
                    strokeDashoffset={113.1 - (113.1 * holdProgress) / 100}
                  />
                </svg>
              )}

              {/* Pad LED indicator */}
              <div
                className={`w-2 h-2 rounded-full mb-1 transition-all ${
                  isPadTouched ? 'bg-[#ff2a5f] shadow-[0_0_6px_#ff2a5f]' : 'bg-[#7f9db9]'
                }`}
              />

              <Fingerprint className={`w-5 h-5 ${isPadTouched ? 'text-white' : 'text-blue-700'}`} />
            </div>
            <span className="text-[9px] font-mono font-semibold text-gray-700 mt-1 flex items-center gap-1">
              TOUCH PAD
              {touchFeedbackLabel && (
                <span className="text-blue-800 font-bold animate-pulse">[{touchFeedbackLabel}]</span>
              )}
            </span>
          </div>

          {/* Right: LiPo Battery Status */}
          <div className="flex flex-col items-center text-center">
            <div className="p-2 bg-[#d6d2c4] rounded-lg border border-[#a29d8e] text-[10px] font-mono text-gray-800 flex flex-col items-center shadow-inner">
              <span className="text-emerald-700 font-bold">3.7V LiPo</span>
              <span className="text-[9px] text-gray-600">150 mAh Cell</span>
              <span className="text-[8px] text-blue-800 mt-0.5 font-bold">RTC Wake G4</span>
            </div>
            <span className="text-[9px] font-mono text-gray-600 mt-1">POWER RAIL</span>
          </div>
        </div>

        {/* Touch Gesture Shortcuts Quick-Bar */}
        <div className="w-full mt-4 pt-2.5 border-t border-[#b8b3a5] flex flex-col">
          <div className="text-[10px] font-mono text-gray-700 mb-1.5 flex justify-between">
            <span className="font-bold">5 HARDWARE GESTURES</span>
            <span className="text-blue-800">Click button or touch pad</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            <button
              onClick={() => {
                soundEngine.playTapClick();
                showFeedback('Single Tap');
                onGesture('TAP');
              }}
              className="xp-btn px-1.5 py-1 text-[10px] font-mono text-center"
              title="Single Tap: Next screen / Game action"
            >
              <div className="font-bold text-blue-800">Tap</div>
              <div className="text-[8px] text-gray-600 truncate">Next</div>
            </button>

            <button
              onClick={() => {
                soundEngine.playDoubleTapChirp();
                showFeedback('Double Tap');
                onGesture('DOUBLE_TAP');
              }}
              className="xp-btn px-1.5 py-1 text-[10px] font-mono text-center"
              title="Double Tap: 12/24h toggle, pet stats, pomodoro reset"
            >
              <div className="font-bold text-blue-800">2× Tap</div>
              <div className="text-[8px] text-gray-600 truncate">Action</div>
            </button>

            <button
              onClick={() => {
                soundEngine.playGestureConfirm();
                showFeedback('Hold 2s');
                onGesture('HOLD_2S');
              }}
              className="xp-btn px-1.5 py-1 text-[10px] font-mono text-center"
              title="Hold 2s: Pet buddy, start pomodoro, force forecast"
            >
              <div className="font-bold text-blue-800">Hold 2s</div>
              <div className="text-[8px] text-gray-600 truncate">Pet/Start</div>
            </button>

            <button
              onClick={() => {
                soundEngine.playTone(1760, 0.1, 'triangle');
                showFeedback('Triple Tap (Mute)');
                onGesture('TRIPLE_TAP');
                setIsMuted(soundEngine.isMuted);
              }}
              className="xp-btn px-1.5 py-1 text-[10px] font-mono text-center"
              title="Triple Tap: Master Mute / Unmute"
            >
              <div className="font-bold text-blue-800">3× Tap</div>
              <div className="text-[8px] text-gray-600 truncate">Mute</div>
            </button>

            <button
              onClick={() => {
                soundEngine.playMenuOpen();
                showFeedback('Hold 5s (Menu)');
                onGesture('HOLD_5S');
              }}
              className="xp-btn px-1.5 py-1 text-[10px] font-mono text-center"
              title="Hold 5s: Open Settings Menu"
            >
              <div className="font-bold text-amber-700">Hold 5s</div>
              <div className="text-[8px] text-gray-600 truncate">Menu</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
