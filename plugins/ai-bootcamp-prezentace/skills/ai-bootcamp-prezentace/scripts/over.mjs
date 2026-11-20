#!/usr/bin/env node
// Validátor slidu (formát v1) — stejná pravidla jako API attendee app.
// Použití: node over.mjs <slide.json>   → exit 0 „OK“, jinak exit 1 a seznam chyb (cesta: zpráva).
// Kontroluje tvar, limity délek a „úniky“ (URL, e-maily, cesty, tvary tokenů) v každém textu.
import fs from "node:fs";

const file = process.argv[2];
if (!file) { console.error("použití: node over.mjs <slide.json>"); process.exit(2); }
let s;
try { s = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { console.error(`neplatný JSON: ${e.message}`); process.exit(1); }

const errs = [], warns = [];
const err = (p, m) => errs.push(`${p}: ${m}`);
const LEAK = [
  [/https?:\/\/|www\.|\b[a-z0-9-]+\.(cz|com|io|net|org|dev|local|internal)\b/i, "vypadá jako URL nebo doména"],
  [/[\w.+-]+@[\w-]+\.[\w.]+/, "vypadá jako e-mail"],
  [/(^|\s)(~\/|\/Users\/|\/home\/|[A-Z]:\\)/, "vypadá jako cesta k souboru"],
  [/\b(sk-[A-Za-z0-9]{10,}|ghp_[A-Za-z0-9]{10,}|glpat-[A-Za-z0-9_-]{10,}|xox[abp]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{12,})/, "vypadá jako token nebo klíč"],
  [/[\u0000-\u001f]/, "obsahuje řídicí znaky"],
  [/<\/?[a-z][^>]*>/i, "obsahuje HTML"],
];
function text(p, v, max, required = false) {
  if (v === undefined || v === null) { if (required) err(p, "chybí"); return; }
  if (typeof v !== "string") return err(p, "má být text");
  if (!v.trim()) return err(p, "je prázdné");
  if (v.length > max) err(p, `max ${max} znaků (má ${v.length})`);
  for (const [re, msg] of LEAK) if (re.test(v)) err(p, `${msg}: „${v.slice(0, 40)}“`);
}
function list(p, v, maxItems, maxLen, required = false) {
  if (v === undefined || v === null) { if (required) err(p, "chybí"); return; }
  if (!Array.isArray(v)) return err(p, "má být pole");
  if (v.length > maxItems) err(p, `max ${maxItems} položek (má ${v.length})`);
  v.forEach((x, i) => text(`${p}[${i}]`, x, maxLen));
}
const int = (p, v) => { if (v !== undefined && v !== null && !(Number.isInteger(v) && v >= 0)) err(p, "má být celé číslo ≥ 0"); };

const KNOWN = ["version", "name", "sentence", "badge", "tip", "tips", "tools", "uses", "setup", "skills", "mcp", "ask", "stats", "did", "models", "tokens", "style"];
for (const k of Object.keys(s)) if (!KNOWN.includes(k)) warns.push(`${k}: neznámé pole, API ho zahodí`);

if (s.version !== 1) err("version", "musí být 1");
text("name", s.name, 60, true);
text("sentence", s.sentence, 120);
text("badge", s.badge, 30);
text("tip", s.tip, 120);
list("tips", s.tips, 2, 120);
list("tools", s.tools, 6, 30, true);
if (Array.isArray(s.tools) && !s.tools.length) err("tools", "aspoň jeden nástroj");
if (s.uses !== undefined) {
  if (!Array.isArray(s.uses) || s.uses.length > 6) err("uses", "pole max 6 dvojic [text, číslo]");
  else s.uses.forEach((u, i) => { if (!Array.isArray(u) || u.length !== 2) return err(`uses[${i}]`, "má být [text, číslo]"); text(`uses[${i}][0]`, u[0], 40); int(`uses[${i}][1]`, u[1]); });
}
list("setup", s.setup, 5, 90);
if (s.skills !== undefined) {
  if (typeof s.skills !== "object" || Array.isArray(s.skills)) err("skills", "má být objekt {total, work, personal}");
  else { int("skills.total", s.skills.total); list("skills.work", s.skills.work, 12, 40); list("skills.personal", s.skills.personal, 12, 40); }
}
if (s.mcp !== undefined) {
  if (typeof s.mcp !== "object" || Array.isArray(s.mcp)) err("mcp", "má být objekt {work, personal}");
  else { list("mcp.work", s.mcp.work, 16, 40); list("mcp.personal", s.mcp.personal, 16, 40); }
}
list("ask", s.ask, 5, 60);
if (s.stats !== undefined) {
  const st = s.stats || {};
  for (const k of ["conversations", "helpers", "active_days", "streak"]) int(`stats.${k}`, st[k]);
  text("stats.peak", st.peak, 20);
  if (st.active_days > 31) err("stats.active_days", "víc než 31 dní za 30 dní");
  if (st.streak > (st.active_days ?? 31)) err("stats.streak", "série delší než počet aktivních dní");
  if (st.heat !== undefined) {
    const ok = Array.isArray(st.heat) && st.heat.length === 7 && st.heat.every(r => Array.isArray(r) && r.length === 24 && r.every(n => Number.isInteger(n) && n >= 0));
    if (!ok) err("stats.heat", "má být 7 × 24 celých čísel ≥ 0 (po–ne × 0–23 h)");
  }
}
if (s.did !== undefined) for (const k of ["edits", "commands", "web"]) int(`did.${k}`, (s.did || {})[k]);
if (s.models !== undefined) {
  if (!Array.isArray(s.models) || s.models.length > 5) err("models", "pole max 5 dvojic [text, procento]");
  else {
    s.models.forEach((m, i) => { text(`models[${i}][0]`, m[0], 30); if (!(Number.isInteger(m[1]) && m[1] >= 0 && m[1] <= 100)) err(`models[${i}][1]`, "procento 0–100"); });
    const sum = s.models.reduce((a, m) => a + (m[1] || 0), 0);
    if (s.models.length && (sum < 95 || sum > 105)) err("models", `procenta dávají ${sum}, mají ~100`);
  }
}
if (s.tokens !== undefined && s.tokens !== null) int("tokens", s.tokens);
if (s.style !== undefined) {
  const st = s.style || {};
  if (st.layout !== undefined && !["prehled", "hero"].includes(st.layout)) err("style.layout", "prehled nebo hero");
  if (st.accent !== undefined && !/^#[0-9a-fA-F]{6}$/.test(st.accent)) err("style.accent", "barva ve tvaru #rrggbb");
}
// soudržnost: Hero bez čísel nemá mít stats/did; Přehled bez čísel je chudý
if (s.style && s.style.layout === "prehled" && !s.stats && !s.did) warns.push("style.layout: Přehled bez čísel — zvaž Hero bez čísel");
if (Buffer.byteLength(JSON.stringify(s)) > 64 * 1024) err("(celek)", "větší než 64 kB");

for (const w of warns) console.log(`varování  ${w}`);
if (errs.length) { for (const e of errs) console.log(`CHYBA     ${e}`); process.exit(1); }
console.log("OK — slide odpovídá formátu v1");
