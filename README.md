# Quran Memorizer

A Quran memorization app that shows the mushaf (Quran pages) in a two-page landscape view. Words are hidden so you can test your memory — only the first word of each ayah is shown in red, and the rest are nearly invisible. Long-press a red word to hear the ayah recited.

## What You Need Before Starting

You need these things installed on your computer. If you don't have them yet, follow the links to install.

### 1. Node.js (version 18 or newer)

Node.js lets your computer run JavaScript. Think of it as the engine that powers this app.

**Check if you already have it:**
```bash
node --version
```

If you see something like `v18.17.0` or higher, you're good. If not:

- **Mac:** Open Terminal and run:
  ```bash
  brew install node
  ```
  (If you don't have `brew`, go to https://brew.sh and install it first)

- **Windows:** Download from https://nodejs.org (pick the LTS version, click Next through the installer)

- **Linux:**
  ```bash
  sudo apt update && sudo apt install nodejs npm
  ```

### 2. Git

Git is a tool that lets you download and track code. Think of it like Google Docs version history, but for code.

**Check if you already have it:**
```bash
git --version
```

If you see a version number, you're good. If not:

- **Mac:** It usually comes pre-installed. If not: `brew install git`
- **Windows:** Download from https://git-scm.com
- **Linux:** `sudo apt install git`

### 3. A Code Editor

You need something to read and edit the code. We recommend **VS Code** — it's free and works on all platforms.

Download: https://code.visualstudio.com

### 4. A Web Browser

You probably already have one. Chrome, Firefox, Safari, or Edge all work.

---

## Setting Up the Project (Step by Step)

### Step 1: Get the code onto your computer

Open your Terminal (Mac/Linux) or Command Prompt (Windows) and run:

```bash
git clone <repository-url>
```

Replace `<repository-url>` with the actual URL of this project (you'll get this from whoever shared the project with you).

Then move into the project folder:

```bash
cd quran-memorizer
```

### Step 2: Install all the packages the app needs

The app depends on a bunch of libraries (other people's code that we use). This one command downloads all of them:

```bash
npm install
```

This might take a minute or two. You'll see a progress bar. Wait until it finishes.

When it's done, you should see a `node_modules` folder appear in the project (it's huge — that's normal).

### Step 3: Start the app

```bash
npm run web
```

This starts the app in your web browser. After a few seconds, you should see a message like:

```
Web is waiting on http://localhost:8081
```

Open that URL in your browser. You should see the Quran pages displayed in landscape mode.

**That's it. The app is running.**

---

## How to Use the App

### Reading
- The app shows **two pages side by side**, just like an open mushaf
- **Swipe left/right** (or double-tap the edges) to turn pages
- Words are nearly invisible on purpose — this is for memorization practice

### Navigation Bar (top of screen)
- **Juz** — Jump to any of the 30 juz
- **Surah** — Jump to any of the 114 surahs (shows Arabic + English name)
- **Bookmarks** — See your saved bookmarks
- **Moon/Sun icon** (right side) — Switch between light and dark mode

### Interacting with Ayahs
- The **first word** of each ayah is shown in **red** — this is your hint
- **Tap** a red word to select that ayah (it gets highlighted)
- **Long-press** a red word to hear the recitation (audio plays while you hold down)
- **Tap an ayah number** (the circled number at the end of a verse) to **bookmark** it — it turns blue
- Tap it again to **remove** the bookmark

### Dark Mode
- Click the moon icon in the top-right corner to switch to dark mode
- Click the sun icon to switch back
- Your preference is saved automatically

---

## Project Structure (What's in Each Folder)

Here's what each file and folder does. You don't need to understand everything right away — just know where to find things.

```
quran-memorizer/
├── app/                    # Pages (routes) of the app
│   ├── _layout.tsx         #   App setup: loads font, locks to landscape
│   └── index.tsx           #   Main screen: page viewer with swipe navigation
│
├── components/             # Reusable UI pieces
│   ├── MushafPage.tsx      #   Renders one page of the Quran (all the lines and words)
│   ├── MushafSpread.tsx    #   Puts two pages side by side (left + right)
│   └── NavBar.tsx          #   Top bar with Juz/Surah/Bookmarks dropdowns + dark mode toggle
│
├── services/               # Data and logic (no UI)
│   ├── quranData.ts        #   Loads Quran page data, surah/juz metadata, page lookups
│   └── audioService.ts     #   Downloads and plays ayah audio (recitation)
│
├── stores/                 # App state (data that changes while you use the app)
│   └── quranStore.ts       #   Stores: current page, active ayah, bookmarks, dark mode
│                           #   (saved to disk so it remembers when you reopen)
│
├── assets/                 # Static files
│   ├── fonts/              #   UthmanicHafs font (the Arabic mushaf font)
│   └── quran-data/         #   604 JSON files, one per page (contains all words + positions)
│
├── app.json                # Expo config (app name, orientation, icons)
├── package.json            # List of dependencies and scripts
├── tsconfig.json           # TypeScript settings
└── babel.config.js         # Babel config (how code gets compiled)
```

---

## Key Concepts for New Developers

### What is Expo?
Expo is a framework that makes it easy to build apps that work on phones (iOS, Android) AND web browsers using the same code. We write the code once, and Expo handles making it work everywhere.

### What is React Native?
React Native is what we use to build the user interface (buttons, text, scrolling, etc). It's similar to building a website with React, but it also works on phones.

### What is TypeScript?
TypeScript is JavaScript with extra safety checks. When you see `.tsx` or `.ts` files, that's TypeScript. The main difference: you describe what type of data things should be (like "this is a number" or "this is a string"), and the computer warns you if you make a mistake.

### What is Zustand?
Zustand (German for "state") is a small library we use to share data between different parts of the app. For example, when you bookmark an ayah in `MushafPage.tsx`, the `NavBar.tsx` can see it too because they both read from the same zustand store.

### How does the Quran data work?
The entire Quran is stored as 604 JSON files (one per page) in `assets/quran-data/`. Each file lists the lines on that page, and each line has individual words with their position (surah:ayah:word number). The app reads these files and renders the Arabic text using the Uthmanic Hafs font.

---

## Common Commands

| Command | What it does |
|---------|-------------|
| `npm run web` | Start the app in your browser |
| `npm run ios` | Start the app on iPhone simulator (Mac only) |
| `npm run android` | Start the app on Android emulator |
| `npx tsc --noEmit` | Check for TypeScript errors (run this before committing code) |

---

## Troubleshooting

### "command not found: npm"
You need to install Node.js. Go back to the "What You Need" section above.

### The page is blank / shows an error
1. Stop the server (press `Ctrl + C` in the terminal)
2. Delete the cache: `rm -rf node_modules/.cache`
3. Start again: `npm run web`

### Arabic text looks wrong or shows boxes
The custom font might not have loaded. Try refreshing the browser. If it still doesn't work, check that `assets/fonts/UthmanicHafs_V20.ttf` exists.

### "Module not found" error
Run `npm install` again — you might be missing a package.

### Port already in use
Another app is using port 8081. Either close that app, or start with a different port:
```bash
npx expo start --web --port 8082
```
