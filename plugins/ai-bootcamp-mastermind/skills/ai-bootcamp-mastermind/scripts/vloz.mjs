#!/usr/bin/env node
// Vloží schválená data do šablony prezentace.
// Použití: node vloz.mjs <data.json> <výstup.html>   (šablona se bere z ../templates/prezentace.html)
// Nahradí jen obsah datového bloku; každý znak "<" v JSON zapíše jako unicode escape, takže text
// v datech (např. ukončovací tag skriptu) nikdy neukončí blok. Výstup má práva 600.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ESCAPE_LT = "\\" + "u003c"; // šest znaků: zpětné lomítko, u, 0, 0, 3, c
const BLOK = /(<script type="application\/json" id="data">)[\s\S]*?(<\/script>)/;

export function vlozData(sablona, data) {
  if (!BLOK.test(sablona)) throw new Error("šablona nemá datový blok");
  const json = JSON.stringify(data, null, 1).replace(/</g, ESCAPE_LT);
  return sablona.replace(BLOK, (_, otevreni, zavreni) => `${otevreni}\n${json}\n${zavreni}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [vstup, vystup] = process.argv.slice(2);
  if (!vstup || !vystup) { console.error("použití: node vloz.mjs <data.json> <výstup.html>"); process.exit(2); }
  const sablona = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "templates", "prezentace.html"), "utf8");
  let data;
  try { data = JSON.parse(fs.readFileSync(vstup, "utf8")); } catch (e) { console.error(`nejde načíst data: ${e.message}`); process.exit(2); }
  fs.writeFileSync(vystup, vlozData(sablona, data), { mode: 0o600 });
  fs.chmodSync(vystup, 0o600);
  console.log(`hotovo: ${vystup}`);
}
