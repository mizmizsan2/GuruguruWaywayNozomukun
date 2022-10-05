import React, { useState } from "react"
import { Controller } from '../components/Controller';

import dynamic from "next/dynamic";
const PageCesium = dynamic(() => import("../components/Cesium"), { ssr: false });
const PageStreetView = dynamic(() => import("../components/StreetView"), { ssr: false });
const PageEx = dynamic(() => import("../components/Ex"), { ssr: false });
const PageInsta = dynamic(() => import("../components/Insta"), { ssr: false });


export default function Home() {
  const [state, setState] = useState(0);
  const [lng, setLng] = useState(0);
  const [lat, setLat] = useState(0);

  const [startLat, setStartLat] = useState(0);
  const [startLng, setStartLng] = useState(0);

  return (
    <>
      <Controller
        onButtonClicked={(count) => {
          let loop = 0; // if文の複数回呼び出されないようにするため防止
          if (state == 1 && count == 1) {
            setState(2);
            loop++;
          } else if (state == 2 && count == 1 && loop == 0) {
            setState(3);
            loop++;
          } else if (state == 3 && count == 1 && loop == 0) {
            setState(1);
          }
          loop = 0;
        }}
        onButtonLongPressed={(count) => {
          if (count == 1) {
            setState(0);
          }
        }}
        onUpdate={(info) => {
          //GPSから取得した緯度経度を初期値にセット
          setStartLat(info.gps.lat);
          setStartLng(info.gps.lng);
        }}
      />

      {/*lng={lng} lat={lat}で緯度経度をdataChangeに渡し、説明文やインスタを表示？→緯度経度をdataの中のものと比較するものが必要*/}
      <PageCesium state={state} setState={setState} setLng={setLng} setLat={setLat} startLat={startLat} startLng={startLng}/>
      <PageStreetView state={state} setState={setState} lng={lng} lat={lat} />
      <PageEx state={state} setState={setState} />
      <PageInsta state={state} setState={setState}></PageInsta>
    </>
  )

}
