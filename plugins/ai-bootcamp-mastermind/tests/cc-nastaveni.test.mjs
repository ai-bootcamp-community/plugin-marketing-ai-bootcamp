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
test("permissions jako počty", () => assert.deepEqual(n.permissions, { allow: 1, deny: 3, ask: 0, defaultMode: "auto" }));
test("zapnuté pluginy", () => assert.deepEqual(n.pluginy, ["superpowers@krakatice"]));
test("skilly s popisem z hlavičky", () =>
  assert.deepEqual(n.skilly, [{ nazev: "muj-skill", popis: "Napíše brief pro agenturu z poznámek ze schůzky.", vlastni: true }]));
test("agenti s popisem", () => assert.deepEqual(n.agenti, [{ nazev: "x", popis: "Rešeršér pro konkurenci." }]));
test("CLAUDE.md jen počet řádků", () => assert.deepEqual(n.claude_md, [{ soubor_id: "CLAUDE.md", radku: 4 }]));
test("memory jen počty souborů", () => assert.deepEqual(n.memory, [{ projekt_id: "-proj-a", souboru: 1 }]));
test("nic z obsahu souborů", () => assert.doesNotMatch(json, /TAJNY_TEXT/));
