# Plugin Marketing · AI BOOTCAMP 2026

Sdílené místo pro **pluginy, skilly, příkazy a instrukce**, které si lidé dávají do svých
AI nástrojů. Vzniklo jako komunitní kontext ke konferenci **AI BOOTCAMP Marketingová edice 2026**: co ti funguje,
to sem dej, ať si to ostatní můžou vzít a rovnou použít.

## Pluginy

| Plugin | Co dělá | Stav |
| --- | --- | --- |
| [`ai-bootcamp-mastermind`](plugins/ai-bootcamp-mastermind/) | Projde tvůj AI setup (skilly, pomocníci, napojení, druhý mozek, instrukce, paměť) a s tebou z něj udělá deep dive prezentaci v HTML pro mastermind. Nic neposílá. | draft, vyzkoušeno s Claude Code |
| [`ai-bootcamp-prezentace`](plugins/ai-bootcamp-prezentace/) | Z AI setupu udělá jeden slide „jaký mám AI stack“. Vznikl pro AI BOOTCAMP 11/2026 (posílá do attendee app); bez odkazu uloží slide jako JSON. | draft, vázaný na akci |

### Instalace přes agenta

Každý plugin má krátký prompt, který vložíš do svého agenta (Claude Code, Codex, Hermes, Cursor…).
Agent si z repa stáhne návod pro sebe (`install-*.md` / `INSTALL.md` ve složce pluginu), vybere
správnou složku skillů pro svůj nástroj, ukáže, co kam kopíruje, a řekne, co skill dělá. Prompt
najdeš v README pluginu. Pro ruční instalaci má každý plugin i `install.sh`.

## Podporované nástroje

Cílem je, aby šel každý příspěvek použít aspoň v základních nástrojích:

| Nástroj | Co se z repa použije |
| --- | --- |
| **Claude Code** | plugin (`.claude-plugin/plugin.json`), skilly, slash příkazy, agenti, hooky, MCP |
| **Codex** (OpenAI) | skilly (`SKILL.md`), instrukce v `AGENTS.md` |
| **Cursor** | pravidla (`.cursor/rules/`), `AGENTS.md`, MCP |
| **Gemini CLI**, **GitHub Copilot** a další | `AGENTS.md` / vlastní instrukční soubor, MCP |

Společným jmenovatelem jsou **skilly ve formátu `SKILL.md`** (Markdown s YAML hlavičkou
`name` + `description`) a **`AGENTS.md`**. Když píšeš něco nového, začni skillem;
nástrojově specifické obaly (Claude plugin, Cursor rule…) jsou nadstavba.

## Struktura

```
plugin-playground/
├── README.md
├── LICENSE
├── docs/                          # zadání a „jak to vzniklo“ (design, plány)
└── plugins/
    └── <nazev-pluginu>/
        ├── README.md              # co to dělá, pro koho, jak nainstalovat (povinné)
        ├── install-<plugin>.md    # volitelně: návod pro agenta (instalace promptem)
        ├── skills/
        │   └── <nazev-skillu>/
        │       └── SKILL.md       # přenositelné jádro
        ├── AGENTS.md              # volitelně: obecné instrukce pro agenty
        ├── .claude-plugin/
        │   └── plugin.json        # volitelně: manifest pro Claude Code
        ├── commands/              # volitelně: slash příkazy (Claude Code)
        ├── agents/                # volitelně: subagenti (Claude Code)
        └── .cursor/rules/         # volitelně: pravidla pro Cursor
```

## Jak použít plugin

Obecně: najdi složku v `plugins/`, přečti její `README.md` a zkopíruj, co tvůj nástroj umí.

- **Claude Code** – celý plugin: zkopíruj nebo nalinkuj složku pluginu a nainstaluj přes `/plugin`;
  jen skill: zkopíruj `skills/<skill>/` do `~/.claude/skills/` (globálně) nebo `.claude/skills/` (v projektu).
- **Codex** – zkopíruj `skills/<skill>/` do adresáře se skilly Codexu, případně obsah
  `AGENTS.md` do `AGENTS.md` ve svém projektu.
- **Cursor** – zkopíruj `.cursor/rules/` do svého projektu, nebo použij `AGENTS.md`.
- **Ostatní** – `SKILL.md` i `AGENTS.md` jsou obyčejný Markdown; vlož je jako instrukce.

Přesné cesty se mezi verzemi nástrojů mění – když něco nesedí, ověř to v dokumentaci
svého nástroje a pošli opravu.

## Jak přispět

1. Forkni repo (nebo si založ větev, pokud máš přístup).
2. Vytvoř `plugins/<nazev-pluginu>/` v `kebab-case`.
3. Přidej aspoň `README.md` a jeden `SKILL.md`. V README uveď:
   - **co** plugin dělá a **pro koho** je,
   - ve kterých nástrojích jsi ho **vyzkoušel/a**,
   - **jak** ho nainstalovat,
   - autora / kontakt.
4. Otevři pull request s krátkým popisem a příkladem použití.

### Pravidla

- **Žádné secrety** – API klíče, tokeny ani interní URL do repa nepatří. Použij proměnné prostředí
  a v README napiš, co je potřeba nastavit.
- **Žádná firemní data** – sdílej postupy, ne obsah z interních systémů.
- **Bezpečnost** – hooky a skripty, které něco spouštějí, popiš v README tak, aby bylo jasné,
  co dělají. Než si cizí plugin nainstaluješ, přečti si ho.
- **Jedna věc na plugin** – raději víc malých pluginů než jeden obří.

## Licence

Pokud plugin neuvádí jinak, příspěvky jsou sdílené pod licencí MIT ([`LICENSE`](LICENSE)).
