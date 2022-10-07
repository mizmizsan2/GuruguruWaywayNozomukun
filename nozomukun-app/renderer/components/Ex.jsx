import React, { useState, useEffect } from "react"
import data  from "./data.json";
import { Controller } from './Controller';

export const PageEx = (props) => {
  let exStyle;  //z-indexの宣言
  if (props.state == 2) {
    exStyle = { zIndex: 4 };
  } else {
    exStyle = { zIndex: 1 };
  }

  let [zoom, setZoom] = useState(0);  //回転量の変数

  let flagFile = `images/flag/${data[props.id].flag}.png`;
  let backImgFile = `images/backImg/${data[props.id].page[zoom].backImg}.jpg`;
  let frameImgStyles = { transform: `rotate(${20 * zoom}deg)` };

  let [typeC, setTypeC] = useState([]);
  let [typeN, setTypeN] = useState([]);
  let [typeM, setTypeM] = useState([]);
  let [typeD, setTypeD] = useState([]);

  useEffect(() => {
    if (data[props.id].cnmType == "C") {
      setTypeC(<div id="category1" className="category categoryC">文化遺産</div>);
    } else if (data[props.id].cnmType == "N") {
      setTypeN(<div id="category1" className="category categoryN">自然遺産</div>);
    } else if (data[props.id].cnmType == "M") {
      setTypeM(<div id="category1" className="category categoryM">複合遺産</div>);
    }

    if (data[props.id].kiki == "1") {
      setTypeD(<div id="category2" className="category categoryD">危機遺産</div>);
    } else {
      setTypeD(<div id="category2" className="category"></div>);
    }
  }, [])

  let potis = [];
  for (let i = 0; i < data[props.id].exNum; i++) {
    potis.push('・');
  }
  let potiList = potis.map((poti, index) => {
    return <div className={index == zoom ? "poti white" : "poti black"} key={index}>{poti}</div>
  })

  return (
    <div className="three" style={exStyle}>
      <Controller
        onWheelChanged={(val) => {  //説明文が最前面でエンコーダが回されると呼び出される
          if (props.state == 2 && zoom >= 0 && zoom <= data[props.id].exNum) {
            if (val < 0) {
              if (zoom <= 0) {
                setZoom(0);
              } else {
                setZoom(zoom - 1);
              }
            } else if (val > 0) {
              if (zoom >= data[props.id].exNum - 1) {
                setZoom(data[props.id].exNum - 1);
              } else {
                setZoom(zoom + 1);
              }
            }
          }
        }}
      />
      <div className="circle">
        <div className="layer-background">
          <img src={backImgFile} className="backImg" />
          <img src="images/frame.png" id="frameImg" style={frameImgStyles} />
        </div>
        <div className="layer-content">
          <div id="header" className="oya">
            <div className="ko1">
              <div id="title">{data[props.id].worldHeritage}</div>
              <div id="subtitle">{data[props.id].page[zoom].subTitle}</div>
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
                  <div id="country">{data[props.id].country}</div>
                  <div id="area">{data[props.id].state}</div>
                </div>
              </div>
            </div>
          </div>
          <div id="document">
            {data[props.id].page[zoom].ex}
          </div>
        </div>
        <div id="potiFrame">
          {potiList}
        </div>
        <div id="author">{data[props.id].page[zoom].photoBy}</div>
        <div id="copyright">{data[props.id].page[zoom].copyRight}</div>
      </div>
    </div>
  )
}

export default PageEx