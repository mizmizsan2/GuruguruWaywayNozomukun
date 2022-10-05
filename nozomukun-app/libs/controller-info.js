/**
 * コントローラの情報を扱う
 */


/**
 * ボタンイベント
 */
export const ButtonEvent = {
  None: 0,
  Clicked: 1,
  LongPressed: 2,
};

/**
 * コントローラの情報
 */
export class ControllerInfo {
  constructor(data) {
    if (data != undefined) {
      if (data instanceof ControllerInfo) {
        this.hasImu = data.hasImu;
        this.hasGps = data.hasGps;
        this.eulerAngle = { ...data.eulerAngle };
        this.accel = { ...data.accel };
        this.gyro = { ...data.gyro };
        this.mag = { ...data.mag };
        this.gps = { ...data.gps };
        this.button = { ...data.button };
        this.wheelSpeed = data.wheelSpeed;
      } else {
        this.hasImu = data[0];
        this.hasGps = data[1];
        this.eulerAngle = {
          heading: data[2][0],
          pitch: data[2][1],
          roll: data[2][2],
        };
        this.accel = {
          x: data[3][0],
          y: data[3][1],
          z: data[3][2],
        };
        this.gyro = {
          x: data[4][0],
          y: data[4][1],
          z: data[4][2],
        };
        this.mag = {
          x: data[5][0],
          y: data[5][1],
          z: data[5][2],
        };
        this.gps = {
          lat: data[6][0],
          lng: data[6][1],
        };
        this.button = {
          event: data[7][0],
          count: data[7][1],
        };
        this.wheelSpeed = data[8];

        if (data.length == 10) {
          // キャリブレーションデータが届いたときの処理
          this.imuCalibration = {
            status: {
              system: data[9][0][0],
              accel: data[9][0][1],
              gyro: data[9][0][2],
              mag: data[9][0][3],
            },
            params: null,
          };

          if (data[9].length == 2) {
            //
            this.imuCalibration.params = {};
          }
        }
      }
    } else {
      this.clear();
    }
  }

  /**
   * 複製する。deep copyしたインスタンスを返す。
   * @returns
   */
  clone() {
    return new ControllerInfo(this);
  }

  /**
   * クリアする。
   */
  clear() {
    this.hasImu = false;
    this.hasGps = false;
    this.eulerAngle = { heading: 0, pitch: 0, roll: 0 };
    this.accel = { x: 0, y: 0, z: 0 };
    this.gyro = { x: 0, y: 0, z: 0 };
    this.mag = { x: 0, y: 0, z: 0 };
    this.gps = { lat: 0, lng: 0 };
    this.button = { event: 0, count: 0 };
    this.wheelSpeed = 0;
    if (this.imuCalibration) {
      delete this.imuCalibration;
    }
  }

  /**
   * MessagePack形式で送信するためのバッファを返す。
   * 並び順に注意！
   * @returns
   */
  getBuffer() {
    return [
      this.hasImu,
      this.hasGps,
      [this.eulerAngle.heading, this.eulerAngle.pitch, this.eulerAngle.roll],
      [this.accel.x, this.accel.y, this.accel.z],
      [this.gyro.x, this.gyro.y, this.gyro.z],
      [this.mag.x, this.mag.y, this.mag.z],
      [this.gps.lat, this.gps.lng],
      [this.button.event, this.button.count],
      this.wheelSpeed,
    ];
  }
}

export const RequestTarget = {
  None: 0,
  Led: "L",
  Imu: "I",
};

export const LedReqParam = {
  Off: "0",
  On: "1",
  Blink1: "2",
  Blink2: "3",
  OnUntilButtonPressed: "4",
  Blink1UntilButtonPressed: "5",
  Blink2UntilButtonPressed: "6",
};

export const ImuReqParam = {
  None: "0",
  GetCalibStatus: "1",
  GetCalibParams: "2",
};

/**
 * マイコンボード制御用のコマンド
 */
export class ControllerReqInfo {
  constructor(target, param) {
    this.target = target != undefined ? target : RequestTarget.None;
    this.param = param != undefined ? param : 0;
  }

  /**
   * マイコンボードへ送信用の文字列を得る。
   * 終端はセミコロン
   * @returns
   */
  getControlString() {
    if (this.target == RequestTarget.None) return ";";
    return this.target + this.param + ";";
  }

  /**
   * MessagePack形式用
   */
  // getBuffer() {
  //   const buf = new Int16Array(2);
  //   buf[0] = this.target;
  //   buf[1] = this.param;
  //   return buf;
  // }
}
