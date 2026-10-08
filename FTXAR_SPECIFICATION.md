# FTXAR (Field Training Exercise Augmented Reality) システム仕様書

- **システム名称**: FTXAR (WebAR砲兵弾着観測・射撃任務シミュレータ)
- **ビルドバージョン**: `2610082215`
- **フロントエンド公開環境**: GitHub Pages (`https://dexism.github.io/FTXAR/`)
- **バックエンド基盤**: Google Apps Script (GAS) Web App API + clasp
- **リポジトリ**: `https://github.com/dexism/FTXAR`
- **更新日**: 2026-10-08

---

## 1. システムアーキテクチャ (ハイブリッド構成)

```mermaid
graph TD
    A[スマートフォン端末 (Pixel 11 Pro等)] -->|HTTPS アクセス| B[GitHub Pages (dexism.github.io/FTXAR)]
    B -->|WebRTC カメラ起動| C[背面実写カメラ映像]
    B -->|Three.js WebGL| D[オクルージョン地形 & かんそくん準拠弾着エフェクト]
    B -->|Web Audio API| E[3D空間音響 (距離遅延・減衰・周波数遮蔽)]
    B -->|doGet / doPost API| F[Google Apps Script バックエンド]
    F -->|PropertiesService / Cache| G[共有射撃任務ストア & NTP高精度ミリ秒時刻]
```

### アーキテクチャの利点
1. **カメラアクセスの完全開放**:
   - Google Apps Script の親 iframe 制限や、ローカルファイル（`file://`）の非セキュア制約を完全排除。
   - W3C / WebRTC の Secure Context 仕様を満たす HTTPS 環境（GitHub Pages）から直接カメラ API（`getUserMedia`）を実行。
2. **リアルタイム射撃任務同期**:
   - バックエンドには GAS Web App API を採用し、サーバーレスかつ Google クラウド上で複数端末間の射撃任務共有と時刻同期を実現。

---

## 2. コア機能仕様

### 1. かんそくん本体 (v4 engine_effects.js) 完全準拠 弾着アニメーション
- **不要エフェクトの排除**: 「終末弾道.html」の爆風（ワイヤーフレーム衝撃波ドーム、単一巨大球体メッシュ等）は一切描画しない。
- **矩形クアッド幾何学的パーティクル集約システム**:
  - **火球 (isAirburstFireball)**: 10パーツ球形敷き詰め (中心コア3個 + 外殻7個/火の粉3個)。指数冷却 $E_i = \exp(-t/\tau)$ により白熱芯(0.05s) $\to$ 純橙色(0.15s) $\to$ 鮮烈赤橙色(0.25s) $\to$ 炭化漆黒(0.75-0.85s) + 火の粉点滅(1.30s)。
  - **曳火 (CVT / Ti Airburst)**:
    - 副煙 (isAirburstSecondarySmoke): 20パーツ円錐形 (作動点最大半径 $\to$ 進行方向に先細り), 灰色, 4.5-5.0s
    - 主煙 (isAirburstMainSmoke): 20パーツ水平ドーナツ型, 黒色, 4.5-5.0s, 0.25s高エネルギー閃光照射
    - 地表弾足 (debris): 破裂高 < 30m で地表から10-40パーツ白煙吹き上がり, 2.0-2.5s
  - **着発 (Q Point Detonating)**:
    - 爆発土煙 (isGroundDirtSmoke): 40パーツ, 3D初速+空気抵抗ドラッグ(k=4.5)+重力(0.5G)放物線運動。最大水平10m, 最大高度15m, 爆心0.15s純白 $\to$ 暗灰色, 0.8-1.5s
    - 着発主煙 (isGroundMainSmoke): 24パーツ, 0.3s遅延発生, 半径1.5-7.5m, 黒-深灰色, 5.0s
    - 地表弾足 (debris)
  - **大気気象連動**: Open-Meteo API より弾着地点の風向・風速を取得し、煙パーティクルのドリフトおよび固有上昇気流（1.0 m/s）をリアルタイム物理シミュレート。

### 2. 各個射（ランダム弾着）アルゴリズム
- 斉射（全門同時弾着）ではなく、指定発射間隔（デフォルト 12秒±3秒）内で各門がランダムな時間差で着弾。
- スロット分割＋正規分布ジッターにより、リアルな砲兵各門独立射撃を再現。
- 弾着音も各弾着時刻・距離に応じて空間音響（音速遅延 $t = d/340$、ローパス遮蔽）が個別発火。

### 3. WebAR HUD & レティクル
- **MGRS 座標 HUD**: 自己位置および弾着位置を `54S UE 00,000 - 00,000 H1234` 形式で表示。
- **10ミル単位目盛タクティカルレティクル**: 電子コンパス（DeviceOrientation）に追従し、1x/2x/5x/10x ズーム倍率と完全連動。
- **キャリブレーション**: 著明な山、太陽、月、北極星による電子コンパス補正。
