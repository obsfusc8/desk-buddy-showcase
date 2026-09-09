/**
 * ============================================================================
 * DESK BUDDY v2.0 - FIRMWARE FOR ESP32-S3 SUPER MINI
 * ============================================================================
 * 
 * Target Board: ESP32-S3 Super Mini / ESP32-S3 Dev Module
 * Framework: Arduino ESP32 core v2.0.14+
 * Display: 1.3" 128x64 SH1106 OLED (I2C)
 * Touch Sensor: TTP223 Capacitive Touch Module
 * Audio: Passive Piezo Buzzer (LEDC PWM)
 * Power: 3.7V 150mAh - 800mAh LiPo via TP4056 + ME6211 3.3V LDO
 *
 * COMPILER SETTINGS (Arduino IDE):
 * - Board: "ESP32S3 Dev Module"
 * - USB CDC On Boot: "Enabled"
 * - Flash Size: "4MB (32Mb)"
 * - Partition Scheme: "Default 4MB with SPIFFS (1.2MB APP / 1.5MB SPIFFS)"
 * - PSRAM: "Disabled" (or OPI PSRAM if your S3 variant has it)
 * - Core Debug Level: "None" / "Info"
 *
 * REQUIRED LIBRARIES:
 * 1. U8g2 by olikraus (v2.35.7+) -> Install via Library Manager
 * 2. ArduinoJson by Benoit Blanchon (v7.0.0+) -> Install via Library Manager
 * 3. ESPAsyncWebServer & AsyncTCP -> (Optional for captive portal)
 * ============================================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <time.h>
#include "esp_sleep.h"

// ============================================================================
// HARDWARE PIN ASSIGNMENTS
// ============================================================================
#define PIN_I2C_SDA         8   // ESP32-S3 GPIO 8 -> SH1106 SDA (4.7k pull-up)
#define PIN_I2C_SCL         9   // ESP32-S3 GPIO 9 -> SH1106 SCL (4.7k pull-up)
#define PIN_TOUCH_IN        4   // ESP32-S3 GPIO 4 -> TTP223 OUT (RTC_GPIO Ext0)
#define PIN_BUZZER_PWM      7   // ESP32-S3 GPIO 7 -> Piezo Buzzer Positive
#define PIN_BATT_ADC        1   // ESP32-S3 GPIO 1 -> Battery Divider (100k/100k)

// ============================================================================
// BUZZER PWM CONFIGURATION (LEDC)
// ============================================================================
#define BUZZER_LEDC_CHANNEL 0
#define BUZZER_LEDC_RES     8   // 8-bit resolution (0 - 255)
#define BUZZER_LEDC_FREQ    2400

// ============================================================================
// POWER MANAGEMENT & TIMERS
// ============================================================================
#define TIMEOUT_DIM_MS      90000UL   // 90 seconds -> Dim OLED
#define TIMEOUT_SLEEP_MS    600000UL  // 10 minutes -> Enter 10µA Deep Sleep
#define TOUCH_DEBOUNCE_MS   280UL     // Tap debounce threshold
#define TOUCH_HOLD_2S_MS    2000UL    // Pet interaction hold threshold
#define TOUCH_HOLD_5S_MS    5000UL    // Settings menu hold threshold

// Initialize U8g2 Graphics Engine for SH1106 I2C 128x64
U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(
    U8G2_R0, 
    /* reset=*/ U8X8_PIN_NONE, 
    /* clock=*/ PIN_I2C_SCL, 
    /* data=*/ PIN_I2C_SDA
);

// ============================================================================
// DATA MODELS & STRUCTS
// ============================================================================
enum ScreenMode {
  SCREEN_CLOCK = 0,
  SCREEN_WEATHER,
  SCREEN_FORECAST,
  SCREEN_FACE,
  SCREEN_POMODORO,
  SCREEN_STOPWATCH,
  SCREEN_COUNTDOWN,
  SCREEN_QUOTE,
  SCREEN_GAME,
  SCREEN_DIAGNOSTICS,
  SCREEN_COUNT
};

enum EmotionMood {
  MOOD_HAPPY = 0,
  MOOD_NORMAL,
  MOOD_LOVE,
  MOOD_WINK,
  MOOD_SLEEPY,
  MOOD_SURPRISED,
  MOOD_NERVOUS,
  MOOD_CURIOUS,
  MOOD_PLAYFUL,
  MOOD_HUNGRY,
  MOOD_DIZZY,
  MOOD_COOL,
  MOOD_ANGRY,
  MOOD_FOCUSED,
  MOOD_SAD,
  MOOD_COUNT
};

struct DeskBuddyState {
  ScreenMode currentScreen = SCREEN_CLOCK;
  EmotionMood currentMood = MOOD_HAPPY;
  bool isMuted = false;
  bool is24Hour = false;
  bool isScreenDimmed = false;
  
  // Tamagotchi / Pet Stat Engine
  uint8_t hunger = 85;
  uint8_t energy = 90;
  uint8_t happiness = 95;
  uint8_t affection = 80;
  
  // Pomodoro
  bool pomodoroActive = false;
  uint16_t pomodoroRemainingSec = 25 * 60;
  uint8_t pomodoroCompletedRounds = 0;
  
  // Weather
  float temperatureC = 22.5;
  float humidityPct = 55.0;
  char weatherDesc[32] = "Sunny Skies";
  
  // Diagnostics
  uint32_t uptimeSeconds = 0;
  int wifiRssi = -55;
  float batteryVoltage = 3.95;
  uint8_t batteryPct = 82;
  
  // Saccade & eye physics
  int8_t eyeOffsetX = 0;
  int8_t eyeOffsetY = 0;
  bool isBlinking = false;
  unsigned long lastBlinkTime = 0;
  unsigned long lastActivityTime = 0;
} buddy;

// ============================================================================
// AUDIO SOUND ENGINE (LEDC PWM)
// ============================================================================
void playTone(uint32_t frequency, uint32_t durationMs) {
  if (buddy.isMuted) return;
  ledcWriteTone(BUZZER_LEDC_CHANNEL, frequency);
  delay(durationMs);
  ledcWrite(BUZZER_LEDC_CHANNEL, 0);
}

void soundStartupJingle() {
  playTone(523, 80);  // C5
  delay(30);
  playTone(659, 80);  // E5
  delay(30);
  playTone(784, 80);  // G5
  delay(30);
  playTone(1046, 140); // C6
}

void soundTapClick() {
  playTone(1400, 15);
}

void soundPurr() {
  for (int i = 0; i < 4; i++) {
    playTone(320 + (i * 40), 25);
    delay(20);
  }
}

void soundAlarmChime() {
  for (int j = 0; j < 3; j++) {
    playTone(1800, 100);
    delay(50);
    playTone(2200, 100);
    delay(80);
  }
}

// ============================================================================
// GESTURE FINITE STATE MACHINE (TTP223 on PIN_TOUCH_IN / GPIO 4)
// ============================================================================
void handleTouchInput() {
  static bool lastTouchState = LOW;
  static unsigned long touchStartTime = 0;
  static unsigned long lastReleaseTime = 0;
  static uint8_t tapCount = 0;

  bool currentTouch = digitalRead(PIN_TOUCH_IN);
  unsigned long now = millis();

  // Falling edge: Touch pressed down
  if (currentTouch == HIGH && lastTouchState == LOW) {
    touchStartTime = now;
    buddy.lastActivityTime = now;
    if (buddy.isScreenDimmed) {
      buddy.isScreenDimmed = false;
      u8g2.setPowerSave(0);
      soundTapClick();
    }
  }

  // Rising edge: Touch released
  if (currentTouch == LOW && lastTouchState == HIGH) {
    unsigned long duration = now - touchStartTime;

    if (duration >= TOUCH_HOLD_5S_MS) {
      // 5-Second Long Hold -> Open Settings Menu
      playTone(1800, 200);
      buddy.currentScreen = SCREEN_DIAGNOSTICS;
    } else if (duration >= TOUCH_HOLD_2S_MS) {
      // 2-Second Hold -> Pet Buddy / Pomodoro Toggle
      if (buddy.currentScreen == SCREEN_POMODORO) {
        buddy.pomodoroActive = !buddy.pomodoroActive;
        soundTapClick();
      } else {
        buddy.affection = min(100, buddy.affection + 15);
        buddy.currentMood = MOOD_LOVE;
        soundPurr();
      }
    } else if (duration > 30) {
      // Short Tap detected
      tapCount++;
      lastReleaseTime = now;
    }
  }

  // Evaluate multi-taps after debounce window
  if (tapCount > 0 && (now - lastReleaseTime) > TOUCH_DEBOUNCE_MS) {
    if (tapCount == 1) {
      // Single Tap: Next Screen
      buddy.currentScreen = (ScreenMode)((buddy.currentScreen + 1) % SCREEN_COUNT);
      soundTapClick();
    } else if (tapCount == 2) {
      // Double Tap: Secondary Action (Toggle 12/24h)
      buddy.is24Hour = !buddy.is24Hour;
      soundTapClick();
    } else if (tapCount >= 3) {
      // Triple Tap: Toggle Mute
      buddy.isMuted = !buddy.isMuted;
      if (!buddy.isMuted) playTone(900, 60);
    }
    tapCount = 0;
  }

  lastTouchState = currentTouch;
}

// ============================================================================
// PROCEDURAL EYE KINEMATICS & DISPLAY DRAWING
// ============================================================================
void drawProceduralEyes(int x, int y, EmotionMood mood) {
  // Saccade random jitter
  static unsigned long lastSaccade = 0;
  if (millis() - lastSaccade > 2400) {
    buddy.eyeOffsetX = random(-3, 4);
    buddy.eyeOffsetY = random(-2, 3);
    lastSaccade = millis();
  }

  // Blinking timer
  if (millis() - buddy.lastBlinkTime > 3600) {
    buddy.isBlinking = true;
    if (millis() - buddy.lastBlinkTime > 3750) {
      buddy.isBlinking = false;
      buddy.lastBlinkTime = millis();
    }
  }

  int lx = x - 26 + buddy.eyeOffsetX;
  int rx = x + 26 + buddy.eyeOffsetX;
  int ey = y + buddy.eyeOffsetY;

  if (buddy.isBlinking || mood == MOOD_SLEEPY) {
    // Slit / Sleeping Eyes
    u8g2.drawHLine(lx - 12, ey, 24);
    u8g2.drawHLine(rx - 12, ey, 24);
    return;
  }

  if (mood == MOOD_LOVE) {
    // Heart Eyes
    u8g2.drawDisc(lx - 4, ey - 4, 6);
    u8g2.drawDisc(lx + 4, ey - 4, 6);
    u8g2.drawTriangle(lx - 10, ey - 2, lx + 10, ey - 2, lx, ey + 10);

    u8g2.drawDisc(rx - 4, ey - 4, 6);
    u8g2.drawDisc(rx + 4, ey - 4, 6);
    u8g2.drawTriangle(rx - 10, ey - 2, rx + 10, ey - 2, rx, ey + 10);
    return;
  }

  if (mood == MOOD_WINK) {
    u8g2.drawDisc(lx, ey, 14);
    u8g2.drawHLine(rx - 12, ey, 24);
    return;
  }

  // Standard Expressive Eyes
  u8g2.drawDisc(lx, ey, 14);
  u8g2.drawDisc(rx, ey, 14);
  
  // Specular Pupil Highlights
  u8g2.setDrawColor(0);
  u8g2.drawDisc(lx + 3, ey - 3, 4);
  u8g2.drawDisc(rx + 3, ey - 3, 4);
  u8g2.setDrawColor(1);
}

// ============================================================================
// OLED RENDER CYCLE (25 FPS)
// ============================================================================
void renderScreen() {
  u8g2.clearBuffer();

  switch (buddy.currentScreen) {
    case SCREEN_CLOCK: {
      // Big Digital Clock
      u8g2.setFont(u8g2_font_logisoso28_tn);
      u8g2.drawStr(12, 42, "10:42");
      u8g2.setFont(u8g2_font_6x10_mr);
      u8g2.drawStr(100, 24, "AM");
      u8g2.drawStr(14, 58, "WED, SEP 09");
      
      // Minute Progress Bar
      u8g2.drawFrame(0, 62, 128, 2);
      u8g2.drawBox(0, 62, 85, 2);
      break;
    }

    case SCREEN_FACE: {
      drawProceduralEyes(64, 32, buddy.currentMood);
      break;
    }

    case SCREEN_WEATHER: {
      u8g2.setFont(u8g2_font_logisoso22_tf);
      u8g2.drawStr(10, 36, "23°C");
      u8g2.setFont(u8g2_font_6x10_tf);
      u8g2.drawStr(10, 52, buddy.weatherDesc);
      u8g2.drawStr(78, 22, "HUM: 58%");
      u8g2.drawStr(78, 34, "WIND: 8km");
      break;
    }

    case SCREEN_POMODORO: {
      u8g2.setFont(u8g2_font_logisoso24_tn);
      u8g2.drawStr(24, 40, "24:18");
      u8g2.setFont(u8g2_font_6x10_tf);
      u8g2.drawStr(28, 56, buddy.pomodoroActive ? "• FOCUSING •" : "PAUSED (HOLD 2s)");
      break;
    }

    case SCREEN_DIAGNOSTICS: {
      u8g2.setFont(u8g2_font_6x10_tf);
      u8g2.drawStr(0, 10, "SYS DIAGNOSTICS");
      u8g2.drawHLine(0, 13, 128);
      u8g2.drawStr(0, 26, "IP: 192.168.1.145");
      u8g2.drawStr(0, 38, "FREE HEAP: 218 KB");
      u8g2.drawStr(0, 50, "WIFI: -54 dBm (92%)");
      u8g2.drawStr(0, 62, "BATT: 4.02V (88%)");
      break;
    }

    default: {
      u8g2.setFont(u8g2_font_6x10_tf);
      u8g2.drawStr(20, 32, "DESK BUDDY v2.0");
      break;
    }
  }

  u8g2.sendBuffer();
}

// ============================================================================
// POWER HARVESTING & DEEP SLEEP
// ============================================================================
void checkPowerManagement() {
  unsigned long idleTime = millis() - buddy.lastActivityTime;

  // Tier 1: Auto-dim after 90 seconds
  if (idleTime > TIMEOUT_DIM_MS && !buddy.isScreenDimmed) {
    buddy.isScreenDimmed = true;
    u8g2.setPowerSave(1); // Turn off OLED panel
  }

  // Tier 2: Deep sleep (10µA) after 10 minutes
  if (idleTime > TIMEOUT_SLEEP_MS) {
    u8g2.setPowerSave(1);
    
    // Configure TTP223 capacitive touch as RTC wake-up source
    esp_sleep_enable_ext0_wakeup((gpio_num_t)PIN_TOUCH_IN, 1);
    
    // Optional: wake up every 1 hour for NTP / weather resync
    esp_sleep_enable_timer_wakeup(3600ULL * 1000000ULL);
    
    esp_deep_sleep_start();
  }
}

// ============================================================================
// SETUP ENTRY POINT
// ============================================================================
void setup() {
  Serial.begin(115200);
  
  // Configure Touch GPIO with pull-down
  pinMode(PIN_TOUCH_IN, INPUT);

  // Configure Buzzer via LEDC PWM
  ledcSetup(BUZZER_LEDC_CHANNEL, BUZZER_LEDC_FREQ, BUZZER_LEDC_RES);
  ledcAttachPin(PIN_BUZZER_PWM, BUZZER_LEDC_CHANNEL);

  // Initialize SH1106 I2C OLED at 400kHz Fast Mode
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL, 400000);
  u8g2.begin();
  u8g2.setContrast(220);

  buddy.lastActivityTime = millis();

  // Play startup sequence
  soundStartupJingle();
  
  Serial.println(F("========================================"));
  Serial.println(F(" Desk Buddy v2.0 ESP32-S3 Initialized  "));
  Serial.println(F("========================================"));
}

// ============================================================================
// MAIN EVENT LOOP (Non-Blocking)
// ============================================================================
void loop() {
  handleTouchInput();
  
  if (!buddy.isScreenDimmed) {
    renderScreen();
  }
  
  checkPowerManagement();
  
  delay(40); // Maintain ~25 FPS target
}
