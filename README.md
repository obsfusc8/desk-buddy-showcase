# Desk Buddy v2.0 🤖

> **Autonomous IoT Desk Companion, Focus Engine & Hardware Workbench powered by ESP32-S3 Dual-Core & Windows XP Web Diagnostics.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Microcontroller: ESP32--S3](https://img.shields.io/badge/MCU-ESP32--S3%20240MHz-red.svg)](https://www.espressif.com/en/products/socs/esp32-s3)
[![Display: SH1106 OLED](https://img.shields.io/badge/Display-1.3%22%20SH1106%20128x64-black.svg)](https://github.com/olikraus/u8g2)
[![Frontend: React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61dafb.svg)](https://react.dev)
[![Build Tool: Vite](https://img.shields.io/badge/Bundler-Vite%206-646cff.svg)](https://vitejs.dev)
[![UI: Windows XP Luna](https://img.shields.io/badge/Theme-Windows%20XP%20Luna-0058e6.svg)](https://microsoft.com)

---

## 🌟 Overview

**Desk Buddy v2.0** is an open-source autonomous IoT desktop companion, Tamagotchi-inspired pet, and productivity station. It combines an ultra-compact **ESP32-S3 Super Mini** hardware controller with an interactive **Windows XP Luna Web Workbench & Simulator**.

### Key Highlights

- **Dual-Core FreeRTOS Engine**: Core 0 handles Wi-Fi, NTP sync, and OpenWeatherMap background polling without blocking Core 1's 25 FPS U8g2 rendering and LEDC buzzer chime synthesizer.
- **15 Hand-Drawn Procedural Facial Expressions**: Organic eye kinematics with dynamic micro-saccades, blinks, and physics damping.
- **10 Autonomous OLED Screen Modes**:
  1. Big Digital Clock (12/24H format, date, minute elapsed bar)
  2. Live Weather Station (temp, feels-like, humidity, wind)
  3. 24h Forecast Sparkline & Umbrella Alert
  4. Animated Expressive Buddy Face
  5. Pomodoro Focus Timer (circular progress ring, break intervals)
  6. Precision Stopwatch (centisecond resolution)
  7. Event Countdown Timer (days, hours, minutes)
  8. Motivation Engine (16 rotating quotes)
  9. Dino Runner Jump Game & Dice Roller
  10. Hardware System Diagnostics (IP, RSSI, free heap, battery voltage)
- **5-Gesture Capacitive Touch FSM**: Single TTP223 capacitive sensor pad (GPIO 4) parses Single Tap, Double Tap, Hold 2s (Pet/Focus), Triple Tap (Mute), and Hold 5s (Settings Menu).
- **Inactivity Power Tiering**: Active 85mA &rarr; Dimmed 25mA after 90s &rarr; Deep Sleep 10µA after 10m with instant RTC Ext0 capacitive touch wake-up.
- **Circuit Schematic CAD Workbench**: Interactive vector schematic with real-time test point probes (`TP1`–`TP6`), signal packet trace animations, and Altium-style title block.

---

## 📐 Hardware Pinout & Wiring Netlist

| ESP32-S3 Pin | Peripheral Component | Function | Notes |
| :--- | :--- | :--- | :--- |
| **GPIO 8** | SH1106 OLED `SDA` | I2C Data | 400kHz Fast Mode (4.7kΩ pull-up to 3.3V) |
| **GPIO 9** | SH1106 OLED `SCL` | I2C Clock | 400kHz Fast Mode (4.7kΩ pull-up to 3.3V) |
| **GPIO 4** | TTP223 Touch `OUT` | RTC Ext0 Wake | Capacitive touch sensor (10µA deep sleep wake) |
| **GPIO 7** | Piezo Buzzer `+` | LEDC PWM Audio | 2.4kHz resonant chime & acoustic feedback |
| **GPIO 1** | Battery Divider | ADC Voltage Sense | 100kΩ / 100kΩ voltage divider from LiPo `VBAT` |
| **3.3V** | All Peripherals `VCC` | Regulated DC Bus | Fed from ME6211 low-dropout regulator (<80mV drop) |
| **GND** | All Peripherals `GND` | Common Ground Plane | Direct star ground return |

---

## 🛒 Bill of Materials (BOM)

| Designator | Component Description | Footprint / Package | Est. Cost (USD) |
| :--- | :--- | :--- | :--- |
| **U1** | ESP32-S3 Super Mini (Dual Core 240MHz, 4MB Flash, USB-C) | 22.5 × 18 mm Module | ~$3.20 |
| **DISP1** | 1.3" Monochrome I2C OLED (128×64 pixels, SH1106 driver) | 4-Pin I2C Header | ~$2.80 |
| **TOUCH1** | TTP223 Capacitive Touch Switch Module | 15 × 11 mm PCB | ~$0.45 |
| **BZ1** | Passive Piezo Transducer Buzzer (3V–5V, 2.4kHz) | 9 × 5.5 mm Through-Hole | ~$0.30 |
| **BAT1** | 3.7V 150mAh–800mAh LiPo Battery (Pouch cell with JST-PH 2.0) | Variable Pouch | ~$2.50 |
| **CHG1** | TP4056 Micro/Type-C LiPo Charger Module with DW01A Protection | 25 × 19 mm Module | ~$0.50 |
| **SW1** | Miniature SPDT Slide Switch (Power ON/OFF) | SS12D00G3 | ~$0.20 |
| **R1, R2** | 4.7kΩ 1% Resistors (I2C SDA/SCL Pull-ups) | 0805 SMD or 1/8W Axial | ~$0.10 |
| **R3, R4** | 100kΩ 1% Resistors (Battery Voltage Divider) | 0805 SMD or 1/8W Axial | ~$0.10 |

---

## ⚡ Arduino IDE Firmware Flashing Guide

1. Download or clone this repository:
   ```bash
   git clone https://github.com/<your-username>/desk-buddy-v2.git
   ```
2. Open `/firmware/DeskBuddy_ESP32S3_v2.0.ino` in the Arduino IDE (v2.2+).
3. Open **Tools &rarr; Manage Libraries** and install:
   - `U8g2` (by olikraus, v2.35.7+)
   - `ArduinoJson` (by Benoit Blanchon, v7.0.0+)
4. Configure Arduino IDE under the **Tools** menu:
   - **Board**: `"ESP32S3 Dev Module"`
   - **USB CDC On Boot**: `"Enabled"` *(CRITICAL for USB Serial debugging)*
   - **Flash Size**: `"4MB (32Mb)"`
   - **Partition Scheme**: `"Default 4MB with SPIFFS (1.2MB APP / 1.5MB SPIFFS)"`
   - **Upload Speed**: `921600`
5. Plug the ESP32-S3 into your PC via USB-C and hit **Upload**.

---

## 💻 Web Workbench & Simulator Quickstart

The web dashboard and hardware simulator run locally with Vite and Node.js:

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server (Port 3000)
npm run dev

# 3. Compile for production deployment
npm run build
```

Open `http://localhost:3000` to interact with:
- **Live Device Simulator**: Authentic 128x64 CRT scanline OLED emulation, 10 screen cycles, buzzer synthesizer, and physical touch interaction.
- **Circuit Schematic CAD**: Live interactive netlist with probe test points (`TP1`–`TP6`) and animated signal bus packets.
- **Expression Gallery**: 15 hand-drawn procedural moods with real-time test triggering.
- **Owner's Manual**: Complete ANSI plain-text configuration guide.

---

## 🌐 REST API Endpoints

When connected to local Wi-Fi, Desk Buddy exposes an embedded HTTP server:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/stats` | `GET` | Return JSON with uptime, battery %, WiFi RSSI, and heap. |
| `POST /api/screen` | `POST` | Change active OLED screen (`{ "screen": 3 }`). |
| `POST /api/mood` | `POST` | Trigger custom facial mood (`{ "mood": "love" }`). |
| `POST /api/timer` | `POST` | Start/pause Pomodoro timer (`{ "action": "start" }`). |
| `POST /api/weather`| `POST` | Manually push custom temperature/condition string. |

---

## 📁 Repository Structure

```
├── firmware/
│   └── DeskBuddy_ESP32S3_v2.0.ino   # Complete ESP32-S3 Arduino C++ sketch
├── src/
│   ├── components/
│   │   ├── InteractiveDevice.tsx    # Live device hardware & OLED simulator
│   │   ├── CircuitWorkbench.tsx     # CAD vector schematic & test points
│   │   ├── ExpressionGallery.tsx    # 15 procedural eye mood catalog
│   │   ├── ManualDocs.tsx           # Owner's manual & flashing guide
│   │   ├── PortfolioShowcase.tsx    # System topology & kinematics showcase
│   │   ├── WebDashboard.tsx         # Embedded REST API dashboard
│   │   └── OledScreen.tsx           # 128x64 monochrome graphics renderer
│   ├── data/
│   │   ├── circuitData.ts           # Netlist, traces, BOM data models
│   │   └── expressions.ts           # Algorithmic mood parameters
│   ├── services/
│   │   └── soundEffects.ts          # Web Audio synthesized piezo chimes
│   ├── App.tsx                      # Windows XP Luna desktop window manager
│   ├── main.tsx                     # React root mount
│   └── types.ts                     # Shared TypeScript schemas
├── public/                          # Static assets and downloadable archive
├── package.json                     # Project manifest and npm scripts
├── vite.config.ts                   # Vite build configuration
├── README.md                        # Master documentation
└── LICENSE                          # MIT Open Source License
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
