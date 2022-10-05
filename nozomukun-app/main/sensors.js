/**
 * センサー制御用マイコンとの通信プログラム
 *
 * シリアルポート:
 * Windows -> COM8
 * Raspberry Pi -> /dev/ttyACM0
 *
 * ボーレート: 115200 bps
 *
 * コマンド
 * GET
 */
import { SerialPort } from "serialport";
import { SlipDecoder } from "@serialport/parser-slip-encoder";
import { app, ipcMain } from "electron";
import { unpack } from "msgpackr";
import { ControllerInfo } from "../libs/controller-info";

require("dotenv").config();

// シリアルポートを開く
const port = new SerialPort(
  {
    // windows: .envファイルに記述する->SERIALPORT
    // ラズパイ: /dev/ttyACM0
    path: process.platform == "win32" ? process.env.SERIALPORT : "/dev/ttyACM0",
    baudRate: 115200,
  },
  (err) => {
    if (err) console.log(`Error: ${err.message}`);
  }
);

// シリアルポートから1行読み込むパーサーを用意する
// 行の終わりはLF(0x0a)
// const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

// シリアルポートからのデータを読み込むためにSLIPデコーダを用意する
const slipParser = port.pipe(new SlipDecoder());

port.on("open", () => {
  console.log("SUCCESS: serial port open");
});

// アプリケーション終了時にシリアルポートを閉じておく処理を登録
app.on("quit", () => {
  console.log(`serial port state: ${port.isOpen}`);
  if (port.isOpen) {
    console.log("serial port close!");
    port.close();
  }
});

let ctrlData = new ControllerInfo();

// let dataReceived = false;

// マイコンボードへのコントロールコードの送信
// ラズパイ→マイコンボードのデータは文字列で、終端にセミコロンを付ける
// See: ControllerReqInfo  [libs/controller.js]
// TODO: SLIPエンコーダで送信するようにする
ipcMain.on("ctrcmd", (event, req) => {
  if (req == undefined) return;

  port.write(Buffer.from(req.getControlString()), (error, result) => {
    if (error) {
      console.log("error: " + error);
      console.log("results: " + results);
    }
  });
});

// ipcRendererからリクエストがあったときの処理
ipcMain.on("ctrget", (event, arg) => {
  // if (!dataReceived) {
  //   console.log("not received ctrl data.");
  // }
  event.returnValue = ctrlData;
});

// シリアル通信でデータを受信したときの処理
slipParser.on("data", (data) => {
  const unpackData = unpack(data); // MessagePack形式のデータをデコードする
  ctrlData = new ControllerInfo(unpackData);
  // console.log("data => " + JSON.stringify(ctrlData)); // 確認用

  // キー付きのデータの場合はこっちの処理
  // ctrlData = unpack(data);
});
