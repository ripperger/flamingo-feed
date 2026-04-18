// ═══════════════════════════════════════════════════════
//  MORNING FEED — CONFIG
//  This is the only file you need to edit regularly.
// ═══════════════════════════════════════════════════════

const CONFIG = {

  // ── Auth ──────────────────────────────────────────────
  password: "morning",          // change before deploying


  // ── Timer ─────────────────────────────────────────────
  timerSeconds: 600,            // 10 minutes = 600


  // ── Access control ────────────────────────────────────
  // Option A: Only allow access within a time window (24h format)
  timeWindow: {
    enabled: false,
    startHour: 6,               // e.g. 6 = 6:00 AM
    endHour:   10,              // e.g. 10 = 10:00 AM
  },

  // Option B: Limit how many times the feed can be unlocked per day
  // Uses localStorage — resets at midnight.
  dailyLimit: {
    enabled: true,
    maxUnlocks: 3,
  },


  // ── Content filters ───────────────────────────────────
  maxDescChars:         220,    // truncate article descriptions
  maxArticleAgeHours:    48,    // hide articles older than this (0 = disabled)
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
    // "war",
    // "earthquake",
    // "celebrity name",
  ],


  // ── News RSS feeds ────────────────────────────────────
  // Find RSS URLs: https://www.rsslookup.com
  newsFeeds: [
    { label: "BBC World",  url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
    { label: "Reuters",    url: "https://feeds.reuters.com/reuters/topNews" },
    { label: "Index.hu",   url: "https://index.hu/24ora/rss/" },
    { label: "444.hu",     url: "https://444.hu/feed" },
    // { label: "My Source", url: "https://example.com/feed.xml" },
  ],


  // ── YouTube channels ──────────────────────────────────
  // Get channel ID: https://commentpicker.com/youtube-channel-id.php
  youtubeFeeds: [
    { label: "Kurzgesagt",  channelId: "UCsXVk37bltHxD1rDPwtNM8Q" },
    { label: "Lex Fridman", channelId: "UCSHZKyawb77ixDdsGog4iWA" },
    // { label: "My Channel", channelId: "UC..." },
  ],

};
