import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nastaveniProfilu } from "../skills/ai-bootcamp-mastermind/examples/cc-nastaveni.mjs";

const PROFIL = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures", "profil");
const n = nastaveniProfilu(PROFIL);
const json = JSON.stringify(n);

test("MCP jen názvy a rozsah", () => {
  assert.deepEqual(n.mcp, [{ nazev: "gmail", rozsah: "globalni" }, { nazev: "lokalni-db", rozsah: "projekt" }]);
  assert.doesNotMatch(json, /tajne\.cz|npx|\/Users\/tajny/);
});
test("env jen klíče, nikdy hodnoty", () => {
  assert.deepEqual(n.env_klice, ["X_TOKEN"]);
  assert.doesNotMatch(json, /sk-tajne/);
});
test("hooky jako událost a počet, bez příkazů", () => {
  assert.deepEqual(n.hooky, [{ udalost: "SessionStart", pocet: 2 }, { udalost: "PreToolUse", pocet: 1 }]);
  assert.doesNotMatch(json, /tajna\/cesta/);
});
test("permissions: počty a ukázky pravidel se zamaskovanými cestami", () => assert.deepEqual(n.permissions, {
  allow: 1, deny: 4, ask: 0, defaultMode: "auto",
  ukazky: { allow: ["Bash(ls:*)"], deny: ["Read(.env)", "Bash(rm -rf:*)", "Bash(sops -d:*)", "Read(…)"], ask: [] },
}));
test("zapnuté pluginy", () => assert.deepEqual(n.pluginy, ["superpowers@krakatice"]));
test("skilly s popisem a kódem (v2)", () => assert.deepEqual(n.skilly, [
  { nazev: "jen-navod", popis: "Jen instrukce.", vlastni: true, kod: { py: 0, js: 0, sh: 0, jine: 0, radku: 0 } },
  { nazev: "muj-skill", popis: "Napíše brief pro agenturu z poznámek ze schůzky.", vlastni: true, kod: { py: 1, js: 1, sh: 0, jine: 0, radku: 5 } },
]));
test("agenti s popisem", () => assert.deepEqual(n.agenti, [{ nazev: "x", popis: "Rešeršér pro konkurenci." }]));
test("CLAUDE.md jen počet řádků", () => assert.deepEqual(n.claude_md, [{ soubor_id: "CLAUDE.md", radku: 4 }]));
test("memory: počty a jména souborů (v2)", () => assert.deepEqual(n.memory, [{ projekt_id: "-proj-a", souboru: 1, soubory: ["MEMORY.md"] }]));
test("nic z obsahu souborů", () => assert.doesNotMatch(json, /TAJNY_TEXT/));
