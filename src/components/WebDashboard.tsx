import React, { useState } from 'react';
import { DeviceSettings, PetStats, ExpressionId } from '../types';
import { EXPRESSIONS } from '../data/expressions';
import { soundEngine } from '../services/soundEffects';
import {
  Globe,
  Wifi,
  CloudSun,
  Clock,
  Heart,
  MessageSquare,
  Send,
  Terminal,
  Play,
  RotateCcw,
  Volume2,
  Check,
  Copy,
  Utensils,
  Sparkles,
} from 'lucide-react';

interface WebDashboardProps {
  settings: DeviceSettings;
  onUpdateSettings: (newSettings: Partial<DeviceSettings>) => void;
  petStats: PetStats;
  onFeedPet: () => void;
  onTriggerMood: (moodId: ExpressionId) => void;
  onSendMessage: (msg: string) => void;
  onTogglePomodoro: () => void;
  onResetPomodoro: () => void;
  isPomodoroRunning: boolean;
}

export const WebDashboard: React.FC<WebDashboardProps> = ({
  settings,
  onUpdateSettings,
  petStats,
  onFeedPet,
  onTriggerMood,
  onSendMessage,
  onTogglePomodoro,
  onResetPomodoro,
  isPomodoroRunning,
}) => {
  const [activeTab, setActiveTab] = useState<'remote' | 'settings' | 'api'>('remote');
  const [customMsg, setCustomMsg] = useState('');
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local form state
  const [formSettings, setFormSettings] = useState<DeviceSettings>(settings);

  const handleFormChange = (key: keyof DeviceSettings, value: any) => {
    setFormSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
    soundEngine.playGestureConfirm();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSendCustomMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    onSendMessage(customMsg.trim());
    soundEngine.playTone(1200, 0.08, 'square');
    setCustomMsg('');
  };

  const apiStateJson = JSON.stringify(
    {
      device: 'DeskBuddy v2.0',
      firmware: 'DeskBuddy20.ino',
      uptime_seconds: 52084,
      free_heap: 214520,
      wifi: {
        connected: true,
        ssid: 'HomeNet_5G',
        ip: '192.168.1.108',
        rssi: -58,
      },
      pet: {
        mode_enabled: settings.petMode,
        fullness: petStats.fullness,
        energy: petStats.energy,
        affection: petStats.affection,
        lifetime_pets: petStats.lifetimePets,
        lifetime_feeds: petStats.lifetimeFeeds,
        lifetime_pomodoros: petStats.lifetimePomodoros,
      },
      display: {
        brightness: settings.brightness,
        night_mode: false,
        is_24h: settings.is24h,
      },
      pomodoro: {
        running: isPomodoroRunning,
        work_min: 25,
        break_min: 5,
      },
    },
    null,
    2
  );

  return (
    <div className="w-full bg-[#ece9d8] rounded-lg border-2 border-[#0055ea] shadow-2xl flex flex-col overflow-hidden text-black font-sans">
      {/* Internet Explorer 6 Title Bar */}
      <div className="bg-gradient-to-r from-[#0058e6] to-[#3a93ff] text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 border border-white flex items-center justify-center text-[10px] font-bold italic">
            e
          </div>
          <span>Desk Buddy v2.0 Web Portal - Microsoft Internet Explorer</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="xp-control-btn w-4 h-4 flex items-center justify-center text-[9px] font-bold">_</button>
          <button className="xp-control-btn w-4 h-4 flex items-center justify-center text-[9px] font-bold">□</button>
          <button className="xp-close-btn w-4 h-4 flex items-center justify-center text-[9px] font-bold">✕</button>
        </div>
      </div>

      {/* IE6 Menu Bar */}
      <div className="bg-[#ece9d8] border-b border-[#d4d0c8] px-3 py-0.5 flex items-center gap-4 text-xs text-black font-sans">
        <span className="hover:bg-[#316ac5] hover:text-white px-1 cursor-pointer">File</span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1 cursor-pointer">Edit</span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1 cursor-pointer">View</span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1 cursor-pointer">Favorites</span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1 cursor-pointer">Tools</span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1 cursor-pointer">Help</span>
      </div>

      {/* IE6 Standard Buttons Toolbar */}
      <div className="bg-[#e4e0cd] px-3 py-1 border-b border-[#b5b09e] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <button className="xp-btn px-2 py-0.5 flex items-center gap-1">← Back</button>
          <button className="xp-btn px-2 py-0.5 flex items-center gap-1" disabled>Forward →</button>
          <button className="xp-btn px-2 py-0.5">✕ Stop</button>
          <button className="xp-btn px-2 py-0.5">⟳ Refresh</button>
          <button className="xp-btn px-2 py-0.5">⌂ Home</button>
        </div>

        {/* Windows XP IE Throbber Logo */}
        <div className="w-6 h-6 bg-[#0055ea] rounded border border-white flex items-center justify-center text-white font-bold text-xs italic shadow-inner">
          e
        </div>
      </div>

      {/* IE6 Address Bar */}
      <div className="bg-[#ece9d8] px-3 py-1.5 border-b border-[#b5b09e] flex items-center gap-2 text-xs">
        <span className="text-gray-600 font-semibold">Address</span>
        <div className="flex-1 bg-white border border-[#7f9db9] rounded-sm px-2 py-1 flex items-center gap-2 font-mono text-xs">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-bold text-black">http://deskbuddy.local/</span>
          <span className="text-gray-400 text-[11px]">(192.168.1.108:80)</span>
        </div>
        <button className="xp-btn px-3 py-1 font-bold text-xs flex items-center gap-1">
          <span className="text-emerald-700">➔</span> Go
        </button>
      </div>

      {/* Web Page Content Container (Authentic Windows XP Web Layout) */}
      <div className="bg-[#f0f0f0] p-5 text-black flex flex-col gap-5 border-t border-[#b5b09e]">
        {/* Portal Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#7f9db9] pb-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('remote')}
              className={`px-3 py-1.5 rounded-t text-xs font-semibold font-mono border-t border-x transition-all ${
                activeTab === 'remote'
                  ? 'bg-white border-[#7f9db9] border-b-white text-[#0055ea] font-bold shadow-xs'
                  : 'bg-[#ece9d8] border-[#d4d0c8] text-gray-700 hover:bg-[#fafafa]'
              }`}
            >
              [1] Quick Remote
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-t text-xs font-semibold font-mono border-t border-x transition-all ${
                activeTab === 'settings'
                  ? 'bg-white border-[#7f9db9] border-b-white text-[#0055ea] font-bold shadow-xs'
                  : 'bg-[#ece9d8] border-[#d4d0c8] text-gray-700 hover:bg-[#fafafa]'
              }`}
            >
              [2] All Settings
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 rounded-t text-xs font-semibold font-mono border-t border-x transition-all ${
                activeTab === 'api'
                  ? 'bg-white border-[#7f9db9] border-b-white text-[#0055ea] font-bold shadow-xs'
                  : 'bg-[#ece9d8] border-[#d4d0c8] text-gray-700 hover:bg-[#fafafa]'
              }`}
            >
              [3] JSON REST API
            </button>
          </div>

          <span className="text-xs font-mono text-blue-800 font-bold hidden sm:block">
            ESP32 ASYNCHRONOUS WEBSERVER · PORT 80
          </span>
        </div>

        {/* TAB 1: QUICK REMOTE ACTIONS & PET CARE */}
        {activeTab === 'remote' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Push Text Message to Screen */}
            <div className="flex flex-col gap-4">
              <div className="bg-white p-4 rounded border border-[#7f9db9] shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-black text-xs font-bold font-mono">
                  <MessageSquare className="w-4 h-4 text-blue-700" />
                  <span>SAY SOMETHING (PUSH MESSAGE TO SCREEN)</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Send a custom text from your phone directly to the Desk Buddy OLED screen:
                </p>
                <form onSubmit={handleSendCustomMsg} className="flex gap-2">
                  <input
                    type="text"
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    placeholder="e.g. Focus time! or Drink water!"
                    maxLength={40}
                    className="flex-1 px-3 py-1.5 bg-white border border-[#7f9db9] rounded-sm text-xs text-black placeholder-gray-400 focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    className="xp-btn px-4 py-1.5 font-bold text-xs flex items-center gap-1.5 text-black"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-700" />
                    <span>Send</span>
                  </button>
                </form>
              </div>

              {/* Virtual Pet Feeding & Stats */}
              <div className="bg-white p-4 rounded border border-[#7f9db9] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-black text-xs font-bold font-mono">
                    <Utensils className="w-4 h-4 text-emerald-700" />
                    <span>VIRTUAL PET CARE STATION</span>
                  </div>
                  <button
                    onClick={() => {
                      onFeedPet();
                      soundEngine.playPetPurr();
                    }}
                    className="xp-btn px-3 py-1 text-emerald-800 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Feed Pet (+25%)</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs font-mono text-center">
                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#cbd5e1]">
                    <span className="text-gray-500 text-[10px] block">FULLNESS</span>
                    <span className="text-base font-bold text-emerald-700">{petStats.fullness}%</span>
                    <div className="w-full bg-[#cbd5e1] h-1.5 rounded mt-1 overflow-hidden">
                      <div className="bg-emerald-600 h-full" style={{ width: `${petStats.fullness}%` }} />
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#cbd5e1]">
                    <span className="text-gray-500 text-[10px] block">ENERGY</span>
                    <span className="text-base font-bold text-amber-600">{petStats.energy}%</span>
                    <div className="w-full bg-[#cbd5e1] h-1.5 rounded mt-1 overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${petStats.energy}%` }} />
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#f8fafc] rounded border border-[#cbd5e1]">
                    <span className="text-gray-500 text-[10px] block">AFFECTION</span>
                    <span className="text-base font-bold text-rose-600">{petStats.affection}%</span>
                    <div className="w-full bg-[#cbd5e1] h-1.5 rounded mt-1 overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${petStats.affection}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pomodoro Remote Control */}
              <div className="bg-white p-4 rounded border border-[#7f9db9] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-black block">FOCUS POMODORO REMOTE</span>
                  <span className="text-[11px] text-gray-600">Status: {isPomodoroRunning ? 'Running' : 'Paused'}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onTogglePomodoro();
                      soundEngine.playGestureConfirm();
                    }}
                    className={`xp-btn px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 ${
                      isPomodoroRunning ? 'text-amber-800' : 'text-blue-800'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isPomodoroRunning ? 'Pause' : 'Start'}</span>
                  </button>
                  <button
                    onClick={() => {
                      onResetPomodoro();
                      soundEngine.playTone(900, 0.05, 'square');
                    }}
                    className="xp-btn px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Remote Mood Trigger Grid (/mood?m=...) */}
            <div className="bg-white p-4 rounded border border-[#7f9db9] shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-black text-xs font-bold font-mono">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  <span>REMOTE EXPRESSION TRIGGER (/mood?m=ID)</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500">15 Expressions</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Trigger any of the 15 hand-drawn expressions instantly over the HTTP API:
              </p>

              <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[290px] pr-1">
                {(Object.keys(EXPRESSIONS) as unknown as ExpressionId[]).map((id) => {
                  const expr = EXPRESSIONS[id];
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        onTriggerMood(id);
                        soundEngine.playTone(500 + id * 80, 0.05, 'triangle');
                      }}
                      className="p-2 bg-[#f8fafc] hover:bg-blue-50 border border-[#cbd5e1] hover:border-[#316ac5] rounded text-left transition-all group"
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[10px] font-mono text-gray-500">ID {id}</span>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: expr.color }} />
                      </div>
                      <span className="text-xs font-bold text-gray-800 group-hover:text-blue-700 block truncate">
                        {expr.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPLETE SETTINGS FORM */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Section: WiFi & Network */}
            <div className="bg-white p-4 rounded border border-[#7f9db9] shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 text-black text-xs font-bold font-mono border-b border-[#d4d0c8] pb-2">
                <Wifi className="w-4 h-4 text-blue-700" />
                <span>WI-FI NETWORK CREDENTIALS</span>
              </div>
              <div>
                <label className="text-xs text-gray-700 block mb-1">Wi-Fi SSID</label>
                <input
                  type="text"
                  defaultValue="HomeNet_5G"
                  className="w-full px-3 py-1.5 bg-white border border-[#7f9db9] rounded-sm text-xs text-black font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-gray-700 block mb-1">Wi-Fi Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full px-3 py-1.5 bg-white border border-[#7f9db9] rounded-sm text-xs text-black font-mono"
                />
              </div>
            </div>

            {/* Section: Weather & Time */}
            <div className="bg-white p-4 rounded border border-[#7f9db9] shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 text-black text-xs font-bold font-mono border-b border-[#d4d0c8] pb-2">
                <CloudSun className="w-4 h-4 text-amber-600" />
                <span>WEATHER & TIMEZONE</span>
              </div>
              <div>
                <label className="text-xs text-gray-700 block mb-1">OpenWeatherMap API Key</label>
                <input
                  type="text"
                  value={formSettings.apiKey}
                  onChange={(e) => handleFormChange('apiKey', e.target.value)}
                  placeholder="Paste key from openweathermap.org"
                  className="w-full px-3 py-1.5 bg-white border border-[#7f9db9] rounded-sm text-xs text-black font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-700 block mb-1">City Name</label>
                  <input
                    type="text"
                    value={formSettings.cityName}
                    onChange={(e) => handleFormChange('cityName', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#7f9db9] rounded-sm text-xs text-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-700 block mb-1">POSIX Timezone</label>
                  <input
                    type="text"
                    value={formSettings.timeZone}
                    onChange={(e) => handleFormChange('timeZone', e.target.value)}
                    placeholder="e.g. BDT-6 or EST5EDT"
                    className="w-full px-3 py-1.5 bg-white border border-[#7f9db9] rounded-sm text-xs text-black font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section: Display & Sound Preferences */}
            <div className="bg-white p-4 rounded border border-[#7f9db9] shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 text-black text-xs font-bold font-mono border-b border-[#d4d0c8] pb-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>DISPLAY & CLOCK FORMAT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-800">24-Hour Clock Format</span>
                <input
                  type="checkbox"
                  checked={formSettings.is24h}
                  onChange={(e) => handleFormChange('is24h', e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-800">Hourly Chime (Counts hours)</span>
                <input
                  type="checkbox"
                  checked={formSettings.hourlyChime}
                  onChange={(e) => handleFormChange('hourlyChime', e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-800 mb-1">
                  <span>OLED Brightness</span>
                  <span className="font-mono text-blue-700 font-bold">{formSettings.brightness}/255</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="255"
                  value={formSettings.brightness}
                  onChange={(e) => handleFormChange('brightness', parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            {/* Section: Target Countdown Event */}
            <div className="bg-white p-4 rounded border border-[#7f9db9] shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 text-black text-xs font-bold font-mono border-b border-[#d4d0c8] pb-2">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>TARGET COUNTDOWN EVENT</span>
              </div>
              <div>
                <label className="text-xs text-gray-700 block mb-1">Event Name</label>
                <input
                  type="text"
                  value={formSettings.eventName}
                  onChange={(e) => handleFormChange('eventName', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#7f9db9] rounded-sm text-xs text-black"
                />
              </div>
              <div>
                <label className="text-xs text-gray-700 block mb-1">Target Date</label>
                <input
                  type="date"
                  value={formSettings.eventDate}
                  onChange={(e) => handleFormChange('eventDate', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#7f9db9] rounded-sm text-xs text-black font-mono"
                />
              </div>
            </div>

            {/* Save & Apply Button */}
            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              {saveSuccess && (
                <span className="text-xs font-mono text-emerald-700 flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5" /> Saved to ESP32 NVS Flash!
                </span>
              )}
              <button
                type="submit"
                className="xp-btn px-6 py-2 text-black font-bold text-xs flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Save & Apply Settings</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: REST API & CURL EXAMPLES */}
        {activeTab === 'api' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="flex flex-col gap-4">
              <div className="bg-white p-4 rounded border border-[#7f9db9] shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-black text-xs font-bold font-mono">
                    <Terminal className="w-4 h-4 text-blue-700" />
                    <span>REST API ENDPOINT: GET /api/state</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                    HTTP 200 OK
                  </span>
                </div>
                <pre className="p-3 bg-[#fdfdfd] rounded border border-[#7f9db9] text-[11px] font-mono text-black overflow-x-auto max-h-[300px] shadow-inner">
                  {apiStateJson}
                </pre>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white p-4 rounded border border-[#7f9db9] shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-black">CLI / TERMINAL CURL EXAMPLES</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('curl "http://deskbuddy.local/mood?m=4"');
                      setCopiedCurl(true);
                      setTimeout(() => setCopiedCurl(false), 2000);
                    }}
                    className="xp-btn px-2 py-0.5 text-xs font-mono flex items-center gap-1"
                  >
                    {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-blue-700" />}
                    <span>{copiedCurl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 font-mono text-xs text-gray-800">
                  <div className="p-2 bg-[#f8fafc] rounded border border-[#cbd5e1]">
                    <span className="text-gray-500 text-[10px] block">Make Buddy Wink (ID 4):</span>
                    <code className="text-blue-800 font-bold">curl "http://deskbuddy.local/mood?m=4"</code>
                  </div>
                  <div className="p-2 bg-[#f8fafc] rounded border border-[#cbd5e1]">
                    <span className="text-gray-500 text-[10px] block">Push Message to Screen:</span>
                    <code className="text-blue-800 font-bold">curl -X POST "http://deskbuddy.local/msg?t=Hello"</code>
                  </div>
                  <div className="p-2 bg-[#f8fafc] rounded border border-[#cbd5e1]">
                    <span className="text-gray-500 text-[10px] block">Feed Virtual Pet:</span>
                    <code className="text-blue-800 font-bold">curl "http://deskbuddy.local/feed"</code>
                  </div>
                  <div className="p-2 bg-[#f8fafc] rounded border border-[#cbd5e1]">
                    <span className="text-gray-500 text-[10px] block">Start Pomodoro Session:</span>
                    <code className="text-blue-800 font-bold">curl "http://deskbuddy.local/pomodoro?do=start"</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
