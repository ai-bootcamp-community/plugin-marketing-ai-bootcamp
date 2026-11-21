#!/usr/bin/env node
// VZOR — ne hotový nástroj. Ukazuje, jak správně projít konverzace Claude Code (pravidla:
// reference/mereni.md). Přečti, zkopíruj do ~/ai-bootcamp-mastermind/work/, přizpůsob a spusť svou kopii.
// Typické úpravy: jiný profil (~/.claude-*), jiné okno, víc profilů najednou, další metrika k tématu.
//
// Použití: node cc-konverzace.mjs <cesta k profilu, např. ~/.claude> [dní, výchozí 30]
// Výstup: JSON s agregacemi na stdout. NIKDY nevypisuje text zpráv ani vstupy nástrojů —
// jen počty, názvy (skilly, MCP servery, typy pomocníků, modely) a id souborů (kandidáti na čtení).
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

// Veřejné modely zkrátí na rodinu, vlastní/firemní nahradí obecným štítkem.
function modelLabel(name) {
  if (typeof name !== "string" || !name || name === "<synthetic>") return null;
  const n = name.toLowerCase();
  for (const fam of ["opus", "sonnet", "haiku", "fable"]) if (n.includes(fam)) return fam[0].toUpperCase() + fam.slice(1);
  if (/^(gpt|o\d|codex)/.test(n)) return "GPT";
  if (n.startsWith("gemini")) return "Gemini";
  return "vlastní model";
}

// Obaly, které harness zapisuje jako „user“, ale nenapsal je člověk (oznámení, výstupy příkazů).
// Na Martinově profilu (2026-11-21) to bylo 23 % „zpráv“. <command-name> a <bash-input> nechat:
// to jsou akce člověka (lomítkový příkaz, ! příkaz).
const OBALY = /^\s*<(task-notification|local-command-stdout|local-command-stderr|local-command-caveat|bash-stdout|bash-stderr|system-reminder)>/;

// Zpráva člověka: ne meta, ne shrnutí po /compact (to psala AI), ne pomocník, ne výsledek nástroje, ne obal.
function jeZpravaCloveka(z) {
  if (z.type !== "user" || z.isMeta || z.isCompactSummary || z.isSidechain) return false;
  const c = z.message && z.message.role === "user" ? z.message.content : null;
  if (typeof c === "string") return c.trim().length > 0 && !OBALY.test(c);
  return Array.isArray(c) && c.some(p => p && p.type === "text");
}

// Rozbor jednoho souboru. Řádky parsuj jako JSON (pořadí polí se liší podle brány/modelu).
// Odpověď i volání nástroje se zapisují víckrát → Map podle id, platí poslední zápis.
export function rozeberKonverzaci(text) {
  const k = { zpravyCloveka: [], odpovedi: new Map(), nastroje: new Map(), maxSoubeznychPomocniku: 0,
              compact: [], entrypoint: null, zacatek: null, konec: null };
  for (const radek of text.split("\n")) {
    if (!radek.trim()) continue;
    let z;
    try { z = JSON.parse(radek); } catch { continue; } // rozepsaný poslední řádek běžící session
    if (!z || typeof z !== "object") continue;
    if (z.timestamp) { k.zacatek ??= z.timestamp; k.konec = z.timestamp; }
    if (!k.entrypoint && typeof z.entrypoint === "string") k.entrypoint = z.entrypoint;
    if (z.type === "system" && z.subtype === "compact_boundary") {
      const m = z.compactMetadata || {};
      k.compact.push({ trigger: m.trigger === "auto" ? "auto" : "manual", preTokens: Number(m.preTokens) || 0 });
      continue;
    }
    if (jeZpravaCloveka(z)) { k.zpravyCloveka.push(z.timestamp); continue; }
    const msg = z.message;
    if (!msg || msg.role !== "assistant") continue;
    if (msg.id) {
      const u = msg.usage || {};
      k.odpovedi.set(msg.id, { model: msg.model, tokeny: (Number(u.input_tokens) || 0) + (Number(u.output_tokens) || 0) });
    }
    // Části jedné odpovědi (každé volání nástroje) bývají na samostatných řádcích se stejným
    // message.id → souběh pomocníků počítej přes všechny řádky dané odpovědi.
    const souběh = k.pomocniciVOdpovedi ??= new Map();
    for (const p of Array.isArray(msg.content) ? msg.content : []) {
      if (!p || p.type !== "tool_use" || !p.id) continue;
      const vstup = p.input || {};
      const n = { jmeno: p.name };
      if (p.name === "Skill" && typeof vstup.skill === "string") n.skill = vstup.skill;
      if (p.name === "Agent" || p.name === "Task") {
        n.subagent = typeof vstup.subagent_type === "string" ? vstup.subagent_type : "general-purpose";
        const klic = msg.id || p.id;
        const ids = souběh.get(klic) || new Set();
        ids.add(p.id); souběh.set(klic, ids);
        k.maxSoubeznychPomocniku = Math.max(k.maxSoubeznychPomocniku, ids.size);
      }
      const mcp = /^mcp__(.+?)__/.exec(p.name || "");
      if (mcp) n.mcpServer = mcp[1];
      k.nastroje.set(p.id, n); // ze vstupu jen název skillu a typ pomocníka, nic dalšího
    }
  }
  delete k.pomocniciVOdpovedi;
  return k;
}

function souboryKonverzaci(koren, odMs) {
  const hlavni = [], pomocnici = [];
  const projdi = dir => {
    let polozky = [];
    try { polozky = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of polozky) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) projdi(p);
      else if (e.name.endsWith(".jsonl")) {
        let m; try { m = fs.statSync(p).mtimeMs; } catch { continue; }
        if (m < odMs) continue;
        (p.split(path.sep).includes("subagents") ? pomocnici : hlavni).push(p);
      }
    }
  };
  projdi(koren);
  return { hlavni, pomocnici };
}

const den = iso => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
function isoTyden(iso) {
  const d = new Date(iso); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const t1 = new Date(d.getFullYear(), 0, 4);
  const t = 1 + Math.round(((d - t1) / 864e5 - 3 + ((t1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(t).padStart(2, "0")}`;
}
const pricti = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const prvni = (o, k, d) => { if (!o[k] || d < o[k]) o[k] = d; };

export function souhrnProfilu(cestaProfilu, dni = 30) {
  const od = Date.now() - dni * 864e5;
  const { hlavni, pomocnici: soubPom } = souboryKonverzaci(path.join(cestaProfilu, "projects"), od);
  const s = { profil_nazev: path.basename(cestaProfilu), okno_dni: dni,
    konverzace: { celkem: 0, podle_entrypointu: {} }, zpravy_cloveka: 0, aktivni_dny: 0,
    heat: Array.from({ length: 7 }, () => Array(24).fill(0)), modely: {}, tokeny: 0,
    pomocnici: { celkem: 0, typy: {}, max_soubezne: 0 }, skilly: {}, mcp: {},
    compact: { konverzaci_s_compact: 0, celkem: 0, manual: 0, auto: 0, preTokens_prumer: 0 },
    tydny: {}, prvni_vyskyt: { skilly: {}, mcp: {} }, kandidati: [] };
  const dny = new Set(), pre = [], radky = [];
  const odpovedi = k => { for (const o of k.odpovedi.values()) { const l = modelLabel(o.model); if (l) pricti(s.modely, l); s.tokeny += o.tokeny; } };

  for (const f of hlavni) {
    let k; try { k = rozeberKonverzaci(fs.readFileSync(f, "utf8")); } catch { continue; }
    s.konverzace.celkem++;
    pricti(s.konverzace.podle_entrypointu, k.entrypoint || "neznámý");
    s.zpravy_cloveka += k.zpravyCloveka.length;
    for (const t of k.zpravyCloveka) {
      const d = new Date(t);
      if (!Number.isFinite(d.getTime())) continue; // zpráva bez času: počítá se, ale ne do heatmapy
      s.heat[(d.getDay() + 6) % 7][d.getHours()]++; dny.add(den(t));
    }
    if (k.zacatek) pricti(s.tydny, isoTyden(k.zacatek));
    odpovedi(k);
    const datum = k.zacatek ? den(k.zacatek) : null;
    for (const n of k.nastroje.values()) {
      if (n.subagent) { s.pomocnici.celkem++; pricti(s.pomocnici.typy, n.subagent); }
      if (n.skill) { pricti(s.skilly, n.skill); if (datum) prvni(s.prvni_vyskyt.skilly, n.skill, datum); }
      if (n.mcpServer) { pricti(s.mcp, n.mcpServer); if (datum) prvni(s.prvni_vyskyt.mcp, n.mcpServer, datum); }
    }
    s.pomocnici.max_soubezne = Math.max(s.pomocnici.max_soubezne, k.maxSoubeznychPomocniku);
    if (k.compact.length) s.compact.konverzaci_s_compact++;
    for (const c of k.compact) { s.compact.celkem++; s.compact[c.trigger]++; pre.push(c.preTokens); }
    radky.push({ soubor_id: path.basename(f, ".jsonl"), zprav_cloveka: k.zpravyCloveka.length, compact: k.compact.length,
                 pomocniku: [...k.nastroje.values()].filter(n => n.subagent).length });
  }
  // Přepisy pomocníků: jen modely a tokeny (práce AI), ne konverzace ani zprávy člověka.
  for (const f of soubPom) { try { odpovedi(rozeberKonverzaci(fs.readFileSync(f, "utf8"))); } catch {} }

  s.aktivni_dny = dny.size;
  s.compact.preTokens_prumer = pre.length ? Math.round(pre.reduce((a, b) => a + b, 0) / pre.length) : 0;

  // Kandidáti na čtení (dvoufázové čtení): agent pak čte jen tyhle soubory, ne všechny.
  const vyber = (duvod, serazene, kolik) => serazene.slice(0, kolik).forEach(r =>
    s.kandidati.push({ soubor_id: r.soubor_id, duvod, zprav_cloveka: r.zprav_cloveka, compact: r.compact }));
  const sZpravami = radky.filter(r => r.zprav_cloveka > 0);
  vyber("nejdelší", [...sZpravami].sort((a, b) => b.zprav_cloveka - a.zprav_cloveka), 3);
  vyber("nejvíc compact", sZpravami.filter(r => r.compact > 0).sort((a, b) => b.compact - a.compact), 2);
  vyber("nejvíc pomocníků", sZpravami.filter(r => r.pomocniku > 0).sort((a, b) => b.pomocniku - a.pomocniku), 2);
  const podleDelky = [...sZpravami].sort((a, b) => a.zprav_cloveka - b.zprav_cloveka);
  vyber("typická", podleDelky.slice(Math.floor(podleDelky.length / 2)), 3);
  s.kandidati = s.kandidati.slice(0, 10);
  return s;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const profil = (process.argv[2] || "~/.claude").replace(/^~/, os.homedir());
  const dni = Number(process.argv[3]) || 30;
  process.stdout.write(JSON.stringify(souhrnProfilu(profil, dni), null, 1) + "\n");
}
