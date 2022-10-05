import * as cesium from "cesium";
import { ipcRenderer } from "electron";
import react, { useEffect } from "react";
import * as resium from "resium";
import { ControllerInfo } from "../../libs/controller-info";
import { Controller } from './Controller';
import Data from "./data2.json";

cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYzQyMjQ4My0xZjhiLTQ4MGEtOTdhNy1jYjAzNWFiNDExYTUiLCJpZCI6OTQzNzMsImlhdCI6MTY1MjkyMjE5OH0.1_liv19GGCsU67M7lZHFxgyypVPt4QOxBVylAdGE-VU";

// 仮数値
const cameraOffset = new cesium.Cartesian3(0, 0, 100);
// const startLng = 132.474889;
// const startLat = 34.396923;
let startPosition;
const zoomAmount = 1000;

const data = [];

const origin = cesium.Cartesian3.fromDegrees(132.461605, 34.396923, 100);
const headingPitchRoll = cesium.HeadingPitchRoll.fromDegrees(90, 0, 0);
//const modelMatrix = cesium.Transforms.headingPitchRollToFixedFrame(origin, headingPitchRoll);//.northUpEastToFixedFrame(origin); //.eastNorthUpToFixedFrame(origin);

// ipcRenderer.on("devs", (event, arg) => {
//     console.log(JSON.stringify(arg));
// });

const outerCoreRadius = 3450000;

export default function PageCesium(props) {
  startPosition = cesium.Cartesian3.fromDegrees(props.startLng, props.startLat, 100);

  const [flag, setFlag] = react.useState(false);
  const [speed, setSpeed] = react.useState(0);
  const [cameraPosition, setCameraPosition] = react.useState(cesium.Cartesian3.fromDegrees(props.startLng + 0.02, props.startLat, 10000));
  const [modelMatrix, setModelMatrix] = react.useState(cesium.Transforms.headingPitchRollToFixedFrame(origin, headingPitchRoll));
  let cessta = { zIndex: 3, height: '100%', width: '100%' };

  for (let i = 0; i < 19; i++) {
    //データ配列にピンの情報を入れ込む
    data[i] = { type: "Feature", geometry: { type: "Point", coordinates: cesium.Cartesian3.fromDegrees(Data[i].longitude, Data[i].latitude, 100), }, }
  }

  const pushPage = (LNG, LAT) => {
    props.setLng(LNG);
    props.setLat(LAT);
    props.setState(1);
    setSpeed(0);
    console.log(LNG + 'と' + LAT + 'が呼ばれた');
  };

  const animate = () => {

    var carto = cesium.Ellipsoid.WGS84.cartesianToCartographic(cameraPosition);
    var lon = cesium.Math.toDegrees(carto.longitude) + speed / 2000.0;
    var lat = cesium.Math.toDegrees(carto.latitude);

    let s = Math.abs(speed);
    let htarget = cesium.Math.clamp(s * s * 1000, 10000, 100000000);
    let h = carto.height;
    let z = zoomAmount * Math.max(carto.height / 80000, 1);

    if (carto.height < htarget) {
      h = Math.min(h + z, htarget);
    } else if (carto.height > htarget) {
      h = Math.max(h - z, htarget);
    }

    setCameraPosition(cesium.Cartesian3.fromDegrees(lon, lat, h));
  };

  return (
    <div className="three" style={cessta}>
      <Controller
        onButtonClicked={(count) => {
          console.log(`button clicked : ${count}`);

        }}
        onButtonLongPressed={(count) => {
          console.log(`button long pressed : ${count}`);
        }}
        onWheelChanged={(val) => {
          if (props.state == 0)
            setSpeed(cesium.Math.clamp(speed + val, -100, 100));
        }}
        onUpdateGps={(latlng) => {
          console.log(`gps updated : ${latlng.lat}, ${latlng.lng}`);
        }}
      />
      <div className="point">
        speed = {speed} height={cesium.Ellipsoid.WGS84.cartesianToCartographic(cameraPosition).height}
      </div>
      {/* <button onClick={() => changeSpeed(+10)}>あっぷ</button> */}
      {/* <button onClick={() => changeSpeed(-10)}>だうん</button> */}

      <resium.Viewer>
        {/* 始点 */}
        <resium.Entity name="start" position={startPosition}>
          <resium.BillboardGraphics image="images/pin-yellow.png" scale={0.3} />
        </resium.Entity>

        {/* ライン */}
        <resium.Entity name="line">
          <resium.PolylineCollection>
            <resium.Polyline positions={[startPosition, cameraPosition]} width={5} />
          </resium.PolylineCollection>
        </resium.Entity>

        {/* カメラ位置 */}
        <resium.Entity name="camera" position={cameraPosition}>
          <resium.BillboardGraphics image="images/pin-blue.png" scale={0.3} />
        </resium.Entity>

        {/*データベースからのマーカー*/}

        { 
          (function () {
            const pin = []; //ピンの場所を格納する
            for (let i = 0; i < 19; i++) {                                                 {/*本当は50000*/}
              pin.push(cesium.Ellipsoid.WGS84.cartesianToCartographic(cameraPosition).height < 50000000000 && (
              <resium.Entity onClick={() => pushPage(Data[i].longitude, Data[i].latitude)} name="広島駅" position={data[i].geometry.coordinates}>
                <resium.BillboardGraphics image='images/pin-red.png' scale={0.3} />
              </resium.Entity>
              ));
            }
            return <ul>{pin}</ul>;
          }())
        }        

        <resium.Model url="models/test.glb" modelMatrix={modelMatrix} minimumPixelSize={100} maximumScale={10000} />

        <resium.Camera />
        <resium.CameraLookAt target={cameraPosition} offset={cameraOffset} />

        <resium.Clock
          startTime={cesium.JulianDate.fromIso8601("2013-12-25")}
          currentTime={cesium.JulianDate.fromIso8601("2013-12-25")}
          stopTime={cesium.JulianDate.fromIso8601("2013-12-26")}
          clockRange={cesium.ClockRange.LOOP_STOP}
          clockStep={cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER}
          multiplier={100}
          shouldAnimate
          onTick={() => animate()}
        />
      </resium.Viewer>
    </div>
  );
}