import React, { useState } from 'react';
import { BookOpen, Search, Copy, Check, ChevronRight, Terminal, Shield, Zap } from 'lucide-react';

export const ManualDocs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sections = [
    {
      id: 'quickstart',
      title: '3. Quick Start',
      content:
        'Already flashed? Power on → hold the pad 5 seconds → WiFi setup AP → join DeskBuddy-Setup (password: buddy1234) → open 192.168.4.1 → fill in WiFi and your weather key → Save. Done.',
    },
    {
      id: 'gestures',
      title: '5. The Five Gestures',
      content:
        'Single tap: Next screen / Game jump\nDouble tap: Secondary action (12/24h toggle, weather refresh, pet stats)\nHold 2s: Primary action (pet the buddy, start/stop pomodoro)\nTriple tap: Mute / unmute all sound\nHold 5s: Open the on-screen settings menu',
    },
    {
      id: 'screens',
      title: '5. Screen Tour (10 Screens)',
      content:
        '1. Clock (big time, date, minute bar, next alarm)\n2. Weather (temp, feels-like, humidity bar, wind)\n3. Forecast (24h sparkline, umbrella alert)\n4. Face (your buddy with 15 expressions, idle animations)\n5. Pomodoro (circular focus ring, rounds counter)\n6. Stopwatch (centisecond resolution)\n7. Countdown (days, hours, minutes to event)\n8. Quote (16 motivational quotes)\n9. Game (Reaction test, Jump runner, Dice & coin)\n10. Diagnostics (IP, RSSI signal, uptime, free heap)',
    },
    {
      id: 'power',
      title: '8. Power and Battery Management',
      content:
        'Active: 25 fps, full brightness\nDimmed: after 90s idle (screen off, everything running)\nDeep sleep: after 10 min idle (~10µA, wakes on touch GPIO 4 or alarm)\nExpected runtime on 150 mAh cell: ~3h screen-on, 8+ hours with dimming, days if mostly sleeping.',
    },
    {
      id: 'timezones',
      title: '10. Timezone POSIX Cheat Sheet',
      content:
        'Dhaka: BDT-6\nDelhi / Kolkata: IST-5:30\nDubai: GST-4\nLondon: GMT0BST,M3.5.0/1,M10.5.0\nNew York: EST5EDT,M3.2.0,M11.1.0\nTokyo: JST-9\n(Note: POSIX sign is inverted compared to UTC offsets)',
    },
  ];

  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-4 font-mono">
      {/* Windows XP Notepad Window Frame */}
      <div className="bg-[#ece9d8] text-black border-2 border-[#0055ea] rounded-lg shadow-2xl overflow-hidden font-sans">
        <div className="bg-gradient-to-r from-[#0058e6] to-[#3a93ff] text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-200" />
            <span>MANUAL.TXT - Notepad (Desk Buddy v2.0 Setup Guide)</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="xp-control-btn w-4 h-4 flex items-center justify-center text-[9px] font-bold">_</button>
            <button className="xp-control-btn w-4 h-4 flex items-center justify-center text-[9px] font-bold">□</button>
            <button className="xp-close-btn w-4 h-4 flex items-center justify-center text-[9px] font-bold">✕</button>
          </div>
        </div>

        {/* Notepad Menu Bar */}
        <div className="bg-[#ece9d8] border-b border-[#d4d0c8] px-3 py-0.5 flex items-center justify-between text-xs text-black font-sans">
          <div className="flex items-center gap-4">
            <span className="hover:bg-[#316ac5] hover:text-white px-1 cursor-pointer">File</span>
            <span className="hover:bg-[#316ac5] hover:text-white px-1 cursor-pointer">Edit</span>
            <span className="hover:bg-[#316ac5] hover:text-white px-1 cursor-pointer">Format</span>
            <span className="hover:bg-[#316ac5] hover:text-white px-1 cursor-pointer">View</span>
            <span className="hover:bg-[#316ac5] hover:text-white px-1 cursor-pointer">Help</span>
          </div>

          {/* Quick Find */}
          <div className="relative w-48">
            <Search className="w-3 h-3 text-[#64748b] absolute left-2 top-1.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find in MANUAL.TXT..."
              className="w-full pl-6 pr-2 py-0.5 bg-white border border-[#7f9db9] rounded-sm text-xs text-black focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Notepad Main Document Area */}
      <div className="bg-white border border-[#7f9db9] rounded-b p-5 text-black shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#d4d0c8]">
          <div>
            <h3 className="text-sm font-bold text-black font-sans uppercase">
              Desk Buddy v2.0 Owner's Manual & Setup Guide
            </h3>
            <p className="text-xs text-gray-600 font-sans mt-0.5">
              Compiled documentation for firmware flashing, pin mapping, gestures, and REST APIs.
            </p>
          </div>
          <span className="text-xs font-mono text-gray-500 bg-[#ece9d8] px-2.5 py-1 rounded border border-[#d4d0c8]">
            Format: Plain Text / ANSI
          </span>
        </div>

        {/* Manual Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSections.map((sec) => (
            <div
              key={sec.id}
              className="bg-[#fafafa] p-4 rounded border border-[#7f9db9] flex flex-col justify-between shadow-xs hover:border-[#0055ea] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#e2e8f0]">
                  <h4 className="text-xs font-bold text-[#0055ea] font-mono flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-700" />
                    <span>{sec.title}</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(sec.content, sec.id)}
                    className="xp-btn px-2 py-0.5 text-xs text-gray-700 flex items-center gap-1"
                    title="Copy Section"
                  >
                    {copiedKey === sec.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-blue-700" />
                    )}
                    <span className="text-[10px]">{copiedKey === sec.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <pre className="text-xs text-gray-800 font-mono leading-relaxed whitespace-pre-wrap">
                  {sec.content}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Board & Partition Settings Box */}
        <div className="p-4 rounded bg-[#ece9d8] border border-[#7f9db9] text-xs font-mono text-black">
          <div className="flex items-center gap-2 text-black font-bold mb-2">
            <Zap className="w-4 h-4 text-blue-700" />
            <span>ARDUINO IDE FLASH COMPILER SETTINGS</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded border border-[#d4d0c8]">
            <div>
              <span className="text-[10px] text-gray-500 block">BOARD TARGET</span>
              <span className="text-blue-800 font-bold">ESP32S3 Dev Module</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">USB CDC ON BOOT</span>
              <span className="text-emerald-700 font-bold">Enabled</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">FLASH SIZE</span>
              <span className="text-black font-bold">4 MB (Quad SPI)</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">PARTITION SCHEME</span>
              <span className="text-amber-800 font-bold">Default 4MB with SPIFFS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
