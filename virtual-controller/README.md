## 仮想コントローラ

開発用のコントローラ

1. [extrasフォルダ](extras/driver/)のWindows用の仮想シリアルポートをインストールしておく。

   インストール方法はこっち → [extras/driver/README.md](extras/driver/README.md)

1. `.env`ファイルを作成する。

   ```
   SERIALPORT=COMxx
   ```

   例）仮想シリアルポートがCOM7とCOM8の場合

   COM7とCOM8の間が仮想シリアルポートで繋がっているので、表のようにそれぞれのアプリの使用ポートとして設定すると使えるようになる。
      
   |    |    |
   |--------------------|------|
   | virtual-controller | COM7 |
   | nozomukun-app | COM8 |

