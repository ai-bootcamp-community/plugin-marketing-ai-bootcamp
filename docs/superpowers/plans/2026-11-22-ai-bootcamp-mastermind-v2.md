# ai-bootcamp-mastermind v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Zapracovat zpětnou vazbu z prvního běhu systémově (vzory, šablona, reference, SKILL.md).

**Architecture:** Beze změny (cesta B). Vzory přidají data, šablona tři nové bloky, reference říkají, jak je plnit.

**Tech Stack:** Node 18+ (vestavěné moduly, `node --test`), soběstačné HTML.

**Spec:** `docs/superpowers/specs/2026-11-21-ai-bootcamp-mastermind-design.md` (sekce v2)

## Global Constraints

- Platí vše z plánu `2026-11-21-ai-bootcamp-mastermind.md` (česky, bez závislostí, nic z internetu, žádné `innerHTML`).
- Nové texty ze vstupů nástrojů: jen `Agent/Task input.description`, max 80 znaků. Pravidla permissions: absolutní cesty a `~/` nahradit `…`.
- „Poslední týden“ = 7 dní před koncem nejnovější konverzace v datech (deterministické pro testy).

## Review Focus

1. `description` pomocníka s absolutní cestou → v `pomocnici.posledni` zamaskovaná → Task 1 test.
2. Mermaid s neznámou syntaxí → zobrazí se jako kód, stránka nespadne → Task 3 test (parser vrátí `null`).
3. Konverzace bez `entrypoint` → počítá se jako člověk (ne automatika) → Task 1 test.
4. Skill bez kódu → `kod` s nulami, ne chyba → Task 2 test.
5. Popisek uzlu mermaid s `<script>` → text, ne HTML (SVG přes `textContent`) → Task 3 statický test (žádné `innerHTML`) + parser test.

## Datové doplňky

`Souhrn` (`cc-konverzace.mjs`) navíc:
- `heat` = jen konverzace s `entrypoint` `cli` nebo chybějícím; `heat_automatika` = ostatní; `aktivni_dny` jen člověk.
- `pomocnici.posledni: {datum: "YYYY-MM-DD", typ, popis}[]` — max 15, nejnovější první, z posledního týdne, `popis` = `description` (max 80, cesty `…`), bez description se položka vynechá.
- `projekty: {projekt_id, konverzaci, zprav_cloveka, posledni: "YYYY-MM-DD"}[]` — složky pod `projects/`, seřazeno podle `konverzaci`, max 20.
- `kandidati`: navíc důvod `"poslední týden"` (max 5, podle počtu zpráv), limit 15.

`Nastaveni` (`cc-nastaveni.mjs`) navíc:
- `skilly[].kod: {py, js, sh, jine, radku}` — soubory ve složce skillu rekurzivně kromě `*.md`; `js` = `.js .mjs .cjs .ts`; `jine` = ostatní spustitelné přípony (`.rb .go .rs`); `radku` = řádky všech kódových souborů.
- `permissions.ukazky: {allow: string[], deny: string[], ask: string[]}` — max 8 každé, cesty zamaskované.
- `memory[].soubory: string[]` — jména souborů (max 20), bez obsahu.

Bloky šablony navíc: `mermaid{text}`, `table{columns: string[], rows: string[][]}`, `tree{items: {name, note?, children?}[]}`.

---

### Task 1: `cc-konverzace.mjs` — dvě heatmapy, poslední úkoly pomocníků, projekty, kandidáti z týdne
**Files:** Modify `…/examples/cc-konverzace.mjs`, fixtures, `tests/cc-konverzace.test.mjs`
- [ ] Testy: `heat` součet 2 (s1 cli) a `heat_automatika` součet 1 (s2 sdk-cli); konverzace bez entrypoint jde do `heat`; `pomocnici.posledni` obsahuje `{typ:"Explore", popis:"Rešerše konkurence"}` a description `"/Users/x/tajne"` se vypíše jako `"…"`; `projekty[0]` = `{projekt_id:"-proj-a", konverzaci:2, zprav_cloveka:3, posledni:"2026-11-11"}`; kandidát `"poslední týden"` existuje; výstup stále bez `TAJNY_TEXT`.
- [ ] RED → implementace → GREEN → commit `feat(mastermind): vzor konverzací v2`

### Task 2: `cc-nastaveni.mjs` — kód ve skillech, ukázky permissions, jména memory
**Files:** Modify `…/examples/cc-nastaveni.mjs`, fixtures (`skills/muj-skill/scripts/a.py` 3 řádky, `skills/muj-skill/b.mjs` 2 řádky, druhý skill bez kódu), `tests/cc-nastaveni.test.mjs`
- [ ] Testy: `muj-skill.kod = {py:1, js:1, sh:0, jine:0, radku:5}`; skill bez kódu má nuly; `permissions.ukazky.deny` obsahuje `"Read(.env)"`; pravidlo `"Read(/Users/tajny/x)"` se vypíše jako `"Read(…)"`; `memory[0].soubory = ["MEMORY.md"]`.
- [ ] RED → implementace → GREEN → commit `feat(mastermind): vzor nastavení v2`

### Task 3: Šablona — bloky `mermaid`, `table`, `tree`
**Files:** Modify `…/templates/prezentace.html`, `tests/sablona.test.mjs`
- [ ] Čistá funkce `parseMermaid(text) -> {smer:"LR"|"TD", uzly:{id,label,tvar}[], hrany:{z,do,label,carkovana}[]} | null` v `<script id="mermaid">`; testy: `flowchart LR\n A[Já] -->|zadání| B(Agent)\n B -.-> C{Pomocníci}` → 3 uzly, 2 hrany, druhá čárkovaná; `graph TD` funguje; `sequenceDiagram…` → `null`; popisek `<b>x</b>` zůstane textem v `label`.
- [ ] `rozdelNaSlidy`: prázdný `table` (bez rows), `tree` (bez items), `mermaid` (bez text) se vynechají; `table` a `mermaid` zaberou slide sám (max 1 takový blok na slide + nejvýš 1 další).
- [ ] Vykreslení: mermaid jako SVG (vrstvy podle nejdelší cesty, `createElementNS`, `textContent`), `null` → blok `code`; table s hlavičkou; tree jako odsazený strom s poznámkami. Demo data: mapa a orchestrace mermaid, projekty table, brain tree; test „demo používá všechny typy“ rozšířit o 3 nové.
- [ ] Vizuální kontrola headless Chrome (mapa, projekty, brain). Commit `feat(mastermind): šablona v2 — mermaid, tabulka, strom`

### Task 4: Reference a SKILL.md
**Files:** Modify `reference/temata.md`, `reference/mereni.md`, `reference/redakce.md`, `SKILL.md`, `INSTALL.md`, `examples/README.md`
- [ ] `temata.md`: nové bloky v tabulce, každý bod v2 jako pokyn u tématu (co přesně, kolik, z čeho).
- [ ] `mereni.md`: entrypoint → dvě heatmapy; poslední týden; popisy úkolů pomocníků.
- [ ] `redakce.md`: popisy úkolů pomocníků, pravidla permissions, ukázky memories, názvy projektů.
- [ ] `INSTALL.md` krok 4 a `examples/README.md`: vzory vypisují i krátké popisy úkolů pomocníků a ukázky pravidel.
- [ ] Celá sada testů zelená. Commit `docs(mastermind): reference v2`
