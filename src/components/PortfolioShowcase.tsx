import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  Cpu,
  BatteryCharging,
  Wifi,
  Sparkles,
  ArrowRight,
  Sliders,
  CheckCircle2,
  HardDrive,
  Activity,
  Layers,
  Zap,
  Radio,
  Volume2,
  Clock,
  Heart,
  Eye,
  Play,
  RotateCcw,
  Check,
} from 'lucide-react';
import { soundEngine } from '../services/soundEffects';

interface PortfolioShowcaseProps {
  onNavigateToSimulator: () => void;
  onNavigateToCircuit: () => void;
}

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  onNavigateToSimulator,
  onNavigateToCircuit,
}) => {
  const [activeArchTab, setActiveArchTab] = useState<'rtos' | 'power' | 'gestures' | 'burnin'>('rtos');
  
  // Interactive Live Architecture Bus Simulator
  const [activeSignalBus, setActiveSignalBus] = useState<'i2c' | 'touch' | 'buzzer' | 'power'>('i2c');
  const [isBusPulsing, setIsBusPulsing] = useState(false);
  const [packetCount, setPacketCount] = useState(1284);

  // Interactive Eye Kinematics & Saccade Simulator
  const [eyeMood, setEyeMood] = useState<'happy' | 'love' | 'wink' | 'shocked' | 'sleepy'>('happy');
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const eyeContainerRef = useRef<HTMLDivElement>(null);

  // Interactive Battery Runtime Estimator
  const [batteryCapacityMilliampHours, setBatteryCapacityMilliampHours] = useState(150);
  const [usageProfile, setUsageProfile] = useState<'continuous' | 'balanced' | 'sleep'>('balanced');

  // Interactive Gesture FSM Simulator
  const [gestureState, setGestureState] = useState<'IDLE' | 'DETECTED' | 'EVALUATING' | 'DISPATCHED'>('IDLE');
  const [lastDispatchedGesture, setLastDispatchedGesture] = useState<string>('Ready for input');

  // Trigger bus signal pulse animation
  const triggerBusPulse = (bus: 'i2c' | 'touch' | 'buzzer' | 'power') => {
    setActiveSignalBus(bus);
    setIsBusPulsing(true);
    setPacketCount((p) => p + 16);

    if (bus === 'i2c') soundEngine.playTone(800, 0.04, 'sine');
    else if (bus === 'touch') soundEngine.playTapClick();
    else if (bus === 'buzzer') soundEngine.playTone(2400, 0.08, 'square');
    else soundEngine.playTone(450, 0.05, 'triangle');

    setTimeout(() => setIsBusPulsing(false), 900);
  };

  // Natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Eye tracking movement on mouse over preview box
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!eyeContainerRef.current) return;
    const rect = eyeContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = Math.max(-10, Math.min(10, (e.clientX - centerX) / 8));
    const deltaY = Math.max(-6, Math.min(6, (e.clientY - centerY) / 8));
    setPupilOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPupilOffset({ x: 0, y: 0 });
  };

  // Simulate gesture action
  const simulateGesture = (type: 'SINGLE_TAP' | 'DOUBLE_TAP' | 'HOLD_2S' | 'HOLD_5S') => {
    setGestureState('DETECTED');
    soundEngine.playTapClick();

    setTimeout(() => {
      setGestureState('EVALUATING');

      setTimeout(() => {
        setGestureState('DISPATCHED');
        if (type === 'SINGLE_TAP') {
          setLastDispatchedGesture('SINGLE TAP → Next OLED Screen (State +1)');
          soundEngine.playTapClick();
        } else if (type === 'DOUBLE_TAP') {
          setLastDispatchedGesture('DOUBLE TAP → 12/24H Time Format Toggled');
          soundEngine.playGestureConfirm();
        } else if (type === 'HOLD_2S') {
          setLastDispatchedGesture('HOLD 2s → Buddy Pet Interaction (+15 Affection)');
          soundEngine.playPetPurr();
        } else {
          setLastDispatchedGesture('HOLD 5s → Hardware Config Menu Invoked');
          soundEngine.playGestureConfirm();
        }

        setTimeout(() => setGestureState('IDLE'), 1800);
      }, 300);
    }, 200);
  };

  // Calculate battery runtime based on capacity and profile
  const calculateRuntime = () => {
    // Current draw estimates
    let averageCurrentMilliAmps = 85; // continuous 25fps + Wi-Fi
    if (usageProfile === 'balanced') averageCurrentMilliAmps = 18; // auto-dim after 90s, intermittent wake
    if (usageProfile === 'sleep') averageCurrentMilliAmps = 0.45; // mostly deep sleep 10µA + 1min hourly sync

    const hours = batteryCapacityMilliampHours / averageCurrentMilliAmps;
    if (hours < 24) {
      return `${hours.toFixed(1)} hours`;
    }
    const days = hours / 24;
    return `${days.toFixed(1)} days (${Math.round(hours)}h)`;
  };

  const engineeringHighlights = [
    {
      title: 'Dual-Core FreeRTOS Engine',
      metric: '240 MHz',
      sub: 'Core 0: Wi-Fi & NTP · Core 1: 25fps OLED & LEDC Buzzer',
      icon: Cpu,
      color: '#38bdf8',
    },
    {
      title: 'Deep-Sleep RTC Wakeup',
      metric: '10 µA',
      sub: 'GPIO 4 Ext0 capacitive wake-up & pre-alarm interrupt',
      icon: BatteryCharging,
      color: '#4ade80',
    },
    {
      title: '15 Hand-Drawn Expressions',
      metric: '15 Moods',
      sub: 'Procedural eye spring physics, blinks & saccades',
      icon: Sparkles,
      color: '#facc15',
    },
    {
      title: 'Zero-Freeze Network Loop',
      metric: '100% Async',
      sub: 'Exponential backoff Wi-Fi reconnect prevents display lag',
      icon: Wifi,
      color: '#a78bfa',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5 font-sans">
      {/* Windows XP Welcome Center / System Information Banner */}
      <div className="bg-[#ffffff] border-2 border-[#7f9db9] rounded-lg shadow-md overflow-hidden">
        {/* Banner Header with Luna Gradient */}
        <div className="bg-gradient-to-r from-[#0058e6] via-[#2a80f0] to-[#5aa7ff] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 border border-white/40 flex items-center justify-center text-white font-bold shadow-inner">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                Welcome to Desk Buddy v2.0 for Windows XP
              </h2>
              <p className="text-[11px] text-blue-100 opacity-90 font-mono">
                Microsoft Windows XP Embedded Device · ESP32-S3 Super Mini Architecture
              </p>
            </div>
          </div>
          <span className="hidden sm:inline px-2.5 py-1 bg-white/15 border border-white/30 rounded text-[11px] font-mono font-bold">
            BUILD 2600.x86.HW2
          </span>
        </div>

        {/* Banner Body (Pure Light Theme) */}
        <div className="p-4 bg-gradient-to-b from-[#f7faff] to-[#edf3fc] text-[#222222] border-b border-[#d4d0c8]">
          <p className="text-xs text-[#334155] leading-relaxed max-w-4xl font-sans">
            Desk Buddy is an autonomous IoT desk companion & focus engine powered by the dual-core 240MHz ESP32-S3.
            It features 10 real-time OLED screen modes, 15 hand-drawn procedural facial expressions with spring physics,
            a capacitive touch gesture engine, a non-blocking FreeRTOS network loop, and an embedded web server portal.
          </p>

          {/* Action Commands */}
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={onNavigateToSimulator}
              className="xp-btn px-4 py-1.5 flex items-center gap-2 font-bold text-xs !bg-[#316ac5] !text-white !border-[#184896] hover:!bg-[#427cdb] shadow-sm"
            >
              <span>Launch Device Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onNavigateToCircuit}
              className="xp-btn px-4 py-1.5 flex items-center gap-2 font-bold text-xs"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-700" />
              <span>Open Circuit Schematic CAD</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Engineering Highlights Grid in Windows XP Light Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {engineeringHighlights.map((item) => (
          <div
            key={item.title}
            className="bg-[#ffffff] border border-[#7f9db9] p-3.5 rounded-lg flex flex-col justify-between shadow-sm hover:border-[#316ac5] transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div
                className="w-8 h-8 rounded border flex items-center justify-center shadow-xs"
                style={{
                  backgroundColor: `${item.color}20`,
                  borderColor: `${item.color}60`,
                  color: '#003399',
                }}
              >
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-[#003399] font-mono">{item.metric}</span>
            </div>

            <div>
              <div className="text-xs font-bold text-[#111827] mb-1">{item.title}</div>
              <div className="text-[11px] text-[#475569] leading-tight">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 2 SHOWCASE INTERACTIVE LIVE LABS (ANIMATED TOPOLOGY & EYE KINEMATICS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LAB 1: INTERACTIVE HARDWARE SIGNAL BUS TOPOLOGY (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-[#7f9db9] shadow-sm overflow-hidden flex flex-col">
          {/* XP Subheader */}
          <div className="bg-[#ece9d8] px-3 py-2 border-b border-[#d4d0c8] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-black font-sans">
              <Radio className="w-4 h-4 text-blue-700 animate-pulse" />
              <span>INTERACTIVE SIGNAL TOPOLOGY & PROTOCOL BUS</span>
            </div>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#b5b09e] text-gray-700">
              PACKETS: {packetCount}
            </span>
          </div>

          <div className="p-4 flex flex-col gap-4 flex-1">
            <p className="text-xs text-gray-600 font-sans">
              Click any peripheral bus to inject an active signal packet. Observe hardware routing and bus timings between the ESP32-S3 and onboard controllers.
            </p>

            {/* Interactive Vector Topology Canvas */}
            <div className="w-full aspect-[16/9] bg-[#f8fafc] rounded border border-[#cbd5e1] relative p-2 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 540 280" className="w-full h-full select-none">
                {/* Background bus lines */}
                {/* I2C Bus Line (Center to Top Right) */}
                <line
                  x1="270"
                  y1="140"
                  x2="440"
                  y2="70"
                  stroke={activeSignalBus === 'i2c' ? '#0284c7' : '#cbd5e1'}
                  strokeWidth={activeSignalBus === 'i2c' ? '3' : '1.5'}
                  strokeDasharray={activeSignalBus === 'i2c' ? '6 4' : 'none'}
                />

                {/* Touch Wake Line (Center to Top Left) */}
                <line
                  x1="270"
                  y1="140"
                  x2="100"
                  y2="70"
                  stroke={activeSignalBus === 'touch' ? '#059669' : '#cbd5e1'}
                  strokeWidth={activeSignalBus === 'touch' ? '3' : '1.5'}
                  strokeDasharray={activeSignalBus === 'touch' ? '6 4' : 'none'}
                />

                {/* Buzzer PWM Line (Center to Bottom Left) */}
                <line
                  x1="270"
                  y1="140"
                  x2="100"
                  y2="210"
                  stroke={activeSignalBus === 'buzzer' ? '#d97706' : '#cbd5e1'}
                  strokeWidth={activeSignalBus === 'buzzer' ? '3' : '1.5'}
                  strokeDasharray={activeSignalBus === 'buzzer' ? '6 4' : 'none'}
                />

                {/* Power 3.3V Line (Center to Bottom Right) */}
                <line
                  x1="270"
                  y1="140"
                  x2="440"
                  y2="210"
                  stroke={activeSignalBus === 'power' ? '#dc2626' : '#cbd5e1'}
                  strokeWidth={activeSignalBus === 'power' ? '3' : '1.5'}
                  strokeDasharray={activeSignalBus === 'power' ? '6 4' : 'none'}
                />

                {/* Animated Signal Packet */}
                {isBusPulsing && (
                  <circle
                    cx={
                      activeSignalBus === 'i2c'
                        ? 355
                        : activeSignalBus === 'touch'
                        ? 185
                        : activeSignalBus === 'buzzer'
                        ? 185
                        : 355
                    }
                    cy={
                      activeSignalBus === 'i2c'
                        ? 105
                        : activeSignalBus === 'touch'
                        ? 105
                        : activeSignalBus === 'buzzer'
                        ? 175
                        : 175
                    }
                    r="6"
                    fill={
                      activeSignalBus === 'i2c'
                        ? '#0284c7'
                        : activeSignalBus === 'touch'
                        ? '#059669'
                        : activeSignalBus === 'buzzer'
                        ? '#d97706'
                        : '#dc2626'
                    }
                    className="animate-ping"
                  />
                )}

                {/* Center Node: ESP32-S3 Host */}
                <g className="cursor-pointer" onClick={() => triggerBusPulse('i2c')}>
                  <rect
                    x="210"
                    y="100"
                    width="120"
                    height="80"
                    rx="8"
                    fill="#1e3a8a"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    className="shadow-sm"
                  />
                  <text x="270" y="132" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                    ESP32-S3
                  </text>
                  <text x="270" y="148" fill="#93c5fd" fontSize="8" textAnchor="middle" fontFamily="monospace">
                    240MHz · Dual Core
                  </text>
                  <text x="270" y="162" fill="#bfdbfe" fontSize="7" textAnchor="middle" fontFamily="monospace">
                    CORE 0 / CORE 1
                  </text>
                </g>

                {/* Node 1: SH1106 OLED (Top Right) */}
                <g className="cursor-pointer" onClick={() => triggerBusPulse('i2c')}>
                  <rect
                    x="390"
                    y="35"
                    width="110"
                    height="65"
                    rx="6"
                    fill={activeSignalBus === 'i2c' ? '#e0f2fe' : '#ffffff'}
                    stroke={activeSignalBus === 'i2c' ? '#0284c7' : '#94a3b8'}
                    strokeWidth="1.5"
                  />
                  <text x="445" y="60" fill="#0369a1" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    SH1106 OLED
                  </text>
                  <text x="445" y="74" fill="#64748b" fontSize="7.5" textAnchor="middle" fontFamily="monospace">
                    I2C @ 400kHz (G8/G9)
                  </text>
                  <text x="445" y="88" fill="#0284c7" fontSize="7" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
                    25 FPS Framebuffer
                  </text>
                </g>

                {/* Node 2: TTP223 Touch Pad (Top Left) */}
                <g className="cursor-pointer" onClick={() => triggerBusPulse('touch')}>
                  <rect
                    x="40"
                    y="35"
                    width="110"
                    height="65"
                    rx="6"
                    fill={activeSignalBus === 'touch' ? '#d1fae5' : '#ffffff'}
                    stroke={activeSignalBus === 'touch' ? '#059669' : '#94a3b8'}
                    strokeWidth="1.5"
                  />
                  <text x="95" y="60" fill="#065f46" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    TTP223 TOUCH
                  </text>
                  <text x="95" y="74" fill="#64748b" fontSize="7.5" textAnchor="middle" fontFamily="monospace">
                    GPIO 4 RTC Ext0
                  </text>
                  <text x="95" y="88" fill="#059669" fontSize="7" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
                    10µA Wake Interrupt
                  </text>
                </g>

                {/* Node 3: Passive Buzzer (Bottom Left) */}
                <g className="cursor-pointer" onClick={() => triggerBusPulse('buzzer')}>
                  <rect
                    x="40"
                    y="180"
                    width="110"
                    height="65"
                    rx="6"
                    fill={activeSignalBus === 'buzzer' ? '#fef3c7' : '#ffffff'}
                    stroke={activeSignalBus === 'buzzer' ? '#d97706' : '#94a3b8'}
                    strokeWidth="1.5"
                  />
                  <text x="95" y="205" fill="#92400e" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    PIEZO BUZZER
                  </text>
                  <text x="95" y="219" fill="#64748b" fontSize="7.5" textAnchor="middle" fontFamily="monospace">
                    GPIO 7 (LEDC PWM)
                  </text>
                  <text x="95" y="233" fill="#d97706" fontSize="7" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
                    2.4kHz Chime Timer
                  </text>
                </g>

                {/* Node 4: Power Rail (Bottom Right) */}
                <g className="cursor-pointer" onClick={() => triggerBusPulse('power')}>
                  <rect
                    x="390"
                    y="180"
                    width="110"
                    height="65"
                    rx="6"
                    fill={activeSignalBus === 'power' ? '#fee2e2' : '#ffffff'}
                    stroke={activeSignalBus === 'power' ? '#dc2626' : '#94a3b8'}
                    strokeWidth="1.5"
                  />
                  <text x="445" y="205" fill="#991b1b" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    3.3V LDO RAIL
                  </text>
                  <text x="445" y="219" fill="#64748b" fontSize="7.5" textAnchor="middle" fontFamily="monospace">
                    TP4056 + 150mAh LiPo
                  </text>
                  <text x="445" y="233" fill="#dc2626" fontSize="7" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
                    Low-Dropout &lt;80mV
                  </text>
                </g>
              </svg>
            </div>

            {/* Quick Pulse Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#e2e8f0]">
              <button
                onClick={() => triggerBusPulse('i2c')}
                className={`xp-btn px-2 py-1.5 text-xs flex items-center justify-center gap-1 font-semibold ${
                  activeSignalBus === 'i2c' ? '!border-[#0284c7] !bg-[#e0f2fe]' : ''
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                <span>Test I2C (400kHz)</span>
              </button>

              <button
                onClick={() => triggerBusPulse('touch')}
                className={`xp-btn px-2 py-1.5 text-xs flex items-center justify-center gap-1 font-semibold ${
                  activeSignalBus === 'touch' ? '!border-[#059669] !bg-[#d1fae5]' : ''
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <span>Test Touch (GPIO 4)</span>
              </button>

              <button
                onClick={() => triggerBusPulse('buzzer')}
                className={`xp-btn px-2 py-1.5 text-xs flex items-center justify-center gap-1 font-semibold ${
                  activeSignalBus === 'buzzer' ? '!border-[#d97706] !bg-[#fef3c7]' : ''
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#d97706]" />
                <span>Test PWM (GPIO 7)</span>
              </button>

              <button
                onClick={() => triggerBusPulse('power')}
                className={`xp-btn px-2 py-1.5 text-xs flex items-center justify-center gap-1 font-semibold ${
                  activeSignalBus === 'power' ? '!border-[#dc2626] !bg-[#fee2e2]' : ''
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
                <span>Test 3.3V Power</span>
              </button>
            </div>
          </div>
        </div>

        {/* LAB 2: INTERACTIVE EYE KINEMATICS & SACCADE TESTER (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-[#7f9db9] shadow-sm overflow-hidden flex flex-col">
          {/* XP Subheader */}
          <div className="bg-[#ece9d8] px-3 py-2 border-b border-[#d4d0c8] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-black font-sans">
              <Eye className="w-4 h-4 text-purple-700" />
              <span>LIVE KINEMATICS & SACCADES LAB</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
              25.2 FPS · 39ms
            </span>
          </div>

          <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
            <p className="text-xs text-gray-600 font-sans">
              Hover your cursor inside the OLED frame below. Procedural spring physics track saccades and eye micro-movements in real time.
            </p>

            {/* Interactive OLED Display Screen Simulation */}
            <div
              ref={eyeContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full aspect-[2/1] bg-[#020408] rounded-lg border-2 border-gray-600 p-4 relative flex flex-col items-center justify-center cursor-crosshair overflow-hidden shadow-inner group"
            >
              {/* Scanlines Effect */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #38bdf8 2px, #38bdf8 4px)',
                }}
              />

              {/* Status Header inside OLED */}
              <div className="absolute top-2 left-3 right-3 flex justify-between text-[9px] font-mono text-[#38bdf8]/70">
                <span>SH1106_128x64</span>
                <span>MOOD: {eyeMood.toUpperCase()}</span>
              </div>

              {/* Procedural Eyes */}
              <div className="flex items-center gap-10">
                {/* Left Eye */}
                <div
                  className={`w-12 h-14 bg-[#38bdf8] rounded-full flex items-center justify-center transition-all duration-75 relative shadow-[0_0_12px_rgba(56,189,248,0.7)] ${
                    isBlinking ? 'scale-y-0' : 'scale-y-100'
                  }`}
                  style={{
                    borderRadius: eyeMood === 'love' ? '20% 80% 20% 80%' : '50%',
                    transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                  }}
                >
                  {/* Pupil Highlight */}
                  <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-2 right-2.5 opacity-90" />
                </div>

                {/* Right Eye */}
                <div
                  className={`w-12 h-14 bg-[#38bdf8] rounded-full flex items-center justify-center transition-all duration-75 relative shadow-[0_0_12px_rgba(56,189,248,0.7)] ${
                    isBlinking || eyeMood === 'wink' ? 'scale-y-0' : 'scale-y-100'
                  }`}
                  style={{
                    borderRadius: eyeMood === 'love' ? '80% 20% 80% 20%' : '50%',
                    transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                  }}
                >
                  {/* Pupil Highlight */}
                  <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-2 right-2.5 opacity-90" />
                </div>
              </div>

              <div className="absolute bottom-1.5 text-[8px] font-mono text-gray-500">
                CURSOR TRACKING ACTIVE · SPRING DAMPING: 0.78
              </div>
            </div>

            {/* Expression Mode Selector Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#e2e8f0]">
              <button
                onClick={() => { setEyeMood('happy'); soundEngine.playTone(600, 0.05, 'sine'); }}
                className={`xp-btn px-2.5 py-1 text-xs font-semibold ${eyeMood === 'happy' ? '!bg-[#ffd880] !border-[#e59700]' : ''}`}
              >
                Happy
              </button>
              <button
                onClick={() => { setEyeMood('love'); soundEngine.playPetPurr(); }}
                className={`xp-btn px-2.5 py-1 text-xs font-semibold ${eyeMood === 'love' ? '!bg-[#ffd880] !border-[#e59700]' : ''}`}
              >
                ♥ Heart
              </button>
              <button
                onClick={() => { setEyeMood('wink'); soundEngine.playTone(750, 0.05, 'sine'); }}
                className={`xp-btn px-2.5 py-1 text-xs font-semibold ${eyeMood === 'wink' ? '!bg-[#ffd880] !border-[#e59700]' : ''}`}
              >
                Wink
              </button>
              <button
                onClick={() => { setEyeMood('shocked'); soundEngine.playTone(1200, 0.05, 'sine'); }}
                className={`xp-btn px-2.5 py-1 text-xs font-semibold ${eyeMood === 'shocked' ? '!bg-[#ffd880] !border-[#e59700]' : ''}`}
              >
                Surprised
              </button>
              <button
                onClick={() => { setEyeMood('sleepy'); soundEngine.playTone(350, 0.05, 'sine'); }}
                className={`xp-btn px-2.5 py-1 text-xs font-semibold ${eyeMood === 'sleepy' ? '!bg-[#ffd880] !border-[#e59700]' : ''}`}
              >
                Sleepy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2 SHOWCASE INTERACTIVE LIVE MODULES (BATTERY RUNTIME & GESTURE FSM) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* MODULE 1: INTERACTIVE BATTERY CAPACITY & RUNTIME CALCULATOR (6 COLS) */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-[#7f9db9] shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#ece9d8] px-3 py-2 border-b border-[#d4d0c8] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-black font-sans">
              <BatteryCharging className="w-4 h-4 text-emerald-700" />
              <span>POWER BUDGET & RUNTIME CALCULATOR</span>
            </div>
            <span className="text-[10px] font-mono text-gray-700">10µA DEEP SLEEP</span>
          </div>

          <div className="p-4 flex flex-col gap-4 flex-1 justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-700 font-bold">Battery LiPo Capacity:</span>
                <span className="text-sm font-bold font-mono text-blue-900">{batteryCapacityMilliampHours} mAh</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="25"
                value={batteryCapacityMilliampHours}
                onChange={(e) => setBatteryCapacityMilliampHours(Number(e.target.value))}
                className="w-full accent-[#0058e6] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                <span>50 mAh (Ultra-compact)</span>
                <span>150 mAh (Stock Spec)</span>
                <span>800 mAh (Extended)</span>
              </div>
            </div>

            {/* Profile Selection */}
            <div>
              <span className="text-xs text-gray-700 font-bold block mb-1.5">Duty Cycle Profile:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setUsageProfile('continuous')}
                  className={`p-2 rounded border text-left text-xs transition-colors ${
                    usageProfile === 'continuous'
                      ? 'bg-[#e0f2fe] border-[#0284c7] font-bold text-blue-950'
                      : 'bg-[#fafafa] border-[#cbd5e1] text-gray-700 hover:bg-[#f1f5f9]'
                  }`}
                >
                  <span className="block font-bold">Continuous</span>
                  <span className="text-[10px] text-gray-500">25fps always on</span>
                </button>

                <button
                  onClick={() => setUsageProfile('balanced')}
                  className={`p-2 rounded border text-left text-xs transition-colors ${
                    usageProfile === 'balanced'
                      ? 'bg-[#e0f2fe] border-[#0284c7] font-bold text-blue-950'
                      : 'bg-[#fafafa] border-[#cbd5e1] text-gray-700 hover:bg-[#f1f5f9]'
                  }`}
                >
                  <span className="block font-bold">Balanced</span>
                  <span className="text-[10px] text-gray-500">Auto-dim 90s</span>
                </button>

                <button
                  onClick={() => setUsageProfile('sleep')}
                  className={`p-2 rounded border text-left text-xs transition-colors ${
                    usageProfile === 'sleep'
                      ? 'bg-[#e0f2fe] border-[#0284c7] font-bold text-blue-950'
                      : 'bg-[#fafafa] border-[#cbd5e1] text-gray-700 hover:bg-[#f1f5f9]'
                  }`}
                >
                  <span className="block font-bold">Deep Sleep</span>
                  <span className="text-[10px] text-gray-500">Touch wake only</span>
                </button>
              </div>
            </div>

            {/* Calculated Result Output Box */}
            <div className="p-3 bg-gradient-to-r from-[#f0fdf4] to-[#dcfce7] rounded border border-[#86efac] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-800 uppercase tracking-wider block font-bold font-mono">
                  CALCULATED AUTONOMY RUNTIME
                </span>
                <span className="text-base font-bold text-emerald-950 font-mono">
                  {calculateRuntime()}
                </span>
              </div>
              <div className="text-right font-mono text-[11px] text-emerald-900">
                <span>Regulator: 3.3V LDO</span>
                <span className="block text-[10px] opacity-75">Cutoff: 3.2V</span>
              </div>
            </div>
          </div>
        </div>

        {/* MODULE 2: INTERACTIVE 5-GESTURE STATE MACHINE VISUALIZER (6 COLS) */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-[#7f9db9] shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#ece9d8] px-3 py-2 border-b border-[#d4d0c8] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-black font-sans">
              <Sliders className="w-4 h-4 text-amber-700" />
              <span>CAPACITIVE GESTURE FSM ENGINE</span>
            </div>
            <span className="text-[10px] font-mono text-gray-700">TTP223 · GPIO 4</span>
          </div>

          <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
            <p className="text-xs text-gray-600 font-sans">
              Click any gesture trigger below to visualize timer-debounced finite state transitions in firmware.
            </p>

            {/* Visual State Nodes */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className={`p-2 rounded border ${
                gestureState === 'IDLE' ? 'bg-[#dbeafe] border-[#2563eb] text-[#1e40af] font-bold shadow-xs' : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                <div className="text-[10px] text-gray-400">STATE 0</div>
                IDLE
              </div>

              <div className={`p-2 rounded border ${
                gestureState === 'DETECTED' ? 'bg-[#fef3c7] border-[#d97706] text-[#92400e] font-bold shadow-xs' : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                <div className="text-[10px] text-gray-400">STATE 1</div>
                TOUCH
              </div>

              <div className={`p-2 rounded border ${
                gestureState === 'EVALUATING' ? 'bg-[#fef3c7] border-[#d97706] text-[#92400e] font-bold shadow-xs' : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                <div className="text-[10px] text-gray-400">STATE 2</div>
                DEBOUNCE
              </div>

              <div className={`p-2 rounded border ${
                gestureState === 'DISPATCHED' ? 'bg-[#dcfce7] border-[#16a34a] text-[#166534] font-bold shadow-xs' : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                <div className="text-[10px] text-gray-400">STATE 3</div>
                DISPATCH
              </div>
            </div>

            {/* Gesture Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => simulateGesture('SINGLE_TAP')}
                className="xp-btn p-2 text-xs font-semibold flex flex-col items-center justify-center text-center"
              >
                <span className="font-bold text-blue-900">Single Tap</span>
                <span className="text-[10px] text-gray-500">&lt;280ms duration</span>
              </button>

              <button
                onClick={() => simulateGesture('DOUBLE_TAP')}
                className="xp-btn p-2 text-xs font-semibold flex flex-col items-center justify-center text-center"
              >
                <span className="font-bold text-blue-900">Double Tap</span>
                <span className="text-[10px] text-gray-500">2x within 400ms</span>
              </button>

              <button
                onClick={() => simulateGesture('HOLD_2S')}
                className="xp-btn p-2 text-xs font-semibold flex flex-col items-center justify-center text-center"
              >
                <span className="font-bold text-rose-700">Hold 2s</span>
                <span className="text-[10px] text-gray-500">Pet & Love</span>
              </button>

              <button
                onClick={() => simulateGesture('HOLD_5S')}
                className="xp-btn p-2 text-xs font-semibold flex flex-col items-center justify-center text-center"
              >
                <span className="font-bold text-amber-700">Hold 5s</span>
                <span className="text-[10px] text-gray-500">Settings Menu</span>
              </button>
            </div>

            {/* Last Dispatched State Output */}
            <div className="p-2.5 bg-[#f8fafc] rounded border border-[#cbd5e1] text-xs font-mono text-gray-800 flex items-center justify-between">
              <span>ACTIVE DISPATCH:</span>
              <span className="font-bold text-blue-800 truncate ml-2">{lastDispatchedGesture}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Windows XP Dialog Style Technical Architecture Tabs */}
      <div className="bg-[#ece9d8] text-black border border-[#7f9db9] rounded-lg shadow-xl overflow-hidden font-sans">
        {/* Dialog Header */}
        <div className="bg-gradient-to-r from-[#0058e6] to-[#3a93ff] text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Firmware Properties & Architecture Diagnostics</span>
          </div>
          <span className="text-[10px] font-mono opacity-80">WINXP_CONFIG.DLL</span>
        </div>

        {/* Windows XP Property Sheet Tabs */}
        <div className="bg-[#ece9d8] px-3 pt-2 border-b border-[#d4d0c8] flex flex-wrap gap-1">
          <button
            onClick={() => setActiveArchTab('rtos')}
            className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x ${
              activeArchTab === 'rtos'
                ? 'bg-[#ffffff] border-[#7f9db9] border-b-white -mb-px text-blue-900 font-bold'
                : 'bg-[#e4e0cd] border-[#b5b09e] text-[#555] hover:bg-[#eae7d6]'
            }`}
          >
            Non-Blocking FreeRTOS
          </button>
          <button
            onClick={() => setActiveArchTab('power')}
            className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x ${
              activeArchTab === 'power'
                ? 'bg-[#ffffff] border-[#7f9db9] border-b-white -mb-px text-blue-900 font-bold'
                : 'bg-[#e4e0cd] border-[#b5b09e] text-[#555] hover:bg-[#eae7d6]'
            }`}
          >
            Power Tiering (10µA)
          </button>
          <button
            onClick={() => setActiveArchTab('gestures')}
            className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x ${
              activeArchTab === 'gestures'
                ? 'bg-[#ffffff] border-[#7f9db9] border-b-white -mb-px text-blue-900 font-bold'
                : 'bg-[#e4e0cd] border-[#b5b09e] text-[#555] hover:bg-[#eae7d6]'
            }`}
          >
            5-Gesture FSM
          </button>
          <button
            onClick={() => setActiveArchTab('burnin')}
            className={`px-3 py-1 text-xs font-semibold rounded-t border-t border-x ${
              activeArchTab === 'burnin'
                ? 'bg-[#ffffff] border-[#7f9db9] border-b-white -mb-px text-blue-900 font-bold'
                : 'bg-[#e4e0cd] border-[#b5b09e] text-[#555] hover:bg-[#eae7d6]'
            }`}
          >
            OLED Burn-In Shield
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 bg-white min-h-[170px] text-xs leading-relaxed text-[#222]">
          {activeArchTab === 'rtos' && (
            <div className="flex flex-col gap-2 font-mono">
              <div className="font-bold text-blue-900 font-sans text-sm">
                Asynchronous Dual-Core FreeRTOS Loop Execution
              </div>
              <p className="text-gray-700">
                To prevent network stalls from freezing OLED screen animations (such as blinking or jumping characters),
                Wi-Fi HTTP client requests, NTP synchronizations, and OpenWeatherMap polling execute in the background with exponential backoff.
              </p>
              <div className="p-2.5 bg-[#f5f5f5] border border-[#ddd] rounded text-[11px] text-emerald-800">
                ✓ Core 0: Wi-Fi / HTTP / NTP tasks · Core 1: 25fps U8g2 full frame-buffer & LEDC buzzer PWM
              </div>
            </div>
          )}

          {activeArchTab === 'power' && (
            <div className="flex flex-col gap-2 font-mono">
              <div className="font-bold text-blue-900 font-sans text-sm">
                Tiered Inactivity Energy Harvesting (Active → Dimmed → Deep Sleep)
              </div>
              <p className="text-gray-700">
                Desk Buddy consumes ~85mA during active 25 fps rendering with Wi-Fi listening.
                After 90s idle, it transitions to Dimmed mode (OLED powered off, ~25mA).
                After 10m idle, it enters Deep Sleep mode consuming ~10µA, waking instantly on GPIO 4 capacitive touch or RTC alarm interrupts.
              </p>
              <div className="p-2.5 bg-[#f5f5f5] border border-[#ddd] rounded text-[11px] text-emerald-800">
                ✓ 150 mAh LiPo runtime: 3 hours continuous display, 8+ hours with auto-dim, 14+ days in deep sleep.
              </div>
            </div>
          )}

          {activeArchTab === 'gestures' && (
            <div className="flex flex-col gap-2 font-mono">
              <div className="font-bold text-blue-900 font-sans text-sm">
                Single-Pad 5-Gesture Finite State Machine
              </div>
              <p className="text-gray-700">
                Hardware timer-debounced finite state machine parsing capacitive touch duration on TTP223 (GPIO 4):
                Single tap (next screen / jump), Double tap (secondary action / stats), Hold 2s (pet / start focus),
                Triple tap (mute toggle), and Hold 5s (on-screen settings menu).
              </p>
              <div className="p-2.5 bg-[#f5f5f5] border border-[#ddd] rounded text-[11px] text-amber-800">
                ✓ Debounce window: 280ms · Hold confirmation beep: 1800Hz · Menu hold threshold: 5000ms.
              </div>
            </div>
          )}

          {activeArchTab === 'burnin' && (
            <div className="flex flex-col gap-2 font-mono">
              <div className="font-bold text-blue-900 font-sans text-sm">
                Procedural OLED Pixel Shift & Night Window
              </div>
              <p className="text-gray-700">
                Monochrome OLED displays suffer irreversible pixel wear if high-contrast clocks stay stationary.
                Every 60 seconds, Desk Buddy shifts its frame origin by ±1 to ±2 pixels randomly across X and Y axes,
                distributing phosphor wear and extending panel lifespan past 50,000 hours.
              </p>
              <div className="p-2.5 bg-[#f5f5f5] border border-[#ddd] rounded text-[11px] text-blue-800">
                ✓ Dynamic X/Y offset jitter · Night mode window (22:00 → 07:00) drops brightness to 25/255.
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer with Classic OK / Cancel / Apply Buttons */}
        <div className="bg-[#ece9d8] px-4 py-2 border-t border-[#d4d0c8] flex justify-end gap-2">
          <button onClick={onNavigateToSimulator} className="xp-btn px-4 py-1 font-semibold !border-[#0055ea] !font-bold">
            Launch Live Device
          </button>
          <button onClick={onNavigateToCircuit} className="xp-btn px-4 py-1 font-semibold">
            View Circuit Schematic
          </button>
        </div>
      </div>
    </div>
  );
};
