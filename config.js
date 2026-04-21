// ═══════════════════════════════════════════════════════
//  MORNING FEED — CONFIG
//  This is the only file you need to edit regularly.
// ═══════════════════════════════════════════════════════

const CONFIG = {

  // ── Auth ──────────────────────────────────────────────
  password: "morning",          // change before deploying


  // ── Timer ─────────────────────────────────────────────
  timerSeconds: 600,            // 10 minutes = 600

  // ── Network ───────────────────────────────────────────
  fetchTimeoutMs: 30000,        // abort a feed fetch after this many ms


  // ── Access control ────────────────────────────────────
  // Option A: Only allow access within a time window (24h format)
  timeWindow: {
    enabled: true,
    startHour: 8,               // e.g. 6 = 6:00 AM
    endHour:   21,              // e.g. 10 = 10:00 AM
  },

  // Option B: Limit how many times the feed can be unlocked per day
  // Uses localStorage — resets at midnight.
  dailyLimit: {
    enabled: true,
    maxUnlocks: 8,
  },


  // ── Content filters ───────────────────────────────────
  maxDescChars:         400,    // truncate article descriptions
  maxArticleAgeHours:    16,    // hide articles older than this (0 = disabled)
  maxNewsPerFeed:         4,    // max items per news source
  maxYoutubePerChannel:   2,    // max videos per channel

  // "recency" = newest first across all sources
  // "source"  = grouped by source
  newsSortOrder: "recency",

  // ── Title blocklist ───────────────────────────────────
  // Articles whose title contains any of these strings (case-insensitive)
  // will be silently skipped. Applies to news only, not YouTube.
  titleBlocklist: [
    "Nagy Feró",
    "Bayer Zsolt",
    "Rákay Philip",
    "Tóth Gabi",
    "Gáspár Győző",
    "Győzike",
    "Molnár Áron",
    "Lengyel Tamás",
    "Borbás Marcsi",
    "Curtis",
    "Dopeman",
    "Kanye West",
    "ByeAlex",
    "Árpa Attila",
    "Tóth Vera",
    "Lázárinfó",
    "Megafon",
    "celeb",
    "borzasztó",    
    "szörnyethalt",
    "pusztító",
    "vészjósló",
    "alattomos",
    // "war",
    // "earthquake",
    // "celebrity name",
  ],


  // ── News RSS feeds ────────────────────────────────────
  // Find RSS URLs: https://www.rsslookup.com
  newsFeeds: [
    { label: "BBC World",  url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
    { label: "Reuters",    url: "https://news.google.com/rss/search?q=site:reuters.com&hl=en-US&gl=US&ceid=US:en" },
    // { label: "Index",   url: "https://index.hu/24ora/rss/" },
    { label: "Telex",   url: "https://telex.hu/rss" },
    { label: "HVG",   url: "https://hvg.hu/rss" },
    { label: "DW",   url: "https://rss.dw.com/atom/rss-en-top" },
    { label: "The Week",   url: "https://theweek.com/uk/feeds.xml" },
    { label: "YES!",   url: "https://www.yesmagazine.org/feed" },
    // { label: "Portfolio",   url: "https://www.portfolio.hu/rss/all.xml" },
    { label: "EUobserver",   url: "https://euobserver.com/feed/" },
    // { label: "Átlátszó",   url: "https://atlatszo.hu/feed/" },
    { label: "Daily News Hungary",   url: "https://dailynewshungary.com/feed/" },
    { label: "Magyar Hang",   url: "https://hang.hu/rss/" },
    // { label: "444.hu",     url: "https://444.hu/feed" },
    { label: "Financial Times", url: "https://www.ft.com/rss/home/international" },
  ],


  // ── YouTube channels ──────────────────────────────────
  // Get channel ID: https://commentpicker.com/youtube-channel-id.php
  youtubeFeeds: [
    // { label: "Kurzgesagt",  channelId: "UCsXVk37bltHxD1rDPwtNM8Q" },
    { label: "DW Magyar", channelId: "UC6UqC3ccwKE2biNb72s83Zw" },
    { label: "Partizán", channelId: "UCEFpEvuosfPGlV1VyUF6QOA" },
    { label: "ATV Magyarország", channelId: "UCXxUjsYxbL1llIe9Ra6wcyQ" },
    { label: "The Economist", channelId: "UC0p5jTq6Xx_DosDFxVXnWaQ" },
    // { label: "Friderikusz Podcast", channelId: "UCQAeX1_gw45xb3Cg-OwEFcw" },
    // { label: "Netflix", channelId: "UCWOA1ZGywLbqmigxE4Qlvuw" },
    // { label: "TED", channelId: "UCAuUUnT6oDeKwE6v1NGQxug" },
    // { label: "Big Think", channelId: "UCvQECJukTDE2i6aCoMnS-Vg" },
    // { label: "DW Documentary", channelId: "UCW39zufHfsuGgpLviKh297Q" },
    // { label: "TED Ed", channelId: "UCsooa4yRKGN_zEE8iknghZA" },
    { label: "Magyar Péter", channelId: "UCDHjSN4vbfmzb8Cdfsob9Gg" },
    // { label: "My Channel", channelId: "UC..." },
  ],

};
