# Supabase 利用状況トラッキング & 管理ダッシュボード — 設計仕様書

**日付:** 2026-05-09  
**対象アプリ:** JPREP LA350 英単語学習アプリ

---

## 1. 概要

既存アプリの基本構造（Zustand + localStorage）を変えずに、Supabaseを薄いレイヤーとして追加する。各モード画面を開いた回数を日別・Week別に記録し、先生が `/admin` ダッシュボードで確認できるようにする。

---

## 2. 要件

- 既存アプリの動作・状態管理（Zustand + localStorage）は変更しない
- Supabaseへの送信は fire-and-forget（失敗してもアプリは動き続ける）
- 記録対象モード: 語源（etymology）、フラッシュカード（flashcard）、クイズ（quiz）、予想問題（predicted_quiz）、単語一覧（wordlist）、ディクテーション（dictation）
- 記録内容: ユーザー名、モード、Week ID、アクセス日時
- ダッシュボードは `/admin` ルートに追加、パスワード保護
- ダッシュボードは先生のみが使用

---

## 3. データモデル

### Supabase テーブル: `activity_logs`

```sql
create table activity_logs (
  id          uuid primary key default gen_random_uuid(),
  user_name   text not null,
  mode        text not null,
  week_id     text,
  accessed_at timestamptz default now()
);
```

| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid | 主キー（自動生成） |
| `user_name` | text | ユーザー名（例: "Taro"） |
| `mode` | text | モード識別子（下記参照） |
| `week_id` | text / null | 対象Week（例: "week08"）。語源画面はnull |
| `accessed_at` | timestamptz | 画面を開いた時刻（自動） |

**mode の値:**

| 値 | 対応画面 |
|---|---|
| `etymology` | 語源学習 |
| `flashcard` | フラッシュカード |
| `quiz` | クイズ |
| `predicted_quiz` | 予想問題 |
| `wordlist` | 単語一覧 |
| `dictation` | ディクテーション |

---

## 4. アーキテクチャ

```
既存アプリ (変更最小限)
  Zustand + localStorage  ←→  画面・フック
         ↓
  fire-and-forget INSERT (エラーは無視)
         ↓
  src/lib/supabase.ts  ← 新規
         ↓
  Supabase (activity_logs テーブル)
         ↓
  /admin ルート  ← 新規
  先生向けダッシュボード
```

---

## 5. 実装コンポーネント

### 新規追加ファイル

| ファイル | 役割 |
|---|---|
| `src/lib/supabase.ts` | Supabaseクライアント初期化 |
| `src/hooks/useActivityLog.ts` | 画面を開いた際にINSERTするカスタムフック |
| `src/pages/AdminScreen.tsx` | ダッシュボード画面（パスワードゲート含む） |
| `src/components/admin/ActivityTable.tsx` | 日別×モード×ユーザー一覧テーブル |
| `src/components/admin/ActivityChart.tsx` | モード別利用回数の棒グラフ |

### 既存ファイルへの変更（最小限）

| ファイル | 変更内容 |
|---|---|
| `src/App.tsx` | `/admin` ルートを1行追加 |
| `src/pages/EtymologyScreen.tsx` | `useActivityLog('etymology', null)` を追加（2行） |
| `src/pages/FlashcardScreen.tsx` | `useActivityLog('flashcard', weekId)` を追加（2行） |
| `src/pages/QuizScreen.tsx` | `useActivityLog('quiz', weekId)` を追加（2行） |
| `src/pages/PredictedQuizScreen.tsx` | `useActivityLog('predicted_quiz', weekId)` を追加（2行） |
| `src/pages/WordListScreen.tsx` | `useActivityLog('wordlist', weekId)` を追加（2行） |
| `src/pages/DictationScreen.tsx` | `useActivityLog('dictation', weekId)` を追加（2行） |

---

## 6. useActivityLog フック仕様

```ts
// 呼び出し方
useActivityLog(mode: string, weekId: string | null)

// 動作
// - コンポーネントマウント時（useEffect []）に1回だけINSERT
// - useCurrentUser() で取得したユーザー名を使用（未ログイン時は送信しない）
// - Supabaseエラーはconsole.warnのみ（アプリには影響しない）
```

---

## 7. 管理ダッシュボード仕様

### アクセス保護

- `.env` に `VITE_ADMIN_PASSWORD` を設定
- `/admin` を開くとパスワード入力画面を表示
- 一致したら `sessionStorage` に保存し、セッション中は再入力不要

### 画面構成

```
┌─────────────────────────────────────────┐
│  JPREP Admin Dashboard        [ログアウト] │
├─────────────────────────────────────────┤
│  期間フィルター: [今週▼]  ユーザー: [全員▼] │
├─────────────────────────────────────────┤
│  モード別利用回数（CSS棒グラフ）             │
├─────────────────────────────────────────┤
│  日別 × モード × ユーザー 一覧テーブル      │
│  日付 | ユーザー | モード | Week | 回数    │
└─────────────────────────────────────────┘
```

### フィルター

- **期間:** 今日 / 今週 / 今月 / 全期間
- **ユーザー:** 全員 / 個別ユーザー選択

### データ取得

- ダッシュボード表示時に `activity_logs` をSupabaseから直接クエリ
- クライアントサイドで日付・ユーザー別に集計

---

## 8. 環境変数

| 変数名 | 説明 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase プロジェクト URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon（公開）キー |
| `VITE_ADMIN_PASSWORD` | ダッシュボードのパスワード |

---

## 9. Supabase セキュリティ設定

- `activity_logs` テーブルの Row Level Security (RLS) を有効化
- INSERT: anon キーで全員が書き込み可能（アプリからの記録用）
- SELECT: anon キーで全員が読み取り可能（ダッシュボード用）
- ※ 本番環境では `service_role` キーを使ったサーバーサイドAPIに移行を推奨

---

## 10. 対象外（スコープ外）

- リアルタイム同期
- ユーザー認証（Supabase Auth）
- 学習スコアの記録
- 利用時間の記録
