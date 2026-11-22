# ai-bootcamp-mastermind · design

Stav: návrh k odsouhlasení (2026-11-21) · Autor: Martin Žatkovič (s Claude)
Navazuje na plugin `plugins/ai-bootcamp-prezentace/` v tomhle repu.

## Proč

Na mastermind session si lidi ukazují, **jak s AI opravdu pracují**: ne „jaký mám stack“
(to dělá slide z `ai-bootcamp-prezentace`), ale pohled pod kapotu — skilly zevnitř, orchestrace,
MCP, second brain, CLAUDE.md, memories, o čem se s AI baví a jak se to vyvíjelo.

Skill `ai-bootcamp-mastermind` za člověka projde jeho AI setup, najde data k předem daným
tématům, **interaktivně s ním projde redakci** (co tam je, co navrhuje smazat) a vyrobí
lokální HTML prezentaci, která funguje sama: jeden soubor, otevřít v prohlížeči, listovat.

**Úspěch:** účastník za 15–30 minut práce s agentem má deep dive, který může na masterminduukázat,
a nic v něm není, co tam mít nechtěl.

## Cíle

- Agent najde data ke všem tématům sám (níže); člověk se ptá jen na výběr a schválení.
- Před vytvořením HTML člověk projde každou sekci: vidí, co agent našel, a dostane konkrétní
  návrhy, co smazat nebo zobecnit.
- HTML funguje out of the box: jeden soubor, bez serveru a bez internetu, slidy šipkami.
- Funguje v Claude Code nejlépe, v Codexu, Hermesu, Cursoru aspoň částečně (co nejde najít, se vynechá).

## Ne-cíle

- Žádné odesílání do attendee app ani jinam. Výstup je soubor u člověka.
- Žádné hotové sběrné skripty, které se jen spustí (rozhodnuto: cesta B, viz Přístupy).
  Skill dodává **vzorové skripty** (`examples/`) jako ukázku, kam se vydat a jak správně
  parsovat; agent si podle nich napíše a upraví vlastní zpracování pro setup člověka.
- Žádné ladění vzhledu pro každého — jedna šablona, jedna paleta s volbou barvy.

## Anti-cíle (selhání, i kdyby to technicky fungovalo)

- V HTML zůstane URL, token, e-mail, cesta, jméno klienta nebo kolegy, které člověk neschválil.
- Čísla jsou špatně kvůli `/compact`, subagentům nebo zdvojeným záznamům (viz Měření).
- Shrnutí napsané AI (po komprimaci) se vydává za to, co napsal člověk.
- Deep dive je výpis konfigurace bez lidské pointy (stará verze `deep-dive.html` byla odložená
  jako „příliš technická“).

## Přístupy

| | Co | Pro | Proti |
| --- | --- | --- | --- |
| A | Node skript spočítá měřitelné, agent dodělá obsah, šablona | přesná a stejná čísla | skript pro každý nástroj zvlášť, delší vývoj |
| **B (vybráno)** | **Jen agent + sepsané „normované setupy“ a pravidla měření + šablona** | nejrychleji hotové, funguje v každém nástroji, obsahu agent rozumí | čísla závisí na tom, jak dobře agent dodrží pravidla; pomalejší a dražší na tokeny |
| C | Skript udělá vše včetně HTML, agent jen rediguje | nejpředvídatelnější | témata, CLAUDE.md, memories skript neshrne |

Martin zvolil B: hodnota je v sepsaných informacích, **kde co hledat a jak to správně
měřit**; agent podle nich jde. Doplněk (Martin): skripty smí být v pluginu, ale **jako vzor**,
podle kterého si agent zpracování připraví sám — ukázka, kam se vydat, ne hotový nástroj. Riziko nepřesných čísel se tlumí sekcí Měření v referenci
(konkrétní pole a pasti) a křížovou kontrolou v postupu.

## Struktura pluginu

```
plugins/ai-bootcamp-mastermind/
  README.md                 # pro člověka: k čemu, instalační prompt, co čte, kam ukládá
  install-mastermind.md     # pro agenta: stejný vzor jako u ai-bootcamp-prezentace
  skills/ai-bootcamp-mastermind/
    SKILL.md                # postup (níže)
    reference/temata.md     # 19 témat: co hledat, odkud, jak ukázat
    reference/setupy.md     # normované setupy: kde co leží pro každý nástroj
    reference/mereni.md     # pravidla počítání a pasti (compact, subagenti, duplicity)
    reference/redakce.md    # kategorie citlivých věcí s příklady + co je vždy ven
    examples/               # vzorové skripty (Node 18+, jen vestavěné moduly), ne ke slepému spuštění
      cc-konverzace.mjs     # projde jsonl Claude Code: dedup, compact, subagenti, modely, hodiny
      cc-nastaveni.mjs      # skilly, pluginy, MCP, hooky, permissions — jen názvy
      README.md             # k čemu který vzor je, co agent typicky upraví (cesty, profily, okno)
    templates/prezentace.html  # šablona s vloženými daty
```

**Role vzorů:** ukazují správné parsování a pasti z `mereni.md` v kódu. Agent je přečte,
přizpůsobí (jiný profil, jiný nástroj, jiné téma) a teprve pak spustí svou verzi. Výstup vzorů
jsou jen agregace (názvy, počty), nikdy text zpráv. Pro Codex/Hermes vzory nejsou — agent
postupuje podle `setupy.md` a vzoru pro Claude Code jako analogie.

## Postup skillu (SKILL.md)

1. **Úvod.** Jednou větou řekni, co projdeš (nastavení, konverzace za 30 dní, CLAUDE.md,
   memories, second brain), že to zůstane lokálně a že před vytvořením HTML projdete
   redakci. Nic se neodesílá.
2. **Setupy.** Podle `reference/setupy.md` najdi všechny nástroje a profily. Víc profilů je
   běžné — zeptej se jednou, který je pracovní a jestli chce oba.
3. **Sběr po tématech.** Podle `reference/temata.md` a `reference/mereni.md` zjisti data ke
   každému tématu. Na počítání si podle vzorů v `examples/` napiš vlastní skript (do
   `~/ai-bootcamp-mastermind/work/`), přizpůsobený nalezeným setupům. Pracovní soubor: `~/ai-bootcamp-mastermind/data.json` (práva 600).
   Téma bez dat vynech, nevymýšlej. U každého čísla si pamatuj zdroj.
4. **Křížová kontrola.** Počty konverzací, komprimací a pomocníků ověř druhou cestou
   (viz `mereni.md`). Nesedí-li to, věř přímému počtu souborů a řekni to.
5. **Přehled.** Tabulka „téma → co jsem našel (1 řádek)“. Zeptej se, která témata vynechat.
6. **Redakce (smyčka po sekcích).** Pro každou sekci ukaž:
   - **Co tam je** — přesně ten text a čísla, která půjdou do HTML.
   - **Navrhuju smazat / zobecnit** — konkrétní položky s důvodem podle `reference/redakce.md`
     (např. „jméno kolegy ‚Petr N.‘ → ‚kolega‘“, „klient ‚Alza‘ → ‚e-shop‘“).
   - **Volby:** nechat · smazat · zobecnit · přepsat vlastními slovy.
   Věci z kategorie „vždy ven“ (URL, tokeny, e-maily, cesty, hesla) se odstraní bez ptaní;
   jen to oznam. Bez schválení sekce nejde dál.
7. **Vlastní slova.** U 17 (nejlepší/nejhorší moment) a 19 (co chci postavit) nabídni
   kandidáty, člověk vybere. Ke každé sekci jedna lidská věta „co to znamená v praxi“ —
   agent navrhne, člověk potvrdí.
8. **Výroba.** Vlož schválená data do šablony → `~/ai-bootcamp-mastermind/prezentace.html`.
9. **Závěrečná kontrola úniků.** Projdi hotový soubor podle „vždy ven“ v `redakce.md`
   (regulární výrazy jsou tam). Nález → oprav a řekni.
10. **Předání.** Otevři soubor v prohlížeči (`open` / `xdg-open`) a řekni, jak listovat
    a jak sekci později upravit (znovu spustit skill s „uprav sekci X“).

## Témata (`reference/temata.md`)

Každé téma = jedna sekce prezentace (1–2 slidy). Sloupec „Kde“ je pro Claude Code;
ostatní nástroje v `setupy.md`.

| # | Téma | Co agent hledá | Kde (Claude Code) |
| --- | --- | --- | --- |
| 1 | Mapa setupu | nástroje, profily, jak do sebe zapadají (diagram) | `~/.claude*`, `~/.codex*`, `~/.hermes`… |
| 2 | Skilly do detailu | názvy, popisy, počet použití, vlastní vs. převzaté, jeden zevnitř | `skills/*/SKILL.md`, `enabledPlugins`, volání `Skill` |
| 3 | Orchestrace | pomocníci: kolik, typy, souběh, kdo řídí | `tool_use` `Agent`/`Task`, `subagents/*.jsonl`, `agents/*.md` |
| 4 | Ukázka konverzace | krátký výsek typické výměny (anonymizovaný) | `projects/**/*.jsonl` |
| 5 | MCP | názvy a četnost použití | `.claude.json` → `mcpServers`, volání `mcp__<server>__*` |
| 6 | Typické projekty | témata konverzací seskupená | názvy složek projektů, shrnutí po komprimaci, první zpráva člověka |
| 7 | Second brain | struktura a typy záznamů, jak ho AI používá | soubory a složky odkazované z CLAUDE.md, memory složky |
| 8 | CLAUDE.md | hlavní pravidla (shrnutí + 2–3 citace) | `~/.claude*/CLAUDE.md`, projektové `CLAUDE.md`/`AGENTS.md` |
| 9 | Memories | náhled, co si AI pamatuje | `projects/*/memory/`, `MEMORY.md` |
| 10 | Co řeší s AI vs. v práci | rozdělení témat (práce/osobní/učení…) | témata z 6 podle profilu |
| 11 | Vývoj v čase | kdy přibyly skilly, MCP, nástroje; objem po týdnech | časy souborů, první výskyt v logu |
| 12 | Den s AI | rozložení podle dne a hodiny | `timestamp` zpráv člověka |
| 13 | AI sama vs. se mnou | podíl pomocníků a automatiky | `entrypoint`, subagenti, hooky |
| 14 | Mantinely | zákazy, schvalování, pojistky | `settings.json` → `permissions`, `hooks` |
| 15 | Modely na co | který model kdy | `message.model` |
| 16 | Kontext a `/compact` | délka konverzací, kolik přeteklo, ruční vs. auto | `compact_boundary` + `compactMetadata` |
| 17 | Nejlepší a nejhorší moment | kandidáti podle signálů; člověk vybere | logy (nejdelší, nejvíc oprav, opakované dotazy) |
| 18 | Co sdílí s ostatními | vlastní skilly/pluginy v repech | git u složek skillů |
| 19 | Co chci postavit dál | rozdělané věci; člověk potvrdí | `plans/`, otevřené větve, TODO |

## Měření (`reference/mereni.md`)

Ověřeno na logu Claude Code (2026-11-21, 314 konverzací, verze s `compactMetadata`):

- **Konverzace = soubor** `projects/<projekt>/<session>.jsonl` mimo `subagents/`.
  `/compact` **nezakládá nový soubor**; konverzace pokračuje ve stejném.
- **Komprimace:** řádek `type: "system"`, `subtype: "compact_boundary"`, s
  `compactMetadata.{trigger: "manual"|"auto", preTokens, postTokens, durationMs}`.
  Hned po něm zpráva `isCompactSummary: true` = **shrnutí napsané AI**.
  - Nepočítat jako zprávu člověka; netahat z něj citace „řekl jsem“.
  - Smí se použít pro téma konverzace (6) — levnější než číst celý log.
  - `preTokens` je velikost kontextu, **ne spotřeba** — nepřičítat k tokenům.
- **Zprávy a volání se zapisují víckrát:** dedup podle `message.id` a `tool_use.id`.
- **Pořadí polí se liší** (vlastní modely přes bránu) — vždy parsovat JSON, ne hledat textem.
- **Subagenti:** přepisy v `…/subagents/*.jsonl`; počet pomocníků = unikátní `tool_use.id`
  volání `Agent`/`Task` v hlavních konverzacích.
- **Automatika:** pole `entrypoint` a `claude -p` běhy; desítky konverzací ve stejnou hodinu
  denně = automatické běhy → oddělit od ručních (jinak „Ranní ptáče“ podle ingestu).
  *Hodnoty `entrypoint` neověřeny — builder ověří na reálných logách.*
- **Codex, Hermes:** chování komprimace a formát neověřeny. Hermes má konverzace v SQLite
  (`~/.hermes/state.db`); čtení SQLite jen přes `hermes sessions list` nebo se zeptat.
- **Křížová kontrola:** `find <profil>/projects -name '*.jsonl' -not -path '*/subagents/*' -mtime -30 | wc -l`.

## Redakce (`reference/redakce.md`)

**Vždy ven, bez ptaní:** URL a hosty, tokeny/klíče/hesla, e-maily, telefonní čísla, cesty
k souborům, názvy repozitářů, `auth.json`/`.env` obsah. Regulární výrazy převzít z
`ai-bootcamp-prezentace/scripts/over.mjs`.

**Navrhnout s příkladem, rozhodne člověk:**

| Kategorie | Příklad nálezu | Návrh |
| --- | --- | --- |
| Jména lidí | „Petr Novák mi poslal…“ | „kolega“ |
| Klienti, firmy | „kampaň pro Alzu“ | „e-shop“ / „klient“ |
| Interní nástroje a projekty | „projekt Krakatice“, firemní MCP | „interní nástroj“ / nechat |
| Obchodní čísla | tržby, rozpočty, ceny | smazat / řádově |
| Osobní | zdraví, rodina, finance | smazat |
| Firemní model | název vlastního modelu | „firemní model“ |
| Citace z konverzací | doslovné výňatky | zkrátit, anonymizovat |
| Obsah CLAUDE.md a memories | celé pasáže | shrnutí + max. 2–3 krátké citace |

## Šablona (`templates/prezentace.html`)

- Jeden HTML soubor, CSS i JS uvnitř, **žádné externí zdroje** (bez CDN, bez fontů z webu).
- Data v `<script type="application/json" id="data">…</script>`; šablona je při otevření vykreslí.
  Agent mění jen tenhle blok.
- Slidy přes celou obrazovku, šipky / mezerník / klik, číslo slidu, tisk do PDF (`@media print`
  = slide na stránku).
- Typy bloků: `text`, `list`, `chips`, `stat` (velké číslo + popisek), `bars`, `heatmap`
  (den × hodina), `flow` (jednoduchý diagram kroků), `conversation` (bubliny člověk/AI),
  `code` (výňatek SKILL.md / CLAUDE.md), `timeline`. Prázdný blok i sekce se skryjí.
- Každá sekce: `title`, `lead` (lidská věta), `blocks[]`.
- Titulní slide: jméno, role, hlavní nástroje, jedna věta. Poslední slide: „S čím chci poradit“
  a „Co si odnést“.
- Světlé i tmavé téma, volba akcentní barvy.
- Funguje s ukázkovými daty bez úprav (out of the box) — šablona je zároveň demo.

## Rozhodnuto (Martin)

- Výstup = lokální HTML prezentace, šablona s mockem, do kterého se doplní data, funguje sama.
- Zaměření: jak lidé pracují — témata 1–19 (seznam vznikl v rozhovoru, Martin odsouhlasil).
- Všechno hledá agent; skill obsahuje sepsané setupy a směry, po čem jít (cesta B).
- Agent čte obsah sám (konverzace, CLAUDE.md, memories); před výrobou HTML člověk interaktivně
  projde redakci s konkrétními návrhy, co smazat.
- `/compact` se musí správně měřit.

## Moje volby (k potvrzení)

- Publikum: lidé, kteří s agenty pracují → technický obsah + u každé sekce jedna lidská věta.
- Okno 30 dní pro čísla; vývoj v čase (11) dál do minulosti, co logy dovolí.
- Úložiště `~/ai-bootcamp-mastermind/`; instalace stejným promptem a `INSTALL.md` jako první skill.
- Plugin v tomhle repu `plugins/ai-bootcamp-mastermind/`, česky.
- **Čtení obsahu dvoufázově:** vzorový skript projde logy a vrátí jen agregace a **kandidáty**
  (id konverzace + důvod: nejdelší, nejvíc oprav, typická). Agent pak čte jen vybrané výseky
  (témata 4, 6, 17), ne všechny logy celé. CLAUDE.md, memories a second brain (malé soubory)
  čte celé. Šetří tokeny a do kontextu modelu jde míň cizího textu.
- **Ukázková data šablony = fiktivní persona** pokrývající všech 19 témat, žádná reálná data.
- **Úklid:** `work/` (vlastní skripty, mezivýsledky) se po výrobě smaže; `data.json` obsahuje
  jen schválená data a zůstává kvůli pozdějším úpravám. Řekne se to člověku.
- **Struktura vs. cesty:** struktura se ukazuje relativně a zobecněně (`brain/projects/`,
  „složka se skilly“), nikdy absolutní cesta ani domovská složka. Názvy vlastních skillů
  a pluginů jsou obsah (téma 2, 18) — nejdou „vždy ven“, ale do redakce s návrhem.
- **Kontrola úniků jako skript:** plugin dodá `scripts/kontrola.mjs` (deterministická kontrola
  hotového HTML/JSON, vzory převzaté z `over.mjs`). Není to sběr, takže je v souladu s cestou B;
  bez Node se agent řídí stejnými vzory v `redakce.md`.
- **Instalace:** `INSTALL.md` + `install.sh` stejně jako první plugin; repo nemá marketplace
  ani CI, nic dalšího se neregistruje.
- **Ostatní nástroje:** builder ověří, co jde na jeho stroji (Codex), zbytek v `setupy.md`
  označí „neověřeno — zjisti, co ve složce je, nebo se zeptej“.

## Nechávám na builderovi

- Vizuální podoba šablony a přesné schéma JSON (v rámci typů bloků výše).
- Formulace v SKILL.md a referencích, pokud zachová pravidla.
- Ověření hodnot `entrypoint` a formátů Codexu na reálných datech.

## v2 · zpětná vazba z prvního běhu (Martin, 2026-11-22)

Martin vygeneroval prezentaci ve svém pracovním profilu a chce **systémové** změny skillu
(prezentaci neupravovat). Po sekcích:

| Sekce | Změna |
| --- | --- |
| mapa | graf, jak setup funguje (mermaid) |
| skilly | víc skillů; které mají kód (Python/Node/shell) a kolik; rozbor nejpoužívanějšího skillu s kódem (co dělají jeho skripty) |
| orchestrace | schéma (mermaid) + co pomocníci řešili v poslední době (krátké popisy úkolů) |
| konverzace | víc ukázek (3 různé typy) |
| projekty | detailní přehled: projekt, konverzací, naposledy, o čem |
| brain | struktura jako strom s počty, ne odrážky |
| claude-md | víc detailu: sekce instrukcí → co říkají, víc citací |
| memories | ukázky záznamů + srovnání, kde všude si AI pamatuje (memory, brain, CLAUDE.md, jiné nástroje) |
| den | dvě heatmapy: člověk vs. automatika |
| mantinely | ukázky konkrétních povolení a zákazů |
| momenty | nejlepší + nejhorší + 5 z posledního týdne |

**Moje volba:** mermaid se v šabloně vykresluje vlastním kódem pro podmnožinu syntaxe (flowchart
LR/TD, uzly `[ ]` `( )` `{ }`, šipky `-->` `-.->` s popiskem `|…|`). Knihovna mermaid má několik MB
a z CDN by porušila „nic z internetu“. Co podmnožina neumí, ukáže se jako kód.
Nové bloky: `mermaid`, `table`, `tree`. Vzory nově vypisují i **krátké popisy úkolů pomocníků**
(`description`, max 80 znaků) a **ukázky pravidel permissions** (cesty zamaskované) — obojí jde
přes redakci.
