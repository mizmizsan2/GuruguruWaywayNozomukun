### 開発環境

- NEXTRON(Next.js + Electron)
- dotenv
- resium
- cesium
- serialport
- msgpackr
- @react-google-maps/api

関連ソフト
- Python3
- Visual Studio Community

### 実行環境

実行環境の準備は[SETUP.md](SETUP.md)に記載

### 準備

次のコマンドを順番に実行する。
```
yarn
yarn prepare
```

.envファイルにGoogle map APIキー, 使用するシリアルポートを記入する。
参考：dotenvファイル

```
GOOLEMAP_APIKEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SERIALPORT=COMxx

INSTA_BUSINESS_ACCOUNT=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
INSTA_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

プログラム中で、process.env.GOOGLEMAP_APIKEYで参照可能

### 実行（開発）

```
yarn dev
```


### 実行ファイル作成

```
yarn build
```
