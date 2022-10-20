import { ipcRenderer } from "electron";
import react from "react";
import { useInterval } from "react-timers-hooks";
import { ButtonEvent } from "../../libs/controller-info";

// ちょっと保存用
let lastLatLng = { lat: 0, lng: 0 };
let lastWheelSpeed = 0;
let lastHeading = 0;
let lastPitch = 0;
let lastRoll = 0;
let lastX = 0;
let lastY = 1;
let lastZ = 0;

/**
 * <ControllerInfo>コンポーネント
 * 指定できる属性:
 * enabled: boolean (default: true)
 * onButtonClicked: function(count, ControllerInfo)
 * onButtonLongPressed: function(count, ControllerInfo))
 * onUpdateWheel: function(speed, ControllerInfo)
 * onUpdateGps: function(ControllerInfo)
 * onUpdate: function(ControllerInfo)
 *
 * @param {*} props
 * @returns
 */
export function Controller(props) {
  const [interval, setInterval] = react.useState(100);
  //  const [latlng, setLatLng] = react.useState({lat: 0, lng: 0});

  react.useEffect(() => {
    if (props.enabled != undefined) {
      if (props.enabled == false) {
        setInterval(null);
      }
    }
  }, [props]);

  useInterval(() => {
    const result = ipcRenderer.sendSync("ctrget");

    if (result.button.event == ButtonEvent.Clicked) {
      if (props.onButtonClicked) props.onButtonClicked(result.button.count, result);
    } else if (result.button.event == ButtonEvent.LongPressed) {
      if (props.onButtonLongPressed) props.onButtonLongPressed(result.button.count, result);
    }

    if (result.wheelSpeed != lastWheelSpeed || result.wheelSpeed != 0) {
      lastWheelSpeed = result.wheelSpeed;
      if (props.onWheelChanged) props.onWheelChanged(result.wheelSpeed, result);
    }

    if (result.gps.lat != lastLatLng.lat || result.gps.lng != lastLatLng.lng) {
      lastLatLng = result.gps;
      if (props.onUpdateGps) result.onUpdateGps(latlng, result);
    }

    if (props.onUpdate) props.onUpdate(result);

    if (result.eulerAngle.heading != lastHeading || result.eulerAngle.pitch != lastPitch || result.eulerAngle.roll != lastRoll || result.eulerAngle.heading != 0 || result.eulerAngle.pitch != 0 || result.eulerAngle.roll != 0) {   //後で修正
      lastHeading = result.eulerAngle.heading;
      lastPitch = result.eulerAngle.pitch;
      lastRoll = result.eulerAngle.roll;
      if (props.onEulerAngleChanged) props.onEulerAngleChanged(result.eulerAngle, result);
    }

    if (result.mag.x != lastX || result.mag.y != lastY || result.mag.z != lastZ || result.mag.x != 0 || result.mag.y != 0 || result.mag.z != 0) {   //後で修正
      lastX = result.mag.x;
      lastY = result.mag.y;
      lastZ = result.mag.z;
      if (props.onMagChanged) props.onMagChanged(result.mag, result);
    }
  }, interval);

  return ;
}
