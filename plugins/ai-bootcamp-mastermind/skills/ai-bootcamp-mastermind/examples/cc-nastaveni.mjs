#!/usr/bin/env node
// VZOR — ne hotový nástroj. Ukazuje, jak z nastavení Claude Code vytáhnout jen NÁZVY a POČTY
// (skilly, pluginy, MCP, hooky, agenti, permissions, CLAUDE.md, memory). Přečti, zkopíruj do
// ~/ai-bootcamp-mastermind/work/, přizpůsob (jiný profil, projektové CLAUDE.md…) a spusť svou kopii.
//
// Použití: node cc-nastaveni.mjs <cesta k profilu, např. ~/.claude>
// Nikdy nevypisuje: hodnoty env, URL/příkazy MCP serverů, příkazy hooků, obsah CLAUDE.md a memory.
// Obsah CLAUDE.md, memories a skillů čte agent sám až v redakčním kroku (viz SKILL.md).
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const cti = p => { try { return fs.readFileSync(p, "utf8"); } catch { return null; } };
const ctiJson = p => { const t = cti(p); try { return t ? JSON.parse(t) : null; } catch { return null; } };
const ls = p => { try { return fs.readdirSync(p, { withFileTypes: true }); } catch { return []; } };

// Popis z YAML hlavičky (description:), max 200 znaků.
function popis(soubor) {
  const t = cti(soubor);
  const fm = t && /^---\n([\s\S]*?)\n---/.exec(t);
  const m = fm && /^description:\s*(.+)$/m.exec(fm[1]);
  return m ? m[1].replace(/^["']|["']$/g, "").trim().slice(0, 200) : null;
}

const pocetRadku = t => t.split("\n").length - (t.endsWith("\n") ? 1 : 0);
const zamaskuj = t => t.replace(/(~\/|\/Users\/|\/home\/|\/root\/|\/Volumes\/|[A-Z]:\\)[^\s)"']*/g, "…");

// Kód ve skillu: skilly se skripty „dělají práci“, ostatní jsou jen instrukce. Počítá soubory a řádky,
// obsah nevypisuje. Rozbor nejpoužívanějšího skillu s kódem dělá agent čtením jeho skriptů.
const PRIPONY = { py: [".py"], js: [".js", ".mjs", ".cjs", ".ts"], sh: [".sh", ".bash", ".zsh"], jine: [".rb", ".go", ".rs", ".pl", ".php"] };
function kodSkillu(slozka) {
  const kod = { py: 0, js: 0, sh: 0, jine: 0, radku: 0 };
  const projdi = (dir, hloubka) => {
    if (hloubka > 4) return;
    for (const e of ls(dir)) {
      const p = path.join(dir, e.name);
      if (e.isDirectory() && !["node_modules", ".git", "__pycache__", ".venv"].includes(e.name)) projdi(p, hloubka + 1);
      else if (e.isFile()) {
        const druh = Object.keys(PRIPONY).find(k => PRIPONY[k].includes(path.extname(e.name)));
        if (!druh) continue;
        kod[druh]++;
        kod.radku += pocetRadku(cti(p) || "");
      }
    }
  };
  projdi(slozka, 0);
  return kod;
}

export function nastaveniProfilu(cesta) {
  const settings = ctiJson(path.join(cesta, "settings.json")) || {};
  // Výchozí profil ~/.claude má MCP v ~/.claude.json (vedle složky), ostatní profily uvnitř.
  const claudeJson = ctiJson(path.join(cesta, ".claude.json"))
    || (path.basename(cesta) === ".claude" ? ctiJson(path.join(path.dirname(cesta), ".claude.json")) : null) || {};

  const skilly = ls(path.join(cesta, "skills")).filter(e => e.isDirectory() || e.isSymbolicLink())
    .sort((a, b) => a.name.localeCompare(b.name)).map(e => ({
      nazev: e.name,
      popis: popis(path.join(cesta, "skills", e.name, "SKILL.md")),
      vlastni: !e.isSymbolicLink(), // heuristika: odkaz = převzatý balíček; viz examples/README.md
      kod: kodSkillu(path.join(cesta, "skills", e.name)),
    }));

  const mcp = [];
  for (const nazev of Object.keys(claudeJson.mcpServers || {})) mcp.push({ nazev, rozsah: "globalni" });
  for (const proj of Object.values(claudeJson.projects || {}))
    for (const nazev of Object.keys((proj && proj.mcpServers) || {}))
      if (!mcp.some(m => m.nazev === nazev)) mcp.push({ nazev, rozsah: "projekt" });

  const hooky = Object.entries(settings.hooks || {}).map(([udalost, skupiny]) => ({
    udalost, pocet: (Array.isArray(skupiny) ? skupiny : []).reduce((a, g) => a + ((g && g.hooks) || []).length, 0),
  }));

  const agenti = ls(path.join(cesta, "agents")).filter(e => e.name.endsWith(".md"))
    .map(e => ({ nazev: e.name.replace(/\.md$/, ""), popis: popis(path.join(cesta, "agents", e.name)) }));

  const perm = settings.permissions || {};
  const pocet = x => (Array.isArray(x) ? x.length : 0);

  const claude_md = ["CLAUDE.md", "AGENTS.md"].map(f => [f, cti(path.join(cesta, f))]).filter(([, t]) => t !== null)
    .map(([soubor_id, t]) => ({ soubor_id, radku: pocetRadku(t) }));

  const memory = ls(path.join(cesta, "projects")).filter(e => e.isDirectory()).map(e => {
    const soubory = ls(path.join(cesta, "projects", e.name, "memory")).filter(f => f.isFile()).map(f => f.name).sort();
    return { projekt_id: e.name, souboru: soubory.length, soubory: soubory.slice(0, 20) };
  }).filter(m => m.souboru > 0);
  const ukazky = x => (Array.isArray(x) ? x : []).filter(r => typeof r === "string").slice(0, 8).map(zamaskuj);

  return {
    skilly,
    pluginy: Object.entries(settings.enabledPlugins || {}).filter(([, zap]) => zap).map(([n]) => n),
    mcp, hooky, agenti,
    permissions: { allow: pocet(perm.allow), deny: pocet(perm.deny), ask: pocet(perm.ask), defaultMode: perm.defaultMode || null,
                   ukazky: { allow: ukazky(perm.allow), deny: ukazky(perm.deny), ask: ukazky(perm.ask) } },
    claude_md, memory,
    env_klice: Object.keys(settings.env || {}),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const profil = (process.argv[2] || "~/.claude").replace(/^~/, os.homedir());
  process.stdout.write(JSON.stringify(nastaveniProfilu(profil), null, 1) + "\n");
}
