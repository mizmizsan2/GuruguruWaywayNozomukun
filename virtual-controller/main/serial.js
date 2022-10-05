import { SerialPort } from "serialport";
import { SlipEncoder } from "@serialport/parser-slip-encoder";
import { app, ipcMain } from "electron";
import { unpack, pack } from "msgpackr";
import { ControllerInfo } from "../libs/controller-info";
import { promisify } from "node:util";
var bulk = require("bulk-write-stream");

require("dotenv").config();

console.log(process.env.SERIALPORT);

const port = new SerialPort(
  {
    path: process.env.SERIALPORT,
    baudRate: 115200,
    usePromises: true,
  },
  (err) => {
    if (err) console.log(`Error: ${err.message}`);
  }
);

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

const { Readable, pipeline } = require("node:stream");

export default function toReadableStream(value) {
  return new ReadableStream({
    read() {
      this.push(value);
      this.push(null);
    },
  });
}

ipcMain.handle("senddata", async (event, info, buffer) => {
  if (port.isOpen) {
    //const packdata = pack(info.getBuffer());
    //   const inf = new ControllerInfo(info);
    const packdata = pack(buffer);
    const stream = Readable.from(packdata);
    // // const stream = toReadableStream(packdata);
    const encoder = stream.pipe(new SlipEncoder());
    // encoder.pipe(process.stdout);
    //    await encoder.pipe(port);

    let encoded;
    let ws = bulk.obj((list) => {
      // let propertyArray = Object.entries(list);
      // console.log(JSON.stringify(propertyArray));
      // console.log(list[0].length);
      encoded = Buffer.alloc(list[0].length);
      list[0].copy(encoded, 0, 0);
      port.write(encoded);
    });
    
    encoder.pipe(ws);

    // stream.pipe(new SlipEncoder()).pipe(port);

    // let p = promisify(pipeline(stream, new SlipEncoder, port, ()=>{}));
    // await p(".");

    // encoder.pipe(port);
    // console.log(encoder);
    return "ok";
  } else return "not open";
});
