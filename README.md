# JPREP LA350 英単語学習アプリ — セットアップ手順

## 必要環境
- Node.js 20 以上（https://nodejs.org からインストール）
- npm 10 以上（Node.js に同梱）

## 起動手順

```powershell
# 1. このフォルダをターミナル（PowerShell）で開く
cd "英単語暗記ツール開発環境\app"

# 2. パッケージをインストール（初回のみ・数分かかります）
npm install

# 3. 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:5173 が自動で開きます。

## ビルド（Netlify デプロイ用）

```powershell
npm run build
# dist/ フォルダが生成される → Netlify にドロップ or 自動デプロイ
```

## 技術スタック
- React 18 + TypeScript 5
- Vite 5 (ビルドツール)
- Tailwind CSS 3 (スタイリング)
- Zustand 4 (状態管理 + localStorage永続化)
- React Query 5 (データフェッチング)
- React Router 6 (画面遷移)

## 実装済み機能（Phase 1 Must要件）
- ✅ ユーザー切替（最大5名、アバター選択）
- ✅ フラッシュカード（カードフリップアニメーション、正解/不正解記録）
- ✅ クイズ（4択、英→日/日→英切替、スコア保存）
- ✅ 単語一覧（例文付き、フリーワード検索）
- ✅ 進捗画面（Week別ベストスコア・学習回数）
- ✅ Week切替（Week5・Week6 実装済み、weeks.config.json で追加可能）

## Week 追加方法
1. `public/data/week07.json` を追加（week05.json のフォーマットに従う）
2. `public/data/weeks.config.json` にエントリを追加
3. `npm run build` → デプロイ （コード変更不要）
