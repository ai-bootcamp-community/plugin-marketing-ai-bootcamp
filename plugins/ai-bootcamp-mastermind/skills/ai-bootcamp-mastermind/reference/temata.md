# Témata deep divu a formát dat

Každé téma = jedna sekce prezentace (`sections[]`, `id` přesně podle tabulky). Téma bez dat
vynech, nevymýšlej. Každá sekce má `lead`: **jednu lidskou větu „co to znamená v praxi“**
(navrhne agent, potvrdí člověk) — publikum jsou lidé, kteří s agenty pracují, ale pointa musí
být srozumitelná i bez technických znalostí.

Kde hledat: `setupy.md`. Jak počítat: `mereni.md`. Co smazat: `redakce.md`.

| # | `id` | Téma | Co agent hledá | Odkud (Claude Code) | Bloky | Ptát se? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `mapa` | Mapa setupu | nástroje, profily, jak do sebe zapadají | profily, nastavení | `flow`, `chips` | ne |
| 2 | `skilly` | Skilly do detailu | názvy, popisy, počet použití, vlastní vs. převzaté, jeden zevnitř (výňatek) | `skills/`, volání `Skill` | `bars`, `code` | který ukázat zevnitř |
| 3 | `orchestrace` | Orchestrace | pomocníci: kolik, typy, souběh, kdo řídí; vlastní agenti | volání `Agent`/`Task`, `agents/` | `stat`, `list` | ne |
| 4 | `konverzace` | Jak spolu mluvíme | krátký výsek typické výměny (2–4 zprávy), anonymizovaný | kandidát `typická` | `conversation` | výběr výseku |
| 5 | `mcp` | Napojení | MCP a konektory s četností | `.claude.json`, volání `mcp__*` | `bars`, `chips` | ne |
| 6 | `projekty` | Na čem to jede | témata konverzací v kategoriích | shrnutí po compact, první zprávy, složky projektů | `bars`, `list` | potvrdit kategorie |
| 7 | `brain` | Druhý mozek | struktura (relativně), typy záznamů, jak ho AI používá | viz „Druhý mozek“ v `setupy.md` | `list`, `stat` | když se nenajde |
| 8 | `claude-md` | Moje pravidla pro AI | hlavní pravidla v bodech + 2–3 citace | `CLAUDE.md`, `AGENTS.md` | `list`, `code` | ne |
| 9 | `memories` | Co si o mně pamatuje | náhled pamatovaných preferencí | `projects/*/memory/` | `list` | ne |
| 10 | `ai-vs-prace` | Co řeším s AI a co v práci | rozdělení témat (příprava, psaní, učení, osobní…) | témata z 6 podle profilu | `bars`, `text` | jak to vidí on |
| 11 | `vyvoj` | Jak se to vyvíjelo | kdy přibyly nástroje, skilly, MCP; objem po týdnech | `prvni_vyskyt`, `tydny`, časy souborů | `timeline` | doplnit starší historii |
| 12 | `den` | Den s AI | kdy pracuje (den × hodina), bez automatiky | `heat` ze zpráv člověka | `heatmap` | ne |
| 13 | `sama-vs-ja` | AI sama vs. se mnou | podíl automatiky a pomocníků | `entrypoint`, hooky, pomocníci | `stat`, `list` | potvrdit automatiku |
| 14 | `mantinely` | Mantinely | zákazy, schvalování, pojistky (smysl, ne pravidla doslova) | `permissions`, `hooks` | `list` | ne |
| 15 | `modely` | Modely na co | který model kdy | `modely` | `bars` | na co který |
| 16 | `kontext` | Dlouhé konverzace | kolik přeteklo, ruční vs. auto `/compact`, velikost kontextu | `compact` | `stat`, `text` | ne |
| 17 | `momenty` | Nejlepší a nejhorší moment | kandidáti podle signálů | kandidáti `nejdelší`, `nejvíc compact` | `text`, `conversation` | **vždy** vybere člověk |
| 18 | `sdileni` | Co sdílím s ostatními | vlastní skilly/pluginy v repech, týmový setup | git u složek skillů | `chips`, `list` | ne |
| 19 | `plany` | Co chci postavit dál | rozdělané věci | `plans/`, otevřené větve | `list` | **vždy** potvrdí člověk |

Příklad dobré `lead` věty: „Velký úkol rozdělím mezi pomocníky; já řídím, oni dělají rešerši
souběžně.“ Špatně: „Používám subagenty typu Explore s paralelním dispatchem.“

## Formát dat (`data.json` = datový blok šablony)

```json
{
  "version": 1,
  "meta": { "name": "", "role": "", "tools": [""], "sentence": "", "accent": "#e8875b", "theme": "tmava" },
  "sections": [ { "id": "skilly", "title": "", "lead": "", "blocks": [ { "type": "text", "text": "" } ] } ],
  "closing": { "ask": [""], "takeaways": [""] }
}
```

- `meta.theme`: `tmava` | `svetla`; `meta.accent`: `#rrggbb`.
- `closing.ask` = „S čím chci poradit“ (z tématu 19), `closing.takeaways` = „Co si odnést“.

| Blok | Pole |
| --- | --- |
| `text` | `text` |
| `list` | `items: string[]` |
| `chips` | `items: string[]` |
| `stat` | `value` (text nebo číslo), `label` |
| `bars` | `items: [popisek, číslo][]` |
| `heatmap` | `data: number[7][24]` (řádky po–ne, sloupce 0–23 h) |
| `flow` | `steps: string[]` |
| `conversation` | `messages: { who: "ja" \| "ai", text }[]` |
| `code` | `text`, `label` (volitelně) |
| `timeline` | `items: { when, what }[]` |

Prázdný blok i sekce bez bloků se nezobrazí; víc než 3 bloky se rozdělí na další slide.
Ukázka všech typů: datový blok v `../templates/prezentace.html` (fiktivní persona).
