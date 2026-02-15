# TikTok Live Rose Counter 🌹

A real-time Rose, Unique User, and Goal counter for TikTok Live streams.

> 🔰 **[はじめて使う方はこちら（セットアップガイド）](https://cooowabungaaa-hue.github.io/tiktok-rose-counter/docs/)**
> 
> (お友達にはこのリンクを送ってあげてください)

---

Designed to help streamers track rose gifts and unique gifters during gamified streams.

## Features

*   **Real-time Rose Counting**: Tracks total roses received.
*   **Unique Gifter Tracking**: Counts how many unique users have sent roses.
*   **Goal Setting**: Set a goal (e.g., 100 Unique Gifters) and see the "Remaining" count.
*   **Combined Stats**: Displays Unique Count, Remaining Count, and Goal status ("GOAL!").
*   **Live Feed**: Visual feed of gifts with user avatars and sequence numbers.
*   **Data Export**:
    *   **Download CSV**: Export the list of unique gifters to a `.csv` file.
    *   **Copy for Sheets**: Copy the list to clipboard in a format ready for Google Sheets (includes Stream Date).
*   **Connection Management**: Connect/Disconnect from streams without restarting the server.
*   **Automatic Stream Date**: Handles streams crossing midnight (before 12 PM counts as previous day).

## セットアップ方法 (選べる2つのパターン)

ご利用の環境に合わせて、以下のいずれかの方法で開始してください。

### 🌹 パターンA：しっかり使いたい方 (推奨)
ご自身のPCに Node.js をインストールして使用します。動作が安定し、起動も速くなります。
1.  **Node.js をインストール**: [公式サイト](https://nodejs.org/)から LTS版をダウンロードしてインストールしてください。
2.  **起動**: フォルダ内の **`start.bat`** をダブルクリックしてください。
    *   初回のみ、必要な部品（library）が自動でインストールされます。
    *   準備ができたらブラウザが自動で立ち上がります。

### 🌹 パターンB：インストールができない・面倒な方
職場のPCなど、管理権限がなく Node.js がインストールできない場合でも利用可能です。
1.  **直接起動**: Node.js のインストールをスキップして、そのまま **`start.bat`** をダブルクリックしてください。
2.  **自動準備**: `start.bat` が Node.js 本体のダウンロードから部品の準備まで、**すべて裏で自動で完了させます。**
    *   初回セットアップに数分かかる場合がありますが、黒い画面（cmd）への文字入力は一切不要です。起動するまでそのままお待ちください。

---

## 使い方

1.  **ブラウザで確認**: サーバーが起動すると `http://localhost:3000` が開きます。
2.  **TikTok IDを入力**: 配信者のユーザー名（@マークなし）を入力して「CONNECT」をクリックします。
3.  **目標設定**: 「Goal #」に目標数（例: 200）を入力して「SET GOAL」をクリックします。
4.  **リアルタイム集計**: バラが投げられるたびに、ユニークユーザー数がカウントされていきます。

---

## データの書き出し
*   **CSV**: 「Unique List」のヘッダーにある `CSV` ボタンで全データを保存できます。
*   **スプレッドシート**: 緑色の `COPY` ボタンを押すと、そのまま Excel や Google スプレッドシートに貼り付けられる形式でコピーされます。

## 友人に共有する場合
「とにかく `start.bat` をダブルクリックして待つだけでOK」と伝えて、このリポジトリのリンクやZIPファイルを送ってあげてください。

## Sharing with Friends

To share this tool with a friend:
1.  They need to install Node.js.
2.  Send them this folder (or link them to your GitHub repository).
3.  They run `npm install` and `node server.js`.

**Note for Web Deployment**:
Hosting this on cloud services (like Glitch, Render, Heroku) might result in connection issues because TikTok often blocks data center IP addresses. Running it locally on your own PC is usually the most stable method.
