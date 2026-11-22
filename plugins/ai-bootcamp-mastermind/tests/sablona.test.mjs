import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { nactiData, zkontroluj } from "../skills/ai-bootcamp-mastermind/scripts/kontrola.mjs";

const SOUBOR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "skills", "ai-bootcamp-mastermind", "templates", "prezentace.html");
const html = fs.readFileSync(SOUBOR, "utf8");
const demo = nactiData(html, SOUBOR);

const TEMATA = ["mapa", "skilly", "orchestrace", "konverzace", "mcp", "projekty", "brain", "claude-md", "memories",
  "ai-vs-prace", "vyvoj", "den", "sama-vs-ja", "mantinely", "modely", "kontext", "momenty", "sdileni", "plany"];
const TYPY = ["text", "list", "chips", "stat", "bars", "heatmap", "flow", "conversation", "code", "timeline", "mermaid", "table", "tree"];

// Vytáhne čistou funkci ze <script id="…"> a spustí ji ve vm; výsledek převede přes JSON
// (pole z vm mají jiný prototyp, deepEqual by je nepovažoval za shodná).
function funkce(idSkriptu, jmeno) {
  const m = new RegExp(`<script id="${idSkriptu}">([\\s\\S]*?)<\\/script>`).exec(html);
  assert.ok(m, `chybí <script id="${idSkriptu}">`);
  const ctx = {};
  vm.runInNewContext(m[1] + `\nthis.f = ${jmeno};`, ctx);
  return (...a) => JSON.parse(JSON.stringify(ctx.f(...a)));
}
const rozdelNaSlidy = () => funkce("rozdeleni", "rozdelNaSlidy");
const parseMermaid = funkce("mermaid", "parseMermaid");

test("mermaid: flowchart LR s tvary, popiskem hrany a čárkovanou šipkou", () => {
  const g = parseMermaid("flowchart LR\n  A[Já] -->|zadání| B(Agent)\n  B -.-> C{Pomocníci}");
  assert.equal(g.smer, "LR");
  assert.deepEqual(g.uzly, [{ id: "A", label: "Já", tvar: "obdelnik" }, { id: "B", label: "Agent", tvar: "kulaty" }, { id: "C", label: "Pomocníci", tvar: "kosoctverec" }]);
  assert.deepEqual(g.hrany, [{ z: "A", do: "B", label: "zadání", carkovana: false }, { z: "B", do: "C", label: "", carkovana: true }]);
});
test("mermaid: graph TD, řetěz na jednom řádku a uzel bez tvaru", () => {
  const g = parseMermaid("graph TD\nA --> B --> C\nB --> D[Konec]");
  assert.equal(g.smer, "TD");
  assert.equal(g.hrany.length, 3);
  assert.deepEqual(g.uzly.find(u => u.id === "A"), { id: "A", label: "A", tvar: "obdelnik" });
});
test("mermaid: neznámý typ diagramu → null (zobrazí se jako kód)", () =>
  assert.equal(parseMermaid("sequenceDiagram\nA->>B: ahoj"), null));
test("mermaid: neznámá syntaxe řádku → null", () => assert.equal(parseMermaid("flowchart LR\nA ~~~ B ??? C"), null));
test("mermaid: popisek s HTML zůstane textem", () =>
  assert.equal(parseMermaid("flowchart LR\nA[\"<b>x</b>\"] --> B")?.uzly[0].label, "<b>x</b>"));
test("mermaid: komentáře a style řádky se ignorují", () =>
  assert.equal(parseMermaid("flowchart LR\n%% komentář\nA --> B\nstyle A fill:#f00")?.hrany.length, 1));

test("rozdělení: prázdné table, tree a mermaid se vynechají", () => {
  const sl = rozdelNaSlidy()({ meta: {}, sections: [{ id: "a", blocks: [
    { type: "table", columns: ["x"], rows: [] }, { type: "tree", items: [] }, { type: "mermaid", text: "" }] }] });
  assert.deepEqual(sl.map(s => s.typ), ["titul"]);
});
test("rozdělení: velký blok (mermaid/table/tree) + nejvýš jeden malý na slide", () => {
  const T = { type: "table", columns: ["x"], rows: [["1"]] }, M = { type: "mermaid", text: "graph LR\nA-->B" }, X = { type: "text", text: "x" };
  const pocty = bloky => rozdelNaSlidy()({ meta: {}, sections: [{ id: "a", blocks: bloky }] }).filter(s => s.typ === "sekce").map(s => s.bloky.length);
  assert.deepEqual(pocty([M, T]), [1, 1]);
  assert.deepEqual(pocty([M, X, X]), [2, 1]);
  assert.deepEqual(pocty([X, X, X, X, X]), [3, 2]);
});

test("demo data jsou verze 1", () => assert.equal(demo.version, 1));
test("demo pokrývá všech 19 témat", () => assert.deepEqual(demo.sections.map(s => s.id), TEMATA));
test("demo používá všechny typy bloků", () => {
  const pouzite = new Set(demo.sections.flatMap(s => s.blocks.map(b => b.type)));
  for (const t of TYPY) assert.ok(pouzite.has(t), t);
});
test("demo nemá úniky", () => assert.deepEqual(zkontroluj(demo), []));
test("šablona nenačítá nic z internetu", () => {
  assert.doesNotMatch(html, /(src|href)\s*=\s*["']?(https?:)?\/\//i);
  assert.doesNotMatch(html, /@import|url\(\s*["']?https?:/i);
});
test("data se nikdy nevkládají jako HTML", () => assert.doesNotMatch(html, /innerHTML|outerHTML|insertAdjacentHTML|document\.write/));
test("</script> v datech po náhradě < za \\u003c nerozbije blok", () => {
  const data = { version: 1, meta: { name: "x</script><b>" } };
  const vlozeny = JSON.stringify(data).replace(/</g, "\\u003c");
  const h = html.replace(/(<script type="application\/json" id="data">)[\s\S]*?(<\/script>)/, `$1${vlozeny}$2`);
  assert.equal(nactiData(h, "a.html").meta.name, "x</script><b>");
});

test("rozdělení: titul první, závěr poslední", () => {
  const sl = rozdelNaSlidy()({ meta: {}, sections: [{ id: "a", title: "A", blocks: [{ type: "text", text: "x" }] }], closing: { ask: ["y"] } });
  assert.deepEqual(sl.map(s => s.typ), ["titul", "sekce", "zaver"]);
});
test("rozdělení: sekce bez bloků nevznikne", () => {
  const sl = rozdelNaSlidy()({ meta: {}, sections: [{ id: "a", title: "A", blocks: [] }] });
  assert.deepEqual(sl.map(s => s.typ), ["titul"]);
});
test("rozdělení: prázdný blok se vynechá", () => {
  const sl = rozdelNaSlidy()({ meta: {}, sections: [{ id: "a", blocks: [{ type: "list", items: [] }, { type: "text", text: "x" }] }] });
  assert.equal(sl[1].bloky.length, 1);
});
test("rozdělení: 5 bloků = 2 slidy po max 3", () => {
  const b = Array.from({ length: 5 }, (_, i) => ({ type: "text", text: String(i) }));
  const sl = rozdelNaSlidy()({ meta: {}, sections: [{ id: "a", title: "A", blocks: b }] });
  assert.deepEqual(sl.filter(s => s.typ === "sekce").map(s => s.bloky.length), [3, 2]);
});
test("rozdělení: závěr jen když má obsah", () => {
  const sl = rozdelNaSlidy()({ meta: {}, sections: [], closing: { ask: [], takeaways: [] } });
  assert.deepEqual(sl.map(s => s.typ), ["titul"]);
});
