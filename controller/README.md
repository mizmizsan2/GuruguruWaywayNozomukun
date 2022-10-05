# センサ制御用プログラム

## ファイル

- controller.ino : メインプログラム
- controller.h : メインプログラムのヘッダー

## ハードウェア

- マイコンボード: Adafruit QT Py RP2040
- 慣性計測ユニット(IMU) : Adafruit BNO055
- GPS: Sparkfun XA1110
- LED ランプ内蔵型スイッチ
- ロータリエンコーダ: Pololu ペアホイール 42 x 19 mm 用エンコーダ

### 接続図

```mermaid
flowchart LR
    RASPI[Raspberry Pi 4]---|USB/シリアル通信|RP2040
    IMU[9DoF IMU\nAdafruit BNO055]-->|Qwiic/I2C|RP2040[Adafruit QT Py RP2040]
    GPS[GPS\nSparkfun XA1110]-->|Qwiic/I2C|IMU
    BTN[ボタン]-->|GPIO24|RP2040
    RP2040-->|GPIO25|BTNLED[ボタン内蔵LED]
    WHL[ロータリエンコーダ\nGPIO27: SIGA\nGPIO28: SIGB]-->|GPIO27,28|RP2040
```

## ビルド

### (1)Arduino IDE の準備

1. ファイル → 環境設定 → ボードマネージャに追加

https://github.com/earlephilhower/arduino-pico/releases/download/global/package_rp2040_index.json

1. ボード →Raspberry Pi RP2040 Boards→Adafruit QT Py RP2040 を選択

1. シリアルポートを選ぶ

### (2)使用ライブラリ

ビルドするには、Arduino IDE のライブラリマネージャから下記ライブラリをインストールしておく。

- SparkFun_I2C_GPS_Arduino_Library : GPS
  - TinyGPS++ : GPS の NMEA フォーマットのパーサー
- Adafruit_BNO055 : 9DoF IMU(慣性計測ユニット)
  - Adafruit_BusIO
  - Adafruit_Unified_Sensor
- Adafruit_NeoPixel : QT Py RP2040 に搭載されている LED(動作確認用)
- ardukit : タイマー処理
- MsgPack : シリアル通信のデータ形式(MessagePack)
- PacketSerial : シリアル通信(SLIP)
- EventButton : ボタンイベント

### (3)ビルド

Adafruit QT Py RP2040 を PC に接続し、プログラムをマイコンボードに書き込む。

## データ形式

### 送信データフォーマット

MessagePack 形式
ホストとの通信は SLIP でエンコード後、シリアル通信で送信

```json
{
    hasImu: bool IMUが利用可能か
    hasGps: bool GPSが利用可能か
    eulerAngle: { オイラー角
        heading: float 
        pitch: float 
        roll: float 
    }
    accel: {
        x, y, z: float 加速度センサー
    }
    gyro: {
        x, y, z: float ジャイロセンサー
    }
    mag: {
        x, y, z: float 磁気センサー
    }
    button: {
        event: イベント状態
        count: ボタンを押した回数
    }
    wheel: int wheelの回転量（大きいほど早く回している。プラス：時計回り？、マイナス：反時計回り？、0：停止）
}
```

キー無しだと以下のようなデータ構造で送信される。
```
[true,true,[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0],[0,0],0]
```


## 処理内容について

RP2040 は 2core なので、各コアに処理を振り分けている。ロータリエンコーダの処理はエッジ検出の取りこぼしがないように 1 コアを占有し、それ以外はもう 1 コアで処理を行う。

- core #0
  - IMU
  - GPS
  - Button/LED
  - データ送信
- core #1
  - Wheel(ロータリエンコーダ)

CPU core #0

```mermaid
stateDiagram-v2
    state if_btn <<choice>>
    state if_reset <<choice>>

    IMU: updateIMUEvent()\nIMUデータ読込
    GPS: updateGPSEvent()\nGPSデータ読込
    SEND: send() データ送信

    [*]-->初期化
    初期化-->接続待ち
    接続待ち-->待機 : シリアル接続開始

    待機-->IMU : 100msec
    IMU-->待機

    待機-->GPS : 5000msec
    GPS-->待機

    待機-->SEND : 100msec
    SEND-->待機
    state SEND {
        [*]-->データ準備
        データ準備-->MessagePackエンコード
        MessagePackエンコード-->データ送信\nSLIP
        データ送信\nSLIP-->[*]
    }

    待機-->ボタン状態管理
    ボタン状態管理-->待機
    state ボタン状態管理 {
        [*]-->if_btn
        if_btn-->OnButtonReleased() : ボタンが離された
        OnButtonReleased()-->[*]
        if_btn-->OnButtonClicked() : ボタンクリック
        OnButtonClicked()-->[*]
        if_btn-->OnButtonLongClicked() : ボタン長押しクリック
        OnButtonLongClicked()-->[*]
        if_btn-->OnButtonLongPressed() : ボタン長押し
        OnButtonLongPressed()-->if_reset
        if_reset-->マイコンボードリセット処理 : 5回長押し
        if_reset-->[*] : 5回長押し以外
    }
```

CPU core #1

```mermaid
stateDiagram-v2
    state if_dir <<choice>>
    [*]-->待機
    待機-->PinA立ち上がり
    PinA立ち上がり-->if_dir
    if_dir-->時計回り : PinBがHIGH
    時計回り-->待機 : 回転速度カウンタ増
    if_dir-->反時計回り : PinBがLOW
    反時計回り-->待機 : 回転速度カウンタ減
    待機-->回転速度確定 : 100msec
    回転速度確定-->待機

```
