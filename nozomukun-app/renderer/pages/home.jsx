import React, { useState } from "react"
import { Controller } from '../components/Controller';

import dynamic from "next/dynamic";
const PageCesium = dynamic(() => import("../components/Cesium"), { ssr: false });
const PageStreetView = dynamic(() => import("../components/StreetView"), { ssr: false });
const PageEx = dynamic(() => import("../components/Ex"), { ssr: false });
const PageInsta = dynamic(() => import("../components/Insta"), { ssr: false });
const PageSetting = dynamic(() => import("../components/Setting"), { ssr: false });


export default function Home() {
  const [end, setEnd] = useState(0);
  const [state, setState] = useState(0);  //画面の状態
  const [lng, setLng] = useState(0);  //緯度経度のデータ
  const [lat, setLat] = useState(0);  //

  const [startLat, setStartLat] = useState(36.318130);  //GPSから取得した緯度経度の初期値
  const [startLng, setStartLng] = useState(139.020929);  //

  const [id, setId] = useState(0);

  const [agoState, setAgoState] = useState(0);

  if (end == 0) {
    return (
      <>
        <Controller
          onButtonClicked={(count) => {
            if (state == 1 && count == 1) {
              setState(2);
              return;
            } else if (state == 2 && count == 1) {
              setState(3);
              return;
            } else if (state == 3 && count == 1) {
              setState(1);
            }
          }}
          onButtonLongPressed={(count) => {
            if (count == 1 && state != -1) {
              setState(0);
            }

            if (count == 3 && state != -1) {
              setAgoState(state);
              setState(-1);
            }
          }}
          onUpdateGPS={(info) => {
            //GPSから取得した緯度経度を初期値にセット
              setStartLat(info.lat);
              setStartLng(info.lng);
          }}
          onUpdate={(info) => {
            console.log(JSON.stringify(info))
          }}
        />


        {/*lng={lng} lat={lat}で緯度経度をdataChangeに渡し、説明文やインスタを表示？→緯度経度をdataの中のものと比較するものが必要*/}
        <PageCesium state={state} setState={setState} setLng={setLng} setLat={setLat} startLat={startLat} startLng={startLng} setId={setId} />
        <PageStreetView state={state} setState={setState} lng={lng} lat={lat} />
        <PageEx state={state} setState={setState} id={id} />
        <PageInsta state={state} setState={setState} id={id} />

        <PageSetting state={state} setState={setState} setStartLat={setStartLat} setStartLng={setStartLng} setEnd={setEnd} agoState={agoState} />
      </>
    )
  }

  if (end == 1) {
    return;
  }

}
