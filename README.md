# FTXAR - WebAR 砲兵弾着観測・射撃任務シミュレータ

Webブラウザ（スマホ端末）だけで動作するWebAR（WebGL / WebRTC / デバイスセンサー）と地理空間情報（GIS/MGRS座標・標高データ）を組み合わせ、指定座標に砲弾が着弾・炸裂するエフェクトをAR重畳表示するシステムです。

## 特徴
- **完全ブラウザ動作 (WebAR)**: アプリインストール不要。HTTPS環境（GitHub Pages）でスマホのカメラ実写映像に重畳。
- **かんそくん本体準拠エフェクト**: 爆風・衝撃波ドーム等を排した、リアルな矩形クアッド幾何学的パーティクル（火球、土煙、白煙、弾足）。
- **リアルタイム空間音響**: 距離減衰、音速遅延、周波数ローパスフィルタによる遮蔽・距離感の再現。
- **各個射シミュレーション**: 指定間隔内で各門がランダムな時間差で着弾・炸裂。
- **MGRS HUD & 10ミル単位レティクル**: 軍用規格MGRS座標表示および電子コンパス連動レティクル。
- **ハイブリッド同期システム**: フロントエンド（GitHub Pages）とバックエンド（Google Apps Script Web App API）の連携によるマルチ端末リアルタイム射撃任務同期。

## 公開・稼働環境
- **WebAR フロントエンド (GitHub Pages)**: `https://dexism.github.io/FTXAR/` (または `docs/index.html`)
- **射撃任務共有バックエンド (Google Apps Script API)**: `https://script.google.com/macros/s/AKfycbz25fTqj6svcb-Hp0lYCwu2SO-_3SWLL4TEuGbBahM-8085u1Ar0n3unmJ32thZHmzR_g/exec`

## GitHub Pages 設定手順
1. リポジトリの **Settings** > **Pages** を開きます。
2. **Build and deployment** の **Source** で `Deploy from a branch` を選択します。
3. **Branch** で `main` (または `master`)、フォルダとして `/docs` を選択し、**Save** をクリックします。
4. 数分後、`https://<ユーザー名>.github.io/FTXAR/` にてHTTPS環境でWebARが利用可能になります。

## ビルド方法
```bash
# スタンドアロンHTMLおよび docs/index.html の再生成
node build_standalone.js
```
