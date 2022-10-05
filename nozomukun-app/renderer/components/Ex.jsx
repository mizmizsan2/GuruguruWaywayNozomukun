import React, { useState, useEffect } from "react"
import { data } from "./dataChange.jsx";
import { Controller } from './Controller';


let expsta;

export const PageEx = (props) => {
  if (props.state == 2) {
    expsta = { zIndex: 4 };
  } else {
    expsta = { zIndex: 1 };
  }

  let [zoom, setZoom] = useState(0);

  //jsonはファイル名だけだからパスと拡張子も付け足す
  let flagFile = `images/flag/${data.flag}.png`;
  let backImgFile = `images/backImg/${data.page[zoom].backImg}.jpg`;  //すべてjpgならこれでいいけどpngとかあるなら.jpgはとってデータベース修正する
  let frameImgStyles = { transform: `rotate(${20 * zoom}deg)` };

  //cnmTypeで判定し、カテゴリーをつける(危機遺産はデータベース側を整えていないため保留)
  let [typeC, setTypeC] = useState([]);
  let [typeN, setTypeN] = useState([]);
  let [typeM, setTypeM] = useState([]);
  let [typeD, setTypeD] = useState([]);

  useEffect(() => {
    if (data.cnmType == "C") {
      setTypeC(<div id="category1" className="category categoryC">文化遺産</div>);
    } else if (data.cnmType == "N") {
      setTypeN(<div id="category1" className="category categoryN">自然遺産</div>);
    } else if (data.cnmType == "M") {
      setTypeM(<div id="category1" className="category categoryM">複合遺産</div>);
    }

    if (data.kiki == "1") {
      setTypeD(<div id="category2" className="category categoryD">危機遺産</div>);
    } else {
      setTypeD(<div id="category2" className="category"></div>);
    }
  }, [])

  let potis = [];
  for (let i = 0; i < data.exNum; i++) {
    potis.push('・');
  }
  let potiList = potis.map((poti, index) => {
    return <div className={index == zoom ? "poti white" : "poti black"} key={index}>{poti}</div>
  })

  return (
    <div className="three" style={expsta}>
      <Controller
        onWheelChanged={(val) => {  //valは加速度と仮定する
          if (props.state == 2 && zoom >= 0 && zoom <= 1) { //zoom < ページ上限
            if (val < 0) {
              if (zoom <= 0) {  //zoom <= ページ上限
                setZoom(0);     //setZoom(ページ上限)
              } else {
                setZoom(zoom - 1);
              }
            } else if (val > 0) {
              if (zoom >= data.exNum - 1) {
                setZoom(data.exNum - 1);
              } else {
                setZoom(zoom + 1);
              }
            }
            console.log(val);
            console.log(zoom);
          }
        }}
      />
      <div className="circle">
        <div className="layer-background">
          <img src={backImgFile} className="backImg" />
          {/* <img src={frameImg} id="frameImg" style={frameImgStyles} /> */}
          <img src="images/frame.png" id="frameImg" style={frameImgStyles} />
        </div>
        <div className="layer-content">
          <div id="header" className="oya">
            <div className="ko1">
              <div id="title">{data.worldHeritage}</div>
              <div id="subtitle">{data.page[zoom].subTitle}</div>
            </div>
            <div className="ko2">
              <div className="ko3">
                <div id="category">
                  {typeC}
                  {typeN}
                  {typeM}
                  {typeD}
                </div>
                <div className="ko4">
                  <div id="flagFrame"><img src={flagFile} id="flag" /></div>
                  <div id="country">{data.country}</div>
                  <div id="area">{data.state}</div>
                </div>
              </div>
            </div>
          </div>
          <div id="document">
            {data.page[zoom].ex}
          </div>
        </div>
        <div id="potiFrame">
          {potiList}
        </div>
        <div id="author">{data.page[zoom].photoBy}</div>
        <div id="copyright">{data.page[zoom].copyRight}</div>
      </div>
    </div>
  )
}

export default PageEx