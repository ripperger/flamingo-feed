// ═══════════════════════════════════════════════════════
//  MORNING FEED — APP
// ═══════════════════════════════════════════════════════

// ── CORS proxy ──────────────────────────────────────────
const proxy = url => `https://corsproxy.io/?${encodeURIComponent(url)}`;

// ── DOM helpers ─────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── localStorage keys ───────────────────────────────────
const LS_KEY = "morning_feed_daily";

// ═══════════════════════════════════════════════════════
//  ACCESS CONTROL
// ═══════════════════════════════════════════════════════

function getToday() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function getDailyRecord() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const rec = raw ? JSON.parse(raw) : null;
    if (rec && rec.date === getToday()) return rec;
  } catch (_) {}
  return { date: getToday(), unlocks: 0 };
}

function incrementUnlocks() {
  const rec = getDailyRecord();
  rec.unlocks += 1;
  localStorage.setItem(LS_KEY, JSON.stringify(rec));
  return rec.unlocks;
}

function isWithinTimeWindow() {
  const h = new Date().getHours();
  return h >= CONFIG.timeWindow.startHour && h < CONFIG.timeWindow.endHour;
}

function checkAccessBlocked() {
  // Time window check
  if (CONFIG.timeWindow.enabled && !isWithinTimeWindow()) {
    const start = String(CONFIG.timeWindow.startHour).padStart(2, "0") + ":00";
    const end   = String(CONFIG.timeWindow.endHour).padStart(2, "0")   + ":00";
    showGateMessage(`⏱`, `Feed available\n${start} – ${end}`);
    return true;
  }
  return false;
}

function checkDailyLimitReached() {
  if (!CONFIG.dailyLimit.enabled) return false;
  const rec = getDailyRecord();
  return rec.unlocks >= CONFIG.dailyLimit.maxUnlocks;
}

// ═══════════════════════════════════════════════════════
//  GATE
// ═══════════════════════════════════════════════════════

function showGateMessage(icon, text) {
  $("gate-input").style.display = "none";
  $("gate-error").style.display = "none";
  const msg = document.createElement("div");
  msg.id = "gate-message";
  msg.innerHTML = `<span>${icon}</span>${text.replace(/\n/g, "<br>")}`;
  $("gate").appendChild(msg);
}

function handleGateSubmit() {
  const input = $("gate-input");
  if (input.value !== CONFIG.password) {
    $("gate-error").textContent = "incorrect";
    input.value = "";
    setTimeout(() => $("gate-error").textContent = "", 2000);
    return;
  }

  // Correct password — check daily limit
  if (checkDailyLimitReached()) {
    showGateMessage("🚫", `Daily limit reached\n(${CONFIG.dailyLimit.maxUnlocks} unlocks)`);
    return;
  }

  // Count this unlock
  incrementUnlocks();

  // Enter feed
  $("gate").style.display = "none";
  $("feed").style.display = "block";
  $("header-date").textContent = new Date().toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short"
  }).toUpperCase();

  loadFeeds();
  startTimer();
}

$("gate-input").addEventListener("keydown", e => {
  if (e.key === "Enter") handleGateSubmit();
});

// Mobile keyboards sometimes fire "change" without "keydown Enter"
$("gate-input").addEventListener("change", () => handleGateSubmit());

// ═══════════════════════════════════════════════════════
//  XML / FEED PARSING
// ═══════════════════════════════════════════════════════

async function fetchXML(url) {
  const res = await fetch(proxy(url), { signal: AbortSignal.timeout(30000) });
  const text = await res.text();
  return new DOMParser().parseFromString(text, "text/xml");
}

function stripTags(str = "") {
  return str
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g,  "&").replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">").replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function truncate(str, max) {
  const s = stripTags(str);
  if (!max || max <= 0) return s;
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function fmtDate(raw = "") {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d)) return "";
  const diffH = (Date.now() - d) / 3_600_000;
  if (diffH < 1)  return `${Math.round(diffH * 60)}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function isTooOld(raw = "") {
  if (!CONFIG.maxArticleAgeHours || CONFIG.maxArticleAgeHours <= 0) return false;
  const d = new Date(raw);
  if (isNaN(d)) return false;
  return (Date.now() - d) / 3_600_000 > CONFIG.maxArticleAgeHours;
}

function isTitleBlocked(title = "") {
  if (!CONFIG.titleBlocklist || !CONFIG.titleBlocklist.length) return false;
  const lower = title.toLowerCase();
  return CONFIG.titleBlocklist.some(term => lower.includes(term.toLowerCase()));
}

// ── Fetch one news feed (RSS 2.0 or Atom) ───────────────
async function fetchNewsFeed(feed) {
  const doc = await fetchXML(feed.url);
  const items = [];

  // RSS 2.0
  const rssItems = [...doc.querySelectorAll("item")];
  if (rssItems.length) {
    rssItems.slice(0, CONFIG.maxNewsPerFeed).forEach(el => {
      const date  = el.querySelector("pubDate")?.textContent || "";
      const title = stripTags(el.querySelector("title")?.textContent || "");
      if (isTooOld(date) || isTitleBlocked(title)) return;
      const link = el.querySelector("link")?.textContent?.trim()
                || el.querySelector("link")?.getAttribute("href") || "";
      items.push({
        title,
        link,
        desc:   el.querySelector("description")?.textContent || "",
        date,
        dateMs: new Date(date).getTime() || 0,
        source: feed.label,
      });
    });
    return items;
  }

  // Atom
  const entries = [...doc.querySelectorAll("entry")];
  entries.slice(0, CONFIG.maxNewsPerFeed).forEach(el => {
    const date  = el.querySelector("updated")?.textContent
               || el.querySelector("published")?.textContent || "";
    const title = stripTags(el.querySelector("title")?.textContent || "");
    if (isTooOld(date) || isTitleBlocked(title)) return;
    const link = el.querySelector("link[rel='alternate']")?.getAttribute("href")
              || el.querySelector("link")?.getAttribute("href") || "";
    items.push({
      title,
      link,
      desc:   el.querySelector("summary")?.textContent
           || el.querySelector("content")?.textContent || "",
      date,
      dateMs: new Date(date).getTime() || 0,
      source: feed.label,
    });
  });
  return items;
}

// ── Fetch one YouTube channel feed ──────────────────────
async function fetchYoutubeFeed(feed) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${feed.channelId}`;
  const doc  = await fetchXML(url);
  const entries = [...doc.querySelectorAll("entry")];
  const items   = [];
  const ytNS    = "http://www.youtube.com/xml/schemas/2015";
  const mrssNS  = "http://search.yahoo.com/mrss/";

  entries.slice(0, CONFIG.maxYoutubePerChannel).forEach(el => {
    let videoId = el.getElementsByTagNameNS(ytNS, "videoId")[0]?.textContent || "";
    if (!videoId) {
      const href = el.querySelector("link")?.getAttribute("href") || "";
      const m = href.match(/[?&]v=([^&]+)/);
      videoId = m ? m[1] : "";
    }
    const date = el.querySelector("published")?.textContent || "";
    const desc = el.getElementsByTagNameNS(mrssNS, "description")[0]?.textContent
              || el.querySelector("summary")?.textContent || "";
    items.push({
      videoId,
      title:   stripTags(el.querySelector("title")?.textContent || ""),
      desc,
      channel: feed.label,
      date,
    });
  });
  return items;
}

// ═══════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════

function renderNews(items) {
  // Sort
  if (CONFIG.newsSortOrder === "recency") {
    items.sort((a, b) => b.dateMs - a.dateMs);
  }

  $("news-count").textContent = `${items.length} items`;

  if (!items.length) {
    $("news-container").innerHTML = '<div class="status-row">no recent items found</div>';
    return;
  }

  $("news-container").innerHTML = items.map(item => `
    <div class="news-item">
      <div class="news-meta">
        <span class="news-source">${item.source}</span>
        ${item.date ? `<span class="meta-dot"></span><span class="news-date">${fmtDate(item.date)}</span>` : ""}
      </div>
      <a class="news-title" href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
      ${item.desc ? `<div class="news-desc">${truncate(item.desc, CONFIG.maxDescChars)}</div>` : ""}
    </div>
  `).join("");
}

function renderYoutube(items) {
  $("yt-count").textContent = `${items.length} videos`;

  if (!items.length) {
    $("yt-container").innerHTML = '<div class="status-row">no videos found</div>';
    return;
  }

  $("yt-container").innerHTML = items.map(item => `
    <div class="yt-item">
      <div class="yt-meta">
        <span class="yt-channel">${item.channel}</span>
        ${item.date ? `<span class="meta-dot"></span><span class="yt-date">${fmtDate(item.date)}</span>` : ""}
      </div>
      <div class="yt-title">${item.title}</div>
      ${item.videoId ? `
        <div class="yt-embed-wrap">
          <iframe
            src="https://www.youtube.com/embed/${item.videoId}?rel=0&modestbranding=1"
            allowfullscreen loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>` : ""}
      ${item.desc ? `<div class="yt-desc">${truncate(item.desc, CONFIG.maxDescChars)}</div>` : ""}
    </div>
  `).join("");
}

// ── Load all feeds in parallel ───────────────────────────
async function loadFeeds() {
  const [newsResults, ytResults] = await Promise.all([
    Promise.allSettled(CONFIG.newsFeeds.map(fetchNewsFeed)),
    Promise.allSettled(CONFIG.youtubeFeeds.map(fetchYoutubeFeed)),
  ]);

  const allNews = newsResults
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);
  renderNews(allNews);

  const allYt = ytResults
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);
  renderYoutube(allYt);
}

// ═══════════════════════════════════════════════════════
//  TIMER + OVERLAY
// ═══════════════════════════════════════════════════════

let timerHandle = null;

function startTimer(seconds = CONFIG.timerSeconds) {
  let remaining = seconds;
  const el = $("timer");

  function tick() {
    remaining--;
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    el.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    el.className = remaining <= 60 ? "urgent" : remaining <= 120 ? "warning" : "";
    if (remaining <= 0) { showOverlay(); return; }
    timerHandle = setTimeout(tick, 1000);
  }

  clearTimeout(timerHandle);
  tick();
}

function showOverlay() {
  $("overlay").classList.add("visible");
}

$("overlay-close").addEventListener("click", () => {
  $("overlay").classList.remove("visible");
  startTimer();
});

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════

// Run access check on page load — before the gate is even visible
if (checkAccessBlocked()) {
  // Gate is already showing the message; nothing else to do.
}
