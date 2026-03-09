import { useState, useEffect, useCallback } from "react";

// ── Admin config ──────────────────────────────────────────
const WORKER_URL   = "https://tucsoneats-email.mike-216.workers.dev/";
const ADMINS_KEY   = "tucsoneats-admins-v1";
const DEFAULT_ADMIN = { username: "admin", password: "tucson2025", name: "Admin", role: "superadmin" };


const WHO_LABELS = {
  student:  "UA Student",
  downtown: "Downtown Worker",
  local:    "Tucson Resident",
  owner:    "Restaurant Owner",
  other:    "Other",
};


// ── Global styles injected once ───────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,900;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green:       #4B863E;
    --green-dark:  #396531;
    --green-light: #74A26B;
    --green-bg:    #4B863E;
    --green-deep:  #243D1C;
    --pink:        #D41674;
    --pink-light:  #E8449A;
    --pink-dark:   #A80E5A;
    --bg:          #243D1C;
    --card:        #2E4E22;
    --card-hov:    #375E29;
    --border:      #3D6530;
    --border-hov:  #4B863E;
    --text:        #FFFFFF;
    --text-muted:  #C5DDB8;
    --text-dim:    #6A9A50;
    --gold:        #F5C842;
    --gold-dark:   #C8982A;
  }

  html { scroll-behavior: smooth; }
  body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); overflow-x: hidden; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--green-deep); }
  ::-webkit-scrollbar-thumb { background: var(--green); border-radius: 3px; }

  /* NAV */
  .te-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(36, 61, 28, 0.97);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px; overflow: hidden;
  }
  .te-nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; cursor: pointer; height: 100%; }
  .te-nav-logo { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
  .te-nav-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; color: #fff; }
  .te-nav-title span { color: var(--pink); font-size: 0.75em; }
  .te-nav-links { display: flex; align-items: center; gap: 6px; }
  .te-nav-links a { color: var(--text-muted); text-decoration: none; font-size: 14px; font-weight: 600;
    padding: 6px 12px; border-radius: 6px; transition: all .15s; }
  .te-nav-links a:hover { color: #fff; background: rgba(255,255,255,.08); }
  .te-nav-cta { background: #D41674 !important; color: #fff !important; border-radius: 20px !important; font-weight: 700 !important; }
  .te-nav-cta:hover { background: #A80E5A !important; }
  @media(max-width:600px) { .te-nav-links .hide-sm { display: none; } }

  /* HERO */
  .te-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(160deg, #243D1C 0%, #396531 40%, #243D1C 100%);
    padding: 80px 24px 70px;
    text-align: center;
  }
  .te-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 20% 80%, rgba(75,134,62,.3) 0%, transparent 55%),
                radial-gradient(ellipse at 80% 20%, rgba(212,22,116,.15) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 50%, rgba(245,200,66,.05) 0%, transparent 60%);
    pointer-events: none;
  }
  .te-hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(245,200,66,.12); border: 1px solid rgba(245,200,66,.3);
    color: var(--gold); font-size: 11px; font-weight: 700; letter-spacing: 3px;
    text-transform: uppercase; padding: 5px 16px; border-radius: 20px; margin-bottom: 22px;
  }
  .te-hero h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(52px, 10vw, 100px);
    line-height: .92; letter-spacing: -1px; margin-bottom: 16px;
  }
  .te-line-green { color: var(--green-light); display: block; }
  .te-line-white { color: #fff; display: block; }
  .te-line-pink  { color: var(--pink); display: block; }
  .te-hero-sub {
    font-size: clamp(15px, 2.5vw, 18px); color: var(--text-muted);
    max-width: 520px; margin: 0 auto 32px; line-height: 1.6;
  }
  .te-hero-sub strong { color: #fff; }
  .te-hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 50px; }
  .te-btn-primary {
    background: linear-gradient(135deg, #4B863E, #396531);
    color: #fff; border: none; border-radius: 10px;
    padding: 14px 28px; font-size: 14px; font-weight: 900; letter-spacing: 2px;
    text-transform: uppercase; cursor: pointer; font-family: inherit;
    box-shadow: 0 4px 24px rgba(75,134,62,.45); text-decoration: none;
    display: inline-block; transition: transform .15s, box-shadow .15s;
  }
  .te-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(75,134,62,.55); }
  .te-btn-outline {
    background: none; color: var(--text-muted); border: 1.5px solid var(--border-hov);
    border-radius: 10px; padding: 14px 28px; font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: inherit; text-decoration: none; display: inline-block;
    transition: all .15s;
  }
  .te-btn-outline:hover { color: #fff; border-color: #fff; }

  /* STATS BAR */
  .te-stats-bar {
    display: flex; justify-content: center;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    background: rgba(0,0,0,.2); flex-wrap: wrap;
  }
  .te-stat-item {
    flex: 1; min-width: 120px; max-width: 200px;
    padding: 18px 20px; text-align: center;
    border-right: 1px solid var(--border);
  }
  .te-stat-item:last-child { border-right: none; }
  .te-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 32px; color: var(--green-light); line-height: 1; }
  .te-stat-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text-dim); margin-top: 3px; }

  /* SECTIONS */
  .te-section { padding: 70px 24px; }
  .te-section-inner { max-width: 1000px; margin: 0 auto; }
  .te-section-tag { font-size: 10px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--pink); margin-bottom: 10px; }
  .te-section-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(32px, 5vw, 52px); margin-bottom: 14px; line-height: 1; }
  .te-section-sub { color: var(--text-muted); font-size: 15px; line-height: 1.65; max-width: 600px; }

  /* HOW IT WORKS */
  .te-how-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-top: 40px; }
  .te-how-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 14px; padding: 28px 24px; position: relative;
    transition: border-color .2s, transform .2s;
  }
  .te-how-card:hover { border-color: var(--border-hov); transform: translateY(-3px); }
  .te-how-num {
    font-family: 'Bebas Neue', sans-serif; font-size: 64px; line-height: 1;
    color: rgba(110,194,74,.15); position: absolute; top: 12px; right: 18px;
  }
  .te-how-icon { font-size: 38px; margin-bottom: 14px; }
  .te-how-card h3 { font-size: 21px; font-weight: 900; margin-bottom: 8px; }
  .te-how-card p { font-size: 16px; color: var(--text-muted); line-height: 1.6; }

  /* PRIZES */
  .te-prizes-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 40px; }
  .te-prize-card {
    border-radius: 14px; padding: 28px 24px;
    border: 1.5px solid; position: relative; overflow: hidden;
  }
  .te-prize-card.gold { background: linear-gradient(135deg, rgba(245,200,66,.1), rgba(200,152,42,.05)); border-color: rgba(245,200,66,.35); }
  .te-prize-card.green { background: linear-gradient(135deg, rgba(61,122,42,.2), rgba(42,90,26,.1)); border-color: var(--border-hov); }
  .te-prize-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(255,255,255,.04), transparent 60%); pointer-events: none; }
  .te-prize-icon { font-size: 42px; margin-bottom: 12px; }
  .te-prize-card h3 { font-size: 20px; font-weight: 900; margin-bottom: 8px; }
  .te-prize-card p { font-size: 16px; color: var(--text-muted); line-height: 1.6; }
  .te-prize-highlight { display: inline-block; margin-top: 10px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; }
  .te-prize-highlight.gold { background: rgba(245,200,66,.15); color: var(--gold); }
  .te-prize-highlight.green { background: rgba(110,194,74,.15); color: var(--green-light); }

  /* TIMELINE */
  .te-timeline { display: flex; flex-direction: column; margin-top: 40px; position: relative; }
  .te-timeline::before { content:''; position:absolute; left:20px; top:0; bottom:0; width:2px; background: linear-gradient(to bottom, var(--green), transparent); }
  .te-tl-item { display: flex; gap: 20px; padding: 0 0 28px 0; }
  .te-tl-dot { width: 42px; height: 42px; border-radius: 50%; background: var(--card); border: 2px solid var(--border-hov); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; z-index: 1; }
  .te-tl-dot.active { background: var(--green); border-color: var(--green-light); box-shadow: 0 0 14px rgba(75,134,62,.5); }
  .te-tl-date { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 3px; }
  .te-tl-title { font-size: 20px; font-weight: 900; margin-bottom: 4px; }
  .te-tl-desc { font-size: 16px; color: var(--text-muted); line-height: 1.5; }

  /* VOTE LAYOUT */
  .te-vote-layout { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--border); border-radius: 18px; overflow: hidden; }
  @media(max-width: 700px) { .te-vote-layout { grid-template-columns: 1fr; } .te-vote-right { display: none !important; } }

  /* STEP BAR */
  .te-step-bar { display:flex; align-items:center; justify-content:center; padding:16px; background:rgba(0,0,0,.2); border-bottom:1px solid var(--border); flex-wrap:wrap; gap:4px; }

  /* FOOTER */
  .te-footer { background: var(--green-deep); border-top: 1px solid var(--border); padding: 36px 24px; text-align: center; }
  .te-footer-brand { font-family: 'Bebas Neue', sans-serif; font-size: 28px; margin-bottom: 8px; }
  .te-footer-brand span { color: var(--pink); }
  .te-footer-links { display: flex; gap: 18px; justify-content: center; flex-wrap: wrap; margin-bottom: 16px; }
  .te-footer-links a { color: var(--text-dim); font-size: 12px; text-decoration: none; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  .te-footer-links a:hover { color: var(--text-muted); }
  .te-footer-copy { font-size: 11px; color: var(--text-dim); }

  /* DIVIDER */
  .te-divider { height: 1px; background: linear-gradient(to right, transparent, var(--border), transparent); }

  /* ANIMATIONS */
  @keyframes te-fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes te-flashGlow { 0%,100%{box-shadow:none;} 50%{box-shadow:0 0 20px rgba(75,134,62,.6);} }
  @keyframes te-pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.5;transform:scale(1.3);} }
  .te-fade-up { animation: te-fadeUp .4s ease forwards; }
  .te-flash-glow { animation: te-flashGlow 1.2s ease; }
  @media(max-width: 750px) { .te-hero-grid { grid-template-columns: 1fr !important; } .te-rankings-col { display: none !important; } }
`;

// ── Storage (Cloudflare KV via Worker) ───────────────────
const storage = {
  async get(key) {
    try {
      const res = await fetch(`${WORKER_URL}storage?key=${encodeURIComponent(key)}`);
      if (res.status === 404) return null;
      return await res.json();
    } catch { return null; }
  },
  async set(key, value) {
    try {
      const res = await fetch(`${WORKER_URL}storage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      return await res.json();
    } catch { return null; }
  },
  async delete(key) {
    try {
      const res = await fetch(`${WORKER_URL}storage?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch { return null; }
  },
};

const STORAGE_KEY  = "tucsoneats-votes-v5";
const VOTED_KEY    = "tucsoneats-voted-v5";
const REGISTRY_KEY = "tucsoneats-registry-v5";

// ── Seed data ─────────────────────────────────────────────
const SEED = [
  { id:"s1", name:"Taqueria Juanitos",   cuisine:"Mexican",  votes:4 },
  { id:"s2", name:"Redbird",             cuisine:"American", votes:3 },
  { id:"s3", name:"Taqueria El Zaraape", cuisine:"Mexican",  votes:5 },
  { id:"s4", name:"Rajin Ramen",         cuisine:"Japanese", votes:2 },
  { id:"s5", name:"Lin's Buffet",        cuisine:"Chinese",  votes:2 },
  { id:"s6", name:"Loving Spoonfulls",   cuisine:"Vegan",    votes:3 },
  { id:"s7", name:"Midtown Vegan Deli",  cuisine:"Vegan",    votes:1 },
];

const WHO_OPTIONS = [
  { id:"student",  label:"University of Arizona Student", emoji:"🎓" },
  { id:"downtown", label:"Downtown Tucson Office Worker", emoji:"🏢" },
  { id:"local",    label:"Tucson Resident",               emoji:"🏠" },
  { id:"owner",    label:"Restaurant Owner",              emoji:"🍳" },
  { id:"other",    label:"Other",                         emoji:"✈️" },
];

const CUISINE_OPTIONS = [
  "Sonoran","American","Mexican","Italian","Japanese","Chinese","Indian",
  "Thai","Vietnamese","Mediterranean","French","Korean","Seafood",
  "BBQ","Pizza","Burgers","Vegan","Middle Eastern","Greek","Other",
];

const CUISINE_EMOJI = {
  American:"🍔", Italian:"🍝", Mexican:"🌮", Japanese:"🍣", Chinese:"🥡",
  Indian:"🍛", Thai:"🍜", Vietnamese:"🍜", Mediterranean:"🫒", French:"🥐",
  Korean:"🍱", Seafood:"🦞", BBQ:"🍖", Pizza:"🍕", Burgers:"🍔", Vegan:"🥗",
  "Middle Eastern":"🧆", Greek:"🫙", Sonoran:"🌵", Other:"🍽️",
};

const validate = ({ firstName, email, phone, zip }) => {
  const e = {};
  if (!firstName.trim()) e.firstName = "Required";
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Valid email required";
  if (!phone.trim() || !/^\d{7,15}$/.test(phone.replace(/[\s\-().+]/g, ""))) e.phone = "Valid phone required";
  if (!zip.trim() || !/^\d{5}$/.test(zip.trim())) e.zip = "5-digit ZIP required";
  return e;
};

const iStyle = (extra = {}) => ({
  width: "100%", background: "rgba(0,0,0,.25)", border: "1.5px solid var(--border)",
  borderRadius: "8px", padding: "11px 14px", color: "#fff", fontSize: "13px",
  fontFamily: "inherit", outline: "none", ...extra,
});

// ── TucsonEats Logo — embedded from AI file ───────────────
const LOGO_IMG = "data:image/png;base64,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";
function TucsonEatsLogo({ height = 52 }) {
  const width = height * (600 / 239);
  return (
    <img src={LOGO_IMG} height={height} width={width}
      alt="TucsonEats.com" style={{display:"block", imageRendering:"auto"}} />
  );
}
const STEPS = ["register", "who", "vote"];

function StepBar({ step }) {
  const labels = ["Sign Up", "Your Role", "Vote"];
  const icons  = ["📋", "👤", "🗳️"];
  const cur = STEPS.indexOf(step);
  return (
    <div className="te-step-bar">
      {STEPS.map((s, i) => {
        const done = cur > i, active = step === s;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", minWidth: "50px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: done ? "var(--green)" : active ? "var(--pink)" : "rgba(255,255,255,.1)",
                border: active ? "2px solid var(--pink-light)" : done ? "2px solid var(--green-light)" : "2px solid rgba(255,255,255,.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: done ? "11px" : "13px", fontWeight: "900", color: "#fff", transition: "all .3s",
              }}>
                {done ? "✓" : icons[i]}
              </div>
              <div style={{
                fontSize: "9px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase",
                color: active ? "var(--pink-light)" : done ? "var(--green-light)" : "rgba(255,255,255,.3)", textAlign: "center",
              }}>
                {labels[i]}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: "28px", height: "2px", background: done ? "var(--green)" : "rgba(255,255,255,.1)", marginBottom: "16px", transition: "all .3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Casino RankingsList ───────────────────────────────────
const CASINO_CSS = `
  @keyframes casino-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes casino-glow-pulse {
    0%,100% { box-shadow: 0 0 8px rgba(255,215,0,.3), 0 0 20px rgba(255,215,0,.1); }
    50%      { box-shadow: 0 0 18px rgba(255,215,0,.7), 0 0 40px rgba(255,215,0,.3), 0 0 60px rgba(255,165,0,.15); }
  }
  @keyframes casino-rank-flash {
    0%,100% { box-shadow: 0 0 0px transparent; }
    30%     { box-shadow: 0 0 24px rgba(255,215,0,.8), 0 0 48px rgba(255,165,0,.4); }
    60%     { box-shadow: 0 0 12px rgba(255,215,0,.4); }
  }
  @keyframes casino-ticker {
    0%   { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  @keyframes casino-number-pop {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.3); color: #FFD700; }
    100% { transform: scale(1); }
  }
  @keyframes casino-bar-shine {
    0%   { background-position: -100% 0; }
    100% { background-position: 200% 0; }
  }
  .casino-top-card    { animation: casino-glow-pulse 2.5s ease-in-out infinite; }
  .casino-flash-card  { animation: casino-rank-flash 1.4s ease-out; }
  .casino-shimmer-text {
    background: linear-gradient(90deg, #FFD700 0%, #FFF8DC 40%, #FFD700 60%, #FFA500 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: casino-shimmer 2.5s linear infinite;
  }
  .casino-bar {
    background: linear-gradient(90deg, #B8860B, #FFD700 40%, #FFF8DC 55%, #FFD700 70%, #B8860B);
    background-size: 200% 100%;
    animation: casino-bar-shine 2s linear infinite;
  }
  .casino-bar-green {
    background: linear-gradient(90deg, #1a5c1a, #3DCC3D 40%, #90EE90 55%, #3DCC3D 70%, #1a5c1a);
    background-size: 200% 100%;
    animation: casino-bar-shine 2.4s linear infinite;
  }
  .casino-bar-pink {
    background: linear-gradient(90deg, #8B2252, #E87DA8 40%, #FFB6C1 55%, #E87DA8 70%, #8B2252);
    background-size: 200% 100%;
    animation: casino-bar-shine 2.2s linear infinite;
  }
  .casino-rank-badge {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 13px; font-weight: 900;
    flex-shrink: 0;
  }
`;

function RankingsList({ sorted, totalVotes, maxVotes, votedFor, flash }) {
  // inject casino CSS once
  useEffect(() => {
    if (!document.getElementById("te-casino-styles")) {
      const s = document.createElement("style");
      s.id = "te-casino-styles";
      s.textContent = CASINO_CSS;
      document.head.appendChild(s);
    }
  }, []);

  if (!sorted.length) return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎰</div>
      <div style={{ fontSize: "12px", color: "#B8860B", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>
        No bets placed yet — be first!
      </div>
    </div>
  );

  const rankStyles = [
    { bg: "linear-gradient(135deg, #1C1400, #2E1F00, #1C1400)", border: "1.5px solid #B8860B" },
    { bg: "linear-gradient(135deg, #141414, #222222, #141414)", border: "1.5px solid #888" },
    { bg: "linear-gradient(135deg, #160A00, #241200, #160A00)", border: "1.5px solid #8B4513" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {sorted.map((r, i) => {
        const pct = totalVotes > 0 ? Math.round((r.votes / totalVotes) * 100) : 0;
        const barPct = (r.votes / maxVotes) * 100;
        const isYours = r.id === votedFor;
        const isTop   = i === 0;
        const isFlash = r.id === flash;
        const rs = rankStyles[i] || { bg: "linear-gradient(135deg,#0D1A0D,#142014)", border: "1px solid #2A3A2A" };

        const rankBadgeStyle = i === 0
          ? { background: "linear-gradient(135deg,#B8860B,#FFD700,#B8860B)", color: "#1C1400", boxShadow: "0 0 10px rgba(255,215,0,.5)" }
          : i === 1
          ? { background: "linear-gradient(135deg,#666,#aaa,#666)", color: "#fff" }
          : i === 2
          ? { background: "linear-gradient(135deg,#6B3A2A,#CD7F32,#6B3A2A)", color: "#fff" }
          : { background: "rgba(255,255,255,.06)", color: "#6A9A50", border: "1px solid #2A3A2A" };

        return (
          <div
            key={r.id}
            className={isFlash ? "casino-flash-card" : isTop ? "casino-top-card" : ""}
            style={{
              background: isYours && !isTop
                ? "linear-gradient(135deg,#1A0D1A,#2A1030,#1A0D1A)"
                : rs.bg,
              border: isYours && !isTop ? "1.5px solid #C45A88" : rs.border,
              borderRadius: "10px",
              padding: "10px 12px",
              transition: "all .4s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* subtle diamond pattern overlay for top 3 */}
            {i < 3 && (
              <div style={{ position: "absolute", inset: 0, opacity: 0.04,
                backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
                backgroundSize: "8px 8px", pointerEvents: "none" }}
              />
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "9px", position: "relative" }}>
              {/* Rank badge */}
              <div className="casino-rank-badge" style={rankBadgeStyle}>
                {i < 3 ? ["♛","♜","♝"][i] : <span style={{ fontSize: "10px" }}>{i + 1}</span>}
              </div>

              {/* Cuisine emoji */}
              <span style={{ fontSize: "18px", flexShrink: 0, filter: isTop ? "drop-shadow(0 0 4px rgba(255,215,0,.6))" : "none" }}>
                {CUISINE_EMOJI[r.cuisine] || "🍽️"}
              </span>

              {/* Name + bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <div style={{ minWidth: 0 }}>
                    <span
                      className={isTop ? "casino-shimmer-text" : ""}
                      style={{
                        fontSize: "13px", fontWeight: "900", display: "block",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        color: isTop ? undefined : isYours ? "#F2A8C4" : "#E8E8E8",
                        fontFamily: isTop ? "'Bebas Neue', sans-serif" : "inherit",
                        fontSize: isTop ? "15px" : "13px",
                        letterSpacing: isTop ? "1px" : "0",
                      }}
                    >
                      {r.name}
                    </span>
                    {isYours && (
                      <span style={{ fontSize: "9px", color: "#E87DA8", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>
                        ♠ your pick
                      </span>
                    )}
                  </div>

                  {/* Vote count */}
                  <div style={{ flexShrink: 0, marginLeft: "8px", textAlign: "right" }}>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: isTop ? "20px" : "16px",
                      lineHeight: 1,
                      color: isTop ? "#FFD700" : i === 1 ? "#AAAAAA" : i === 2 ? "#CD7F32" : "#6EC24A",
                      textShadow: isTop ? "0 0 10px rgba(255,215,0,.6)" : "none",
                    }}>
                      {r.votes}
                    </div>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,.35)", letterSpacing: "1px" }}>{pct}%</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: "4px", background: "rgba(0,0,0,.5)", borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    className={isTop ? "casino-bar" : isYours ? "casino-bar-pink" : "casino-bar-green"}
                    style={{ height: "100%", borderRadius: "2px", width: `${barPct}%`, transition: "width .8s cubic-bezier(.4,0,.2,1)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
function TucsonEatsTournament() {
  const [step,        setStep]        = useState("register");
  const [reg,         setReg]         = useState({ firstName: "", email: "", phone: "", zip: "" });
  const [regErrors,   setRegErrors]   = useState({});
  const [whoAnswer,   setWhoAnswer]   = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [hasVoted,    setHasVoted]    = useState(false);
  const [votedFor,    setVotedFor]    = useState(null);
  const [selectedId,  setSelectedId]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [newName,     setNewName]     = useState("");
  const [newCuisine,  setNewCuisine]  = useState("Sonoran");
  const [searchTerm,  setSearchTerm]  = useState("");
  const [flash,       setFlash]       = useState(null);
  const [agree,       setAgree]       = useState(false);
  const sessionStart = useState(() => Date.now())[0]; // capture page load time
  const [countdown, setCountdown] = useState(null); // seconds remaining before auto-reset

  const resetForNewVoter = async () => {
    await storage.delete(VOTED_KEY);
    setCountdown(null);
    setStep("register");
    setReg({ firstName: "", email: "", phone: "", zip: "" });
    setRegErrors({});
    setWhoAnswer("");
    setSelectedId(null);
    setHasVoted(false);
    setVotedFor(null);
    setShowAdd(false);
    setNewName("");
    setNewCuisine("Sonoran");
    setSearchTerm("");
    setAgree(false);
    setError(null);
  };

  // Auto-reset countdown when step reaches "done"
  useEffect(() => {
    if (step !== "done") { setCountdown(null); return; }
    setCountdown(10);
    const iv = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(iv); resetForNewVoter(); return null; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [step]);

  // Inject global CSS once
  useEffect(() => {
    if (!document.getElementById("te-global-styles")) {
      const style = document.createElement("style");
      style.id = "te-global-styles";
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }
  }, []);

  const syncStorage = async () => {
    let existing = [];
    try { const r = await storage.get(STORAGE_KEY); if (r) existing = JSON.parse(r.value); } catch {}
    const ids = new Set(existing.map(r => r.id));
    const missing = SEED.filter(r => !ids.has(r.id));
    const merged = missing.length ? [...existing, ...missing] : existing;
    if (missing.length) await storage.set(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  };

  const loadData = useCallback(async (polling = false) => {
    const merged = await syncStorage();
    if (polling) {
      setRestaurants(prev => {
        const changed = merged.find(r => { const o = prev.find(p => p.id === r.id); return o && r.votes > o.votes; });
        if (changed) { setFlash(changed.id); setTimeout(() => setFlash(null), 1200); }
        return merged;
      });
    } else {
      setRestaurants(merged);
    }
    try { const v = await storage.get(VOTED_KEY); if (v) { setHasVoted(true); setVotedFor(v.value); setStep("done"); } } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData(false);
    const iv = setInterval(() => loadData(true), 6000);
    return () => clearInterval(iv);
  }, [loadData]);

  const handleRegNext = async () => {
    const errs = validate(reg);
    if (Object.keys(errs).length) { setRegErrors(errs); return; }
    setRegErrors({});
    // Check if this email has already voted
    try {
      const rr = await storage.get(REGISTRY_KEY);
      if (rr) {
        const existing = JSON.parse(rr.value);
        const prior = existing.find(r => r.email && r.email.toLowerCase() === reg.email.toLowerCase());
        if (prior && !prior.allowRevote) {
          setRegErrors({ email: "This email has already been used to vote. Each person may only vote once." });
          return;
        }
      }
    } catch {}
    setStep("who");
  };

  const sendConfirmationEmail = async (firstName, email, restaurantName, cuisine) => {
    try {
      await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, email, restaurantName, cuisine }),
      });
    } catch (e) {
      console.warn("Email send failed:", e);
    }
  };

  const handleVote = async () => {
    if (!selectedId || hasVoted || submitting) return;
    setSubmitting(true); setError(null);
    try {
      const latest = await syncStorage();
      const updated = latest.map(r => r.id === selectedId ? { ...r, votes: r.votes + 1 } : r);
      await storage.set(STORAGE_KEY, JSON.stringify(updated));
      setRestaurants(updated);
      const entry = { ...reg, role: whoAnswer, votedFor: selectedId, votedAt: Date.now(), sessionStart };
      let registry = [];
      try { const rr = await storage.get(REGISTRY_KEY); if (rr) registry = JSON.parse(rr.value); } catch {}
      registry.push(entry);
      await storage.set(REGISTRY_KEY, JSON.stringify(registry));
      await storage.set(VOTED_KEY, selectedId);
      setHasVoted(true); setVotedFor(selectedId); setStep("done");
      // Send confirmation email (non-blocking)
      const votedRestaurant = updated.find(r => r.id === selectedId);
      sendConfirmationEmail(reg.firstName, reg.email, votedRestaurant?.name, votedRestaurant?.cuisine);
    } catch { setError("Failed to submit. Please try again."); }
    setSubmitting(false);
  };

  const handleAddVote = async () => {
    if (!newName.trim() || hasVoted || submitting) return;
    setSubmitting(true); setError(null);
    try {
      const latest = await syncStorage();
      const exists = latest.find(r => r.name.toLowerCase() === newName.trim().toLowerCase());
      if (exists) { setError(`"${exists.name}" is already listed!`); setSubmitting(false); setShowAdd(false); setSearchTerm(newName.trim()); return; }
      const newId = `r_${Date.now()}`;
      const updated = [...latest, { id: newId, name: newName.trim(), cuisine: newCuisine, votes: 1, addedAt: Date.now() }];
      await storage.set(STORAGE_KEY, JSON.stringify(updated));
      await storage.set(VOTED_KEY, newId);
      // Save registry entry for add-and-vote path
      let registry2 = [];
      try { const rr = await storage.get(REGISTRY_KEY); if (rr) registry2 = JSON.parse(rr.value); } catch {}
      registry2.push({ ...reg, role: whoAnswer, votedFor: newId, votedAt: Date.now(), sessionStart });
      await storage.set(REGISTRY_KEY, JSON.stringify(registry2));
      setRestaurants(updated); setHasVoted(true); setVotedFor(newId); setStep("done");
      setNewName(""); setShowAdd(false);
      // Send confirmation email (non-blocking)
      sendConfirmationEmail(reg.firstName, reg.email, newName.trim(), newCuisine);
    } catch { setError("Failed to add. Please try again."); }
    setSubmitting(false);
  };

  const sorted     = [...restaurants].sort((a, b) => b.votes - a.votes);
  const totalVotes = restaurants.reduce((s, r) => s + r.votes, 0);
  const maxVotes   = sorted[0]?.votes || 1;
  const votedRest  = restaurants.find(r => r.id === votedFor);
  const filtered   = restaurants
    .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.cuisine.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🌵</div>
        <div style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase" }}>Loading Tucson's Best…</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'DM Sans', sans-serif", color: "#fff" }}>

      {/* ── NAV ── */}
      <nav className="te-nav">
        <a className="te-nav-brand" href="#">
          <TucsonEatsLogo height={60}/>
        </a>
        <div className="te-nav-links">
          <a onClick={e=>{e.preventDefault();document.getElementById("how-it-works")?.scrollIntoView({behavior:"smooth"})}} href="#how-it-works" className="hide-sm">How It Works</a>
          <a onClick={e=>{e.preventDefault();document.getElementById("timeline")?.scrollIntoView({behavior:"smooth"})}} href="#timeline" className="hide-sm">Schedule</a>
          <a onClick={e=>{e.preventDefault();document.getElementById("prizes")?.scrollIntoView({behavior:"smooth"})}} href="#prizes" className="hide-sm">Prizes</a>
          <a onClick={e=>{e.preventDefault();document.getElementById("vote")?.scrollIntoView({behavior:"smooth"})}} href="#vote" className="te-nav-cta">🗳️ Vote Now</a>
        </div>
      </nav>

      {/* ── HERO + LIVE RANKINGS (two-column) ── */}
      <div style={{ background: "linear-gradient(160deg, #2A4820 0%, #396531 50%, #2A4820 100%)", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        {/* background glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 60%, rgba(75,134,62,.25) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(212,22,116,.1) 0%, transparent 50%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 380px", minHeight: "520px", position: "relative", zIndex: 1 }}>

          {/* ── LEFT: Brand + CTA ── */}
          <div style={{ padding: "52px 40px 52px 32px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid var(--border)" }}>
            {/* Coming Soon Banner — bold designed */}
            <div style={{ marginBottom: "24px", position: "relative", display: "inline-block", width: "fit-content" }}>
              <div style={{
                background: "linear-gradient(135deg, #0D1A00, #1A3510, #0D1A00)",
                border: "1px solid rgba(184,134,11,.4)",
                borderRadius: "14px",
                padding: "14px 22px",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 0 30px rgba(184,134,11,.12), inset 0 1px 0 rgba(255,215,0,.1)",
              }}>
                {/* shimmer overlay */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 40%, rgba(255,215,0,.05) 50%, transparent 60%)", backgroundSize: "200% 100%", animation: "casino-shimmer 3s linear infinite", pointerEvents: "none" }} />
                {/* top gold line */}
                <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg,transparent,#FFD700,transparent)" }} />

                <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
                  <span style={{ fontSize: "22px" }}>🍽️</span>
                  <div>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "clamp(18px, 2.5vw, 26px)",
                      letterSpacing: "3px",
                      lineHeight: 1,
                      background: "linear-gradient(90deg,#B8860B,#FFD700,#FFF8DC,#FFD700,#B8860B)",
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "casino-shimmer 2.5s linear infinite",
                      marginBottom: "3px",
                    }}>
                      TucsonEats.com
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", letterSpacing: "1px" }}>Local Restaurant Delivery Service</span>
                      <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(184,134,11,.6)", display: "inline-block" }} />
                      <span style={{ fontSize: "11px", color: "var(--gold)", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main headline */}
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 6vw, 80px)", lineHeight: 0.9, letterSpacing: "-0.5px", marginBottom: "18px" }}>
              <span style={{ color: "#fff", display: "block" }}>TUCSON'S</span>
              <span style={{ color: "var(--green-light)", display: "block" }}>FAVORITE</span>
              <span style={{ color: "var(--pink)", display: "block" }}>RESTAURANT</span>
              <span style={{ color: "#fff", display: "block" }}>TOURNAMENT</span>
            </h1>

            {/* Tagline */}
            <p style={{ color: "var(--text-muted)", fontSize: "clamp(14px, 1.6vw, 16px)", lineHeight: "1.65", marginBottom: "10px", maxWidth: "440px" }}>
              <strong style={{ color: "#fff" }}>Built by Tucson. For Tucson.</strong>
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 1.4vw, 15px)", lineHeight: "1.65", marginBottom: "28px", maxWidth: "440px" }}>
              We're launching a new local restaurant delivery service designed to support our city's <strong style={{ color: "#fff" }}>restaurants</strong>, <strong style={{ color: "#fff" }}>drivers</strong>, and <strong style={{ color: "#fff" }}>families</strong>. Before we go live — the community votes.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "36px" }}>
              <button onClick={() => document.getElementById("vote")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="te-btn-primary">🗳️ Cast Your Vote</button>
              <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="te-btn-outline">How It Works</button>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: "0", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", width: "fit-content", background: "rgba(0,0,0,.2)" }}>
              {[
                { num: totalVotes,         label: "Votes Cast" },
                { num: restaurants.length, label: "Restaurants" },
                { num: "Mar 24",           label: "Top 16 Set" },
                { num: "Apr 6",            label: "Champion" },
              ].map((s, i, arr) => (
                <div key={i} style={{ padding: "14px 20px", textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", color: "var(--green-light)", lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", marginTop: "3px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Casino Live Rankings ── */}
          <div style={{ background: "linear-gradient(180deg, #0D1A00 0%, #0A1400 40%, #050D00 100%)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

            {/* felt texture overlay */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.06,
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "12px 12px", pointerEvents: "none" }} />

            {/* gold top border */}
            <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, #B8860B, #FFD700, #FFF8DC, #FFD700, #B8860B, transparent)", flexShrink: 0 }} />

            {/* header */}
            <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(184,134,11,.3)", flexShrink: 0, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🎰</span>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "3px",
                    background: "linear-gradient(90deg,#B8860B,#FFD700,#FFF8DC,#FFD700,#B8860B)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    animation: "casino-shimmer 2.5s linear infinite",
                  }}>
                    LIVE LEADERBOARD
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FFD700", boxShadow: "0 0 8px #FFD700", animation: "te-pulse 1.5s infinite" }} />
                  <span style={{ fontSize: "9px", color: "#B8860B", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>LIVE</span>
                </div>
              </div>
              {/* decorative suit row */}
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", opacity: 0.35 }}>
                {["♠","♥","♦","♣"].map(s => <span key={s} style={{ fontSize: "12px", color: s === "♥" || s === "♦" ? "#cc2222" : "#fff" }}>{s}</span>)}
              </div>
            </div>

            {/* ticket counter */}
            <div style={{ padding: "8px 16px", borderBottom: "1px solid rgba(184,134,11,.2)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,.3)", flexShrink: 0 }}>
              <span style={{ fontSize: "10px", color: "rgba(184,134,11,.7)", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>Total Votes</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", color: "#FFD700", letterSpacing: "2px", textShadow: "0 0 8px rgba(255,215,0,.4)" }}>{totalVotes}</span>
            </div>

            {/* rankings list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 16px" }}>
              <RankingsList sorted={sorted} totalVotes={totalVotes} maxVotes={maxVotes} votedFor={votedFor} flash={flash} />
            </div>

            {/* gold bottom border + CTA */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #B8860B, #FFD700, #B8860B, transparent)" }} />
              <div style={{ padding: "14px 16px", background: "rgba(0,0,0,.4)" }}>
                <a onClick={e=>{e.preventDefault();document.getElementById("vote")?.scrollIntoView({behavior:"smooth"})}} href="#vote" style={{
                  display: "block", textAlign: "center",
                  background: "linear-gradient(135deg, #8B6914, #B8860B, #FFD700, #B8860B, #8B6914)",
                  color: "#1C1400", borderRadius: "8px", padding: "11px",
                  fontSize: "12px", fontWeight: "900", letterSpacing: "2px",
                  textTransform: "uppercase", textDecoration: "none",
                  boxShadow: "0 0 20px rgba(255,215,0,.3), 0 4px 14px rgba(0,0,0,.5)",
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: "15px",
                  cursor: "pointer",
                }}>
                  🎲 Place Your Vote
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="te-divider" />

      {/* ── HOW IT WORKS ── */}
      <section className="te-section" id="how-it-works">
        <div className="te-section-inner">
          <div className="te-section-tag">How It Works</div>
          <h2 className="te-section-title">Simple. Fun. Community-Powered.</h2>
          <p className="te-section-sub">Three steps to help crown Tucson's favorite restaurant — and earn rewards when TucsonEats launches.</p>
          <div className="te-how-grid">
            {[
              { num: "1", icon: "🗳️", title: "Cast Your Vote", desc: "Vote for your favorite locally owned Tucson restaurant. Search the list or add one that's missing." },
              { num: "2", icon: "🏆", title: "Top 16 Advance",  desc: "The top 16 most-voted restaurants advance to the official bracket on March 24. Head-to-head matchups begin." },
              { num: "3", icon: "👑", title: "Crown the Champion", desc: "Vote each round until a champion is crowned on April 6. Tucson decides — no algorithms, just community." },
            ].map(c => (
              <div className="te-how-card" key={c.num}>
                <div className="te-how-num">{c.num}</div>
                <div className="te-how-icon">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="te-divider" />

      {/* ── PRIZES ── */}
      <section className="te-section" id="prizes">
        <div className="te-section-inner">
          <div className="te-section-tag">Why Vote?</div>
          <h2 className="te-section-title">Vote. Win. Support Local.</h2>
          <p className="te-section-sub">Every vote supports Tucson's local restaurant scene. Plus — voters earn exclusive rewards when TucsonEats launches in mid-April.</p>
          <div className="te-prizes-grid">
            <div className="te-prize-card gold">
              <div className="te-prize-icon">🎉</div>
              <h3>Free Delivery on Your First Order</h3>
              <p>All voters receive free delivery (delivery fee waived) on their first order when TucsonEats.com launches.</p>
              <span className="te-prize-highlight gold">All Voters</span>
            </div>
            <div className="te-prize-card green">
              <div className="te-prize-icon">💵</div>
              <h3>$10 Hungry Bucks Credit</h3>
              <p>Voters who supported the championship-winning restaurant receive $10 in digital credit, valid for 90 days after launch.</p>
              <span className="te-prize-highlight green">Champion Supporters</span>
            </div>
            <div className="te-prize-card green">
              <div className="te-prize-icon">🌵</div>
              <h3>Support Tucson Restaurants</h3>
              <p>TucsonEats was created to support locally owned restaurants and keep more dollars in our community. This championship is powered by Tucson.</p>
              <span className="te-prize-highlight green">Community Impact</span>
            </div>
          </div>
        </div>
      </section>

      <div className="te-divider" />

      {/* ── TIMELINE ── */}
      <section className="te-section" id="timeline">
        <div className="te-section-inner" style={{ maxWidth: "600px" }}>
          <div className="te-section-tag">Schedule</div>
          <h2 className="te-section-title">Tournament Timeline</h2>
          <p className="te-section-sub">Mark your calendar — every round needs your vote.</p>
          <div className="te-timeline">
            {[
              { active: true,  date: "Now — March 23",  title: "Nomination Voting Open",      desc: "Vote for your favorite restaurant. Top 16 most-voted earn their bracket spot." },
              { active: false, date: "March 24",         title: "🏀 Sweet 16 Bracket Starts", desc: "The official Sweet 16 bracket is revealed and voting begins. Head-to-head matchups start today!" },
              { active: false, date: "March 24 – April 5", title: "Round 1 & Quarterfinals", desc: "Community votes determine who advances in each head-to-head matchup." },
              { active: false, date: "April 1–5",        title: "Semifinals",                  desc: "The final four battle it out. Only two advance to the championship." },
              { active: false, date: "April 6",          title: "🏆 Champion Crowned",         desc: "Tucson votes. One restaurant wins. $10 Hungry Bucks delivered to champion supporters." },
            ].map((t, i) => (
              <div className="te-tl-item" key={i}>
                <div className={`te-tl-dot${t.active ? " active" : ""}`}>{t.active ? "🗳️" : "📅"}</div>
                <div style={{ paddingTop: "8px" }}>
                  <div className="te-tl-date">{t.date}</div>
                  <div className="te-tl-title">{t.title}</div>
                  <div className="te-tl-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="te-divider" />

      {/* ── VOTE SECTION ── */}
      <section className="te-section" id="vote" style={{ background: "linear-gradient(160deg,#2A4820,#243D1C,#2A4820)" }}>
        <div className="te-section-inner">
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div className="te-section-tag">Cast Your Vote</div>
            <h2 className="te-section-title">Who's Tucson's Favorite?</h2>
            <p className="te-section-sub" style={{ margin: "0 auto" }}>
              Voting closes <strong style={{ color: "#fff" }}>March 24 at 11:59 PM</strong>. Top 16 advance to the championship bracket.
            </p>
          </div>

          <div className="te-vote-layout">

            {/* ── VOTE PANEL (left) ── */}
            <div style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}>
              <StepBar step={step} />

              {/* Step 1 — Register */}
              {step === "register" && (
                <div className="te-fade-up" style={{ padding: "28px 24px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "4px", color: "var(--pink)", textTransform: "uppercase", marginBottom: "6px" }}>Step 1 of 3</div>
                  <h3 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "6px" }}>Create Your Voter Profile</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "22px", lineHeight: "1.5" }}>
                    Quick sign-up so each vote counts once. Your info stays private. <em>Voting closes March 24 at 11:59 PM.</em>
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                    {[
                      { key: "firstName", label: "First Name",    type: "text",  ph: "e.g. Maria" },
                      { key: "email",     label: "Email Address", type: "email", ph: "e.g. maria@email.com" },
                      { key: "phone",     label: "Phone Number",  type: "tel",   ph: "e.g. 520-555-1234" },
                      { key: "zip",       label: "ZIP Code",      type: "text",  ph: "e.g. 85701", max: 5 },
                    ].map(({ key, label, type, ph, max }) => (
                      <div key={key}>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "5px" }}>{label}</label>
                        <input
                          type={type} placeholder={ph} maxLength={max} value={reg[key]}
                          onChange={e => setReg({ ...reg, [key]: key === "zip" ? e.target.value.replace(/\D/g, "") : e.target.value })}
                          style={iStyle(regErrors[key] ? { borderColor: "var(--pink)" } : {})}
                        />
                        {regErrors[key] && <div style={{ color: "var(--pink-light)", fontSize: "11px", marginTop: "3px" }}>⚠ {regErrors[key]}</div>}
                      </div>
                    ))}
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                      <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ marginTop: "2px", accentColor: "var(--green)" }} />
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                        I agree to receive updates from TucsonEats.com about the championship, local restaurant news, and exclusive offers.
                      </span>
                    </label>
                    <button onClick={handleRegNext} style={{ background: "linear-gradient(135deg,var(--green),var(--green-dark))", color: "#fff", border: "none", borderRadius: "9px", padding: "13px", fontSize: "13px", fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 20px rgba(61,122,42,.4)" }}>
                      Next: Your Role →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 — Who */}
              {step === "who" && (
                <div className="te-fade-up" style={{ padding: "28px 24px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "4px", color: "var(--pink)", textTransform: "uppercase", marginBottom: "6px" }}>Step 2 of 3</div>
                  <h3 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "6px" }}>Which Best Describes You?</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>Select the option that fits best.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                    {WHO_OPTIONS.map(opt => (
                      <button key={opt.id} onClick={() => setWhoAnswer(opt.id)} style={{ background: whoAnswer === opt.id ? "var(--card-hov)" : "var(--card)", border: whoAnswer === opt.id ? "2px solid var(--pink)" : "1.5px solid var(--border)", borderRadius: "10px", padding: "12px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "12px", color: "inherit", transition: "all .15s" }}>
                        <span style={{ fontSize: "20px" }}>{opt.emoji}</span>
                        <span style={{ fontSize: "13px", fontWeight: "700", flex: 1 }}>{opt.label}</span>
                        {whoAnswer === opt.id && <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "var(--pink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "900" }}>✓</div>}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setStep("register")} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: "9px", padding: "12px 16px", cursor: "pointer", color: "var(--text-muted)", fontSize: "12px", fontFamily: "inherit", fontWeight: "700" }}>← Back</button>
                    <button onClick={() => whoAnswer && setStep("vote")} disabled={!whoAnswer} style={{ flex: 1, background: whoAnswer ? "linear-gradient(135deg,var(--green),var(--green-dark))" : "rgba(255,255,255,.1)", color: whoAnswer ? "#fff" : "rgba(255,255,255,.3)", border: "none", borderRadius: "9px", padding: "12px", fontSize: "13px", fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase", cursor: whoAnswer ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                      Next: Cast Your Vote →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 — Vote */}
              {step === "vote" && (
                <div className="te-fade-up" style={{ padding: "24px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "4px", color: "var(--pink)", textTransform: "uppercase", marginBottom: "5px" }}>Step 3 of 3</div>
                  <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "14px", lineHeight: "1.5" }}>
                    Hey <strong style={{ color: "#fff" }}>{reg.firstName}</strong>! Pick your favorite Tucson restaurant.
                  </p>
                  <div style={{ position: "relative", marginBottom: "10px" }}>
                    <input type="text" placeholder="Search restaurant or cuisine…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={iStyle({ paddingLeft: "34px", borderColor: "var(--border-hov)" })} />
                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🔍</span>
                  </div>
                  {error && <div style={{ background: "rgba(200,50,50,.15)", border: "1px solid var(--pink-dark)", borderRadius: "7px", padding: "9px 12px", marginBottom: "10px", color: "var(--pink-light)", fontSize: "12px" }}>⚠️ {error}</div>}
                  <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "5px", marginBottom: "10px" }}>
                    {filtered.length > 0 ? filtered.map(r => (
                      <button key={r.id} onClick={() => setSelectedId(r.id)} style={{ background: selectedId === r.id ? "var(--card-hov)" : "var(--card)", border: selectedId === r.id ? "1.5px solid var(--green)" : "1.5px solid var(--border)", borderRadius: "9px", padding: "10px 12px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "9px", color: "inherit", transition: "all .15s", flexShrink: 0 }}>
                        <span style={{ fontSize: "17px" }}>{CUISINE_EMOJI[r.cuisine] || "🍽️"}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{r.cuisine}</div>
                        </div>
                        {selectedId === r.id && <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "900", flexShrink: 0 }}>✓</div>}
                      </button>
                    )) : (
                      <div style={{ textAlign: "center", padding: "22px", color: "var(--text-dim)", border: "1px dashed var(--border)", borderRadius: "9px" }}>
                        <div style={{ fontSize: "22px", marginBottom: "5px" }}>🌵</div>
                        <div style={{ fontSize: "12px" }}>{searchTerm ? `No results for "${searchTerm}"` : "No restaurants found!"}</div>
                      </div>
                    )}
                  </div>
                  {!showAdd ? (
                    <button onClick={() => { setShowAdd(true); setNewName(searchTerm); }} style={{ width: "100%", background: "none", border: "1.5px dashed var(--green)", borderRadius: "9px", padding: "10px", cursor: "pointer", color: "var(--green-light)", fontSize: "12px", fontWeight: "700", fontFamily: "inherit", marginBottom: "10px" }}>
                      🌵 Add a restaurant not on the list
                    </button>
                  ) : (
                    <div style={{ background: "rgba(0,0,0,.2)", border: "1.5px solid var(--green)", borderRadius: "9px", padding: "14px", marginBottom: "10px" }}>
                      <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "3px", color: "var(--pink)", textTransform: "uppercase", marginBottom: "10px" }}>Add & Vote</div>
                      <input type="text" placeholder="Restaurant name…" value={newName} onChange={e => setNewName(e.target.value)} autoFocus style={iStyle({ marginBottom: "8px" })} />
                      <select value={newCuisine} onChange={e => setNewCuisine(e.target.value)} style={iStyle({ marginBottom: "10px" })}>
                        {CUISINE_OPTIONS.map(c => <option key={c} value={c}>{CUISINE_EMOJI[c]} {c}</option>)}
                      </select>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={handleAddVote} disabled={!newName.trim() || submitting} style={{ flex: 1, background: newName.trim() ? "var(--green)" : "rgba(255,255,255,.1)", color: newName.trim() ? "#fff" : "rgba(255,255,255,.3)", border: "none", borderRadius: "7px", padding: "10px", cursor: newName.trim() ? "pointer" : "not-allowed", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "inherit" }}>
                          {submitting ? "Adding…" : "🌵 Add & Vote"}
                        </button>
                        <button onClick={() => { setShowAdd(false); setError(null); }} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: "7px", padding: "10px 14px", cursor: "pointer", color: "var(--text-muted)", fontFamily: "inherit", fontSize: "11px" }}>Cancel</button>
                      </div>
                    </div>
                  )}
                  {selectedId && !showAdd && (
                    <button onClick={handleVote} disabled={submitting} style={{ width: "100%", background: "linear-gradient(135deg,var(--green),var(--green-dark))", color: "#fff", border: "none", borderRadius: "9px", padding: "13px", fontSize: "13px", fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 20px rgba(61,122,42,.4)" }}>
                      {submitting ? "Submitting…" : "🗳️ Submit My Vote"}
                    </button>
                  )}
                  <button onClick={() => setStep("who")} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: "8px", padding: "9px 14px", cursor: "pointer", color: "var(--text-muted)", fontSize: "11px", fontFamily: "inherit", fontWeight: "700", marginTop: "8px" }}>← Back</button>
                </div>
              )}

              {/* Done */}
              {step === "done" && (
                <div className="te-fade-up" style={{ padding: "36px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: "50px", marginBottom: "14px" }}>🌵</div>
                  <div style={{ color: "var(--green-light)", fontSize: "10px", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "6px" }}>Vote Recorded!</div>
                  <h3 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "8px" }}>Thanks{reg.firstName ? `, ${reg.firstName}` : ""}!</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.6", maxWidth: "240px", marginBottom: "20px" }}>
                    Your vote for <strong style={{ color: "#fff" }}>{votedRest?.name}</strong> has been counted!
                  </p>
                  <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "16px 24px", marginBottom: "14px", width: "100%", maxWidth: "240px" }}>
                    <div style={{ fontSize: "26px", marginBottom: "5px" }}>{CUISINE_EMOJI[votedRest?.cuisine] || "🍽️"}</div>
                    <div style={{ fontWeight: "900", fontSize: "15px" }}>{votedRest?.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginTop: "2px" }}>{votedRest?.cuisine}</div>
                  </div>
                  <div style={{ background: "rgba(245,200,66,.1)", border: "1px solid rgba(245,200,66,.25)", borderRadius: "10px", padding: "12px 16px", fontSize: "12px", color: "var(--gold)", maxWidth: "260px", lineHeight: "1.5" }}>
                    🎉 Check your email — you'll get <strong>free delivery</strong> on your first TucsonEats order!
                  </div>
                  <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    {/* Countdown ring */}
                    <div style={{ position: "relative", width: "52px", height: "52px" }}>
                      <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="26" cy="26" r="22" fill="none" stroke="var(--border)" strokeWidth="3" />
                        <circle
                          cx="26" cy="26" r="22" fill="none"
                          stroke="var(--green-light)" strokeWidth="3"
                          strokeDasharray={`${2 * Math.PI * 22}`}
                          strokeDashoffset={`${2 * Math.PI * 22 * (1 - (countdown || 0) / 10)}`}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 1s linear" }}
                        />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontFamily: "'Bebas Neue',sans-serif", color: "var(--green-light)", letterSpacing: "1px" }}>
                        {countdown}
                      </div>
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", letterSpacing: "2px", textTransform: "uppercase" }}>
                      Next voter in {countdown}s
                    </div>
                    <button
                      onClick={resetForNewVoter}
                      style={{ marginTop: "4px", background: "none", border: "1.5px solid var(--border-hov)", borderRadius: "9px", padding: "10px 20px", cursor: "pointer", color: "var(--text-muted)", fontSize: "11px", fontFamily: "inherit", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", transition: "all .15s" }}
                      onMouseOver={e => { e.target.style.color="#fff"; e.target.style.borderColor="#fff"; }}
                      onMouseOut={e => { e.target.style.color="var(--text-muted)"; e.target.style.borderColor="var(--border-hov)"; }}
                    >
                      👤 New Voter Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── RANKINGS PANEL (right) — Casino style ── */}
            <div className="te-vote-right" style={{ background: "linear-gradient(180deg,#0D1A00,#0A1400,#050D00)", display: "flex", flexDirection: "column", maxHeight: "600px", position: "relative", overflow: "hidden" }}>
              {/* felt dots */}
              <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "12px 12px", pointerEvents: "none" }} />
              {/* gold top bar */}
              <div style={{ height: "3px", background: "linear-gradient(90deg,transparent,#B8860B,#FFD700,#FFF8DC,#FFD700,#B8860B,transparent)", flexShrink: 0 }} />
              <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(184,134,11,.3)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "15px" }}>🎰</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "17px", letterSpacing: "3px", background: "linear-gradient(90deg,#B8860B,#FFD700,#FFF8DC,#FFD700,#B8860B)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "casino-shimmer 2.5s linear infinite" }}>
                      LIVE LEADERBOARD
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FFD700", boxShadow: "0 0 8px #FFD700", animation: "te-pulse 1.5s infinite" }} />
                    <span style={{ fontSize: "9px", color: "#B8860B", fontWeight: "700", letterSpacing: "2px" }}>LIVE</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "10px", opacity: 0.3 }}>
                    {["♠","♥","♦","♣"].map(s => <span key={s} style={{ fontSize: "11px", color: s === "♥" || s === "♦" ? "#cc2222" : "#fff" }}>{s}</span>)}
                  </div>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", color: "#FFD700", textShadow: "0 0 8px rgba(255,215,0,.4)" }}>{totalVotes} <span style={{ fontSize: "10px", color: "#B8860B", fontWeight: "400", letterSpacing: "1px" }}>VOTES</span></span>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 12px" }}>
                <RankingsList sorted={sorted} totalVotes={totalVotes} maxVotes={maxVotes} votedFor={votedFor} flash={flash} />
              </div>
              <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#B8860B,#FFD700,#B8860B,transparent)", flexShrink: 0 }} />
              <div style={{ padding: "10px 12px", textAlign: "center", background: "rgba(0,0,0,.3)", flexShrink: 0 }}>
                <span style={{ fontSize: "10px", color: "rgba(184,134,11,.6)", letterSpacing: "2px", textTransform: "uppercase" }}>🌵 {restaurants.length} restaurants competing</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="te-divider" />

      {/* ── FOOTER ── */}
      <footer className="te-footer">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
          <TucsonEatsLogo height={60}/>
        </div>
        <div style={{ color: "var(--text-dim)", fontSize: "12px", marginBottom: "16px" }}>Local Restaurant Delivery · Coming Mid-April</div>
        <div className="te-footer-links">
          <a href="#">Restaurant Partner Sign-Up</a>
          <a href="#">Become a Driver</a>
          <a href="#">Terms &amp; Privacy</a>
          <a href="#">Championship Bracket</a>
        </div>

        {/* Contact Info */}
        <div style={{ display: "flex", justifyContent: "center", gap: "28px", flexWrap: "wrap", margin: "18px 0 16px", padding: "18px 24px", background: "rgba(0,0,0,.2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <span style={{ fontSize: "16px" }}>✉️</span>
            <div>
              <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "2px" }}>Email</div>
              <a href="mailto:mike@tucsoneats.com" style={{ fontSize: "13px", color: "var(--green-light)", fontWeight: "600", textDecoration: "none", letterSpacing: "0.3px" }}>mike@tucsoneats.com</a>
            </div>
          </div>
          <div style={{ width: "1px", background: "var(--border)", alignSelf: "stretch" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <span style={{ fontSize: "16px" }}>📍</span>
            <div>
              <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "2px" }}>Address</div>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>2813 E Broadway Blvd, Tucson AZ 85716</span>
            </div>
          </div>
        </div>

        <div className="te-footer-copy">© 2025 TucsonEats.com · Built by Tucson. For Tucson. 🌵</div>
      </footer>

    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════════════════════════

// ── CSS ───────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:         #0F1A0A;
    --surface:    #172110;
    --card:       #1E2E14;
    --border:     #2A3E1A;
    --border-hov: #3D6530;
    --green:      #4B863E;
    --green-l:    #74A26B;
    --green-d:    #396531;
    --pink:       #D41674;
    --pink-l:     #E8449A;
    --gold:       #F5C842;
    --text:       #FFFFFF;
    --text-muted: #C5DDB8;
    --text-dim:   #6A9A50;
    --red:        #E53E3E;
    --sidebar-w:  220px;
  }
  html, body { height: 100%; }
  body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border-hov); border-radius: 4px; }

  /* LAYOUT */
  .adm-shell { display: flex; min-height: 100vh; }
  .adm-sidebar {
    width: var(--sidebar-w); flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
  }
  .adm-main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

  /* SIDEBAR */
  .adm-logo { padding: 24px 20px 20px; border-bottom: 1px solid var(--border); }
  .adm-logo-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; color: #fff; line-height: 1; }
  .adm-logo-sub { font-size: 9px; font-weight: 700; letter-spacing: 3px; color: var(--pink); text-transform: uppercase; margin-top: 2px; }
  .adm-nav { flex: 1; padding: 16px 10px; display: flex; flex-direction: column; gap: 4px; }
  .adm-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
    font-size: 13px; font-weight: 600; color: var(--text-dim);
    cursor: pointer; transition: all .15s; border: none; background: none;
    text-align: left; width: 100%; font-family: inherit;
  }
  .adm-nav-item:hover { color: var(--text-muted); background: rgba(255,255,255,.04); }
  .adm-nav-item.active { color: #fff; background: rgba(75,134,62,.2); border: 1px solid rgba(75,134,62,.3); }
  .adm-nav-item .nav-icon { font-size: 16px; width: 20px; text-align: center; }
  .adm-nav-section { font-size: 9px; font-weight: 700; letter-spacing: 3px; color: var(--border-hov); text-transform: uppercase; padding: 12px 12px 4px; }
  .adm-sidebar-footer { padding: 16px; border-top: 1px solid var(--border); }
  .adm-sidebar-footer p { font-size: 10px; color: var(--text-dim); text-align: center; }

  /* TOPBAR */
  .adm-topbar {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 0 28px; height: 60px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 40;
  }
  .adm-topbar-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 1px; color: #fff; }
  .adm-topbar-right { display: flex; align-items: center; gap: 12px; }
  .adm-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #4CAF50; box-shadow: 0 0 8px #4CAF50; animation: adm-pulse 2s infinite; }
  .adm-live-label { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #4CAF50; text-transform: uppercase; }

  /* CONTENT */
  .adm-content { flex: 1; padding: 28px; }

  /* STAT CARDS */
  .adm-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 28px; }
  .adm-stat {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 18px 20px;
    transition: border-color .2s;
  }
  .adm-stat:hover { border-color: var(--border-hov); }
  .adm-stat-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 8px; }
  .adm-stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: var(--green-l); line-height: 1; }
  .adm-stat-sub { font-size: 11px; color: var(--text-dim); margin-top: 4px; }

  /* TABLE */
  .adm-table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
  .adm-table-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .adm-table-header h3 { font-size: 14px; font-weight: 900; }
  .adm-table { width: 100%; border-collapse: collapse; }
  .adm-table th { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text-dim); padding: 10px 16px; text-align: left; border-bottom: 1px solid var(--border); background: rgba(0,0,0,.2); }
  .adm-table td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid rgba(42,62,26,.5); vertical-align: middle; }
  .adm-table tr:last-child td { border-bottom: none; }
  .adm-table tr:hover td { background: rgba(255,255,255,.02); }
  .adm-table-scroll { overflow-x: auto; }

  /* BADGES */
  .adm-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .adm-badge-green { background: rgba(75,134,62,.2); color: var(--green-l); border: 1px solid rgba(75,134,62,.3); }
  .adm-badge-pink  { background: rgba(212,22,116,.15); color: var(--pink-l); border: 1px solid rgba(212,22,116,.25); }
  .adm-badge-gold  { background: rgba(245,200,66,.12); color: var(--gold); border: 1px solid rgba(245,200,66,.25); }
  .adm-badge-dim   { background: rgba(255,255,255,.06); color: var(--text-dim); border: 1px solid var(--border); }

  /* INPUTS */
  .adm-input {
    background: rgba(0,0,0,.3); border: 1.5px solid var(--border);
    border-radius: 8px; padding: 9px 14px; color: #fff; font-size: 13px;
    font-family: inherit; outline: none; transition: border-color .15s;
  }
  .adm-input:focus { border-color: var(--green); }
  .adm-input::placeholder { color: var(--text-dim); }
  .adm-select { appearance: none; cursor: pointer; }

  /* BUTTONS */
  .adm-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; font-family: inherit; border: none; transition: all .15s; }
  .adm-btn-green { background: var(--green); color: #fff; }
  .adm-btn-green:hover { background: var(--green-d); }
  .adm-btn-outline { background: none; border: 1.5px solid var(--border-hov); color: var(--text-muted); }
  .adm-btn-outline:hover { border-color: #fff; color: #fff; }
  .adm-btn-red { background: rgba(229,62,62,.15); border: 1px solid rgba(229,62,62,.3); color: #fc8181; }
  .adm-btn-red:hover { background: rgba(229,62,62,.25); }
  .adm-btn-gold { background: rgba(245,200,66,.15); border: 1px solid rgba(245,200,66,.3); color: var(--gold); }
  .adm-btn-gold:hover { background: rgba(245,200,66,.25); }
  .adm-btn-sm { padding: 5px 10px; font-size: 10px; }
  .adm-btn:disabled { opacity: .4; cursor: not-allowed; }

  /* SEARCH */
  .adm-search-wrap { position: relative; }
  .adm-search-wrap .adm-input { padding-left: 34px; }
  .adm-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-dim); font-size: 14px; pointer-events: none; }

  /* CHART BAR */
  .adm-bar-track { height: 8px; background: rgba(0,0,0,.4); border-radius: 4px; overflow: hidden; }
  .adm-bar-fill { height: 100%; border-radius: 4px; transition: width .6s ease; }

  /* MODAL */
  .adm-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .adm-modal { background: var(--card); border: 1px solid var(--border-hov); border-radius: 16px; padding: 28px; width: 100%; max-width: 440px; }
  .adm-modal h3 { font-size: 18px; font-weight: 900; margin-bottom: 18px; }

  /* FORM ROW */
  .adm-form-row { margin-bottom: 14px; }
  .adm-form-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px; display: block; }

  /* LOGIN */
  .adm-login { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); }
  .adm-login-card { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 44px 36px; width: 100%; max-width: 380px; text-align: center; }
  .adm-login-icon { font-size: 48px; margin-bottom: 16px; }
  .adm-login-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 2px; margin-bottom: 6px; }
  .adm-login-sub { font-size: 13px; color: var(--text-dim); margin-bottom: 28px; }

  /* TOAST */
  .adm-toast { position: fixed; bottom: 24px; right: 24px; background: var(--green); color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; z-index: 999; animation: adm-slide-in .3s ease; box-shadow: 0 4px 20px rgba(75,134,62,.4); }
  .adm-toast.error { background: var(--red); }

  /* EMPTY */
  .adm-empty { text-align: center; padding: 48px 24px; color: var(--text-dim); }
  .adm-empty-icon { font-size: 40px; margin-bottom: 12px; }
  .adm-empty p { font-size: 14px; }

  /* REPORT CARDS */
  .adm-report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 24px; }
  .adm-report-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; }
  .adm-report-card h4 { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 16px; }

  /* SECTION TITLE */
  .adm-section-title { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 14px; }

  @keyframes adm-pulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }
  @keyframes adm-slide-in { from{transform:translateY(10px);opacity:0;} to{transform:translateY(0);opacity:1;} }
  @keyframes adm-fade-in { from{opacity:0;} to{opacity:1;} }
  .adm-fade { animation: adm-fade-in .3s ease; }

  /* CONFIRM DIALOG */
  .adm-confirm { background: var(--card); border: 1.5px solid rgba(229,62,62,.4); border-radius: 14px; padding: 24px; max-width: 360px; width: 100%; }
  .adm-confirm h4 { font-size: 16px; font-weight: 900; margin-bottom: 8px; }
  .adm-confirm p { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5; }

  @media(max-width: 768px) {
    .adm-sidebar { width: 60px; }
    .adm-sidebar .adm-logo-title, .adm-sidebar .adm-logo-sub, .adm-sidebar .adm-nav-item span:not(.nav-icon), .adm-sidebar .adm-nav-section, .adm-sidebar-footer p { display: none; }
    .adm-main { margin-left: 60px; }
    .adm-nav-item { justify-content: center; padding: 10px; }
  }
`;

// ── Tiny chart component ──────────────────────────────────
function BarChart({ data, colorFn }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{d.label}</span>
            <span style={{ fontSize: "12px", fontFamily: "'Bebas Neue',sans-serif", color: colorFn ? colorFn(i) : "var(--green-l)", letterSpacing: "1px" }}>{d.value}</span>
          </div>
          <div className="adm-bar-track">
            <div className="adm-bar-fill" style={{ width: `${(d.value / max) * 100}%`, background: colorFn ? colorFn(i) : "var(--green)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Login screen ──────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const handleSubmit = async () => {
    // Load admins from storage, fall back to default
    let admins = [DEFAULT_ADMIN];
    try {
      const stored = await storage.get(ADMINS_KEY);
      if (stored) admins = JSON.parse(stored.value);
    } catch {}
    const match = admins.find(a => a.username === username.trim() && a.password === pw);
    if (match) { onLogin(match); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  };
  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <div className="adm-login-icon">🌵</div>
        <div className="adm-login-title">Admin Panel</div>
        <div className="adm-login-sub">TucsonEats Tournament · Restricted Access</div>
        <div className="adm-form-row">
          <input
            className="adm-input" type="text" placeholder="Username"
            value={username} onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <input
            className="adm-input" type="password" placeholder="Password"
            value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", marginBottom: "12px", borderColor: err ? "var(--red)" : undefined }}
          />
        </div>
        {err && <p style={{ color: "var(--red)", fontSize: "12px", marginBottom: "10px" }}>Incorrect username or password</p>}
        <button className="adm-btn adm-btn-green" style={{ width: "100%", justifyContent: "center" }} onClick={handleSubmit}>
          🔐 Sign In
        </button>
      </div>
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────
function TucsonEatsAdmin() {
  const [authed, setAuthed]         = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [tab, setTab]               = useState("customers");
  const [admins, setAdmins]         = useState([DEFAULT_ADMIN]);
  const [adminModal, setAdminModal] = useState(null); // null | "add" | admin object
  const [adminForm, setAdminForm]   = useState({ name: "", username: "", password: "", role: "admin" });
  const [adminFormErr, setAdminFormErr] = useState({});
  const [restaurants, setRests]     = useState([]);
  const [registry, setRegistry]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState(null); // { type: "add"|"edit", data? }
  const [confirm, setConfirm]       = useState(null); // { msg, onConfirm }
  const [editForm, setEditForm]     = useState({ name: "", cuisine: "Sonoran", votes: 0, email: "", phone: "", address: "", manager: "" });
  const [custEditModal, setCustEditModal] = useState(null); // customer being edited
  const [custEditForm, setCustEditForm]   = useState({});
  const [custSort, setCustSort]     = useState("date");
  const [custView, setCustView]     = useState("list"); // "votes" | "list"
  const [restCols, setRestCols]     = useState({ rank: true, restaurant: true, cuisine: true, manager: true, phone: true, email: true, address: true, votes: true, share: true });
  const [selectedRestFilter, setSelectedRestFilter] = useState(null); // restaurant id to drill into

  // Inject CSS
  useEffect(() => {
    if (!document.getElementById("adm-styles")) {
      const s = document.createElement("style"); s.id = "adm-styles"; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    // Load restaurants
    let rests = [];
    try {
      const r = await storage.get(STORAGE_KEY);
      if (r) rests = JSON.parse(r.value);
      else rests = [...SEED];
    } catch { rests = [...SEED]; }
    setRests(rests);

    // Load registry
    let reg = [];
    try {
      const r = await storage.get(REGISTRY_KEY);
      if (r) reg = JSON.parse(r.value);
    } catch {}
    setRegistry(reg);

    // Load admins
    try {
      const r = await storage.get(ADMINS_KEY);
      if (r) setAdmins(JSON.parse(r.value));
      else setAdmins([DEFAULT_ADMIN]);
    } catch { setAdmins([DEFAULT_ADMIN]); }

    setLoading(false);
  }, []);

  useEffect(() => { if (authed) { loadData(); const iv = setInterval(loadData, 8000); return () => clearInterval(iv); } }, [authed, loadData]);

  // ── Restaurant actions ──
  const saveAdmins = async (updated) => {
    await storage.set(ADMINS_KEY, JSON.stringify(updated));
    setAdmins(updated);
  };

  const handleSaveAdmin = async () => {
    const errs = {};
    if (!adminForm.name.trim()) errs.name = "Required";
    if (!adminForm.username.trim()) errs.username = "Required";
    if (!adminForm.password.trim()) errs.password = "Required";
    if (adminModal === "add" && admins.find(a => a.username === adminForm.username.trim())) errs.username = "Username already exists";
    if (Object.keys(errs).length) { setAdminFormErr(errs); return; }
    setAdminFormErr({});
    if (adminModal === "add") {
      await saveAdmins([...admins, { ...adminForm, id: `adm_${Date.now()}` }]);
      showToast(`✅ Admin "${adminForm.name}" added`);
    } else {
      await saveAdmins(admins.map(a => a.username === adminModal.username ? { ...a, ...adminForm } : a));
      showToast(`✅ Admin "${adminForm.name}" updated`);
    }
    setAdminModal(null);
  };

  const handleDeleteAdmin = async (admin) => {
    if (admins.length === 1) { showToast("⚠️ Cannot delete the last admin"); return; }
    if (admin.username === currentAdmin?.username) { showToast("⚠️ Cannot delete yourself"); return; }
    await saveAdmins(admins.filter(a => a.username !== admin.username));
    showToast(`🗑️ Admin "${admin.name}" removed`);
  };

  const isSuperAdmin = currentAdmin?.role === "superadmin";

  const saveRests = async (updated) => {
    await storage.set(STORAGE_KEY, JSON.stringify(updated));
    setRests(updated);
  };

  const handleAddRestaurant = async () => {
    if (!editForm.name.trim()) return;
    const newR = { id: `r${Date.now()}`, name: editForm.name.trim(), cuisine: editForm.cuisine, votes: 0, email: editForm.email, phone: editForm.phone, address: editForm.address, manager: editForm.manager };
    await saveRests([...restaurants, newR]);
    showToast(`✅ ${newR.name} added`);
    setModal(null); setEditForm({ name: "", cuisine: "Sonoran", votes: 0, email: "", phone: "", address: "", manager: "" });
  };

  const handleEditRestaurant = async () => {
    const updated = restaurants.map(r => r.id === modal.data.id ? { ...r, name: editForm.name, cuisine: editForm.cuisine, votes: parseInt(editForm.votes, 10) || 0, email: editForm.email, phone: editForm.phone, address: editForm.address, manager: editForm.manager } : r);
    await saveRests(updated);
    showToast("✅ Restaurant updated");
    setModal(null);
  };

  const handleDeleteRestaurant = (r) => {
    setConfirm({
      msg: `Remove "${r.name}" and its ${r.votes} votes? This cannot be undone.`,
      onConfirm: async () => {
        await saveRests(restaurants.filter(x => x.id !== r.id));
        showToast(`🗑️ ${r.name} removed`);
        setConfirm(null);
      }
    });
  };

  const handleResetVotes = (r) => {
    setConfirm({
      msg: `Reset votes for "${r.name}" to 0?`,
      onConfirm: async () => {
        await saveRests(restaurants.map(x => x.id === r.id ? { ...x, votes: 0 } : x));
        showToast(`🔄 Votes reset for ${r.name}`);
        setConfirm(null);
      }
    });
  };

  const handleResetAllVotes = () => {
    setConfirm({
      msg: "Reset ALL votes to zero? This will clear every restaurant's vote count.",
      onConfirm: async () => {
        await saveRests(restaurants.map(r => ({ ...r, votes: 0 })));
        showToast("🔄 All votes reset");
        setConfirm(null);
      }
    });
  };

  // ── Customer edit / add ──
  const toggleRestEmailNotify = async (rest) => {
    await saveRests(restaurants.map(r => r.id === rest.id ? { ...r, emailNotify: !r.emailNotify } : r));
    showToast(!rest.emailNotify ? `🔔 Notifications ON for ${rest.name}` : `🔕 Notifications OFF for ${rest.name}`);
  };

  const toggleAllowRevote = async (customer) => {
    const idx = registry.findIndex(r => r.email === customer.email && r.votedAt === customer.votedAt);
    if (idx === -1) return;
    const updated = [...registry];
    updated[idx] = { ...updated[idx], allowRevote: !updated[idx].allowRevote };
    await storage.set(REGISTRY_KEY, JSON.stringify(updated));
    setRegistry(updated);
    showToast(updated[idx].allowRevote ? `✅ ${customer.firstName || customer.email} can now re-vote` : `🔒 ${customer.firstName || customer.email} locked to one vote`);
  };

  const toggleEmailNotification = async (customer) => {
    const idx = registry.findIndex(r => r.email === customer.email && r.votedAt === customer.votedAt);
    if (idx === -1) return;
    const updated = [...registry];
    updated[idx] = { ...updated[idx], emailNotify: !updated[idx].emailNotify };
    await storage.set(REGISTRY_KEY, JSON.stringify(updated));
    setRegistry(updated);
    showToast(updated[idx].emailNotify ? `🔔 Notifications ON for ${customer.firstName || customer.email}` : `🔕 Notifications OFF for ${customer.firstName || customer.email}`);
  };

  const handleSaveCustomer = async () => {
    if (!custEditModal) return;
    if (custEditModal === "new") {
      // Add new customer
      const newEntry = {
        ...custEditForm,
        votedAt: Date.now(),
        sessionStart: null,
      };
      const updated = [...registry, newEntry];
      await storage.set(REGISTRY_KEY, JSON.stringify(updated));
      setRegistry(updated);
      setCustEditModal(null);
      showToast("✅ Customer added");
    } else {
      // Edit existing customer
      const idx = registry.findIndex(r =>
        r.email === custEditModal.email && r.votedAt === custEditModal.votedAt
      );
      if (idx === -1) return;
      const updated = [...registry];
      updated[idx] = { ...updated[idx], ...custEditForm };
      await storage.set(REGISTRY_KEY, JSON.stringify(updated));
      setRegistry(updated);
      setCustEditModal(null);
      showToast("✅ Customer updated");
    }
  };

  // ── CSV Export ──
  const loadXLSX = () => new Promise((resolve, reject) => {
    if (window.XLSX) { resolve(window.XLSX); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => resolve(window.XLSX);
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const exportExcel = async () => {
    try {
      const XLSX = await loadXLSX();
      const rows = [
        ["First Name", "Email", "Phone", "ZIP", "Role", "Voted For", "Cuisine", "Date of Vote", "Time on Site"],
        ...registry.map(r => {
          const rest = restaurants.find(x => x.id === r.votedFor);
          const timeOnSite = r.sessionStart && r.votedAt
            ? (() => { const secs = Math.round((r.votedAt - r.sessionStart) / 1000); if (secs < 60) return `${secs}s`; return `${Math.floor(secs/60)}m ${secs%60}s`; })()
            : "—";
          return [
            r.firstName || "",
            r.email || "",
            r.phone || "",
            r.zip || "",
            WHO_LABELS[r.role] || r.role || "",
            rest?.name || "",
            rest?.cuisine || "",
            r.votedAt ? new Date(r.votedAt).toLocaleString() : "",
            timeOnSite,
          ];
        })
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      // Style header row width
      ws["!cols"] = [16,28,16,8,20,24,16,22,14].map(w => ({ wch: w }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Customers");
      XLSX.writeFile(wb, "tucsoneats-customers.xlsx");
      showToast("📊 Excel exported!");
    } catch { showToast("Export failed", true); }
  };

  const exportLeaderboardExcel = async () => {
    try {
      const XLSX = await loadXLSX();
      const rows = [
        ["Rank", "Restaurant", "Cuisine", "Votes", "Share %"],
        ...sorted.map((r, i) => [
          i + 1,
          r.name,
          r.cuisine,
          r.votes,
          totalVotes ? Math.round((r.votes / totalVotes) * 100) : 0,
        ])
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = [6, 28, 16, 8, 10].map(w => ({ wch: w }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leaderboard");
      XLSX.writeFile(wb, "tucsoneats-leaderboard.xlsx");
      showToast("📊 Leaderboard exported!");
    } catch { showToast("Export failed", true); }
  };

  // ── Derived data ──
  const totalVotes    = restaurants.reduce((s, r) => s + r.votes, 0);
  const sorted        = [...restaurants].sort((a, b) => b.votes - a.votes);
  const maxVotes      = sorted[0]?.votes || 1;

  const filteredCustomers = registry
    .filter(r => {
      const q = search.toLowerCase();
      return !q || r.firstName?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.phone?.includes(q);
    })
    .sort((a, b) => {
      if (custSort === "date") return (b.votedAt || 0) - (a.votedAt || 0);
      if (custSort === "name") return (a.firstName||"").localeCompare(b.firstName||"");
      return 0;
    });

  // Report data
  const cuisineVotes = Object.entries(
    restaurants.reduce((acc, r) => { acc[r.cuisine] = (acc[r.cuisine] || 0) + r.votes; return acc; }, {})
  ).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 8);

  const locationVotes = Object.entries(
    registry.reduce((acc, r) => { const k = r.zip ? `ZIP ${r.zip}` : "Unknown"; acc[k] = (acc[k]||0)+1; return acc; }, {})
  ).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 10);

  const COLORS = ["#FFD700","#C0C0C0","#CD7F32","#6EC24A","#74A26B","#4B863E","#396531","#243D1C"];

  if (!authed) return (
    <>
      <style>{CSS}</style>
      <LoginScreen onLogin={(admin) => { setAuthed(true); setCurrentAdmin(admin); }} />
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="adm-shell">

        {/* ── SIDEBAR ── */}
        <aside className="adm-sidebar">
          <div className="adm-logo">
            <div className="adm-logo-title">TUCSONEATS</div>
            <div className="adm-logo-sub">Admin Panel</div>
          </div>
          <nav className="adm-nav">
            <div className="adm-nav-section">Management</div>
            {[
              { id: "customers",   icon: "👥", label: "Customers" },
              { id: "restaurants", icon: "🍽️", label: "Restaurants" },
              { id: "reports",     icon: "📊", label: "Reports" },
              { id: "settings",    icon: "⚙️", label: "Settings" },
            ].map(n => (
              <button key={n.id} className={`adm-nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
          <div className="adm-sidebar-footer">
            <p>© 2025 TucsonEats</p>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="adm-main">
          {/* Topbar */}
          <div className="adm-topbar">
            <div className="adm-topbar-title">
              {tab === "customers" && "Customers"}
              {tab === "restaurants" && "Restaurants"}
              {tab === "reports" && "Reports"}
              {tab === "settings" && "Settings"}
            </div>
            <div className="adm-topbar-right">
              <div className="adm-live-dot" />
              <span className="adm-live-label">Live</span>
            </div>
          </div>

          <div className="adm-content adm-fade" key={tab}>

            {/* ── STATS ROW (always visible) ── */}
            <div className="adm-stats-row">
              <div className="adm-stat">
                <div className="adm-stat-label">Total Votes</div>
                <div className="adm-stat-val">{totalVotes}</div>
                <div className="adm-stat-sub">across {restaurants.length} restaurants</div>
              </div>
              <div className="adm-stat">
                <div className="adm-stat-label">Customers</div>
                <div className="adm-stat-val">{registry.length}</div>
                <div className="adm-stat-sub">unique customers</div>
              </div>
              <div className="adm-stat">
                <div className="adm-stat-label">Leading</div>
                <div className="adm-stat-val" style={{ fontSize: "20px", paddingTop: "6px" }}>{sorted[0]?.name || "—"}</div>
                <div className="adm-stat-sub">{sorted[0]?.votes || 0} votes</div>
              </div>
              <div className="adm-stat">
                <div className="adm-stat-label">Restaurants</div>
                <div className="adm-stat-val">{restaurants.length}</div>
                <div className="adm-stat-sub">competing</div>
              </div>
            </div>



            {/* ── CUSTOMERS TAB ── */}
            {tab === "customers" && (
              <div>
                {/* View toggle */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "18px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    className={`adm-btn ${custView === "votes" ? "adm-btn-green" : "adm-btn-outline"}`}
                    onClick={() => { setCustView("votes"); setSelectedRestFilter(null); }}
                  >📊 Total Votes</button>
                  <button
                    className={`adm-btn ${custView === "list" ? "adm-btn-green" : "adm-btn-outline"}`}
                    onClick={() => { setCustView("list"); setSelectedRestFilter(null); }}
                  >👥 All Customers</button>
                  <div style={{ marginLeft: "auto" }}>
                    <button className="adm-btn adm-btn-gold" onClick={exportExcel}>📊 Export Excel</button>
                  </div>
                </div>

                {/* ── TOTAL VOTES VIEW ── */}
                {custView === "votes" && !selectedRestFilter && (
                  <div className="adm-table-wrap">
                    <div className="adm-table-header">
                      <h3>Total Votes by Restaurant</h3>
                      <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Click a row to see voter details</span>
                    </div>
                    {sorted.length === 0 ? (
                      <div className="adm-empty"><div className="adm-empty-icon">🗳️</div><p>No votes yet</p></div>
                    ) : (
                      <div className="adm-table-scroll">
                        <table className="adm-table">
                          <thead>
                            <tr>
                              <th>Rank</th>
                              <th>Restaurant</th>
                              <th>Cuisine</th>
                              <th>Total Votes</th>
                              <th>Share</th>
                              <th>Voters</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {sorted.map((r, i) => {
                              const votersForThis = registry.filter(v => v.votedFor === r.id);
                              const pct = totalVotes ? Math.round((r.votes / totalVotes) * 100) : 0;
                              return (
                                <tr
                                  key={r.id}
                                  style={{ cursor: "pointer" }}
                                  onClick={() => setSelectedRestFilter(r.id)}
                                >
                                  <td>
                                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "20px", color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "var(--text-dim)" }}>
                                      #{i + 1}
                                    </span>
                                  </td>
                                  <td style={{ fontWeight: 700 }}>
                                    <span style={{ marginRight: "8px" }}>{CUISINE_EMOJI[r.cuisine] || "🍽️"}</span>
                                    {r.name}
                                  </td>
                                  <td><span className="adm-badge adm-badge-dim">{r.cuisine}</span></td>
                                  <td>
                                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "26px", color: i === 0 ? "#FFD700" : "var(--green-l)" }}>{r.votes}</span>
                                  </td>
                                  <td style={{ minWidth: "130px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <div className="adm-bar-track" style={{ flex: 1 }}>
                                        <div className="adm-bar-fill" style={{ width: `${(r.votes / maxVotes) * 100}%`, background: i === 0 ? "#FFD700" : "var(--green)" }} />
                                      </div>
                                      <span style={{ fontSize: "11px", color: "var(--text-dim)", width: "32px" }}>{pct}%</span>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="adm-badge adm-badge-green">{votersForThis.length} customers</span>
                                  </td>
                                  <td>
                                    <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={e => { e.stopPropagation(); setSelectedRestFilter(r.id); }}>
                                      View Details →
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* ── DRILL-DOWN: voters for a specific restaurant ── */}
                {custView === "votes" && selectedRestFilter && (() => {
                  const rest = restaurants.find(r => r.id === selectedRestFilter);
                  const voters = registry.filter(v => v.votedFor === selectedRestFilter);
                  return (
                    <div>
                      {/* Back + header */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                        <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => setSelectedRestFilter(null)}>← Back</button>
                        <div>
                          <div style={{ fontSize: "18px", fontWeight: 900 }}>
                            {CUISINE_EMOJI[rest?.cuisine] || "🍽️"} {rest?.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                            {rest?.votes || 0} total votes · {voters.length} customers
                          </div>
                        </div>
                      </div>

                      <div className="adm-table-wrap">
                        <div className="adm-table-header">
                          <h3>Voter Details — {rest?.name}</h3>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <div className="adm-search-wrap">
                              <span className="adm-search-icon">🔍</span>
                              <input className="adm-input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "180px" }} />
                            </div>
                          </div>
                        </div>
                        {voters.length === 0 ? (
                          <div className="adm-empty"><div className="adm-empty-icon">👤</div><p>No customers for this restaurant yet</p></div>
                        ) : (
                          <div className="adm-table-scroll">
                            <table className="adm-table">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Name</th>
                                  <th>Email</th>
                                  <th>Phone</th>
                                  <th>Location (ZIP)</th>
                                  <th>Who They Are</th>
                                  <th>Date of Vote</th>
                                  <th>Time on Site</th>
                                </tr>
                              </thead>
                              <tbody>
                                {voters
                                  .filter(v => {
                                    const q = search.toLowerCase();
                                    return !q || v.firstName?.toLowerCase().includes(q) || v.email?.toLowerCase().includes(q) || v.phone?.includes(q);
                                  })
                                  .sort((a, b) => (b.votedAt || 0) - (a.votedAt || 0))
                                  .map((v, i) => {
                                    const voteDate = v.votedAt ? new Date(v.votedAt) : null;
                                    const timeOnSite = v.sessionStart && v.votedAt
                                      ? (() => {
                                          const secs = Math.round((v.votedAt - v.sessionStart) / 1000);
                                          if (secs < 60) return `${secs}s`;
                                          const m = Math.floor(secs / 60), s = secs % 60;
                                          return `${m}m ${s}s`;
                                        })()
                                      : "—";
                                    return (
                                      <tr key={i}>
                                        <td style={{ color: "var(--text-dim)", fontSize: "12px" }}>{i + 1}</td>
                                        <td style={{ fontWeight: 700 }}>{v.firstName || "—"}</td>
                                        <td style={{ color: "var(--text-muted)" }}>{v.email}</td>
                                        <td style={{ color: "var(--text-muted)" }}>{v.phone}</td>
                                        <td><span className="adm-badge adm-badge-dim">📍 {v.zip}</span></td>
                                        <td><span className="adm-badge adm-badge-green">{WHO_LABELS[v.role] || v.role || "—"}</span></td>
                                        <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                          {voteDate ? (
                                            <div>
                                              <div style={{ fontWeight: 700, color: "#fff" }}>{voteDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                                              <div style={{ color: "var(--text-dim)", fontSize: "11px" }}>{voteDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                                            </div>
                                          ) : "—"}
                                        </td>
                                        <td>
                                          <span className={`adm-badge ${timeOnSite !== "—" ? "adm-badge-pink" : "adm-badge-dim"}`}>
                                            ⏱ {timeOnSite}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* ── ALL REGISTRATIONS VIEW ── */}
                {custView === "list" && (
                  <div className="adm-table-wrap">
                    <div className="adm-table-header">
                      <h3>All Customers</h3>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <div className="adm-search-wrap">
                          <span className="adm-search-icon">🔍</span>
                          <input className="adm-input" placeholder="Search name, email, phone…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "200px" }} />
                        </div>
                        <select className="adm-input adm-select" value={custSort} onChange={e => setCustSort(e.target.value)} style={{ width: "130px" }}>
                          <option value="date">Sort: Newest</option>
                          <option value="name">Sort: Name</option>
                        </select>
                        <button className="adm-btn adm-btn-green" onClick={() => {
                          setCustEditModal("new");
                          setCustEditForm({ firstName: "", email: "", phone: "", zip: "", role: "local", votedFor: "" });
                        }}>+ Add Customer</button>
                      </div>
                    </div>
                    {filteredCustomers.length === 0 ? (
                      <div className="adm-empty"><div className="adm-empty-icon">👥</div><p>No customers yet</p></div>
                    ) : (
                      <div className="adm-table-scroll">
                        <table className="adm-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>ZIP</th>
                              <th>Who</th>
                              <th>Voted For</th>
                              <th>Date of Vote</th>
                              <th>Time on Site</th>
                              <th>Notifications</th>
                              <th>Allow Re-vote</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCustomers.map((r, i) => {
                              const rest = restaurants.find(x => x.id === r.votedFor);
                              const voteDate = r.votedAt ? new Date(r.votedAt) : null;
                              const timeOnSite = r.sessionStart && r.votedAt
                                ? (() => {
                                    const secs = Math.round((r.votedAt - r.sessionStart) / 1000);
                                    if (secs < 60) return `${secs}s`;
                                    const m = Math.floor(secs / 60), s = secs % 60;
                                    return `${m}m ${s}s`;
                                  })()
                                : "—";
                              return (
                                <tr key={i}>
                                  <td style={{ fontWeight: 700 }}>{r.firstName || "—"}</td>
                                  <td style={{ color: "var(--text-muted)" }}>{r.email}</td>
                                  <td style={{ color: "var(--text-muted)" }}>{r.phone}</td>
                                  <td><span className="adm-badge adm-badge-dim">📍 {r.zip}</span></td>
                                  <td><span className="adm-badge adm-badge-green">{WHO_LABELS[r.role] || r.role || "—"}</span></td>
                                  <td>
                                    {rest ? (
                                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span>{CUISINE_EMOJI[rest.cuisine] || "🍽️"}</span>
                                        <span style={{ fontWeight: 700 }}>{rest.name}</span>
                                      </span>
                                    ) : <span style={{ color: "var(--text-dim)" }}>—</span>}
                                  </td>
                                  <td style={{ fontSize: "12px" }}>
                                    {voteDate ? (
                                      <div>
                                        <div style={{ fontWeight: 700 }}>{voteDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                                        <div style={{ color: "var(--text-dim)", fontSize: "11px" }}>{voteDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                                      </div>
                                    ) : "—"}
                                  </td>
                                  <td>
                                    <span className={`adm-badge ${timeOnSite !== "—" ? "adm-badge-pink" : "adm-badge-dim"}`}>
                                      ⏱ {timeOnSite}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      onClick={() => toggleEmailNotification(r)}
                                      title={r.emailNotify ? "Click to disable email notifications" : "Click to enable email notifications"}
                                      style={{
                                        display: "inline-flex", alignItems: "center", gap: "6px",
                                        padding: "5px 12px", borderRadius: "20px", fontSize: "11px",
                                        fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                        border: "1.5px solid",
                                        background: r.emailNotify ? "rgba(75,134,62,.2)" : "rgba(255,255,255,.04)",
                                        borderColor: r.emailNotify ? "var(--green)" : "var(--border)",
                                        color: r.emailNotify ? "var(--green-l)" : "var(--text-dim)",
                                        transition: "all .2s",
                                      }}
                                    >
                                      {r.emailNotify ? "🔔 On" : "🔕 Off"}
                                    </button>
                                  </td>
                                  <td>
                                    <button
                                      onClick={() => toggleAllowRevote(r)}
                                      title={r.allowRevote ? "Click to lock to one vote" : "Click to allow this person to vote again"}
                                      style={{
                                        display: "inline-flex", alignItems: "center", gap: "6px",
                                        padding: "5px 12px", borderRadius: "20px", fontSize: "11px",
                                        fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                        border: "1.5px solid",
                                        background: r.allowRevote ? "rgba(212,22,116,.15)" : "rgba(255,255,255,.04)",
                                        borderColor: r.allowRevote ? "#D41674" : "var(--border)",
                                        color: r.allowRevote ? "#D41674" : "var(--text-dim)",
                                        transition: "all .2s",
                                      }}
                                    >
                                      {r.allowRevote ? "✅ Allowed" : "🔒 Locked"}
                                    </button>
                                  </td>
                                  <td>
                                    <button
                                      className="adm-btn adm-btn-outline adm-btn-sm"
                                      onClick={() => {
                                        setCustEditModal(r);
                                        setCustEditForm({
                                          firstName: r.firstName || "",
                                          email:     r.email || "",
                                          phone:     r.phone || "",
                                          zip:       r.zip || "",
                                          role:      r.role || "other",
                                          votedFor:  r.votedFor || "",
                                        });
                                      }}
                                    >✏️ Edit</button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── RESTAURANTS TAB ── */}
            {tab === "restaurants" && (
              <div>
                {/* Column visibility filter */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "var(--text-dim)", marginRight: "4px" }}>Columns</span>
                  {[
                    { key: "rank", label: "Rank" },
                    { key: "restaurant", label: "Restaurant" },
                    { key: "cuisine", label: "Cuisine" },
                    { key: "manager", label: "Manager" },
                    { key: "phone", label: "Phone" },
                    { key: "email", label: "Email" },
                    { key: "address", label: "Address" },
                    { key: "votes", label: "Votes" },
                    { key: "share", label: "Share" },
                  ].map(col => (
                    <button
                      key={col.key}
                      onClick={() => setRestCols(c => ({ ...c, [col.key]: !c[col.key] }))}
                      style={{
                        padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit", border: "1.5px solid",
                        background: restCols[col.key] ? "rgba(75,134,62,.2)" : "transparent",
                        borderColor: restCols[col.key] ? "var(--green)" : "var(--border)",
                        color: restCols[col.key] ? "var(--green-l)" : "var(--text-dim)",
                        transition: "all .15s",
                      }}
                    >{col.label}</button>
                  ))}
                  <button
                    onClick={() => setRestCols({ rank: true, restaurant: true, cuisine: true, manager: true, phone: true, email: true, address: true, votes: true, share: true })}
                    style={{ marginLeft: "auto", padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "1.5px solid var(--border)", background: "transparent", color: "var(--text-dim)" }}
                  >Reset</button>
                </div>

                <div className="adm-table-wrap">
                  <div className="adm-table-header">
                    <h3>Restaurant Lineup</h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="adm-btn adm-btn-green" onClick={() => { setEditForm({ name: "", cuisine: "Sonoran" }); setModal({ type: "add" }); }}>+ Add Restaurant</button>
                    </div>
                  </div>
                  <div className="adm-table-scroll">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          {restCols.rank       && <th>Rank</th>}
                          {restCols.restaurant && <th>Restaurant</th>}
                          {restCols.cuisine    && <th>Cuisine</th>}
                          {restCols.manager    && <th>Manager</th>}
                          {restCols.phone      && <th>Phone</th>}
                          {restCols.email      && <th>Email</th>}
                          {restCols.address    && <th>Address</th>}
                          {restCols.votes      && <th>Votes</th>}
                          {restCols.share      && <th>Share</th>}
                          <th>Notifications</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map((r, i) => {
                          const pct = totalVotes ? Math.round((r.votes / totalVotes) * 100) : 0;
                          return (
                            <tr key={r.id}>
                              {restCols.rank && <td><span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "18px", color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "var(--text-dim)" }}>#{i + 1}</span></td>}
                              {restCols.restaurant && <td style={{ fontWeight: 700 }}><span style={{ marginRight: "8px" }}>{CUISINE_EMOJI[r.cuisine] || "🍽️"}</span>{r.name}</td>}
                              {restCols.cuisine && <td><span className="adm-badge adm-badge-dim">{r.cuisine}</span></td>}
                              {restCols.manager && <td style={{ color: "var(--text-muted)" }}>{r.manager || <span style={{ color: "var(--text-dim)" }}>—</span>}</td>}
                              {restCols.phone   && <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>{r.phone || <span style={{ color: "var(--text-dim)" }}>—</span>}</td>}
                              {restCols.email   && <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>{r.email || <span style={{ color: "var(--text-dim)" }}>—</span>}</td>}
                              {restCols.address && <td style={{ color: "var(--text-muted)", fontSize: "12px", maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.address || <span style={{ color: "var(--text-dim)" }}>—</span>}</td>}
                              {restCols.votes   && <td><span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "22px", color: "var(--green-l)" }}>{r.votes}</span></td>}
                              {restCols.share   && <td style={{ minWidth: "110px" }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div className="adm-bar-track" style={{ flex: 1 }}><div className="adm-bar-fill" style={{ width: `${(r.votes / maxVotes) * 100}%`, background: i === 0 ? "#FFD700" : "var(--green)" }} /></div><span style={{ fontSize: "11px", color: "var(--text-dim)", width: "32px" }}>{pct}%</span></div></td>}
                              <td>
                                <button
                                  onClick={() => toggleRestEmailNotify(r)}
                                  title={r.emailNotify ? "Click to disable vote notifications" : "Click to enable vote notifications"}
                                  style={{
                                    display: "inline-flex", alignItems: "center", gap: "6px",
                                    padding: "5px 12px", borderRadius: "20px", fontSize: "11px",
                                    fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                    border: "1.5px solid",
                                    background: r.emailNotify ? "rgba(75,134,62,.2)" : "rgba(255,255,255,.04)",
                                    borderColor: r.emailNotify ? "var(--green)" : "var(--border)",
                                    color: r.emailNotify ? "var(--green-l)" : "var(--text-dim)",
                                    transition: "all .2s",
                                  }}
                                >
                                  {r.emailNotify ? "🔔 On" : "🔕 Off"}
                                </button>
                              </td>
                              <td><button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => { setEditForm({ name: r.name, cuisine: r.cuisine, votes: r.votes, email: r.email||"", phone: r.phone||"", address: r.address||"", manager: r.manager||"" }); setModal({ type: "edit", data: r }); }}>✏️ Edit</button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── REPORTS TAB ── */}
            {tab === "reports" && (
              <div>
                <div className="adm-report-grid">
                  {/* Votes by cuisine */}
                  <div className="adm-report-card">
                    <h4>Votes by Cuisine</h4>
                    {cuisineVotes.length ? <BarChart data={cuisineVotes} colorFn={i => COLORS[i % COLORS.length]} /> : <div className="adm-empty"><p>No votes yet</p></div>}
                  </div>

                  {/* Votes by who */}
                  <div className="adm-report-card">
                    <h4>Voters by Location</h4>
                    {locationVotes.length ? <BarChart data={locationVotes} colorFn={() => "var(--pink)"} /> : <div className="adm-empty"><p>No customers yet</p></div>}
                  </div>
                </div>

                {/* Full leaderboard */}
                <div className="adm-report-card" style={{ marginBottom: "24px" }}>
                  <h4>Full Leaderboard</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                    {sorted.map((r, i) => {
                      const pct = totalVotes ? Math.round((r.votes / totalVotes) * 100) : 0;
                      return (
                        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "20px", color: COLORS[i] || "var(--text-dim)", width: "28px", textAlign: "right", flexShrink: 0 }}>#{i+1}</span>
                          <span style={{ fontSize: "18px", flexShrink: 0 }}>{CUISINE_EMOJI[r.cuisine]||"🍽️"}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontSize: "13px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "16px", color: COLORS[i] || "var(--green-l)", flexShrink: 0, marginLeft: "8px" }}>{r.votes} <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>({pct}%)</span></span>
                            </div>
                            <div className="adm-bar-track">
                              <div className="adm-bar-fill" style={{ width: `${(r.votes / maxVotes) * 100}%`, background: i === 0 ? "#FFD700" : "var(--green)" }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Export */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button className="adm-btn adm-btn-gold" onClick={exportExcel}>📊 Export Customers Excel</button>
                  <button className="adm-btn adm-btn-outline" onClick={exportLeaderboardExcel}>📊 Export Leaderboard Excel</button>
                </div>
              </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {tab === "settings" && (
              <div>
                {/* Logged-in info */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(75,134,62,.2)", border: "2px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👤</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "15px" }}>{currentAdmin?.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>@{currentAdmin?.username} · <span style={{ color: currentAdmin?.role === "superadmin" ? "#FFD700" : "var(--green-l)", fontWeight: 700 }}>{currentAdmin?.role === "superadmin" ? "⭐ Super Admin" : "Admin"}</span></div>
                  </div>
                  <button className="adm-btn adm-btn-outline adm-btn-sm" style={{ marginLeft: "auto" }} onClick={() => { setAdminModal(currentAdmin); setAdminForm({ name: currentAdmin.name, username: currentAdmin.username, password: currentAdmin.password, role: currentAdmin.role }); }}>✏️ Edit My Profile</button>
                </div>

                {/* Administrators */}
                <div className="adm-table-wrap">
                  <div className="adm-table-header">
                    <h3>Administrators</h3>
                    {isSuperAdmin && (
                      <button className="adm-btn adm-btn-green" onClick={() => { setAdminForm({ name: "", username: "", password: "", role: "admin" }); setAdminFormErr({}); setAdminModal("add"); }}>+ Add Admin</button>
                    )}
                  </div>
                  <div className="adm-table-scroll">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Username</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map((a, i) => (
                          <tr key={a.username}>
                            <td style={{ fontWeight: 700 }}>
                              {a.username === currentAdmin?.username && <span style={{ color: "var(--green-l)", fontSize: "11px", marginRight: "6px" }}>● You</span>}
                              {a.name}
                            </td>
                            <td style={{ color: "var(--text-muted)" }}>@{a.username}</td>
                            <td>
                              <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: a.role === "superadmin" ? "rgba(255,215,0,.15)" : "rgba(75,134,62,.15)", color: a.role === "superadmin" ? "#FFD700" : "var(--green-l)", border: `1px solid ${a.role === "superadmin" ? "rgba(255,215,0,.3)" : "rgba(75,134,62,.3)"}` }}>
                                {a.role === "superadmin" ? "⭐ Super Admin" : "Admin"}
                              </span>
                            </td>
                            <td style={{ display: "flex", gap: "8px" }}>
                              <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => { setAdminModal(a); setAdminForm({ name: a.name, username: a.username, password: a.password, role: a.role }); setAdminFormErr({}); }}>✏️ Edit</button>
                              {isSuperAdmin && a.username !== currentAdmin?.username && (
                                <button className="adm-btn adm-btn-red adm-btn-sm" onClick={() => handleDeleteAdmin(a)}>🗑️ Remove</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Info box */}
                <div style={{ background: "rgba(75,134,62,.08)", border: "1px solid rgba(75,134,62,.2)", borderRadius: "12px", padding: "16px 20px", marginTop: "20px" }}>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.7 }}>
                    <strong style={{ color: "var(--green-l)" }}>⭐ Super Admin</strong> — Can add, edit and remove other admins.<br/>
                    <strong style={{ color: "var(--green-l)" }}>Admin</strong> — Can manage customers, restaurants and reports but cannot manage other admins.
                  </p>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── ADMIN ADD / EDIT MODAL ── */}
      {adminModal && (
        <div className="adm-modal-bg" onClick={e => e.target === e.currentTarget && setAdminModal(null)}>
          <div className="adm-modal" style={{ maxWidth: "440px" }}>
            <h3>{adminModal === "add" ? "➕ Add Administrator" : "✏️ Edit Administrator"}</h3>

            <div className="adm-form-row">
              <label className="adm-form-label">Full Name</label>
              <input className="adm-input" style={{ width: "100%", borderColor: adminFormErr.name ? "var(--red)" : undefined }} placeholder="e.g. Mike Johnson" value={adminForm.name} onChange={e => setAdminForm(f => ({ ...f, name: e.target.value }))} />
              {adminFormErr.name && <p style={{ color: "var(--red)", fontSize: "11px", margin: "4px 0 0" }}>{adminFormErr.name}</p>}
            </div>

            <div className="adm-form-row">
              <label className="adm-form-label">Username</label>
              <input className="adm-input" style={{ width: "100%", borderColor: adminFormErr.username ? "var(--red)" : undefined }} placeholder="e.g. mike" value={adminForm.username} onChange={e => setAdminForm(f => ({ ...f, username: e.target.value }))} />
              {adminFormErr.username && <p style={{ color: "var(--red)", fontSize: "11px", margin: "4px 0 0" }}>{adminFormErr.username}</p>}
            </div>

            <div className="adm-form-row">
              <label className="adm-form-label">Password</label>
              <input className="adm-input" type="password" style={{ width: "100%", borderColor: adminFormErr.password ? "var(--red)" : undefined }} placeholder="Enter password" value={adminForm.password} onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))} />
              {adminFormErr.password && <p style={{ color: "var(--red)", fontSize: "11px", margin: "4px 0 0" }}>{adminFormErr.password}</p>}
            </div>

            {isSuperAdmin && (
              <div className="adm-form-row">
                <label className="adm-form-label">Role</label>
                <select className="adm-input" style={{ width: "100%" }} value={adminForm.role} onChange={e => setAdminForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="admin">Admin</option>
                  <option value="superadmin">⭐ Super Admin</option>
                </select>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button className="adm-btn adm-btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={() => setAdminModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-green" style={{ flex: 1, justifyContent: "center" }} onClick={handleSaveAdmin}>
                {adminModal === "add" ? "➕ Add Admin" : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
      {modal && (
        <div className="adm-modal-bg" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal" style={{ maxWidth: "500px" }}>
            <h3>{modal.type === "add" ? "➕ Add Restaurant" : "✏️ Edit Restaurant"}</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="adm-form-row" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">Restaurant Name</label>
                <input className="adm-input" style={{ width: "100%" }} placeholder="e.g. El Charro Café" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="adm-form-row" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">Cuisine Type</label>
                <select className="adm-input adm-select" style={{ width: "100%" }} value={editForm.cuisine} onChange={e => setEditForm(f => ({ ...f, cuisine: e.target.value }))}>
                  {CUISINE_OPTIONS.map(c => <option key={c} value={c}>{CUISINE_EMOJI[c]||"🍽️"} {c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
              <div className="adm-form-row" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">Manager's Name</label>
                <input className="adm-input" style={{ width: "100%" }} placeholder="e.g. Maria Garcia" value={editForm.manager} onChange={e => setEditForm(f => ({ ...f, manager: e.target.value }))} />
              </div>
              <div className="adm-form-row" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">Phone Number</label>
                <input className="adm-input" style={{ width: "100%" }} placeholder="(520) 555-0100" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>

            <div className="adm-form-row" style={{ marginTop: "12px" }}>
              <label className="adm-form-label">Email Address</label>
              <input className="adm-input" style={{ width: "100%" }} placeholder="e.g. manager@restaurant.com" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <div className="adm-form-row">
              <label className="adm-form-label">Address</label>
              <input className="adm-input" style={{ width: "100%" }} placeholder="e.g. 747 N Stone Ave, Tucson AZ 85705" value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
            </div>

            {modal.type === "edit" && (
              <>
                <div className="adm-form-row">
                  <label className="adm-form-label">Vote Count</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      className="adm-input" type="number" min="0"
                      style={{ width: "100px" }}
                      value={editForm.votes}
                      onChange={e => setEditForm(f => ({ ...f, votes: e.target.value }))}
                    />
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", margin: "16px 0", paddingTop: "16px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--red)", marginBottom: "8px" }}>Danger Zone</div>
                  <button
                    className="adm-btn adm-btn-red"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => { setModal(null); handleDeleteRestaurant(modal.data); }}
                  >🗑️ Delete Restaurant</button>
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <button className="adm-btn adm-btn-green" style={{ flex: 1, justifyContent: "center" }} onClick={modal.type === "add" ? handleAddRestaurant : handleEditRestaurant} disabled={!editForm.name.trim()}>
                {modal.type === "add" ? "Add Restaurant" : "Save Changes"}
              </button>
              <button className="adm-btn adm-btn-outline" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DIALOG ── */}
      {confirm && (
        <div className="adm-modal-bg" onClick={e => e.target === e.currentTarget && setConfirm(null)}>
          <div className="adm-confirm">
            <h4>⚠️ Are you sure?</h4>
            <p>{confirm.msg}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="adm-btn adm-btn-red" style={{ flex: 1, justifyContent: "center" }} onClick={confirm.onConfirm}>Yes, proceed</button>
              <button className="adm-btn adm-btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOMER EDIT MODAL ── */}
      {custEditModal && (
        <div className="adm-modal-bg" onClick={e => e.target === e.currentTarget && setCustEditModal(null)}>
          <div className="adm-modal" style={{ maxWidth: "500px" }}>
            <h3>{custEditModal === "new" ? "➕ Add Customer" : "✏️ Edit Customer"}</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="adm-form-row" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">First Name</label>
                <input className="adm-input" style={{ width: "100%" }} value={custEditForm.firstName} onChange={e => setCustEditForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="adm-form-row" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">ZIP Code</label>
                <input className="adm-input" style={{ width: "100%" }} value={custEditForm.zip} onChange={e => setCustEditForm(f => ({ ...f, zip: e.target.value }))} />
              </div>
            </div>

            <div className="adm-form-row" style={{ marginTop: "12px" }}>
              <label className="adm-form-label">Email</label>
              <input className="adm-input" style={{ width: "100%" }} value={custEditForm.email} onChange={e => setCustEditForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <div className="adm-form-row">
              <label className="adm-form-label">Phone</label>
              <input className="adm-input" style={{ width: "100%" }} value={custEditForm.phone} onChange={e => setCustEditForm(f => ({ ...f, phone: e.target.value }))} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="adm-form-row" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">Who They Are</label>
                <select className="adm-input adm-select" style={{ width: "100%" }} value={custEditForm.role} onChange={e => setCustEditForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="student">UA Student</option>
                  <option value="downtown">Downtown Worker</option>
                  <option value="local">Tucson Resident</option>
                  <option value="owner">Restaurant Owner</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="adm-form-row" style={{ marginBottom: 0 }}>
                <label className="adm-form-label">Voted For</label>
                <select className="adm-input adm-select" style={{ width: "100%" }} value={custEditForm.votedFor} onChange={e => setCustEditForm(f => ({ ...f, votedFor: e.target.value }))}>
                  <option value="">— None —</option>
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{CUISINE_EMOJI[r.cuisine] || "🍽️"} {r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button className="adm-btn adm-btn-green" style={{ flex: 1, justifyContent: "center" }} onClick={handleSaveCustomer}>
                {custEditModal === "new" ? "Add Customer" : "Save Changes"}
              </button>
              <button className="adm-btn adm-btn-outline" onClick={() => setCustEditModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && <div className={`adm-toast ${toast.isError ? "error" : ""}`}>{toast.msg}</div>}
    </>
  );
}


// ══════════════════════════════════════════════════════════
// ROUTER — switches between main app and admin panel
// Visit ?admin or press the hidden link to access admin
// ══════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.search.includes("admin") ? "admin" : "main";
    }
    return "main";
  });

  return (
    <>
      {view === "main" && (
        <>
          <TucsonEatsTournament />
          {/* Hidden admin link — triple-click the footer copyright */}
          <div
            onDoubleClick={() => setView("admin")}
            style={{ position: "fixed", bottom: 0, right: 0, width: "60px", height: "30px", cursor: "default", zIndex: 9999 }}
            title=""
          />
        </>
      )}
      {view === "admin" && (
        <>
          <TucsonEatsAdmin />
          <button
            onClick={() => setView("main")}
            style={{
              position: "fixed", top: "12px", right: "12px", zIndex: 9999,
              background: "rgba(36,61,28,0.95)", border: "1px solid #3D6530",
              color: "#74A26B", padding: "6px 14px", borderRadius: "8px",
              fontSize: "11px", fontWeight: 700, letterSpacing: "2px",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            ← Back to Site
          </button>
        </>
      )}
    </>
  );
}
