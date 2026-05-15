# MAL Story Generator

> Chrome extension that automatically generates Instagram stories when you complete an anime or manga on MyAnimeList.

![MAL Story Generator](https://img.shields.io/badge/version-2.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Auto-detection** — banner appears when you mark something as Completed on MAL
- **MAL OAuth login** — pulls title, cover, episodes and your score automatically
- **Profile photo** — your MAL avatar loads automatically on the card
- **Metal rating palette** — unique color for each score (bordeaux → gold)
- **Pixel-perfect export** — 1080×1920px via Canvas API, identical to preview
- **Zero manual uploads** — everything is filled in automatically

## 🚀 Install

1. Download the latest `mal-story-extension.zip` from [Releases](../../releases)
2. Unzip the file
3. Open `chrome://extensions` in Chrome, Brave, or Edge
4. Enable **Developer Mode** (top right)
5. Click **Load unpacked** and select the unzipped folder
6. Visit any anime or manga page on [myanimelist.net](https://myanimelist.net)

## 📸 How it works

1. **Login** — click the extension icon and sign in with your MAL account
2. **Browse** — visit any anime/manga page and click "📸 Gerar Story"
3. **Complete** — mark something as Completed and a banner appears automatically
4. **Download** — your 1080×1920 story PNG is ready to post on Instagram

## 🎨 Rating Colors

| Score | MAL Label | Color |
|-------|-----------|-------|
| 10 | Masterpiece | 🟡 Gold |
| 9 | Great | 🟡 Amber |
| 8 | Very Good | ⬜ Silver |
| 7 | Good | 🩶 Dark Silver |
| 6 | Fine | 🟤 Bronze |
| 5 | Average | 🟤 Copper |
| 4 | Bad | 🟫 Rust |
| 3 | Very Bad | 🟫 Dark Rust |
| 2 | Horrible | 🔴 Bordeaux |
| 1 | Appalling | ⬛ Dark Bordeaux |

## 🔒 Privacy

- OAuth PKCE authentication — your token never leaves your machine
- No external servers — everything runs locally in the extension
- No data collection of any kind

## 📄 License

MIT — not affiliated with MyAnimeList.
