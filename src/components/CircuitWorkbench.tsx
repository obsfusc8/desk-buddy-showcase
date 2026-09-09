import React, { useState, useEffect } from 'react';
import { CIRCUIT_COMPONENTS, CIRCUIT_TRACES, BILL_OF_MATERIALS } from '../data/circuitData';
import { CircuitSignalTrace, CircuitComponent } from '../types';
import { Cpu, Zap, Activity, Info, Copy, Check, ShieldAlert, Sliders, Layers, Play, Radio, Volume2 } from 'lucide-react';
import { soundEngine } from '../services/soundEffects';

export const CircuitWorkbench: React.FC = () => {
  const [selectedTraceId, setSelectedTraceId] = useState<string>('i2c_sda');
  const [selectedComponentId, setSelectedComponentId] = useState<string>('mcu');
  const [activeTab, setActiveTab] = useState<'schematic' | 'oscilloscope' | 'pinmap' | 'bom'>('schematic');
  const [copiedCode, setCopiedCode] = useState(false);
  const [oscTime, setOscTime] = useState(0);
  const [isAutoSequenceRunning, setIsAutoSequenceRunning] = useState(false);
  const [autoSequenceStep, setAutoSequenceStep] = useState<number>(0);
  const [hoveredTestPoint, setHoveredTestPoint] = useState<string | null>(null);

  const runPowerOnSequence = () => {
    if (isAutoSequenceRunning) return;
    setIsAutoSequenceRunning(true);
    setAutoSequenceStep(1);
    setSelectedTraceId('pwr_3v3');
    soundEngine.playTone(400, 0.1, 'sine');

    setTimeout(() => {
      setAutoSequenceStep(2);
      setSelectedComponentId('mcu');
      soundEngine.playTone(600, 0.1, 'sine');

      setTimeout(() => {
        setAutoSequenceStep(3);
        setSelectedTraceId('i2c_scl');
        soundEngine.playTone(800, 0.08, 'sine');

        setTimeout(() => {
          setAutoSequenceStep(4);
          setSelectedTraceId('touch_wake');
          soundEngine.playTapClick();

          setTimeout(() => {
            setAutoSequenceStep(5);
            setSelectedTraceId('buzzer_pwm');
            soundEngine.playStartupJingle();

            setTimeout(() => {
              setIsAutoSequenceRunning(false);
              setAutoSequenceStep(0);
            }, 1800);
          }, 1200);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  // Animate oscilloscope waveform
  useEffect(() => {
    const interval = setInterval(() => {
      setOscTime((t) => (t + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const selectedTrace = CIRCUIT_TRACES.find((t) => t.id === selectedTraceId) || CIRCUIT_TRACES[0];
  const selectedComponent = CIRCUIT_COMPONENTS.find((c) => c.id === selectedComponentId) || CIRCUIT_COMPONENTS[0];

  const arduinoPinDefs = `// ==========================================
// DESK BUDDY v2.0 HARDWARE PIN DEFINITIONS
// DO NOT CHANGE: RTC wake & hardware I2C map
// ==========================================
#define PIN_OLED_SDA   8    // I2C Data (SH1106)
#define PIN_OLED_SCL   9    // I2C Clock @ 400kHz
#define PIN_TOUCH_OUT  4    // Active HIGH (RTC GPIO ext0 wake)
#define PIN_BUZZER_PWM 7    // LEDC PWM Passive Piezo Buzzer

// Peripheral configuration
#define I2C_FREQ_HZ    400000
#define BUZZER_LEDC_CH 0
#define BUZZER_TIMER_RES 8  // 8-bit resolution`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(arduinoPinDefs);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Generate waveform for oscilloscope based on selected trace
  const renderWaveform = () => {
    const points: string[] = [];
    const width = 360;
    const height = 110;
    const midY = height / 2;

    if (selectedTrace.signalType === 'I2C_CLOCK') {
      // 400kHz Square wave bursts
      for (let x = 0; x < width; x += 12) {
        const offset = (x + oscTime * 6) % 24;
        const y = offset < 12 ? 25 : 85;
        points.push(`${x},${y} ${x + 12},${y}`);
      }
    } else if (selectedTrace.signalType === 'I2C_DATA') {
      // Data packet bursts
      for (let x = 0; x < width; x += 16) {
        const pseudoRand = ((x + oscTime * 4) * 17) % 7;
        const y = pseudoRand > 3 ? 25 : 85;
        points.push(`${x},${y} ${x + 16},${y}`);
      }
    } else if (selectedTrace.signalType === 'PWM_AUDIO') {
      // Audio square wave (2.4 kHz)
      for (let x = 0; x < width; x += 10) {
        const offset = (x + oscTime * 8) % 20;
        const y = offset < 10 ? 20 : 90;
        points.push(`${x},${y} ${x + 10},${y}`);
      }
    } else if (selectedTrace.signalType === 'DIGITAL_INTERRUPT') {
      // Occasional digital pulse
      for (let x = 0; x < width; x += 30) {
        const isPulse = (x + oscTime * 3) % 180 < 30;
        const y = isPulse ? 25 : 85;
        points.push(`${x},${y} ${x + 30},${y}`);
      }
    } else if (selectedTrace.signalType === 'POWER_3V3' || selectedTrace.signalType === 'POWER_BATT') {
      // Smooth DC with minimal ripple
      for (let x = 0; x < width; x += 10) {
        const ripple = Math.sin((x + oscTime * 5) * 0.1) * 2;
        const y = 30 + ripple;
        points.push(`${x},${y}`);
      }
    } else {
      // Ground 0V
      for (let x = 0; x < width; x += 10) {
        points.push(`${x},90`);
      }
    }

    return points.join(' ');
  };

  return (
    <div className="w-full flex flex-col gap-4 font-mono">
      {/* Circuit Workbench Header in Windows XP CAD Suite Style */}
      <div className="bg-[#ece9d8] text-black border-2 border-[#7f9db9] rounded-lg shadow-xl overflow-hidden font-sans">
        <div className="bg-gradient-to-r from-[#0058e6] to-[#3a93ff] text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-200" />
            <span>DeskBuddy CAD Suite 2001 - [SCHEMATIC1 : ESP32_S3_CORE.SCH]</span>
          </div>
          <span className="text-[10px] font-mono opacity-80">DESIGN RULES CHECK: PASSED (0 ERRORS)</span>
        </div>

        {/* XP CAD Action Bar */}
        <div className="bg-[#e4e0cd] px-3 py-1.5 border-b border-[#b5b09e] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('schematic')}
              className={`xp-btn px-3 py-1 flex items-center gap-1.5 font-bold ${
                activeTab === 'schematic' ? '!border-[#e59700] !bg-[#ffd880]' : ''
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-700" />
              <span>Schematic Diagram</span>
            </button>

            <button
              onClick={() => setActiveTab('oscilloscope')}
              className={`xp-btn px-3 py-1 flex items-center gap-1.5 font-bold ${
                activeTab === 'oscilloscope' ? '!border-[#e59700] !bg-[#ffd880]' : ''
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span>DSO Logic Analyzer</span>
            </button>

            <button
              onClick={() => setActiveTab('pinmap')}
              className={`xp-btn px-3 py-1 flex items-center gap-1.5 font-bold ${
                activeTab === 'pinmap' ? '!border-[#e59700] !bg-[#ffd880]' : ''
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-700" />
              <span>Pin Netlist Rules</span>
            </button>

            <button
              onClick={() => setActiveTab('bom')}
              className={`xp-btn px-3 py-1 flex items-center gap-1.5 font-bold ${
                activeTab === 'bom' ? '!border-[#e59700] !bg-[#ffd880]' : ''
              }`}
            >
              <Info className="w-3.5 h-3.5 text-purple-700" />
              <span>Bill of Materials (BOM)</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-gray-700 flex items-center gap-3">
            <span>GRID: 2.54mm</span>
            <span>|</span>
            <span>BUS: I2C 400kHz</span>
          </div>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE SCHEMATIC & WIRING DIAGRAM */}
      {activeTab === 'schematic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Visual SVG Wiring Canvas */}
          <div className="lg:col-span-2 bg-[#ffffff] rounded-lg border border-[#7f9db9] p-4 flex flex-col relative overflow-hidden shadow-sm">
            {/* Top Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <div className="text-xs font-mono text-gray-700 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isAutoSequenceRunning ? 'bg-amber-500 animate-ping' : 'bg-emerald-600 animate-pulse'}`} />
                <span className="font-bold">CAD SCHEMATIC NETLIST · CLICK TRACE OR TEST POINT (TP)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={runPowerOnSequence}
                  disabled={isAutoSequenceRunning}
                  className={`xp-btn px-3 py-1 text-xs font-bold flex items-center gap-1.5 ${
                    isAutoSequenceRunning ? '!bg-[#ffd880] !border-[#e59700]' : '!bg-[#316ac5] !text-white !border-[#002f80]'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span>{isAutoSequenceRunning ? `BOOTING STEP ${autoSequenceStep}/5...` : 'Run Power-On Sequence'}</span>
                </button>
              </div>
            </div>

            {/* High-Precision Interactive Circuit Vector Canvas */}
            <div className="w-full aspect-[16/10] bg-[#fafafa] rounded border border-[#cbd5e1] p-2 relative flex items-center justify-center select-none overflow-hidden">
              {/* Subtle drafting grid pattern */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              <svg viewBox="0 0 800 480" className="w-full h-full">
                {/* WIRING TRACES */}
                {/* 1. I2C SDA Trace (GPIO 8 -> OLED SDA) */}
                <path
                  d="M 400 240 L 400 130 L 610 130 L 610 170"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth={selectedTraceId === 'i2c_sda' ? '4' : '2.5'}
                  strokeDasharray={selectedTraceId === 'i2c_sda' ? '8 4' : 'none'}
                  className="cursor-pointer transition-all duration-300 hover:stroke-blue-900"
                  onClick={() => setSelectedTraceId('i2c_sda')}
                />

                {/* 2. I2C SCL Trace (GPIO 9 -> OLED SCK) */}
                <path
                  d="M 400 260 L 420 260 L 420 150 L 590 150 L 590 170"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth={selectedTraceId === 'i2c_scl' ? '4' : '2.5'}
                  strokeDasharray={selectedTraceId === 'i2c_scl' ? '8 4' : 'none'}
                  className="cursor-pointer transition-all duration-300 hover:stroke-indigo-900"
                  onClick={() => setSelectedTraceId('i2c_scl')}
                />

                {/* 3. Touch Pad Interrupt (TTP223 OUT -> GPIO 4) */}
                <path
                  d="M 190 190 L 190 280 L 300 280"
                  fill="none"
                  stroke="#059669"
                  strokeWidth={selectedTraceId === 'touch_wake' ? '4' : '2.5'}
                  strokeDasharray={selectedTraceId === 'touch_wake' ? '8 4' : 'none'}
                  className="cursor-pointer transition-all duration-300 hover:stroke-emerald-900"
                  onClick={() => setSelectedTraceId('touch_wake')}
                />

                {/* 4. Buzzer PWM (GPIO 7 -> Piezo POS) */}
                <path
                  d="M 300 240 L 220 240 L 220 370 L 240 370"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth={selectedTraceId === 'buzzer_pwm' ? '4' : '2.5'}
                  strokeDasharray={selectedTraceId === 'buzzer_pwm' ? '8 4' : 'none'}
                  className="cursor-pointer transition-all duration-300 hover:stroke-amber-900"
                  onClick={() => setSelectedTraceId('buzzer_pwm')}
                />

                {/* 5. 3.3V Power Bus */}
                <path
                  d="M 350 190 L 350 90 L 550 90 L 550 170 M 350 90 L 150 90 L 150 170"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth={selectedTraceId === 'pwr_3v3' ? '4' : '2.5'}
                  className="cursor-pointer transition-all duration-300 hover:stroke-red-900"
                  onClick={() => setSelectedTraceId('pwr_3v3')}
                />

                {/* 6. Ground Return Bus */}
                <path
                  d="M 350 330 L 350 420 L 570 420 L 570 170 M 350 420 L 170 420 L 170 170 M 350 420 L 280 420 L 280 370"
                  fill="none"
                  stroke="#475569"
                  strokeWidth={selectedTraceId === 'gnd_plane' ? '4' : '2.5'}
                  className="cursor-pointer transition-all duration-300 hover:stroke-black"
                  onClick={() => setSelectedTraceId('gnd_plane')}
                />

                {/* ANIMATED SIGNAL FLOW PACKETS */}
                {selectedTraceId === 'i2c_sda' && (
                  <circle
                    cx={400 + ((oscTime * 4) % 210)}
                    cy={130}
                    r="4.5"
                    fill="#0284c7"
                    className="shadow-sm"
                  />
                )}
                {selectedTraceId === 'i2c_scl' && (
                  <circle
                    cx={420 + ((oscTime * 5) % 170)}
                    cy={150}
                    r="4.5"
                    fill="#6366f1"
                    className="shadow-sm"
                  />
                )}
                {selectedTraceId === 'touch_wake' && (
                  <circle
                    cx={190 + ((oscTime * 3) % 110)}
                    cy={280}
                    r="4.5"
                    fill="#059669"
                    className="shadow-sm"
                  />
                )}
                {selectedTraceId === 'buzzer_pwm' && (
                  <circle
                    cx={220 + ((oscTime * 4) % 20)}
                    cy={370}
                    r="4.5"
                    fill="#d97706"
                    className="shadow-sm"
                  />
                )}
                {selectedTraceId === 'pwr_3v3' && (
                  <circle
                    cx={350 + ((oscTime * 3) % 200)}
                    cy={90}
                    r="4.5"
                    fill="#dc2626"
                    className="shadow-sm"
                  />
                )}

                {/* TEST POINTS (TP1 - TP6) */}
                {/* TP1: 3.3V Power Test Point */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedTraceId('pwr_3v3')}
                  onMouseEnter={() => setHoveredTestPoint('TP1: +3.31V DC Regulated Bus')}
                  onMouseLeave={() => setHoveredTestPoint(null)}
                >
                  <circle cx="260" cy="90" r="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                  <circle cx="260" cy="90" r="3" fill="#ca8a04" />
                  <text x="260" y="78" fill="#a16207" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">TP1 (3V3)</text>
                </g>

                {/* TP2: I2C SDA Test Point */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedTraceId('i2c_sda')}
                  onMouseEnter={() => setHoveredTestPoint('TP2: I2C SDA Data Line @ 400kHz')}
                  onMouseLeave={() => setHoveredTestPoint(null)}
                >
                  <circle cx="510" cy="130" r="8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
                  <circle cx="510" cy="130" r="3" fill="#0284c7" />
                  <text x="510" y="118" fill="#0369a1" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">TP2 (SDA)</text>
                </g>

                {/* TP3: I2C SCL Test Point */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedTraceId('i2c_scl')}
                  onMouseEnter={() => setHoveredTestPoint('TP3: I2C SCL Clock Train @ 400kHz')}
                  onMouseLeave={() => setHoveredTestPoint(null)}
                >
                  <circle cx="480" cy="150" r="8" fill="#ede9fe" stroke="#6366f1" strokeWidth="1.5" />
                  <circle cx="480" cy="150" r="3" fill="#6366f1" />
                  <text x="480" y="172" fill="#4338ca" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">TP3 (SCL)</text>
                </g>

                {/* TP4: Touch Ext0 Test Point */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedTraceId('touch_wake')}
                  onMouseEnter={() => setHoveredTestPoint('TP4: TTP223 Active-High Touch Wake')}
                  onMouseLeave={() => setHoveredTestPoint(null)}
                >
                  <circle cx="240" cy="280" r="8" fill="#d1fae5" stroke="#059669" strokeWidth="1.5" />
                  <circle cx="240" cy="280" r="3" fill="#059669" />
                  <text x="240" y="270" fill="#047857" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">TP4 (EXT0)</text>
                </g>

                {/* TP5: Buzzer PWM Test Point */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedTraceId('buzzer_pwm')}
                  onMouseEnter={() => setHoveredTestPoint('TP5: Piezo LEDC 2.4kHz PWM Waveform')}
                  onMouseLeave={() => setHoveredTestPoint(null)}
                >
                  <circle cx="220" cy="300" r="8" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
                  <circle cx="220" cy="300" r="3" fill="#d97706" />
                  <text x="200" y="303" fill="#92400e" fontSize="7.5" fontWeight="bold" textAnchor="end" fontFamily="monospace">TP5 (PWM)</text>
                </g>

                {/* TP6: Ground Test Point */}
                <g
                  className="cursor-pointer"
                  onClick={() => setSelectedTraceId('gnd_plane')}
                  onMouseEnter={() => setHoveredTestPoint('TP6: 0.00V System Ground Reference')}
                  onMouseLeave={() => setHoveredTestPoint(null)}
                >
                  <circle cx="220" cy="420" r="8" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
                  <circle cx="220" cy="420" r="3" fill="#475569" />
                  <text x="220" y="440" fill="#334155" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">TP6 (GND)</text>
                </g>

                {/* COMPONENT MODULE BOXES */}
                {/* 1. ESP32-S3 Super Mini (Center MCU) */}
                <g
                  className="cursor-pointer transition-transform hover:opacity-95"
                  onClick={() => setSelectedComponentId('mcu')}
                >
                  <rect
                    x="300"
                    y="190"
                    width="100"
                    height="140"
                    rx="6"
                    fill="#f1f5f9"
                    stroke={selectedComponentId === 'mcu' ? '#0058e6' : '#64748b'}
                    strokeWidth={selectedComponentId === 'mcu' ? '3' : '1.5'}
                  />
                  <rect x="315" y="200" width="70" height="40" rx="3" fill="#e2e8f0" stroke="#94a3b8" />
                  <text x="350" y="222" fill="#0f172a" fontSize="9" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">ESP32-S3</text>
                  <text x="350" y="233" fill="#475569" fontSize="7" textAnchor="middle" fontFamily="monospace">SUPER MINI</text>

                  {/* Pin labels */}
                  <text x="306" y="244" fill="#b45309" fontSize="8" fontFamily="monospace" fontWeight="bold">G7 (PWM)</text>
                  <text x="306" y="284" fill="#047857" fontSize="8" fontFamily="monospace" fontWeight="bold">G4 (WAKE)</text>
                  <text x="394" y="244" fill="#0369a1" fontSize="8" textAnchor="end" fontFamily="monospace" fontWeight="bold">G8 (SDA)</text>
                  <text x="394" y="264" fill="#4338ca" fontSize="8" textAnchor="end" fontFamily="monospace" fontWeight="bold">G9 (SCL)</text>
                  <text x="350" y="204" fill="#b91c1c" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">3V3</text>
                  <text x="350" y="324" fill="#334155" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">GND</text>
                </g>

                {/* 2. SH1106 OLED Display (Top Right) */}
                <g
                  className="cursor-pointer transition-transform hover:opacity-95"
                  onClick={() => setSelectedComponentId('oled')}
                >
                  <rect
                    x="530"
                    y="160"
                    width="140"
                    height="100"
                    rx="6"
                    fill="#f8fafc"
                    stroke={selectedComponentId === 'oled' ? '#0058e6' : '#64748b'}
                    strokeWidth={selectedComponentId === 'oled' ? '3' : '1.5'}
                  />
                  <rect x="545" y="170" width="110" height="55" rx="4" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />
                  <text x="600" y="195" fill="#38bdf8" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">SH1106 128x64</text>
                  <text x="600" y="210" fill="#94a3b8" fontSize="7" textAnchor="middle" fontFamily="monospace">I2C @ 400kHz</text>

                  {/* Header Pins */}
                  <circle cx="550" cy="245" r="3" fill="#dc2626" />
                  <text x="550" y="254" fill="#dc2626" fontSize="6" textAnchor="middle" fontFamily="monospace">VCC</text>
                  <circle cx="570" cy="245" r="3" fill="#475569" />
                  <text x="570" y="254" fill="#475569" fontSize="6" textAnchor="middle" fontFamily="monospace">GND</text>
                  <circle cx="590" cy="245" r="3" fill="#4f46e5" />
                  <text x="590" y="254" fill="#4f46e5" fontSize="6" textAnchor="middle" fontFamily="monospace">SCL</text>
                  <circle cx="610" cy="245" r="3" fill="#0284c7" />
                  <text x="610" y="254" fill="#0284c7" fontSize="6" textAnchor="middle" fontFamily="monospace">SDA</text>
                </g>

                {/* 3. TTP223 Capacitive Touch Module (Top Left) */}
                <g
                  className="cursor-pointer transition-transform hover:opacity-95"
                  onClick={() => setSelectedComponentId('touch')}
                >
                  <rect
                    x="130"
                    y="150"
                    width="80"
                    height="70"
                    rx="6"
                    fill="#ecfdf5"
                    stroke={selectedComponentId === 'touch' ? '#0058e6' : '#10b981'}
                    strokeWidth={selectedComponentId === 'touch' ? '3' : '1.5'}
                  />
                  <circle cx="170" cy="180" r="14" fill="#d1fae5" stroke="#059669" strokeWidth="1.5" />
                  <text x="170" y="184" fill="#047857" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">PAD</text>
                  <text x="170" y="210" fill="#064e3b" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">TTP223</text>
                </g>

                {/* 4. Passive Piezo Buzzer (Bottom Left) */}
                <g
                  className="cursor-pointer transition-transform hover:opacity-95"
                  onClick={() => setSelectedComponentId('buzzer')}
                >
                  <circle
                    cx="260"
                    cy="370"
                    r="25"
                    fill="#fef3c7"
                    stroke={selectedComponentId === 'buzzer' ? '#0058e6' : '#f59e0b'}
                    strokeWidth={selectedComponentId === 'buzzer' ? '3' : '1.5'}
                  />
                  <circle cx="260" cy="370" r="8" fill="#fde68a" />
                  <text x="260" y="360" fill="#92400e" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">PIEZO</text>
                  <text x="260" y="388" fill="#78350f" fontSize="7" textAnchor="middle" fontFamily="monospace">LEDC</text>
                </g>

                {/* 5. 3.7V LiPo + Slide Switch (Bottom Right) */}
                <g
                  className="cursor-pointer transition-transform hover:opacity-95"
                  onClick={() => setSelectedComponentId('power')}
                >
                  <rect
                    x="480"
                    y="310"
                    width="120"
                    height="65"
                    rx="6"
                    fill="#f1f5f9"
                    stroke={selectedComponentId === 'power' ? '#0058e6' : '#64748b'}
                    strokeWidth={selectedComponentId === 'power' ? '3' : '1.5'}
                  />
                  <text x="540" y="332" fill="#059669" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">3.7V LiPo 150mAh</text>
                  <text x="540" y="346" fill="#475569" fontSize="7" textAnchor="middle" fontFamily="monospace">+ SLIDE SWITCH</text>
                  <rect x="495" y="353" width="30" height="10" rx="2" fill="#e2e8f0" stroke="#94a3b8" />
                  <text x="510" y="361" fill="#1e293b" fontSize="6" textAnchor="middle" fontFamily="monospace">ON/OFF</text>
                </g>

                {/* HIGH-END CAD DRAWING TITLE BLOCK (ALTIUM / KICAD STYLE) */}
                <g>
                  <rect x="520" y="405" width="270" height="65" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="520" y1="425" x2="790" y2="425" stroke="#94a3b8" strokeWidth="0.8" />
                  <line x1="520" y1="445" x2="790" y2="445" stroke="#94a3b8" strokeWidth="0.8" />
                  <line x1="680" y1="425" x2="680" y2="470" stroke="#94a3b8" strokeWidth="0.8" />
                  
                  <text x="525" y="418" fill="#0036a6" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                    TITLE: DESK BUDDY v2.0 - HARDWARE SCHEMATIC
                  </text>
                  <text x="525" y="438" fill="#334155" fontSize="7" fontFamily="monospace">
                    DWG: DB-SCH-2001-REV2.1
                  </text>
                  <text x="690" y="438" fill="#059669" fontSize="7" fontWeight="bold" fontFamily="monospace">
                    DRC: PASSED (0 ERR)
                  </text>
                  <text x="525" y="458" fill="#64748b" fontSize="6.5" fontFamily="monospace">
                    CORE: ESP32-S3 @ 240MHz
                  </text>
                  <text x="690" y="458" fill="#334155" fontSize="6.5" fontFamily="monospace">
                    SHEET: 1 OF 1
                  </text>
                </g>
              </svg>
            </div>

            {/* Test Point Probing Feedback Callout */}
            {hoveredTestPoint && (
              <div className="mt-2 p-1.5 bg-[#eff6ff] rounded border border-[#bfdbfe] text-xs font-mono text-[#1e40af] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-ping" />
                <span className="font-bold">PROBE OSCILLOGRAPH:</span>
                <span>{hoveredTestPoint}</span>
              </div>
            )}

            {/* Trace Selection Pills */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#d4d0c8]">
              <span className="text-xs font-mono text-gray-700 self-center mr-1">QUICK PROBE:</span>
              {CIRCUIT_TRACES.map((trace) => (
                <button
                  key={trace.id}
                  onClick={() => setSelectedTraceId(trace.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                    selectedTraceId === trace.id
                      ? 'bg-[#316ac5] text-white font-bold shadow-xs'
                      : 'bg-[#ece9d8] text-black hover:bg-[#d8d4c0] border border-[#7f9db9]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: trace.color }} />
                  <span>{trace.name.split(' (')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Electrical Telemetry & Signal Inspector */}
          <div className="flex flex-col gap-4">
            {/* Live Trace Telemetry Card */}
            <div className="bg-[#ffffff] rounded-lg border border-[#7f9db9] p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#d4d0c8] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-mono uppercase font-bold text-black">
                    SIGNAL INSPECTOR
                  </span>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{ backgroundColor: `${selectedTrace.color}20`, color: selectedTrace.color }}
                >
                  {selectedTrace.signalType}
                </span>
              </div>

              <h4 className="text-sm font-bold text-blue-900 mb-1">{selectedTrace.name}</h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">{selectedTrace.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#f8fafc] p-3 rounded border border-[#cbd5e1]">
                <div>
                  <span className="text-gray-500 text-[10px] block font-sans">VOLTAGE</span>
                  <span className="text-black font-semibold">{selectedTrace.voltage}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-sans">FREQUENCY</span>
                  <span className="text-blue-700 font-semibold">{selectedTrace.frequency}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-sans">SOURCE</span>
                  <span className="text-black">{selectedTrace.source}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-sans">DESTINATION</span>
                  <span className="text-black">{selectedTrace.destination}</span>
                </div>
              </div>
            </div>

            {/* Component Specs Card */}
            <div className="bg-[#ffffff] rounded-lg border border-[#7f9db9] p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#d4d0c8] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-mono uppercase font-bold text-black">
                    COMPONENT SPECIFICATION
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-500">Select module in diagram</span>
              </div>

              <h4 className="text-sm font-bold text-black">{selectedComponent.name}</h4>
              <span className="text-[11px] font-mono text-blue-700 block mb-2">{selectedComponent.partNumber}</span>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">{selectedComponent.description}</p>

              <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-[#d4d0c8]">
                <span className="text-gray-600">V-Range: <strong className="text-black">{selectedComponent.voltageRange}</strong></span>
                <span className="text-gray-600">Draw: <strong className="text-emerald-700">{selectedComponent.currentDraw.split('/')[0]}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VIRTUAL OSCILLOSCOPE / LOGIC PROBE */}
      {activeTab === 'oscilloscope' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-[#ffffff] rounded-lg border border-[#7f9db9] p-4 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-700 animate-pulse" />
                <span className="text-xs font-mono font-bold text-black uppercase">
                  VIRTUAL DSO-2024 · HARDWARE LOGIC ANALYZER
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-gray-600">Probe on: </span>
                <span className="px-2 py-0.5 rounded bg-[#316ac5] text-white font-bold">
                  {selectedTrace.pinNumber} ({selectedTrace.name.split(' (')[0]})
                </span>
              </div>
            </div>

            {/* Oscilloscope Grid Screen (Authentic Benchtop CRT Phosphor Display) */}
            <div className="relative w-full aspect-[2/1] bg-[#02180c] rounded border-2 border-[#336644] p-4 flex items-center justify-center overflow-hidden shadow-inner">
              {/* Reticle grid lines */}
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)`,
                  backgroundSize: '40px 30px',
                }}
              />

              {/* Live Waveform SVG */}
              <svg viewBox="0 0 360 110" className="w-full h-full relative z-10">
                <polyline
                  points={renderWaveform()}
                  fill="none"
                  stroke="#39ff14"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* On-screen telemetry watermark */}
              <div className="absolute top-2 left-3 text-[10px] font-mono text-[#4ade80]/70 flex gap-4 pointer-events-none">
                <span>CH1: 1.0V / DIV</span>
                <span>TIME: 2.5 µs / DIV</span>
                <span className="text-[#86efac]">TRIGGER: AUTO (RISE)</span>
              </div>
            </div>

            {/* Scope Control Knobs (Simulated) */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#d4d0c8] text-center font-mono text-xs">
              <div className="p-2 bg-[#f8fafc] rounded border border-[#cbd5e1]">
                <span className="text-[10px] text-gray-500 block">Vpp (PEAK)</span>
                <span className="text-black font-bold">{selectedTrace.voltage.split(' ')[0]}</span>
              </div>
              <div className="p-2 bg-[#f8fafc] rounded border border-[#cbd5e1]">
                <span className="text-[10px] text-gray-500 block">MEASURED FREQ</span>
                <span className="text-blue-700 font-bold">{selectedTrace.frequency}</span>
              </div>
              <div className="p-2 bg-[#f8fafc] rounded border border-[#cbd5e1]">
                <span className="text-[10px] text-gray-500 block">DUTY CYCLE</span>
                <span className="text-emerald-700 font-bold">{selectedTrace.dutyCycle || '50.0%'}</span>
              </div>
              <div className="p-2 bg-[#f8fafc] rounded border border-[#cbd5e1]">
                <span className="text-[10px] text-gray-500 block">COUPLING</span>
                <span className="text-black font-bold">DC 1MΩ</span>
              </div>
            </div>
          </div>

          {/* Right Column: Signal Selector */}
          <div className="bg-[#ffffff] rounded-lg border border-[#7f9db9] p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-mono font-bold text-black uppercase">
                  SELECT TEST PIN TO PROBE
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Connect the probe tip onto any signal trace in the ESP32-S3 circuit:
              </p>

              <div className="flex flex-col gap-1.5">
                {CIRCUIT_TRACES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTraceId(t.id)}
                    className={`w-full p-2 rounded text-left font-mono text-xs transition-all flex items-center justify-between border ${
                      selectedTraceId === t.id
                        ? 'bg-[#316ac5] text-white border-[#0055ea] font-bold shadow-xs'
                        : 'bg-[#fafafa] border-[#d4d0c8] text-black hover:bg-[#ece9d8]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <span>{t.pinNumber}</span>
                    </div>
                    <span className={`text-[10px] ${selectedTraceId === t.id ? 'text-blue-100' : 'text-gray-500'}`}>{t.frequency}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 rounded bg-[#fff8e7] border border-[#f5c66b] text-xs text-[#7c4a03]">
              <div className="flex items-center gap-1.5 text-[#9a5b00] font-bold mb-1 font-mono">
                <Zap className="w-3.5 h-3.5" />
                <span>HARDWARE NOTE</span>
              </div>
              I2C lines (GPIO 8 & 9) utilize ESP32-S3 internal 45kΩ pull-ups with external 4.7kΩ on the SH1106 breakout for crisp square transitions at 400kHz.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PIN MAP RULES & ARDUINO CODE */}
      {activeTab === 'pinmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Official Pin Map Table */}
          <div className="bg-[#ffffff] rounded-lg border border-[#7f9db9] p-4 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-[#d4d0c8] pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-mono font-bold text-black uppercase">
                  OFFICIAL PIN MAP (DO NOT CHANGE)
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-bold">Strict Rule</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-[#7f9db9] bg-[#ece9d8] text-gray-700">
                    <th className="py-1.5 px-2">SIGNAL</th>
                    <th className="py-1.5 px-2">GPIO</th>
                    <th className="py-1.5 px-2">FUNCTION / NOTES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  <tr className="hover:bg-blue-50">
                    <td className="py-2 px-2 font-bold text-blue-700">OLED SDA</td>
                    <td className="py-2 px-2 font-bold text-black">8</td>
                    <td className="py-2 px-2 text-gray-600">I²C data bus for SH1106 128×64 frame buffer</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="py-2 px-2 font-bold text-indigo-700">OLED SCL</td>
                    <td className="py-2 px-2 font-bold text-black">9</td>
                    <td className="py-2 px-2 text-gray-600">I²C clock @ 400 kHz Fast-Mode transfer</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="py-2 px-2 font-bold text-emerald-700">Touch OUT</td>
                    <td className="py-2 px-2 font-bold text-black">4</td>
                    <td className="py-2 px-2 text-gray-600">Active HIGH, RTC-capable → wakes from deep sleep</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="py-2 px-2 font-bold text-amber-700">Buzzer</td>
                    <td className="py-2 px-2 font-bold text-black">7</td>
                    <td className="py-2 px-2 text-gray-600">Passive piezo, PWM driven via hardware LEDC</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="py-2 px-2 font-bold text-red-700">VCC (+3.3V)</td>
                    <td className="py-2 px-2 font-bold text-black">3V3</td>
                    <td className="py-2 px-2 text-gray-600">Regulated logic rail from onboard low-dropout regulator</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="py-2 px-2 font-bold text-gray-600">GND</td>
                    <td className="py-2 px-2 font-bold text-black">GND</td>
                    <td className="py-2 px-2 text-gray-600">Common star ground plane</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 rounded bg-amber-50 border border-amber-300 text-xs text-amber-900 leading-relaxed">
              <strong>Why GPIO 4 for Touch?</strong> GPIO 4 is an RTC-capable pin on the ESP32-S3. This allows the system to enter deep sleep (drawing only 10µA) and wake up instantly when the capacitive pad is touched via <code>esp_sleep_enable_ext0_wakeup(GPIO_NUM_4, 1)</code>.
            </div>
          </div>

          {/* Right: Copyable Arduino C++ Header Code (Notepad Style) */}
          <div className="bg-[#ffffff] rounded-lg border border-[#7f9db9] p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#d4d0c8]">
                <span className="text-xs font-mono font-bold text-black uppercase">
                  C++ FIRMWARE PIN CONFIGURATION (Notepad)
                </span>
                <button
                  onClick={handleCopyCode}
                  className="xp-btn px-2.5 py-1 text-xs font-mono flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-700" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-3 bg-[#fdfdfd] border border-[#7f9db9] rounded text-xs font-mono text-black overflow-x-auto leading-relaxed shadow-inner">
                {arduinoPinDefs}
              </pre>
            </div>

            <div className="mt-3 text-xs text-gray-600">
              Matches section <strong>1. Overview · Pin map</strong> of the Desk Buddy v2.0 Owner's Manual. Ready to paste directly into <code>DeskBuddy20.ino</code>.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BILL OF MATERIALS (BOM) */}
      {activeTab === 'bom' && (
        <div className="bg-[#ffffff] rounded-lg border border-[#7f9db9] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-[#d4d0c8] pb-2">
            <div>
              <h4 className="text-sm font-bold text-black uppercase font-mono">
                DESK BUDDY v2.0 · HARDWARE BILL OF MATERIALS
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Complete verified component list for DIY builds and batch production.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-mono font-bold rounded">
              Est. Total Cost: ~$12.50 USD
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-[#7f9db9] bg-[#ece9d8] text-gray-700">
                  <th className="py-2 px-2.5">#</th>
                  <th className="py-2 px-2.5">COMPONENT</th>
                  <th className="py-2 px-2.5">QTY</th>
                  <th className="py-2 px-2.5">PACKAGE / FORM FACTOR</th>
                  <th className="py-2 px-2.5">PURPOSE & SUBSYSTEM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {BILL_OF_MATERIALS.map((b) => (
                  <tr key={b.item} className="hover:bg-blue-50 transition-colors">
                    <td className="py-2.5 px-2.5 text-gray-500">{b.item}</td>
                    <td className="py-2.5 px-2.5 font-bold text-black">{b.component}</td>
                    <td className="py-2.5 px-2.5 text-blue-700 font-bold">{b.qty}</td>
                    <td className="py-2.5 px-2.5 text-gray-700">{b.package}</td>
                    <td className="py-2.5 px-2.5 text-gray-600">{b.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
