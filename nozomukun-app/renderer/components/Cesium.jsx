import * as cesium from "cesium";
import React, { useState, useEffect } from "react";
import * as resium from "resium";
import { Controller } from './Controller';
import Data from "./data.json";

export default function PageCesium(props) {
  cesium.Ion.defaultAccessToken = process.env.DEFAULTACCESSTOKEN;
  const cameraOffset = new cesium.Cartesian3(0, 0, 100);
  const [startPosition, setStarePosition] = useState(cesium.Cartesian3.fromDegrees(props.startLng, props.startLat, 100));  //GPSから取得した現在地(原点)を格納する
  const zoomAmount = 1000;
  const pinData = []; //表示されるピンの位置情報のデータ

  const [speed, setSpeed] = useState(0);  //Cesium上での移動スピード
  const [pitch, setPitch] = useState(0);  //pitchの値の変更
  const [magLon, setMagLon] = useState(0);
  const [magLat, setMagLat] = useState(0);
  const [cameraPosition, setCameraPosition] = useState(cesium.Cartesian3.fromDegrees(props.startLng, props.startLat, 10000)); //画面で表示される座標と高さ
  let cesiumStyle = { zIndex: 3, height : '1080px', width: '1080px' }; //z-indexの宣言
  let ans;
  const dataNum = 100; //データベースに格納されてある世界遺産データの数

  const [lonA, setLonA] = useState(0);
  const [latA, setLatA] = useState(0);
  const [lastLon, setLastLon] = useState(lonA);

  useEffect(() => {
    console.log("Cesium来たよ");
    setCameraPosition(cesium.Cartesian3.fromDegrees(props.startLng, props.startLat, 10000));
    setStarePosition(cesium.Cartesian3.fromDegrees(props.startLng, props.startLat, 100));
  }, [props.startLng || props.startLat])

  //データ配列にピンの情報を入れ込む
  for (let i = 0; i < dataNum; i++) {
    if (Data[i].longitude != "") {
      pinData[i] = { type: "Feature", geometry: { type: "Point", coordinates: cesium.Cartesian3.fromDegrees(Data[i].longitude, Data[i].latitude, 100), }, }
    }
  }

  const pushPage = (LNG, LAT) => {
    props.setLng(LNG);  //緯度経度をセット
    props.setLat(LAT);
    props.setState(1);  //stateを1にセットする→z-indexでストリートビューの画面を最前面に持ってくる
    setSpeed(0);  //speedを0にし、移動を止める
    console.log(LNG + 'と' + LAT + 'が呼ばれた');
    let firstAns = Math.abs(Math.sqrt((Data[0].longitude - LNG) * (Data[0].longitude - LNG) + (Data[0].latitude - latA) * (Data[0].latitude - latA)));
    let near = firstAns;
    for (let i = 1; i < dataNum; i++) {
      if (Data[i].longitude != "") {
        ans = Math.abs(Math.sqrt((Data[i].longitude - LNG) * (Data[i].longitude - LNG) + (Data[i].latitude - latA) * (Data[i].latitude - latA)));
        if (near > ans) {
          near = ans;
          props.setId(i);
        }
      }
    }
    if (near == firstAns) {
      props.setId(0);
    }
  };

  const animate = () => {
    var carto = cesium.Ellipsoid.WGS84.cartesianToCartographic(cameraPosition);

    setLastLon(lonA);
    setLonA(cesium.Math.toDegrees(carto.longitude) + speed / 1000.0 * magLon);  //斜め移動のための変数magLon,magLat
    setLatA(cesium.Math.toDegrees(carto.latitude) + speed / 1000.0 * magLat);

    let s = Math.abs(speed);
    let htarget = cesium.Math.clamp(s * s * 1000, 10000, 100000000);
    let h = carto.height;
    let z = zoomAmount * Math.max(carto.height / 80000, 1); //高さの最大値と計算

    var n = 7;	// 小数点第n位まで残す

    if (carto.height <= htarget) {
      h = Math.min(h + z, htarget);
    } else if (carto.height >= htarget) {
      h = Math.max(h - z, htarget);
    }

    setCameraPosition(cesium.Cartesian3.fromDegrees(cesium.Math.toDegrees(carto.longitude) + speed / 2000.0 * magLon, cesium.Math.toDegrees(carto.latitude) + speed / 2000.0 * magLat, h));  //カメラ位置を更新
  };

  const [doon, setDoon] = useState(0);

  const doonPic = () => {

    console.log("ドーンの写真出た");

    setDoon(true);

    setTimeout(function () {
      setDoon(false);
    }.bind(this), 3000)
  }



  return (
    <div className="three" style={cesiumStyle}>
      <Controller
        onButtonClicked={(count) => {
          console.log(`button clicked : ${count}`);
          if (props.state == 0 && count == 1) {
            let firstAns2 = Math.abs(Math.sqrt((Data[0].longitude - lonA) * (Data[0].longitude - lonA) + (Data[0].latitude - latA) * (Data[0].latitude - latA)));
            let near2 = firstAns2;
            let lastAns2 = 0;
            let ans2;
            for (let i = 1; i < dataNum; i++) {
              if (Data[i].longitude != "") {
                ans2 = Math.abs(Math.sqrt((Data[i].longitude - lonA) * (Data[i].longitude - lonA) + (Data[i].latitude - latA) * (Data[i].latitude - latA)));
                if (near2 > ans2) {
                  near2 = ans2;
                  lastAns2 = i;
                }
              }
            }
            console.log(near2);
            if (near2 < 1) { //ここの0.5は人のマーカーから世界遺産までの距離
              pushPage(Data[lastAns2].longitude, Data[lastAns2].latitude);
            } else {
              pushPage(lonA, latA);
            }
          }
          if (props.state == 0 && count == 2) {
            setSpeed(0);
          }
        }}
        onButtonLongPressed={(count) => {
          console.log(`button long pressed : ${count}`);
        }}
        onWheelChanged={(val) => {
          if (props.state == 0) { //Cesiumが最前面の場合にエンコーダを回すと実行
            console.log(pitch);
            // if (speed == 0 && pitch <= 0.9) {
            //   let h = cesium.Ellipsoid.WGS84.cartesianToCartographic(cameraPosition).height;
            //   // if (ground == 0 && val > 0) {
            //   setLonA(lonA + 180);
            //   setLatA(-latA);
            //   doonPic();
            //   setCameraPosition(cesium.Cartesian3.fromDegrees(lonA + 180, -latA, h));
            //   //   setGround(1);
            //   //   return;
            //   // } else if (ground == 1 && val < 0) {
            //   //   setLonA(lonA + 180);
            //   //   setLatA(-latA);
            //   //   doonPic();
            //   //   setCameraPosition(cesium.Cartesian3.fromDegrees(lonA + 180, -latA, h));
            //   //   setGround(0);
            //   // }
            // } else {
              setSpeed(cesium.Math.clamp(speed + val, -100, 100));
            // }
          }

        }}
        onUpdateGps={(latlng) => {
          console.log(`gps updated : ${latlng.lat}, ${latlng.lng}`);
        }}
        onEulerAngleChanged={(val) => { //9軸センサに対応して数値が変化する
          if (props.state == 0) {
            if (speed == 0) {
              setPitch(val.pitch*18);
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
     

      <resium.Viewer full>
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
          <resium.BillboardGraphics image={doon ? 'images/dooon.png' : speed == 0 ? "images/x1.png" : lonA < lastLon ? "images/humanLeft.png" : "images/humanRight.png"} scale={0.5} />
        </resium.Entity>

        {/*データベースからのマーカー*/}
        {
          (function () {
            const pin = []; //ピンの場所を格納する
            for (let i = 0; i < dataNum; i++) {
              if (Data[i].longitude != "") {
                pin.push(cesium.Ellipsoid.WGS84.cartesianToCartographic(cameraPosition).height < 50000000 && (
                  <resium.Entity onClick={() => pushPage(Data[i].longitude, Data[i].latitude)} name={Data[i].worldHeritage} position={pinData[i].geometry.coordinates}>
                    <resium.BillboardGraphics image='images/pin-red.png' scale={0.8} />
                  </resium.Entity>
                ));
              }
            }
            return <ul>{pin}</ul>;  //格納されたデータのピンの表示をする
          }())
        }

        <resium.Camera />
        <resium.CameraLookAt target={cameraPosition} offset={cameraOffset} />

        <resium.Clock //Cesium上での時間
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