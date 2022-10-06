import React, { useState, useEffect } from 'react'
import { data } from "./dataChange.jsx";
import { Controller } from './Controller';

class Instagram {
  async getPost() {
    this.version = 'v15.0';
    this.instaBusinessAccount = process.env.INSTA_BUSINESS_ACCOUNT;
    this.instaAccessToken = process.env.INSTA_ACCESS_TOKEN;
    this.query = 'tajmahal';
    //this.query = data.tagName;  //typescriptのほうを修正してjsonを入れなおす。Excelにタグ用のデータも作る（基本は英語名を全部小文字にしてつなげるだけ）
    this.baseUrl = 'https://graph.facebook.com/' + this.version + '/ig_hashtag_search?user_id=' + this.instaBusinessAccount + '&q=' + this.query + '&access_token=' + this.instaAccessToken;
    return this.resJson();
  }

  async resJson() {
    let resId = await fetch(this.baseUrl);
    let tagResult = await resId.json();

    this.tagId = tagResult.data[0].id;
    this.condition = 'top_media'; //人気の投稿
    this.fields = 'media_url,permalink,media_type,children{id,media_type,media_url}';
    this.dataUrl = 'https://graph.facebook.com/' + this.version + '/' + this.tagId + '/' + this.condition + '?user_id=' + this.instaBusinessAccount + '&fields=' + this.fields + '&access_token=' + this.instaAccessToken;

    let resData = await fetch(this.dataUrl);
    let dataResult = await resData.json();

    let insta = [];
    if (dataResult != null) {
      dataResult['data'].forEach(function (info) {
        if (info['media_type'] == 'CAROUSEL_ALBUM') {
          info['children']['data'].forEach(function (infoChildren) {
            if (infoChildren['media_type'] == 'IMAGE') {
              let obj = {};
              obj['link'] = info['permalink'];
              obj['img'] = infoChildren['media_url'];
              insta.push(obj);
            }
          });
        } else if (info['media_type'] == 'IMAGE') {
          let obj = {};
          obj['link'] = info['permalink'];
          obj['img'] = info['media_url'];
          insta.push(obj);
        }
      });
      return insta;
    }
  }
}

export const PageInsta = (props) => {
  let instaStyle;
  if (props.state == 3) {
    instaStyle = { zIndex: 4 };
  } else {
    instaStyle = { zIndex: 0 };
  }

  let [zoom, setZoom] = useState(4);
  let [page, setPage] = useState(1);
  let pageMax = 25;
  let zoomMax = 8;

  let instagram = new Instagram();
  let instaPosts = [];

  let [list, setList] = useState([]);

  let zoomSet = [{ mag: '0.65', num: '1' }, { mag: '0.7', num: '1' }, { mag: '0.75', num: '1' },
  { mag: '0.8', num: '1' }, { mag: '0.85', num: '1' }, { mag: '0.9', num: '1' },
  { mag: '0.95', num: '1' }, { mag: '1', num: '1' }, { mag: '1.05', num: '1' }];
  let mag = zoomSet[zoom].mag;
  let num = zoomSet[zoom].num;
  let numOfDisplay = num * num;
  let backImgFile = `images/backImg/${data.page[page >= data.backImgNum ? data.backImgNum - 1 : page - 1].backImg}.jpg`;  //すべてjpgならこれでいいけどpngとかあるなら.jpgはとってデータベース修正する
  let frameImgStyles = { transform: `rotate(${20 * props.zoom}deg)` };
  let containerStyles = { width: `${100 * mag}%`, height: `${100 * mag}%`, marginTop: `${(1080 - (1080 * mag)) / 2}px` };

  useEffect(() => {
    const f = async () => {
      if (instaPosts = await instagram.getPost()) {
        for (let i = numOfDisplay * (page - 1); i < numOfDisplay * page; i++) {
          if (instaPosts.length < i) {
            break;
          }
          let frameStyles = { width: `${1080 * mag / num}px`, height: `${1080 * mag / num}px` };
          let linkStyles = { width: `${1080 * mag / num}px`, height: `${1080 * mag / num}px` };
          setList(<li style={frameStyles}><a href={instaPosts[i].link} style={linkStyles}><img className="insta-photo" src={instaPosts[i].img} alt="instagramの画像"></img></a></li>);
        }
      }
    }
    f();
  }, [zoom])

  return (
    <div className="three" style={instaStyle}>
      <Controller
        onWheelChanged={(val) => {
          if (props.state == 3 && page >= 1 && page <= pageMax) {
            if (val < 0) {
              if (page <= 1 && zoom <= 0) {
                setZoom(0);
                setPage(1);
              } else {
                setZoom(zoom - 1);
                if (zoom <= 0) {
                  setZoom(4);
                  setPage(page - 1);
                }
              }
            } else if (val > 0) {
              if (page >= 25 && zoom >= zoomMax) {
                setZoom(zoomMax);
                setPage(pageMax);
              } else {
                setZoom(zoom + 1);
                if (zoom >= zoomMax) {
                  setZoom(4);
                  setPage(page + 1);
                }
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
          <ul className="insta-container" style={containerStyles}>
            {list}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PageInsta