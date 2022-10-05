/**
 * センサーとかボタンとか制御プログラム
 * ボタンを4回押し→5回目長押しでリセット
 * LEDステータス：黄色：センサー類初期化、水色：シリアル接続待ち、緑色：接続中
 */

// デバッグ用
// #define DEBUG
#undef DEBUG

// 動作確認用でQT Py RP2040のLEDを光らせるかどうか
#define ENABLE_LED_STATUS
// #undef ENABLE_LED_STATUS

// パケットのキーを有効にする。無効にするとパケットサイズを小さくできる。
// #define ENABLE_PACKET_KEY
#undef ENABLE_PACKET_KEY

// MessagePackの最大パケットサイズ
#define MSGPACK_MAX_PACKET_BYTE_SIZE 256

#include "controller.h"
#include <ardukit.h>
#include <Wire.h>
#include <SparkFun_I2C_GPS_Arduino_Library.h>
#include <TinyGPS++.h>
#include <Adafruit_BNO055.h>
#include <PacketSerial.h>
#include <EventButton.h>

#ifdef ENABLE_LED_STATUS
#include <Adafruit_NeoPixel.h>
Adafruit_NeoPixel led(1, LED_PIN);
#endif

Adafruit_BNO055 sensorImu = Adafruit_BNO055(55, 0x28, &Wire1);
sensors_event_t eventEuler, eventQuat, eventAccel, eventGyro, eventMag;
bool isImuInited = false;
unsigned int imuIntervalId;

I2CGPS sensorGps;      // Hook object to the library
TinyGPSPlus parserGps; // Declare gps object
bool isGpsInited = false;
unsigned int gpsIntervalId;
double locationLat = 0, locationLng = 0;

// for Button
EventButton button(BUTTON_PIN);
int buttonClickCount = 0;
int buttonEvent = 0;

LedCommand ledCommand = LedCommand::Off;
unsigned ledEventId = -1;
bool ledState = false;

// for Wheel
bool encoderPinALast = false;
int nowSpd = 0;
int agoSpd = 0;
int wheelSpeed = 0;
int startTime = 0;

ControllerPacket packet;
SLIPPacketSerial serial;

/**
 * @brief マイコンボード（RP2040）をリセットする
 *
 */
void reset()
{
  AIRCR_Register = 0x5FA0004;
}

/**
 * @brief Quaternionからオイラー角を求める
 * 参考：http://l52secondary.blog.fc2.com/blog-entry-50.html
 *
 * @param q
 * @param ev
 */
void calcEulerAngles(imu::Quaternion q, sensors_event_t &ev)
{
  double w = q.w();
  double x = q.x();
  double y = q.y();
  double z = q.z();

  double ysqr = y * y;

  // roll (x-axis rotation)
  double t0 = +2.0 * (w * x + y * z);
  double t1 = +1.0 - 2.0 * (x * x + ysqr);
  double roll = std::atan2(t0, t1);

  // pitch (y-axis rotation)
  double t2 = +2.0 * (w * y - z * x);
  t2 = t2 > 1.0 ? 1.0 : t2;
  t2 = t2 < -1.0 ? -1.0 : t2;
  double pitch = std::asin(t2);

  // heading (z-axis rotation)
  double t3 = +2.0 * (w * z + x * y);
  double t4 = +1.0 - 2.0 * (ysqr + z * z);
  double heading = std::atan2(t3, t4);

  ev.orientation.heading = heading;
  ev.orientation.pitch = pitch;
  ev.orientation.roll = roll;
}

/**
   @brief IMUの現在の状態を読み込む
   IMU_UPDATE_INTERVALミリ秒(100ミリ秒)ごとに更新
*/
void updateIMUEvent(void *)
{
  // sensorImu.getEvent(&eventEuler);
  calcEulerAngles(sensorImu.getQuat(), eventEuler);
  sensorImu.getEvent(&eventAccel, Adafruit_BNO055::VECTOR_ACCELEROMETER);
  sensorImu.getEvent(&eventGyro, Adafruit_BNO055::VECTOR_GYROSCOPE);
  sensorImu.getEvent(&eventMag, Adafruit_BNO055::VECTOR_MAGNETOMETER);
}

// void sendIMUOrientation(SerialCmd &s)
// {
//     float theta;
//     theta = atan2f(magEvent.magnetic.x, magEvent.magnetic.y);
//     // s.Print(theta * 180 / M_PI).PrintLn();

//     s.Print("Orientation: ");
//     s.Print(imuEvent.orientation.x).Print(" ");        // roll
//     s.Print(imuEvent.orientation.y).Print(" ");        // pitch
//     s.Print(imuEvent.orientation.z + theta).PrintLn(); // heading(yaw)
// }

/**
 * @brief GPSの状態を読み込む
 *
 */
void updateGPSEvent(void *)
{
  while (sensorGps.available()) // available() returns the number of new bytes available from the GPS module
  {
    parserGps.encode(sensorGps.read()); // Feed the GPS parser
  }
  if (parserGps.time.isUpdated() && parserGps.location.isValid())
  {
    locationLat = parserGps.location.lat();
    locationLng = parserGps.location.lng();
  }
}

/**
 * @brief ボタンを離した時のイベント
 *
 */
void onButtonReleased(EventButton &)
{
  buttonClickCount++;
  buttonEvent = BUTTONEVENT_NONE;
}

/**
 * @brief ボタンをクリックした時のイベント
 *
 */
void onButtonClicked(EventButton &)
{
  // buttonClickCount;
  buttonEvent = BUTTONEVENT_CLICK;
}

/**
 * @brief ボタンを長押しした時のイベント
 * 5回長押しでリセットがかかる
 */
void onButtonLongPressed(EventButton &)
{
  buttonClickCount++;
  buttonEvent = BUTTONEVENT_LONGPRESS;

  // 5回目長押しでリセット
  if (buttonClickCount == 5)
  {
    reset();
  }
}

/**
 * @brief ボタンを長押しクリックした時のイベント
 * イベントキャンセル用に用意
 */
void onButtonLongClicked(EventButton &)
{
  buttonClickCount = 0;
  buttonEvent = BUTTONEVENT_NONE;
}

#ifdef DEBUG
void serialPrintPacket()
{
  Serial.print("ANG(h/p/r): ");
  Serial.print(packet.eulerAngle.heading, 2);
  Serial.print(", ");
  Serial.print(packet.eulerAngle.pitch, 2);
  Serial.print(", ");
  Serial.print(packet.eulerAngle.roll, 2);
  Serial.print(" A:");
  Serial.print(packet.accel.x, 2);
  Serial.print(", ");
  Serial.print(packet.accel.y, 2);
  Serial.print(", ");
  Serial.print(packet.accel.z, 2);
  Serial.print(" G:");
  Serial.print(packet.gyro.x, 2);
  Serial.print(", ");
  Serial.print(packet.gyro.y, 2);
  Serial.print(", ");
  Serial.print(packet.gyro.z, 2);
  Serial.print(" M:");
  Serial.print(packet.mag.x, 2);
  Serial.print(", ");
  Serial.print(packet.mag.y, 2);
  Serial.print(", ");
  Serial.println(packet.mag.z, 2);

  Serial.print("GPS: ");
  Serial.print(packet.gps.lat, 2);
  Serial.print(", ");
  Serial.print(packet.gps.lng, 2);

  Serial.print(" BTN: ");
  Serial.print(packet.button.event);
  Serial.print(", ");
  Serial.print(packet.button.count);
  Serial.print(", ");

  Serial.print(" WHL: ");
  Serial.println(packet.wheelSpeed);
}
#endif

/**
 * @brief データをシリアルで送信する。MessagePack形式、SLIPエンコード
 *
 */
void send(void *)
{
  packet.hasImu = isImuInited;
  if (isImuInited)
  {
    packet.eulerAngle.heading = eventEuler.orientation.heading;
    packet.eulerAngle.pitch = eventEuler.orientation.pitch;
    packet.eulerAngle.roll = eventEuler.orientation.roll;
    packet.accel.x = eventAccel.acceleration.x;
    packet.accel.y = eventAccel.acceleration.y;
    packet.accel.z = eventAccel.acceleration.z;
    packet.gyro.x = eventAccel.gyro.x;
    packet.gyro.y = eventAccel.gyro.y;
    packet.gyro.z = eventAccel.gyro.z;
    packet.mag.x = eventAccel.magnetic.x;
    packet.mag.y = eventAccel.magnetic.y;
    packet.mag.z = eventAccel.magnetic.z;
  }

  packet.hasGps = isGpsInited;
  if (isGpsInited)
  {
    packet.gps.lat = parserGps.location.lat();
    packet.gps.lng = parserGps.location.lng();
  }

  if (buttonClickCount > 0) // ボタンイベントが確定していたら送信
  {
    if (buttonEvent != BUTTONEVENT_NONE)
    {
      if ((unsigned int)ledCommand & LED_EVENT_UNTILBUTTONPRESSED) // ボタンが押されるまで～のイベントを止める
      {
        clearLedEvent();
        gpio_put(BUTTON_LED_PIN, false);
        ledCommand = LedCommand::Off;
      }
      packet.button.event = buttonEvent;
      packet.button.count = buttonClickCount;
      buttonEvent = BUTTONEVENT_NONE;
      buttonClickCount = 0;
    }
  }
  else // 何もしていない状態
  {

    packet.button.event = BUTTONEVENT_NONE;
    packet.button.count = 0;
  }
  packet.wheelSpeed = wheelSpeed;

  MsgPack::Packer packer;
  packer.serialize(packet);

#ifdef DEBUG
  serialPrintPacket();
#else
  serial.send(packer.data(), packer.size());
#endif
}

/**
 * @brief ボタン内蔵のLEDを点滅させる。
 * adk::set_intervalから呼び出される。
 *
 * @param data
 */
void blinkLed(void *data)
{
  ledState = !ledState;
  gpio_put(BUTTON_LED_PIN, ledState);
}

/**
 * @brief Ledのタイマーイベントを止める
 *
 */
void clearLedEvent()
{
  if (ledEventId != -1)
  {
    adk::clear_timeout(ledEventId);
    ledEventId = -1;
  }
}

/**
 * @brief LEDの制御コマンド：0～6
 *
 * @param c
 * @return LedCommand
 */
LedCommand controlLed(char c)
{
  switch (c)
  {
  case '0':
    gpio_put(BUTTON_LED_PIN, false);
    return LedCommand::Off;
  case '1':
    gpio_put(BUTTON_LED_PIN, true);
    return LedCommand::On;
  case '2':
    clearLedEvent();
    ledEventId = adk::set_interval(blinkLed, 200);
    return LedCommand::Blink1;
  case '3':
    clearLedEvent();
    ledEventId = adk::set_interval(blinkLed, 400);
    return LedCommand::Blink2;
  case '4':
    gpio_put(BUTTON_LED_PIN, true);
    return LedCommand::OnUntilButtonPressed;
  case '5':
    clearLedEvent();
    ledEventId = adk::set_interval(blinkLed, 200);
    return LedCommand::Blink1UntilButtonPressed;
  case '6':
    clearLedEvent();
    ledEventId = adk::set_interval(blinkLed, 400);
    return LedCommand::Blink2UntilButtonPressed;
  }

  return LedCommand::Unknown;
}

void onPacketReceived()
{
  String s = Serial.readStringUntil(';');

  for (int i = 0; s[i] != '\0'; i++)
  {
    switch (s[i])
    {
    case ';':
    case '\0':
    case '\r':
    case '\n':
      return;

    case 'L': // LEDの制御
      ledCommand = controlLed(s[i + 1]);
      if(ledCommand != LedCommand::Unknown)
        i++;
      break;
    case 'I': // IMUの制御
      break;
    }
  }
}

void setup()
{
  // 最初2秒ほど初期化を待つ
  delay(2000);

#ifdef ENABLE_LED_STATUS
  // LEDの初期化
  pinMode(LED_POWER, OUTPUT);
  digitalWrite(LED_POWER, HIGH);
  led.begin();
  led.setBrightness(10);
  led.setPixelColor(0, COLOR_YELLOW);
  led.show();
#endif

  // IMU初期化
  if (isImuInited = sensorImu.begin())
  {
    delay(650);
    sensorImu.setExtCrystalUse(true);
  }

  // GPS初期化
  isGpsInited = sensorGps.begin(Wire1);

  pinMode(BUTTON_LED_PIN, OUTPUT);
  // ボタンイベント登録
  button.setClickHandler(onButtonClicked);
  button.setReleasedHandler(onButtonReleased);
  button.setLongClickHandler(onButtonLongClicked);
  button.setLongPressHandler(onButtonLongPressed, false); // Second arg means repeat the long click

#ifdef ENABLE_LED_STATUS
  led.setPixelColor(0, COLOR_CYAN);
  led.show();
#endif

  // シリアル通信開始
  serial.begin(115200);
  delay(1000);

#ifdef ENABLE_LED_STATUS
  led.setPixelColor(0, COLOR_GREEN);
  led.show();
#endif

  // イベントスタート
  if (isImuInited)
  {
    adk::set_interval(updateIMUEvent, IMU_UPDATE_INTERVAL);
  }

  if (isGpsInited)
  {
    adk::set_interval(updateGPSEvent, GPS_UPDATE_INTERVAL);
  }

  adk::set_interval(send, SEND_INTERVAL);
}

void loop()
{
  button.update();
  adk::run();
  serial.update();

  if (Serial.available() > 0)
  {
    onPacketReceived();
  }
}

int counterA = 0;

void buttonFunc()
{
  // serial.Print(millis()).Print(" .I. ").Print(digitalRead(BUTTON_PIN)).PrintLn();
  counterA++;
}

void setup1()
{
  pinMode(ENCODER_PIN_A, INPUT);
  pinMode(ENCODER_PIN_B, INPUT);
  startTime = millis();
}

void loop1()
{
  //                           _______         _______
  //               PinA ______|       |_______|       |______ PinA
  // negative <---         _______         _______         __      --> positive
  //               PinB __|       |_______|       |_______|   PinB

  bool n = gpio_get(ENCODER_PIN_A);
  if ((encoderPinALast == false) && (n == true))
  {
    if (gpio_get(ENCODER_PIN_B) == false)
    {
      nowSpd--;
    }
    else
    {
      nowSpd++;
    }
  }
  encoderPinALast = n;

  if (millis() - startTime >= 100)
  {
    wheelSpeed = nowSpd + agoSpd;

    agoSpd = nowSpd;
    nowSpd = 0;

    startTime = millis();
  }
}