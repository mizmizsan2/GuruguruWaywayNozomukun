import React from "react";
import Head from "next/head";
import Link from "next/link";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Button, TextField } from "@mui/material";
import { useInterval } from "react-timers-hooks";
import { ButtonEvent, ControllerInfo } from "../../libs/controller-info";
import { ipcRenderer } from "electron";

const marksDirection = [
  { value: -180, label: "南" },
  { value: -90, label: "西" },
  { value: 0, label: "北" },
  { value: 90, label: "東" },
  { value: 180, label: "南" },
];

const marksEulerAngles = [
  { value: -180, label: "-180" },
  { value: -90, label: "-180" },
  { value: 0, label: "0" },
  { value: 90, label: "90" },
  { value: 180, label: "180" },
];

function valuetext(value) {
  return `${value}`;
}

function Home() {
  // console.log("HOME: " + process.env.SERIALPORT);
  const [sendingIndicator, setSendingInidicator] = React.useState(false);
  const [direction, setDirection] = React.useState(0);
  const [heading, setHeading] = React.useState(0);
  const [pitch, setPitch] = React.useState(0);
  const [lat, setLat] = React.useState(34.253129);
  const [lng, setLng] = React.useState(132.904293);
  const [wheelSpeed, setWheelSpeed] = React.useState(0);
  const [controllerInfo, setControllerInfo] = React.useState(new ControllerInfo());

  /**
   * 方向を変えたとき
   * @param {*} event
   * @param {*} newValue
   */
  const onChangeDirection = (event, newValue) => {
    let inf = controllerInfo.clone();
    inf.mag.y = Math.cos(newValue * Math.PI / 180);
    inf.mag.x = Math.sin(newValue * Math.PI / 180);
    setControllerInfo(inf);
    setDirection(newValue);
  };

  /**
   * Headingを変えたとき
   * @param {*} event
   * @param {*} newValue
   */
  const onChangeHeading = (event, newValue) => {
    let inf = controllerInfo.clone();
    inf.eulerAngle.heading = newValue;
    setControllerInfo(inf);
    setHeading(newValue);
  };

  /**
   * Pitchを変えたとき
   * @param {*} event
   * @param {*} newValue
   */
  const onChangePitch = (event, newValue) => {
    let inf = controllerInfo.clone();
    inf.eulerAngle.pitch = newValue;
    setControllerInfo(inf);
    setPitch(newValue);
  };

  /**
   * Latのテキスト入力の値を変更
   * controllerInfoの反映はボタンを押したときにする
   * @param {*} event
   */
  const onChangeLat = (event) => {
    setLat(Number.parseFloat(event.target.value));
  };

  /**
   * Lngのテキスト入力の値を変更
   * controllerInfoの反映はボタンを押したときにする
   * @param {*} event
   */
  const onChangeLng = (event) => {
    setLng(Number.parseFloat(event.target.value));
  };

  /**
   * Lat,Lngのテキスト入力値をcontrollerInfoに反映させる
   */
  const onUpdateLatLng = () => {
    let inf = controllerInfo.clone();
    inf.gps.lat = lat;
    inf.gps.lng = lng;
    setControllerInfo(inf);
  };

  /**
   * wheelを変えたとき
   * @param {*} event
   * @param {*} newValue
   */
  const onChangeWheelSpeed = (event, newValue) => {
    let inf = controllerInfo.clone();
    inf.wheelSpeed = newValue;
    setControllerInfo(inf);
    setWheelSpeed(newValue);
  };

  /**
   * wheelのスライダーのドラッグをやめたときに自動的に0に戻す。
   * @param {*} event
   * @param {*} newValue
   */
  const onChangeCommittedWheelSpeed = (event, newValue) => {
    let inf = controllerInfo.clone();
    inf.wheelSpeed = 0;
    setControllerInfo(inf);
    setWheelSpeed(0);
  };

  /**
   * ボタンのクリックイベント
   * @param {*} count クリック回数
   */
  const onClickButton = (count) => {
    let inf = controllerInfo.clone();
    inf.button.event = ButtonEvent.Clicked;
    inf.button.count = count;
    setControllerInfo(inf);
  };

  /**
   * ボタンの長押しイベント
   * @param {*} count クリック回数
   */
  const onLongPressButton = (count) => {
    let inf = controllerInfo.clone();
    inf.button.event = ButtonEvent.LongPressed;
    inf.button.count = count;
    setControllerInfo(inf);
  };

  /**
   * コントローラの状態を送信する。100ミリ秒毎に呼び出される。
   */
  useInterval(async () => {
    setSendingInidicator(!sendingIndicator);
    
    // メインプロセスにコントローラの情報を送信！シリアル転送してもらう
    const result = await ipcRenderer.invoke("senddata", controllerInfo, controllerInfo.getBuffer());
    console.log(`result => ${result}`);

    // ボタンイベントは一回だけ送信なのでクリアしておく
    let inf = controllerInfo.clone();
    inf.button.event = ButtonEvent.None;
    inf.button.count = 0;
    setControllerInfo(inf);
  }, 100);

  return (
    <React.Fragment>
      <Head>
        <title>virtual-controller</title>
      </Head>
      <div>
        <Box sx={{ width: 250 }}>
          <Grid container>
            <Grid item xs={6}>
              送信中: {sendingIndicator ? "●" : "○"}
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained">開始</Button>
            </Grid>
          </Grid>
          <pre>{JSON.stringify(controllerInfo, null, "\t")}</pre>
        </Box>
        <Box sx={{ width: 250 }}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Slider
                aria-label="Custom marks"
                defaultValue={20}
                getAriaValueText={valuetext}
                valueLabelDisplay="auto"
                marks={marksDirection}
                max={180}
                min={-180}
                value={direction}
                onChange={onChangeDirection}
              />
            </Grid>
            <Grid item xs={4}>
              方位
            </Grid>
            <Grid item xs={8}>
              <Slider
                aria-label="Custom marks"
                defaultValue={20}
                getAriaValueText={valuetext}
                valueLabelDisplay="auto"
                marks={marksEulerAngles}
                max={180}
                min={-180}
                value={heading}
                onChange={onChangeHeading}
              />
            </Grid>
            <Grid item xs={4}>
              Heading
            </Grid>
            <Grid item xs={8}>
              <Slider
                aria-label="Custom marks"
                defaultValue={20}
                getAriaValueText={valuetext}
                valueLabelDisplay="auto"
                marks={marksEulerAngles}
                max={180}
                min={-180}
                value={pitch}
                onChange={onChangePitch}
              />
            </Grid>
            <Grid item xs={4}>
              Pitch
            </Grid>
            <Grid item xs={6}>
              <TextField label="lat" variant="standard" value={lat} onChange={onChangeLat} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="lng" variant="standard" value={lng} onChange={onChangeLng} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" style={{ width: "100%" }} onClick={onUpdateLatLng}>
                緯度経度有効
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" style={{ width: "100%" }} onClick={() => onClickButton(1)}>
                クリック1
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" style={{ width: "100%" }} onClick={() => onClickButton(2)}>
                クリック2
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" style={{ width: "100%" }} onClick={() => onLongPressButton(1)}>
                長押し1
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" style={{ width: "100%" }} onClick={() => onLongPressButton(2)}>
                長押し2
              </Button>
            </Grid>
            <Grid item xs={8}>
              <Slider
                defaultValue={0}
                valueLabelDisplay="auto"
                max={20}
                min={-20}
                value={wheelSpeed}
                onChange={onChangeWheelSpeed}
                onChangeCommitted={onChangeCommittedWheelSpeed}
              />
            </Grid>
            <Grid item xs={4}>
              Wheel
            </Grid>
          </Grid>
        </Box>
      </div>
    </React.Fragment>
  );
}

export default Home;
