import * as cesium from "cesium";
import React, { useState } from "react";
import * as resium from "resium";
import { Controller } from './Controller';
import Data from "./data.json";

export default function PageCesium(props) {
  cesium.Ion.defaultAccessToken = process.env.DEFAULTACCESSTOKEN;
  const cameraOffset = new cesium.Cartesian3(0, 0, 100);
  let startPosition;
  const zoomAmount = 1000;
  const pinData = [];
  startPosition = cesium.Cartesian3.fromDegrees(props.startLng, props.startLat, 100);

  const [speed, setSpeed] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [magLon, setMagLon] = useState(0);
  const [magLat, setMagLat] = useState(0);
  const [cameraPosition, setCameraPosition] = useState(cesium.Cartesian3.fromDegrees(props.startLng, props.startLat, 10000));
  let cesiumStyle = { zIndex: 3, height: '100%', width: '100%' };
  let ans;
  const dataNum = 24;

  //データ配列にピンの情報を入れ込む
  for (let i = 0; i < dataNum; i++) {
    if (Data[i].longitude != "") {
      pinData[i] = { type: "Feature", geometry: { type: "Point", coordinates: cesium.Cartesian3.fromDegrees(Data[i].longitude, Data[i].latitude, 100), }, }
    }
  }

  const pushPage = (LNG, LAT) => {
    props.setLng(LNG);
    props.setLat(LAT);
    props.setState(1);
    setSpeed(0);
    console.log(LNG + 'と' + LAT + 'が呼ばれた');
    let firstAns = Math.abs(Math.sqrt((Data[0].longitude - LNG)*(Data[0].longitude - LNG)+(Data[0].latitude - LAT)*(Data[0].latitude - LAT)));
    let near = firstAns;
    for (let i = 1; i < dataNum; i++) {
      if (Data[i].longitude != "") {
        ans = Math.abs(Math.sqrt((Data[i].longitude - LNG)*(Data[i].longitude - LNG)+(Data[i].latitude - LAT)*(Data[i].latitude - LAT)));
        if(near > ans){
        near = ans;
        props.setId(i);
        }
      }
    }
    if(near == firstAns){
      props.id(0);
    }
  };

  const animate = () => {
    var carto = cesium.Ellipsoid.WGS84.cartesianToCartographic(cameraPosition);
    var lon = cesium.Math.toDegrees(carto.longitude) + speed / 2000.0 *magLon;
    var lat = cesium.Math.toDegrees(carto.latitude) + speed / 2000.0 *magLat;

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
    <div className="three" style={cesiumStyle}>
      <Controller
        onButtonClicked={(count) => {
          console.log(`button clicked : ${count}`);

        }}
        onButtonLongPressed={(count) => {
          console.log(`button long pressed : ${count}`);
        }}
        onWheelChanged={(val) => {
          if (props.state == 0) {
            setSpeed(cesium.Math.clamp(speed + val, -100, 100));
          }
        }}
        onUpdateGps={(latlng) => {
          console.log(`gps updated : ${latlng.lat}, ${latlng.lng}`);
        }}
        onEulerAngleChanged={(val) => {
          if (props.state == 0) {
            if (speed == 0) {
              setPitch(val.pitch);
            }
          }
        }}
        onMagChanged={(val) => {
          if (props.state == 0) {
              setMagLon(val.x);
              setMagLat(val.y);
          }
        }}
      />
      <div className="point">
        speed = {speed} height={cesium.Ellipsoid.WGS84.cartesianToCartographic(cameraPosition).height}
      </div>

      <resium.Viewer>
        {/* 始点 */}
        <resium.Entity name="start" position={startPosition}>
          <resium.BillboardGraphics image="images/pin-blue.png" scale={0.8} />
        </resium.Entity>

        {/* ライン */}
        <resium.Entity name="line">
          <resium.PolylineCollection>
            <resium.Polyline positions={[startPosition, cameraPosition]} width={5} />
          </resium.PolylineCollection>
        </resium.Entity>

        {/* カメラ位置 */}
        <resium.Entity name="camera" position={cameraPosition}>
          <resium.BillboardGraphics image={speed < 0 ? "images/humanLeft.png" : "images/humanRight.png"} scale={0.5} />
        </resium.Entity>

        {/*データベースからのマーカー*/}
        {
          (function () {
            const pin = []; //ピンの場所を格納する
            for (let i = 0; i < dataNum; i++) {
              if (Data[i].longitude != "") {
                pin.push(cesium.Ellipsoid.WGS84.cartesianToCartographic(cameraPosition).height < 50000000 && (  //500000
                  <resium.Entity onClick={() => pushPage(Data[i].longitude, Data[i].latitude)} name={Data[i].worldHeritage} position={pinData[i].geometry.coordinates}>
                    <resium.BillboardGraphics image='images/pin-red.png' scale={0.8} />
                  </resium.Entity>
                ));
              }
            }
            return <ul>{pin}</ul>;
          }())
        }

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