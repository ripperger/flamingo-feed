# Morning Feed

A personal, self-hosted morning news digest. Opens in the browser, loads the latest RSS news and YouTube videos, then locks itself after 10 minutes.

Built for one purpose: check what matters, then get to work.

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure — rarely needs editing |
| `style.css` | Visual design |
| `app.js` | Feed fetching, timer, overlay logic |
| `config.js` | **All user settings — edit this one** |

---

## Setup

### Deploy to GitHub Pages (recommended — accessible on mobile)

1. Create a new GitHub repository (name it e.g. `morning-feed`)
2. Upload all four files to the root of the repo
3. Go to **Settings → Pages → Branch: main → Folder: / (root)** → Save
4. Your feed is live at `https://YOUR_USERNAME.github.io/morning-feed/`
5. On Android (Brave or Chrome): tap the menu → **Add to Home Screen**

### Run locally (PC only)

Open a terminal in the project folder and run:

```
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

> Do not open `index.html` directly as a file (`file://`). The CORS proxy won't work that way — you need a local server.

---

## Configuration (`config.js`)

### Auth
```js
password: "morning"   // change this before deploying
```

### Timer
```js
timerSeconds: 600     // 10 minutes — adjust to taste
```

### Access control

**Option A — Time window:** Only show the gate during a specific time of day.
```js
timeWindow: {
  enabled:   true,
  startHour: 6,    // 6:00 AM
  endHour:   10,   // 10:00 AM (exclusive)
}
```
Outside these hours, the page shows "Feed available 06:00 – 10:00" and no input.

**Option B — Daily unlock limit:** Allow the feed to be unlocked N times per day. Uses `localStorage` — resets at midnight. If you reload and unlock again, that counts.
```js
dailyLimit: {
  enabled:    true,
  maxUnlocks: 3,
}
```
Both options can be enabled simultaneously.

### Content filters
```js
maxDescChars:        220   // truncate article descriptions (0 = no limit)
maxArticleAgeHours:   48   // hide articles older than this (0 = show all)
maxNewsPerFeed:        4   // items shown per news source
maxYoutubePerChannel:  2   // videos shown per channel
newsSortOrder: "recency"   // "recency" | "source"
```

### Adding news feeds

Find RSS URLs at [rsslookup.com](https://www.rsslookup.com) or by searching `site:example.com rss`.

```js
newsFeeds: [
  { label: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { label: "My Source", url: "https://example.com/feed.xml" },
],
```

### Adding YouTube channels

Get a channel ID at [commentpicker.com/youtube-channel-id.php](https://commentpicker.com/youtube-channel-id.php).

```js
youtubeFeeds: [
  { label: "Kurzgesagt", channelId: "UCsXVk37bltHxD1rDPwtNM8Q" },
],
```

---

## Privacy

This tool uses a JavaScript password gate — it keeps casual visitors out, but the source code (including the password) is readable by anyone who has the URL. This is acceptable for a personal morning feed of public RSS content.

For stronger privacy, deploy to [Netlify](https://netlify.com) instead of GitHub Pages — Netlify offers server-level password protection on free plans via `netlify.toml`.

The `noindex` meta tag prevents search engines from indexing the page.

---

## How the 10-minute mechanism works

- Timer counts down visibly in the header
- Turns gold at 2 minutes, red and blinking at 1 minute
- At zero: a fullscreen overlay appears with a randomly generated 12-character code
- Type the code correctly to dismiss the overlay and reset the timer to 10 minutes
- If you close the tab and reopen it, the page resets — but if `dailyLimit` is enabled, this counts as a new unlock and is tracked

---

## Troubleshooting

**Feeds not loading** — The CORS proxy (`corsproxy.io`) is a free third-party service. If it's down, feeds will silently fail. Alternative proxy: `https://api.allorigins.win/get?url=` (requires code change in `app.js`).

**YouTube feed empty** — Double-check the `channelId`. It must be the channel ID (starts with `UC`), not the channel handle (`@name`).

**Password gate not appearing** — Make sure you're serving the files through a local server, not opening `index.html` directly.
