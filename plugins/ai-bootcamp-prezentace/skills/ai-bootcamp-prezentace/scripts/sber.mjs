#!/usr/bin/env node
// Sběr AI stacku pro slide AI BOOTCAMPu.
// Čte jen NÁZVY (skillů, pluginů, MCP serverů, agentů) a POČTY (konverzace, volání nástrojů,
// modely, tokeny). Obsah konverzací, hodnoty proměnných prostředí, auth soubory ani historii
// promptů nevypisuje a nikam neposílá. Výstup: JSON na stdout. Jen vestavěné moduly Node 18+.
// Použití: node sber.mjs [--days 30]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const HOME = os.homedir();
const DAYS = Number(process.argv[process.argv.indexOf("--days") + 1]) || 30;
const SINCE = Date.now() - DAYS * 86400e3;
const tilde = p => p.replace(HOME, "~");
const exists = p => { try { fs.accessSync(p); return true; } catch { return false; } };
const isDir = p => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const readJson = p => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const real = p => { try { return fs.realpathSync(p); } catch { return p; } };
const ls = p => { try { return fs.readdirSync(p); } catch { return []; } };
// Jen `description` z hlavičky (frontmatter) souboru, max 200 znaků; tělo se nečte.
function describe(file) {
  let head = "";
  try { const fd = fs.openSync(file, "r"); const b = Buffer.alloc(4096); head = b.toString("utf8", 0, fs.readSync(fd, b, 0, 4096, 0)); fs.closeSync(fd); } catch { return null; }
  const fm = head.startsWith("---") ? head.split(/\n---/)[0] : "";
  const m = fm.match(/^description:\s*(.+)$/m);
  return m ? m[1].replace(/^["']|["']$/g, "").slice(0, 200) : null;
}

// Veřejné modely zkrátí na rodinu, vlastní/firemní nahradí obecným štítkem.
function modelLabel(name) {
  if (typeof name !== "string" || !name || name === "<synthetic>") return null;
  const n = name.toLowerCase();
  for (const fam of ["opus", "sonnet", "haiku", "fable"]) if (n.includes(fam)) return fam[0].toUpperCase() + fam.slice(1);
  if (/^(gpt|o\d|codex)/.test(n)) return "GPT";
  if (n.startsWith("gemini")) return "Gemini";
  return "vlastní model";
}

// Všechny *.jsonl pod složkou změněné v okně; přepisy subagentů nejsou samostatné konverzace.
function sessionFiles(root) {
  const out = [];
  const walk = dir => {
    for (const e of (() => { try { return fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; } })()) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".jsonl")) {
        try { const st = fs.statSync(p); if (st.mtimeMs >= SINCE) out.push([p, st.mtimeMs, p.includes(`${path.sep}subagents${path.sep}`)]); } catch {}
      }
    }
  };
  walk(root);
  return out;
}

const SEEN = new Set(); // sdílené/symlinkované složky mezi profily nepočítat dvakrát
function newUsage() {
  return { sessions: 0, heat: Array.from({ length: 7 }, () => Array(24).fill(0)), days: new Set(),
           did: { edits: 0, commands: 0, web: 0 }, helpers: 0, skills: {}, models: {}, tokens: 0,
           helper_types: {}, helper_did: { edits: 0, commands: 0, web: 0 }, helper_models: {}, helper_tokens: 0 };
}
function addSession(u, file, mtime) {
  const r = real(file);
  if (SEEN.has(r)) return false;
  SEEN.add(r);
  const d = new Date(mtime);
  u.sessions++;
  u.heat[(d.getDay() + 6) % 7][d.getHours()]++;
  u.days.add(d.toISOString().slice(0, 10));
  return true;
}
const ACTION = { Edit: "edits", MultiEdit: "edits", Write: "edits", NotebookEdit: "edits", Bash: "commands", WebSearch: "web", WebFetch: "web" };
// Odpovědi modelu se čtou z rozparsovaného JSON: pořadí polí se liší podle brány/modelu
// (u vlastních modelů přes bránu je "model" až za obsahem), regex by je minul.
// Jedna odpověď se v logu zapisuje víckrát se stejným id → počítat jednou (poslední zápis má konečné usage).

function scanClaudeLog(u, file, sub = false) {
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch { return; }
  const msgs = new Map(), tools = new Map();
  for (const line of text.split("\n")) {
    if (!line.includes('"assistant"')) continue;
    let msg;
    try { msg = JSON.parse(line).message; } catch { continue; }
    if (!msg || msg.role !== "assistant") continue;
    if (msg.model && msg.id) {
      const us = msg.usage || {};
      msgs.set(msg.id, [msg.model, (Number(us.input_tokens) || 0) + (Number(us.output_tokens) || 0)]);
    }
    for (const part of Array.isArray(msg.content) ? msg.content : []) {
      if (part && part.type === "tool_use" && part.id) tools.set(part.id, [part.name, part.input || {}]);
    }
  }
  for (const [name, input] of tools.values()) {
    if (ACTION[name]) { u.did[ACTION[name]]++; if (sub) u.helper_did[ACTION[name]]++; }
    if (name === "Agent" || name === "Task") {
      u.helpers++;
      // typ pomocníka: obecné a pluginové názvy ukázat, vlastní agenty jen jako „vlastní agent“
      const t = typeof input.subagent_type === "string" ? input.subagent_type : "general-purpose";
      const k = /^(general-purpose|Explore|Plan|claude|statusline-setup|claude-code-guide)$/.test(t) || t.includes(":") ? t : "vlastní agent";
      u.helper_types[k] = (u.helper_types[k] || 0) + 1;
    }
    if (name === "Skill" && typeof input.skill === "string") u.skills[input.skill] = (u.skills[input.skill] || 0) + 1;
  }
  for (const [model, tok] of msgs.values()) {
    const l = modelLabel(model);
    if (l) u.models[l] = (u.models[l] || 0) + 1;
    u.tokens += tok;
    if (sub) { if (l) u.helper_models[l] = (u.helper_models[l] || 0) + 1; u.helper_tokens += tok; }
  }
}

function finish(u) {
  const days = [...u.days].sort();
  let best = 0, cur = 0, prev = null;
  for (const d of days) {
    cur = prev && (Date.parse(d) - Date.parse(prev)) === 86400e3 ? cur + 1 : 1;
    best = Math.max(best, cur); prev = d;
  }
  const total = Object.values(u.models).reduce((a, b) => a + b, 0) || 1;
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]);
  return { sessions: u.sessions, active_days: days.length, streak: best, heat: u.heat, did: u.did, helpers: u.helpers,
           helpers_detail: { types: Object.entries(u.helper_types).sort((a, b) => b[1] - a[1]).slice(0, 8), did: u.helper_did,
             models_pct: (t => Object.entries(u.helper_models).sort((a, b) => b[1] - a[1]).map(([m, c]) => [m, Math.round(c * 100 / t)]))(Object.values(u.helper_models).reduce((a, b) => a + b, 0) || 1),
             tokens: u.helper_tokens },
           skills_used: top(u.skills).slice(0, 15),
           models_pct: top(u.models).slice(0, 5).map(([m, c]) => [m, Math.round(c * 100 / total)]),
           tokens: u.tokens };
}

function claudeProfiles() {
  const c = new Set(ls(HOME).filter(n => n === ".claude" || n.startsWith(".claude-")).map(n => path.join(HOME, n)));
  if (process.env.CLAUDE_CONFIG_DIR) c.add(path.resolve(process.env.CLAUDE_CONFIG_DIR.replace(/^~/, HOME)));
  return [...c].filter(p => isDir(p) && (exists(path.join(p, "settings.json")) || isDir(path.join(p, "projects")))).sort();
}

function claudeProfile(p) {
  const s = readJson(path.join(p, "settings.json")) || {};
  const active = real(p) === real(process.env.CLAUDE_CONFIG_DIR ? process.env.CLAUDE_CONFIG_DIR.replace(/^~/, HOME) : path.join(HOME, ".claude"));
  const plugins = Object.entries(s.enabledPlugins || {}).filter(([, v]) => v).map(([k]) => k.split("@"));
  const skills = ls(path.join(p, "skills")).filter(d => exists(path.join(p, "skills", d, "SKILL.md"))).sort();
  const agents = ls(path.join(p, "agents")).filter(f => f.endsWith(".md")).map(f => f.slice(0, -3)).sort();
  // popisy vlastních skillů a agentů: podklad pro „na co AI používám“ a „Zeptej se mě na“
  const descriptions = Object.fromEntries([
    ...skills.map(d => [`skill:${d}`, describe(path.join(p, "skills", d, "SKILL.md"))]),
    ...agents.map(a => [`agent:${a}`, describe(path.join(p, "agents", `${a}.md`))]),
  ].filter(([, v]) => v));
  const hooks = Object.values(s.hooks || {}).flat().reduce((a, h) => a + ((h && h.hooks) || []).length, 0);
  const envKeys = Object.keys(s.env || {}); // jen přítomnost klíčů, ne hodnoty
  let state = readJson(path.join(p, ".claude.json"));
  if (!state && real(p) === real(path.join(HOME, ".claude"))) state = readJson(path.join(HOME, ".claude.json"));
  const mcp = new Set(Object.keys((state && state.mcpServers) || {}));
  for (const proj of Object.values((state && state.projects) || {})) for (const k of Object.keys((proj && proj.mcpServers) || {})) mcp.add(k);
  const u = newUsage();
  // subagent = pomocník: jeho práce, modely a tokeny se počítají, ale není to samostatná konverzace
  for (const [f, mt, sub] of sessionFiles(path.join(p, "projects"))) {
    if (sub) { if (!SEEN.has(real(f))) { SEEN.add(real(f)); scanClaudeLog(u, f, true); } }
    else if (addSession(u, f, mt)) scanClaudeLog(u, f);
  }
  return { tool: "Claude Code", path: tilde(p), active, model: modelLabel(s.model),
           plugins: plugins.map(([n, m]) => [n, m || ""]), skills, agents, descriptions, hooks,
           custom_gateway: envKeys.includes("ANTHROPIC_BASE_URL") || envKeys.includes("ANTHROPIC_CUSTOM_MODEL_OPTION"),
           mcp: [...mcp].sort(), usage: finish(u) };
}

function codexProfiles() {
  const c = new Set(ls(HOME).filter(n => n === ".codex" || n.startsWith(".codex-")).map(n => path.join(HOME, n)));
  if (process.env.CODEX_HOME) c.add(path.resolve(process.env.CODEX_HOME.replace(/^~/, HOME)));
  return [...c].filter(p => exists(path.join(p, "config.toml"))).sort();
}

function codexProfile(p) {
  let toml = "";
  try { toml = fs.readFileSync(path.join(p, "config.toml"), "utf8"); } catch {}
  const model = (toml.match(/^model\s*=\s*"([^"]+)"/m) || [])[1];
  const mcp = [...new Set([...toml.matchAll(/^\[mcp_servers\.([A-Za-z0-9_-]+)\]/gm)].map(m => m[1]))].sort();
  const plugins = [...new Set([...toml.matchAll(/^\[plugins\."([^"]+)"\]/gm)].map(m => m[1].split("@")[0]))].sort();
  const skills = ls(path.join(p, "skills")).filter(d => exists(path.join(p, "skills", d, "SKILL.md"))).sort();
  const hj = readJson(path.join(p, "hooks.json")) || {};
  const hooks = Object.values(hj.hooks || {}).filter(Array.isArray).reduce((a, v) => a + v.length, 0);
  const u = newUsage();
  for (const [f, mt, sub] of sessionFiles(path.join(p, "sessions"))) if (!sub) addSession(u, f, mt);
  return { tool: "Codex", path: tilde(p), model: modelLabel(model), model_name: model && /^(gpt|o\d)/i.test(model) ? model : null,
           mcp, plugins, skills, hooks, usage: finish(u) };
}

// Jen přítomnost. Složka nástroje neznamená, že ho člověk používá — agent se zeptá.
function otherTools() {
  const found = [];
  for (const [tool, f] of [["Cursor", ".cursor/mcp.json"], ["Gemini CLI", ".gemini/settings.json"], ["Copilot CLI", ".copilot/mcp-config.json"]]) {
    const d = readJson(path.join(HOME, f));
    if (d) found.push({ tool, mcp: Object.keys(d.mcpServers || {}).sort() });
  }
  if (isDir(path.join(HOME, ".hermes"))) found.push({ tool: "Hermes", skills: ls(path.join(HOME, ".hermes", "skills")).sort() });
  const apps = ["Claude", "ChatGPT", "Cursor", "Codex", "Perplexity"].filter(a => isDir(`/Applications/${a}.app`));
  return { found, apps };
}

const o = otherTools();
process.stdout.write(JSON.stringify({
  generated: new Date().toISOString().slice(0, 10), days: DAYS,
  claude: claudeProfiles().map(claudeProfile), codex: codexProfiles().map(codexProfile),
  other_tools: o.found, apps: o.apps,
}, null, 1) + "\n");
