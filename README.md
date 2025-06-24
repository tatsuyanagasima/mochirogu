# モチログ - 習慣 × 気分管理アプリ
習慣記録と気分の変化を同時に記録できるセルフマネジメント支援アプリです。
Next.js（TypeScript）とSupabaseを用いたフルスタック構成で、日々の習慣・気分・メモを記録し、カレンダーやグラフで振り返り・分析が可能です。

## 技術スタック
フロントエンド：Next.js (React / TypeScript)
バックエンド：Supabase（認証・DB・API）
認証：Supabase Auth（メール／SNSログイン対応）

## サイトイメージ
チャート描画：Chart.js![ChatGPT Image 2025年5月27日 00_19_45](https://github.com/user-attachments/assets/e70bce87-ab83-43d4-be3a-38c5f2d0d2f9)


## 設計ドキュメント

[要件定義・基本設計・詳細設計の一覧_Googleスプレッドシート](https://docs.google.com/spreadsheets/d/1yCv84vdfhXLyGrSnAAy68239r-LzfslNElnfcQ0W9PI/edit?gid=649127913#gid=649127913)



## 使用技術
フロントエンド：Next.js 14（App Router）

バックエンド：Next.js（API Routes）

データベース：Supabase（PostgreSQL）

認証：Supabase Auth（メール/SNSログイン）

デプロイ：Vercel

バージョン管理：Git、GitHub

テスト・デバッグ：Chrome DevTools

グラフ描画：Chart.js

スタイリング：Tailwind CSS

型チェック：TypeScript


## 機能一覧
ユーザー登録／ログイン（メール・SNS対応）

習慣の登録／編集／削除（曜日指定OK）

毎日の習慣チェック記録（気分5段階＋メモ）

記録のカレンダー表示（アイコンと色で可視化）

分析機能（習慣の達成率、気分の推移などをグラフで表示）

モバイルファーストなUI設計（iPhone対応）
