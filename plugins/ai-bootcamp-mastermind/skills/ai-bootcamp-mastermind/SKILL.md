---
name: ai-bootcamp-mastermind
description: Use when the user runs /ai-bootcamp-mastermind or wants a deep-dive HTML presentation of how they work with AI (skills, orchestration, MCP, second brain, CLAUDE.md, memories) for an AI BOOTCAMP mastermind session.
---

# AI BOOTCAMP · mastermind deep dive

Projdeš AI setup člověka, najdeš data k 19 tématům, **s ním je po sekcích zrediguješ** a vyrobíš
lokální HTML prezentaci, která funguje sama (jeden soubor, šipky). Na mastermindu ukazuje, **jak**
s AI pracuje — skilly zevnitř, orchestraci, napojení, druhý mozek, pravidla, vývoj.
Komunikuj česky. Nic se nikam neposílá.

## Hlavní princip: skripty jsou inspirace, setup je realita

Ke sběru máš vzorové skripty (`examples/`). Vznikly na **jednom** setupu (macOS, Claude Code
v určité verzi, konkrétní profily). Počítač, na kterém běžíš, může být jiný: jiný nástroj, jiné
cesty, víc profilů, novější formát logu, Linux/Windows, chybějící Node, druhý mozek v Obsidianu
místo složky. **Nespouštěj vzory naslepo a nevěř jim jen proto, že doběhly.**

1. **Nejdřív se rozhlédni** po tomhle počítači: jaké nástroje a profily tu jsou, kde leží logy,
   jak vypadá jeden řádek logu (jen klíče, ne obsah), kde je druhý mozek.
2. **Porovnej se vzorem**: sedí cesty, názvy polí, formát? Vzor ti říká *co* zjistit a *na jaké
   pasti* si dát pozor (`reference/mereni.md`) — to platí všude. *Jak* to zjistit závisí na setupu.
3. **Aplikuj na tenhle setup**: když vzor sedí, zkopíruj ho do `~/ai-bootcamp-mastermind/work/`
   a uprav (cesty, profily, okno). Když nesedí, napiš vlastní skript nebo použij shell — podle
   stejných pravidel (jen názvy a počty, dedup, compact, člověk vs. automatika).
4. **Ověř výsledek proti realitě**: počty druhou cestou (`find … | wc -l`), nulové nebo divné
   hodnoty prověř (nula skillů u člověka, který skilly zjevně má = chyba sběru, ne fakt).
5. **Řekni člověku, co jsi upravil** a co zůstalo neověřené („Codex počítám jen podle souborů,
   formát zpráv jsem neověřil“).

Totéž platí pro `reference/setupy.md`: je to mapa, ne pravda. Když složka vypadá jinak, věř tomu,
co vidíš.

## Soubory

Složka tohoto skillu = `<skill>`. Pracovní složka člověka: `~/ai-bootcamp-mastermind/`
(`data.json`, `prezentace.html`, dočasně `work/`; soubory s daty práva 600).

| Soubor | K čemu |
| --- | --- |
| `<skill>/reference/temata.md` | 19 témat (`id`, co hledat, bloky) + formát dat |
| `<skill>/reference/setupy.md` | kde co leží pro Claude Code, Codex, Hermes… |
| `<skill>/reference/mereni.md` | jak počítat správně (`/compact`, pomocníci, duplicity, automatika) |
| `<skill>/reference/redakce.md` | co je vždy ven, co navrhnout ke smazání, formát redakce |
| `<skill>/examples/` | **vzory** skriptů (+ README) — inspirace, ne hotový nástroj (viz Hlavní princip) |
| `<skill>/scripts/vloz.mjs` | vloží `data.json` do šablony → `prezentace.html` |
| `<skill>/scripts/kontrola.mjs` | kontrola úniků v `data.json` / `prezentace.html` |
| `<skill>/templates/prezentace.html` | šablona s ukázkovou personou |

## Postup

### 1. Úvod
Jednou zprávou řekni, co projdeš (nastavení AI nástrojů, konverzace za 30 dní, CLAUDE.md,
memories, druhý mozek), že vše zůstane u něj v `~/ai-bootcamp-mastermind/`, že před výrobou HTML
spolu projdete redakci a že sběr chvíli trvá. Zeptej se jen na to, co nejde zjistit: jméno a roli
na titulní slide.

### 2. Setupy (rozhlédni se)
Podle `setupy.md` najdi nástroje a profily (`ls -d ~/.claude* ~/.codex* ~/.hermes ~/.cursor …`),
ale věř tomu, co ve složkách skutečně je. U každého nástroje s logy se podívej na klíče jednoho
záznamu (`head -1 <log> | jq 'keys'`), ať víš, jestli formát sedí se vzorem.
Víc profilů → jednou se zeptej, který je pracovní a jestli ukázat oba.

### 3. Sběr (aplikuj vzory na tenhle setup)
- Přečti `examples/README.md` a vzory. Podle kroku 2 rozhodni u každého: sedí → zkopíruj do
  `~/ai-bootcamp-mastermind/work/` a uprav; nesedí → napiš vlastní podle `mereni.md`.
  Spouštěj jen své kopie. Výstup jsou jen agregace a kandidáti.
- K tématům, která vzory nepokrývají, dopiš vlastní malý skript podle `mereni.md` nebo použij
  shell (`ls`, `jq 'keys'`, `grep` na klíče) — vždy jen názvy a počty.
- Obsah čti **dvoufázově** (`mereni.md`): u kandidátů jen výseky, `CLAUDE.md`, memories
  a strukturu druhého mozku celé. Do konverzace s člověkem nevypisuj surové logy.
- U skillů s kódem přečti skripty **nejpoužívanějšího** (počet použití × kód) a shrň, co který
  skript dělá (téma 2). U druhého mozku projdi strukturu do hloubky 2–3 (téma 7).
- Kde téma chce schéma (mapa, orchestrace), napiš graf v podmnožině mermaid podle `temata.md`.
- Výsledek průběžně skládej do `~/ai-bootcamp-mastermind/data.json` podle formátu v `temata.md`.
  U každého čísla si pamatuj zdroj. Drž se rozsahu u témat (např. 8–12 skillů, 3 ukázky
  konverzací, 5 momentů z týdne) — deep dive má mít detail, ne odrážky.

### 4. Křížová kontrola
Počet konverzací ověř `find` (viz `mereni.md`). Počty, které nedávají smysl, neukazuj — nejdřív
zjisti, jestli chybu neudělal sběr (jiný formát, jiná cesta). U `entrypoint` jiného než `cli`
se zeptej, jestli jde o jeho automatiku. Člověku krátce řekni, co jsi oproti vzorům upravil
a co je neověřené.

### 5. Přehled
Tabulka „téma → co jsem našel (jeden řádek)“ pro všech 19 témat (u chybějících „nenašel jsem“).
Zeptej se, která témata vynechat. Pak nabídni kandidáty pro 17 (nejlepší/nejhorší moment)
a potvrzení 19 (co chce postavit dál) — vždy vybírá člověk.

### 6. Redakce po sekcích
Pro každou sekci zprávu ve formátu z `redakce.md`: **Co tam je** (přesně, co půjde do HTML),
**Navrhuju** (konkrétní položky s důvodem), **Vždy ven** (už odstraněno), **Volby**.
Klidně 2–3 sekce v jedné zprávě, ať to netrvá věčnost. Bez schválení sekce nejde dál.
Navrhni `lead` větu (lidsky, bez žargonu) — schvaluje se se sekcí.

### 7. Titul a závěr
`meta`: jméno, role, hlavní nástroje, jedna věta „o čem je můj deep dive“ (nabídni 2–3 návrhy).
`closing.ask` z tématu 19 („S čím chci poradit“), `closing.takeaways` 2–3 tipy (navrhni).
Barva a motiv: nabídni oranžovou/modrou/zelenou/růžovou, tmavý/světlý.

### 8. Výroba
`node <skill>/scripts/vloz.mjs ~/ai-bootcamp-mastermind/data.json ~/ai-bootcamp-mastermind/prezentace.html`
— vloží schválená data do šablony (jen datový blok, se správným escapováním, práva 600).
Šablonu ručně neupravuj. Bez Node: do datového bloku vlož JSON, ve kterém je každý znak
„menší než“ zapsaný jako unicode escape (zpětné lomítko, `u003c`), jinak text v datech může blok ukončit.

### 9. Kontrola úniků
`node <skill>/scripts/kontrola.mjs ~/ai-bootcamp-mastermind/prezentace.html` (a `data.json`).
Nález → oprav v datech, vlož znovu, spusť znovu. Bez Node zkontroluj vzory z `redakce.md` ručně.

### 10. Předání a úklid
- Smaž `~/ai-bootcamp-mastermind/work/` a řekni to. `data.json` zůstává (jen schválená data,
  pro pozdější úpravy).
- Otevři prezentaci (`open` na macOS, `xdg-open` na Linuxu) a řekni: šipky/mezerník listují,
  `#5` v adrese otevře slide 5, tisk do PDF dá slide na stránku.
- Úprava později: „uprav sekci X“ → změň `data.json`, znovu kroky 8–9.

## Časté chyby

- Shrnutí po `/compact` (`isCompactSummary`) citovat jako slova člověka — psala ho AI.
- Přičítat `preTokens` k tokenům — je to velikost kontextu.
- Počítat `/compact` nebo `subagents/*.jsonl` jako nové konverzace.
- Souběh pomocníků počítat po řádcích — volání jedné odpovědi jsou na víc řádcích se stejným `message.id`.
- Číst všechny logy celé — drahé a zbytečné; jen kandidáti a výseky.
- Absolutní cesty ve struktuře druhého mozku — ukazuj relativně.
- Hledat MCP jen v `.claude.json` — konektory claude.ai jsou jen v logu (`mcp__claude_ai_*`).
- Heatmapa a „ranní ptáče“ z automatiky — odděl `entrypoint` jiné než `cli`.
- Jedna heatmapa pro všechno — člověk a automatika patří do dvou (`heat`, `heat_automatika`).
- Mermaid mimo podmnožinu (`subgraph`, `sequenceDiagram`, `A[(db)]`) — šablona ho ukáže jen jako kód.
- Seznamy místo struktury: projekty, CLAUDE.md, memories a skilly s kódem patří do `table`,
  druhý mozek do `tree`.
- Počítat obaly (`<task-notification>`, `<bash-stdout>`, `<local-command-stdout>`…) jako zprávy
  člověka — u autora to bylo 23 % „zpráv“ (viz `mereni.md`).
- Technický žargon v `lead` větách — pointa musí dávat smysl i bez znalosti nástroje.
