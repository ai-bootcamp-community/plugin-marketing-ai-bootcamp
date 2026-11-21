#!/usr/bin/env node
// Kontrola úniků v datech prezentace (data.json nebo hotové prezentace.html).
// Použití: node kontrola.mjs <soubor.json|soubor.html>
//   exit 0 → „OK — žádné úniky“; exit 1 → řádek na nález; exit 2 → špatné použití nebo neplatný JSON.
// Hledá jen věci, které na slide nikdy nepatří (URL, e-maily, absolutní cesty, tokeny, telefony).
// Jména lidí, klienty a interní názvy nepozná — ty řeší redakce s člověkem (reference/redakce.md).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VZORY = [
  [/[\w.+-]+@[\w-]+\.[\w.]+/, "vypadá jako e-mail"],
  [/https?:\/\/|www\.|\b[a-z0-9-]+\.(cz|sk|com|io|net|org|dev|ai|app|local|internal)\b/i, "vypadá jako URL nebo doména"],
  [/(^|[\s"'(`=:])(~\/|\/Users\/|\/home\/|\/root\/|[A-Z]:\\)/, "vypadá jako cesta k souboru"],
  [/\b(sk-[A-Za-z0-9_-]{10,}|ghp_[A-Za-z0-9]{10,}|github_pat_[A-Za-z0-9_]{10,}|glpat-[A-Za-z0-9_-]{10,}|xox[abp]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{12,})/, "vypadá jako token nebo klíč"],
  [/(\+\d{3}[ ]?)?\b\d{3}[ ]?\d{3}[ ]?\d{3}\b/, "vypadá jako telefon"],
];

export function najdiUniky(text) {
  const nalezy = [];
  for (const [re, duvod] of VZORY) {
    const m = re.exec(text);
    if (m) nalezy.push({ duvod, ukazka: text.slice(Math.max(0, m.index - 10), m.index + 30) });
  }
  return nalezy;
}

export function nactiData(obsah, jmenoSouboru) {
  if (!jmenoSouboru.endsWith(".html")) return JSON.parse(obsah);
  const m = /<script[^>]*\bid="data"[^>]*>([\s\S]*?)<\/script>/.exec(obsah);
  if (!m) throw new Error("v HTML chybí datový blok <script id=\"data\">");
  return JSON.parse(m[1]);
}

export function zkontroluj(data) {
  const nalezy = [];
  const projdi = (v, cesta) => {
    if (typeof v === "string") { const n = najdiUniky(v)[0]; if (n) nalezy.push({ cesta, ...n }); } // jeden nález na řetězec stačí
    else if (Array.isArray(v)) v.forEach((x, i) => projdi(x, `${cesta}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) projdi(x, cesta ? `${cesta}.${k}` : k);
  };
  projdi(data, "");
  return nalezy;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const soubor = process.argv[2];
  if (!soubor) { console.error("použití: node kontrola.mjs <soubor.json|soubor.html>"); process.exit(2); }
  let data;
  try { data = nactiData(fs.readFileSync(soubor, "utf8"), soubor); }
  catch (e) { console.error(`nejde načíst: ${e.message}`); process.exit(2); }
  const nalezy = zkontroluj(data);
  if (!nalezy.length) { console.log("OK — žádné úniky"); process.exit(0); }
  for (const n of nalezy) console.log(`${n.cesta}: ${n.duvod}: „${n.ukazka}…“`);
  process.exit(1);
}
