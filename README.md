# TikTok Live Rose Counter 🌹

A real-time Rose, Unique User, and Goal counter for TikTok Live streams.

> 🔰 **[はじめて使う方はこちら（セットアップガイド）](https://htmlpreview.github.io/?https://github.com/USERNAME/REPO/blob/main/docs/index.html)**
> 
> (※上記リンクは、GitHubにアップロードした後に有効になります。お友達にはこのリンクを送ってあげてください)

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

## Prerequisites

*   **Node.js**: You must have Node.js installed (v14 or higher recommended).
    *   [Download Node.js](https://nodejs.org/)

## Installation

1.  **Clone or Download** this repository.
2.  Open a terminal/command prompt in the project folder.
3.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

1.  **Start the Server**:
    Double-click `start.bat` (if on Windows) or run:
    ```bash
    node server.js
    ```
2.  **Open in Browser**:
    Go to `http://localhost:3000`
3.  **Connect**:
    *   Enter your TikTok `@username`.
    *   Click **CONNECT**.
4.  **Set Goal**:
    *   Enter your target number in the "Goal #" box (default 100).
    *   Click **SET GOAL**.

## Exporting Data

*   **CSV**: Click the `CSV` button in the Unique List header to download.
*   **Google Sheets**: Click the `COPY` button (green) to copy data. Paste simply into a spreadsheet (Cell A1).

## Sharing with Friends

To share this tool with a friend:
1.  They need to install Node.js.
2.  Send them this folder (or link them to your GitHub repository).
3.  They run `npm install` and `node server.js`.

**Note for Web Deployment**:
Hosting this on cloud services (like Glitch, Render, Heroku) might result in connection issues because TikTok often blocks data center IP addresses. Running it locally on your own PC is usually the most stable method.
