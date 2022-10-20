import React, { useState, useEffect } from "react"

import { Controller } from '../components/Controller';


export default function PageSetting(props) {
    let SettingStyle;

    const [handle, setHandle] = useState(0);

    if (props.state == -1) {
        SettingStyle = { zIndex: 4 };
    } else {
        SettingStyle = { zIndex: 1 };
    }

    const startPlace = (lat, lng) => {
        console.log("初期地点セットされました")
        props.setStartLat(lat);
        props.setStartLng(lng);
        props.setState(0);
    }

    const shutdown = () => {
        props.setEnd(1);
    }

    const back = () => {
        props.setState(props.agoState);
    }

    const [tokyoStyle, setTokyoStyle] = useState("selectSetButton");
    const [gmesseStyle, setGmesseStyle] = useState("setButton");
    const [hiroshimaStyle, setHiroshimaStyle] = useState("setButton");
    const [endStyle, setEndStyle] = useState("setButton");
    const [backStyle, setBackStyle] = useState("setButton");


    return (
        <div className="three">
            <Controller
                onButtonClicked={() => {
                    if (props.state == -1) {
                        if (handle == 0) {
                            startPlace(35.6809591, 139.7673068)
                            return;
                        } else if (handle == 1) {
                            startPlace(36.318130, 139.020929)
                            return;
                        } else if (handle == 2) {
                            startPlace(34.3976198, 132.4753631)
                            return;
                        } else if (handle == 3) {
                            shutdown()
                            return;
                        } else if (handle == 4) {
                            back()
                        }
                    }
                }}
                onWheelChanged={(val) => {
                    if (val > 0) {
                        if (handle == 0) {
                            setTokyoStyle("setButton");
                            setGmesseStyle("selectSetButton");
                            setHandle(1);
                            return;
                        } else if (handle == 1) {
                            setGmesseStyle("setButton");
                            setHiroshimaStyle("selectSetButton");
                            setHandle(2);
                            return;
                        } else if (handle == 2) {
                            setHiroshimaStyle("setButton");
                            setEndStyle("selectSetButton");
                            setHandle(3);
                            return;
                        } else if (handle == 3) {
                            setEndStyle("setButton");
                            setBackStyle("selectSetButton");
                            setHandle(4);
                            return;
                        } else if (handle == 4) {
                            setTokyoStyle("selectSetButton");
                            setBackStyle("setButton");
                            setHandle(0);
                        }
                    }
                }}
            />
            <div className="circle" style={SettingStyle}>
                <div>設定画面</div>
                <div className="someSetButtun">
                    <button className={tokyoStyle} onClick={() => startPlace(35.6809591, 139.7673068)}>初期地点選択(東京駅)</button>
                    <button className={gmesseStyle} onClick={() => startPlace(36.318130, 139.020929)}>初期地点選択(Gメッセ群馬)</button>
                    <button className={hiroshimaStyle} onClick={() => startPlace(34.3976198, 132.4753631)}>初期地点選択(広島駅)</button>
                    <button className={endStyle} onClick={() => shutdown()}>アプリの終了</button>
                    <button className={backStyle} onClick={() => back()}>戻る</button>
                </div>
            </div>
        </div>
    )
}