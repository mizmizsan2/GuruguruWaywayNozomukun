#pragma once

#include <MsgPack.h>

// I2C speed standard-mode: 100kbps
#ifndef I2C_SPEED_STANDARD
#define I2C_SPEED_STANDARD 100000
#endif

// I2C speed fast-mode: 400kbps
#ifndef I2C_SPEED_FAST
#define I2C_SPEED_FAST 400000
#endif

// I2C speed fast-mode plus: 1Mbps
#ifndef I2C_SPEED_FAST_PLUS
#define I2C_SPEED_FAST_PLUS 1000000
#endif

// I2C speed high-speed-mode: 3.4Mbps
#ifndef I2C_SPEED_HIGH
#define I2C_SPEED_HIGH 3400000
#endif

// QT Py RP2040ボードに搭載のLEDの接続ピン番号
#define LED_POWER 11
#define LED_PIN 12

/**
   @brief LEDの色設定用のデータを作る
*/
#define LED_COLOR(r, g, b) ((r << 16) | (g << 8) | b)
#define COLOR_RED LED_COLOR(255, 0, 0)
#define COLOR_GREEN LED_COLOR(0, 255, 0)
#define COLOR_BLUE LED_COLOR(0, 0, 255)
#define COLOR_YELLOW LED_COLOR(255, 255, 0)
#define COLOR_MAGENTA LED_COLOR(255, 0, 255)
#define COLOR_CYAN LED_COLOR(0, 255, 255)

// スイッチの接続ピン番号
#define BUTTON_PIN 24
#define BUTTON_LED_PIN 25

// ボタンイベント
#define BUTTONEVENT_NONE 0
#define BUTTONEVENT_CLICK 1
#define BUTTONEVENT_LONGPRESS 2

#define ENCODER_PIN_A 27
#define ENCODER_PIN_B 28

#ifdef HAVE_PACKET_KEY
#define PACKET_KEY(name, value) MsgPack::str_t key_##name = value
#else
#define PACKET_KEY(name, value)
#endif

// 各センサー類の更新間隔（ミリ秒）
#define IMU_UPDATE_INTERVAL 100
#define GPS_UPDATE_INTERVAL 5000

// データ送信間隔
#define SEND_INTERVAL 100

#define AIRCR_Register (*((volatile uint32_t *)(PPB_BASE + 0x0ED0C)))

/**
   @brief オイラー角（heading, pitch, roll）

*/
struct EulerAngleParams
{
  PACKET_KEY(heading, "heading");
  float heading;
  PACKET_KEY(pitch, "pitch");
  float pitch;
  PACKET_KEY(roll, "roll");
  float roll;

#ifdef ENABLE_PACKET_KEY
  MSGPACK_DEFINE_MAP(key_heading, heading, key_pitch, pitch, key_roll, roll)
#else
  MSGPACK_DEFINE(heading, pitch, roll)
#endif
};

/**
   @brief 加速度/角速度/地磁気センサー

*/
struct SensorParams
{
  PACKET_KEY(x, "x");
  float x;
  PACKET_KEY(y, "y");
  float y;
  PACKET_KEY(z, "z");
  float z;

#ifdef ENABLE_PACKET_KEY
  MSGPACK_DEFINE_MAP(key_x, x, key_y, y, key_z, z)
#else
  MSGPACK_DEFINE(x, y, z)
#endif
};

/**
   @brief GPS位置情報

*/
struct GpsParams
{
  PACKET_KEY(lat, "lat");
  double lat;
  PACKET_KEY(lng, "lng");
  double lng;

#ifdef ENABLE_PACKET_KEY
  MSGPACK_DEFINE_MAP(key_lat, lat, key_lng, lng)
#else
  MSGPACK_DEFINE(lat, lng)
#endif
};

/**
 * @brief ボタンイベント
 */
struct ButtonParams
{
  PACKET_KEY(event, "event");
  int event; // ボタンイベント(BUTTONEVENT_NONE, BUTTONEVENT_CLICK, BUTTONEVENT_LONGPRESS)
  PACKET_KEY(count, "count");
  int count; // クリックした回数

#ifdef ENABLE_PACKET_KEY
  MSGPACK_DEFINE_MAP(key_event, event, key_count, count);
#else
  MSGPACK_DEFINE(event, count);
#endif
};

/**
   @brief パケット

*/
struct ControllerPacket
{
  PACKET_KEY(hasImu, "hasImu");
  bool hasImu;
  PACKET_KEY(hasGps, "hasGps");
  bool hasGps;
  PACKET_KEY(eulerAngle, "eulerAngle");
  EulerAngleParams eulerAngle;
  PACKET_KEY(accel, "accel");
  SensorParams accel;
  PACKET_KEY(gyro, "gyro");
  SensorParams gyro;
  PACKET_KEY(mag, "mag");
  SensorParams mag;
  PACKET_KEY(gps, "gps");
  GpsParams gps;
  PACKET_KEY(button, "button");
  ButtonParams button;
  PACKET_KEY(wheelSpeed, "wheelSpeed");
  int wheelSpeed;

#ifdef ENABLE_PACKET_KEY
  MSGPACK_DEFINE_MAP(key_hasImu, hasImu, key_hasGps, hasGps, key_eularAngle, eulerAngle, key_accel, accel, key_gyro, gyro, key_mag, mag, key_gps, gps, key_button, button, key_wheelSpeed, wheelSpeed)
#else
  MSGPACK_DEFINE(hasImu, hasGps, eulerAngle, accel, gyro, mag, gps, button, wheelSpeed)
#endif
};

// struct ControllerPacket2
// {
//   PACKET_KEY(hasImu, "hasImu");
//   bool hasImu;
//   PACKET_KEY(hasGps, "hasGps");
//   bool hasGps;
//   PACKET_KEY(eulerAngle, "eulerAngle");
//   EulerAngleParams eulerAngle;
//   PACKET_KEY(accel, "accel");
//   SensorParams accel;
//   PACKET_KEY(gyro, "gyro");
//   SensorParams gyro;
//   PACKET_KEY(mag, "mag");
//   SensorParams mag;
//   PACKET_KEY(gps, "gps");
//   GpsParams gps;
//   PACKET_KEY(button, "button");
//   ButtonParams button;
//   PACKET_KEY(wheelSpeed, "wheelSpeed");
//   int wheelSpeed;
//   PACKET_KEY(imuCalibration, "imuCalibration")
// #ifdef ENABLE_PACKET_KEY
//   MSGPACK_DEFINE_MAP(key_hasImu, hasImu, key_hasGps, hasGps, key_eularAngle, eulerAngle, key_accel, accel, key_gyro, gyro, key_mag, mag, key_gps, gps, key_button, button, key_wheelSpeed, wheelSpeed)
// #else
//   MSGPACK_DEFINE(hasImu, hasGps, eulerAngle, accel, gyro, mag, gps, button, wheelSpeed)
// #endif
// };

#define LED_EVENT_UNTILBUTTONPRESSED 0x1000

enum LedCommand
{
  Unknown = 0,
  Off = 1,
  On = 2,
  Blink1 = 3,
  Blink2 = 4,
  OnUntilButtonPressed = LED_EVENT_UNTILBUTTONPRESSED & LedCommand::On,
  Blink1UntilButtonPressed = LED_EVENT_UNTILBUTTONPRESSED & LedCommand::Blink1,
  Blink2UntilButtonPressed = LED_EVENT_UNTILBUTTONPRESSED & LedCommand::Blink2,
};

