# 🎾 ポケテニマスター

**栄冠ナイン式ポケモンテニス部管理ゲーム**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)
[![Pokemon API](https://img.shields.io/badge/PokeAPI-v2-yellow)](https://pokeapi.co/)

## 🌟 概要

ポケテニマスターは、人気ゲーム「栄冠ナイン」のテニス版として開発された、ポケモンと共に高校テニス部を3年間管理する本格的な経営シミュレーションゲームです。

### 🎯 ゲームの特徴

- **栄冠ナイン式カードゲーム**: 月次進行での戦略的カード選択
- **リアルなポケモンデータ**: PokeAPI統合による本格的なポケモン情報
- **完全テニス試合シミュレーション**: セット・ゲーム・ポイント制の本格的な試合システム
- **3年間のストーリー**: 入学から卒業までの完全な高校生活
- **詳細な統計システム**: 選手・チーム両方の包括的な分析

## 🚀 技術スタック

### フロントエンド
- **Next.js 14** - App Router採用
- **TypeScript** - 型安全性の確保
- **Tailwind CSS** - モダンなスタイリング
- **Framer Motion** - スムーズなアニメーション

### バックエンド
- **Supabase** - PostgreSQL + リアルタイム機能
- **Row Level Security (RLS)** - セキュアなデータアクセス
- **Pokemon API** - 公式ポケモンデータ統合

### 開発環境
- **ESLint + Prettier** - コード品質管理
- **Git** - バージョン管理
- **Vercel** - デプロイメント

## 🎮 主要機能

### 🏆 ゲームシステム
- [x] **月次カードゲーム**: 練習・試合・イベントカードによる戦略的な部運営
- [x] **選手管理**: ポケモンの特性を活かした選手育成
- [x] **試合システム**: リアルなテニススコアリング（15-30-40-ゲーム）
- [x] **年度進行**: 卒業・進級・新入生システム

### 📊 統計・分析
- [x] **詳細統計**: 個人・チーム両方の包括的なデータ追跡
- [x] **マッチ記録**: 全試合の詳細ログとリプレイ機能
- [x] **成長追跡**: 選手の能力値変化の可視化
- [x] **ダッシュボード**: タブ式インターフェースでの情報整理

### 🎯 イベントシステム
- [x] **年間イベント**: 卒業式・新入生歓迎・大会参加
- [x] **ランダムイベント**: 特別練習・怪我・能力向上イベント
- [x] **大会システム**: 地区大会から全国大会への道のり

### 💾 データ管理
- [x] **リアルタイム同期**: Supabaseによる即座のデータ更新
- [x] **セキュアアクセス**: RLSによるユーザー別データ保護
- [x] **バックアップ**: 自動データ保存とリストア機能

## 📦 インストール・セットアップ

### 前提条件
- Node.js 18.0.0以上
- npm または yarn
- Supabaseアカウント

### 1. リポジトリのクローン
```bash
git clone https://github.com/KopetanZ/poketeni.git
cd poketeni
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.example`を`.env.local`にコピーして、以下の値を設定：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_url

# Pokemon API (デフォルト)
NEXT_PUBLIC_POKEAPI_BASE_URL=https://pokeapi.co/api/v2

# ゲーム設定
NEXT_PUBLIC_GAME_VERSION=1.0.0
NEXT_PUBLIC_MAX_TEAM_SIZE=15
NEXT_PUBLIC_DEBUG_MODE=false
```

### 4. データベースセットアップ
```bash
# データベーススキーマの作成
node setup-database.js

# または手動でSQLファイルを実行
# database-schema.sql をSupabaseで実行
```

### 5. 開発サーバーの起動
```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 🎯 使い方

### 🏁 ゲーム開始
1. フルーツ認証でログイン
2. 新しい学校を作成
3. 初期チームメンバーが自動生成される
4. ダッシュボードでゲーム開始

### 🗓️ 月次進行
1. **カード選択**: 練習・試合・イベントから選択
2. **結果確認**: カードの効果と結果を確認
3. **統計チェック**: 選手の成長と チーム状況を把握
4. **次月準備**: 戦略を立てて次の月へ

### 🏆 試合システム
- **練習試合**: 経験値獲得とスキル向上
- **公式戦**: 地区大会・県大会・全国大会
- **特別試合**: イベント限定の特殊なマッチ

## 🏗️ プロジェクト構造

```
tenipoke/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx        # メインダッシュボード
│   │   ├── players/        # 選手管理ページ
│   │   ├── training/       # 練習ページ
│   │   └── matches/        # 試合ページ
│   ├── components/         # Reactコンポーネント
│   │   ├── game/          # ゲームロジック関連
│   │   ├── player/        # 選手管理
│   │   ├── match/         # 試合システム
│   │   └── ui/            # 汎用UIコンポーネント
│   ├── hooks/             # カスタムReactフック
│   ├── lib/               # ユーティリティ・API
│   ├── types/             # TypeScript型定義
│   └── styles/            # スタイルファイル
├── docs/                  # ドキュメント
├── public/               # 静的ファイル
└── database-*.sql        # データベースファイル
```

## 🤝 コントリビューション

このプロジェクトへの貢献を歓迎します！

### 開発の流れ
1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コーディング規約
- TypeScript必須
- ESLint + Prettierに従う
- コンポーネントは適切にコメント
- テストの追加を推奨

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🙏 謝辞

- **パワプロシリーズ/栄冠ナイン** - ゲームシステムのインスピレーション
- **Pokemon Company** - ポケモンという素晴らしいコンテンツ
- **PokeAPI** - 包括的なポケモンデータの提供
- **Supabase** - 素晴らしいBaaSプロバイダー

## 📞 サポート

- **GitHub Issues**: バグ報告や機能リクエスト
- **Discussions**: 質問や提案
- **Wiki**: 詳細なゲームガイド

---

**🎾 Let's play Pokemon Tennis! 頑張って甲子園（テニス版）を目指そう！**