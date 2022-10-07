import React, { useEffect } from "react";
import { GoogleMap, useLoadScript, StreetViewPanorama } from "@react-google-maps/api";
import { Controller } from './Controller';
import { waitUntilSymbol } from "next/dist/server/web/spec-extension/fetch-event";
import { sampleTerrainMostDetailed } from "cesium";

//GoogleMapの画面サイズ
const containerStyle = {
  width: "1080px",
  height: "1080px",
};

export default function PageStreetView(props) {

  let target;
  let panoramA; //StreetViewPanoramaクラスを一時的に保存する変数
  let Links;  //ストリートビューの１画面に進める方向の数

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLEMAP_APIKEY, 
  });
  const [isMapLoaded, setIsMapLoaded] = React.useState(false);
  let streetViewStyle;  //z-indexの宣言
  if (props.state == 1) {
    target = <StreetViewPanorama position={{ lat: props.lat, lng: props.lng }} visible={true} onLoad={panorama => onLoadPanorama(panorama)} />;
    streetViewStyle = { zIndex: 4, height: '100%', width: '100%' };
  } else {
    streetViewStyle = { zIndex: 2, height: '100%', width: '100%' };
  }

  const onLoadPanorama = (panorama) => {
    //ストリートビューがロードされたら引数panoramaをグローバル変数panoramAに入れる
    //エラー防止
    panoramA = panorama;
  }

  const renderMap = () => {
    const onLoad = async () => {
      await (500); // GoogleMapが表示されるまでちょっと待ってあげる
      setIsMapLoaded(true); // 待った後にStreetViewPanoramaをセットする
    }
    return (
      <div className="three" style={streetViewStyle}>
        <Controller
          onEulerAngleChanged={(val) => {
            if (props.state == 1) {
              panoramA.setPov({
                heading: val.heading,
                pitch: val.pitch,
                // roll: val.roll
              });
            }
          }}
          onWheelChanged={(val) => {
            if (props.state == 1 && val >= 0) {
              console.log(panoramA.links);
              Links = panoramA.links;
              let streetTarget = 0;
              //リンクがない場合は何もしない
              if (Links.length >= 1) {
                let near = 360;
                let currentPov = panoramA.getPov();

                //現在向ている方向に近いlinkを選択
                Links.forEach(function (element, index) {
                  let ans = Math.abs(currentPov.heading - element.heading);
                  if (near > ans) {
                    near = ans;
                    console.log(Links);
                    streetTarget = index;
                  }
                });
                // 次に移動するLink先に向きを変える
                panoramA.setPov({
                  heading: Links[streetTarget].heading,
                  pitch: 0
                });
                // 次のストリートビューに移動する
                panoramA.setPano(Links[streetTarget]['pano']);
              }
            }
          }}
        />

        <GoogleMap id="circle-example" mapContainerStyle={containerStyle} zoom={14} center={{ lat: props.lat, lng: props.lng }} onLoad={() => onLoad()}>
          {isMapLoaded ? target : <></>}
        </GoogleMap>
      </div>
    );
  };
  if (loadError) {
    return <div>えらー…ぐーぐるまっぷが読み込めませんよ</div>;
  }
  return isLoaded ? renderMap() : <div>ろーでぃんぐ</div>;
}
