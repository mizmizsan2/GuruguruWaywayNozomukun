## Raspberry Pi 4のセットアップメモ

### 環境

- OS: DietPi 8.8.1

### OSのインストール

1. 実行用のアカウントを追加
1. wifiの設定
1. sambaの設定

/etc/samba/smb.confに共有フォルダを追加

1. Xのインストール
1. 画面設定
circle_display.shを実行できる場所に置いて、実行権をつける。
~/.config/lxsession/autostartファイルに、circle_display.shを実行するように追記する。

参考：
- https://ubunlog.com/ja/anadir-resolucion-pantalla-personalizada-ubuntu/
- https://ja.linux-console.net/?p=842#gsc.tab=0

カスタム解像度の作り方メモ
```
cvt 1080 1080 60
```
実行結果
```
# 1080x1080 59.97 Hz (CVT) hsync: 67.16 kHz; pclk: 97.25 MHz
Modeline "1080x1080_60.00"   97.25  1080 1152 1264 1448  1080 1083 1093 1120 -hsync +vsync
```
```
xrandr --newmode "1080x1080_60.00"   97.25  1080 1152 1264 1448  1080 1083 1093 1120 -hsync +vsync
xrandr --addmode HDMI-1 1080x1080_60.00
xrandr --output HDMI-1 --mode 1080x1080_60.00
```

ディスプレイの電源オン/オフ
vcgencmd display_power 0 # ディスプレイ OFF
vcgencmd display_power 1 # ディスプレイ ON


### 実行環境の準備

1. libopenjp2*をインストール
```
apt install libopenjp2*
```
1. node.jsのインストール（ネットから最新版をとってくる）
1. yarn

