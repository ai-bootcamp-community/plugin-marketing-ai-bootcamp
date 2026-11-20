---
name: ai-bootcamp-prezentace
description: Use when the user runs /ai-bootcamp-prezentace, pastes an app.aibootcamp.cz/s/ link, or wants to create, preview or send their AI stack slide for AI BOOTCAMP.
---

# AI BOOTCAMP · slide s mým AI stackem

Z nastavení účastníka vytvoříš jeden slide „jaký mám AI setup a v čem jedu“ a po jeho souhlasu
ho pošleš do attendee app (nebo uložíš jako JSON k ručnímu nahrání). Publikum jsou marketéři:
slide mluví o tom, **na co** člověk AI používá a **co má nastavené**, ne o technických detailech.

Formát dat: `docs/website-prezentation/README.md` v repu `ai-bootcamp-community/plugin-playground`
(tabulka „Datový formát slidu (v1)“). Komunikuj česky.

## Postup

### 1. Odkaz a nastavení

- Argument ve tvaru `https://<host>/s/<token>` → ulož `{"base": "https://<host>", "token": "<token>"}`
  do `~/.config/ai-bootcamp/prezentace.json` (práva 600). Token nikdy nevypisuj.
- Bez argumentu a bez uloženého souboru → zeptej se na osobní odkaz ze stránky **Můj slide**
  v attendee app. Když ho člověk nemá, pokračuj v režimu „jen JSON“.

### 2. Sběr

Cíl sběru je vždy stejný — vyplnit tabulku „Co potřebuju zjistit“ v
[`reference/zdroje.md`](reference/zdroje.md). Cesty jsou tři, v tomto pořadí:

1. **Skript** (rychlá cesta): `node <složka tohoto skillu>/scripts/sber.mjs`. Spočítá Claude Code
   a Codex za 30 dní (u velké historie desítky sekund — řekni to předem) a vrátí JSON s názvy,
   popisy vlastních skillů/agentů a počty.
2. **Vlastní průzkum** (agentní cesta) — když Node chybí, skript selže, nebo člověk používá nástroj,
   který skript nezná (Cursor, Gemini CLI, Hermes, opencode, Copilot…), nebo výsledku chybí kus.
   Postupuj podle `reference/zdroje.md`: kde co leží, jak to číst bezpečně, co nikdy.
3. **Otázky** — co nejde zjistit (na co AI používá v práci, k čemu je který nástroj), se zeptej.

Výsledky cest slož dohromady a u každého čísla si pamatuj, odkud je (skript / průzkum / odpověď).

**Křížová kontrola skriptu průzkumem** (vždy, pár příkazů):
- Profily, které skript vrátil, opravdu existují; nechybí žádný z `ls -d ~/.claude* ~/.codex*`.
- Nástroj, který člověk zmíní nebo má aplikaci, a skript u něj vrátí 0 nebo nic → dohledej podle
  `reference/zdroje.md`, případně se zeptej.
- Počet konverzací ověř `find <profil>/projects -name '*.jsonl' -not -path '*/subagents/*' -mtime -30 | wc -l`
  (± pár kusů je v pořádku). Velký rozdíl = chyba skriptu → věř průzkumu a řekni to člověku.
- Čísla, která nedávají smysl (podíly modelů nedávají ~100 %, série > aktivní dny), neposílej.

### 3. Sestavení návrhu

Zdroj → pole slidu:

| Ze sběru | Do slidu |
| --- | --- |
| nástroje podle `usage.sessions` (+ `apps`, `other_tools` jen když je člověk potvrdí) | `tools`, seřazené sestupně |
| `skills_used` + názvy skillů | `uses`: 4–6 kategorií řečí marketéra (Plánování a nápady, Texty a copy, Data a reporty, Výzkum, Komunikace, Kontrola práce…) s váhou = počet použití |
| hooky, subagenti, druhý mozek, vlastní agenti | `setup`: 3–5 vět bez žargonu („AI si pamatuje moje schůzky a poznámky“, „Pomocníci pracují souběžně na víc úkolech“, „Pojistky, aby AI nic nerozbila“) |
| skilly a MCP | `skills.work/personal`, `mcp.work/personal` (pracovní = z profilu, který člověk označí jako pracovní) |
| `usage` | `stats` (konverzace, pomocníci, peak „den h:00“, heat, active_days, streak), `did`, `models` |
| nejzajímavější věci setupu | `ask`: 3 návrhy témat „Zeptej se mě na“ |
| hodiny aktivity | `badge`: Ranní ptáče (peak 5–9), Noční sova (21–3), jinak podle hlavního použití |

Vlastní nebo firemní model piš jen jako „firemní model“ / „vlastní model“.

### 4. Co jsem našel (vypiš, než se na cokoli zeptáš)

Krátký přehled v obecných kategoriích, ne surová data. Každý řádek = něco, co může jít na slide:

| Co můžeš ukázat | Co jsem našel |
| --- | --- |
| Nástroje a modely | např. „Claude Code (Opus), Codex, ChatGPT app“ |
| Na co AI používáš | 4–6 kategorií odvozených ze skillů |
| Co máš nastavené | 3–5 vět řečí marketéra |
| Skilly a napojení | počty + 3–5 příkladů; firemní zvlášť |
| Čísla aktivity | konverzace, pomocníci, aktivní dny, kdy pracuješ |
| Tokeny | přibližný počet za 30 dní |

Je-li jasné, že část konverzací je automatika (desítky za den ve stejnou hodinu, víc než ~20 denně),
řekni to a čísla aktivity označ jako zkreslená.

### 5. Výběr (AskUserQuestion, je-li k dispozici; jinak stejné otázky jako očíslovaný seznam)

Jedno volání, tyto čtyři otázky, u doporučené volby „(doporučeno)“:

1. **Co na slide** (multiSelect): Nástroje a modely · Skilly a napojení · Čísla aktivity ·
   Tokeny do side questu. Výchozí doporučení: první dvě; čísla jen když nejsou zkreslená.
2. **Formát**: zvolil-li čísla nebo tokeny → **Přehled (doporučeno)**; jinak → **Hero bez čísel
   (doporučeno)**: velká věta, nástroje, skilly a napojení jako čipy. Ulož do `style.layout`.
3. **Firemní věci**: Ukázat názvy · Interní zobecnit (doporučeno) · Jen osobní.
   (Pracovní = z profilu, který člověk označí; má-li víc profilů, zeptej se na to předem jednou větou.)
4. **Barva**: Oranžová · Modrá · Zelená · Růžová (vlastní #hex přes „Other“).

Co nezvolil, do JSON nedávej (`stats`, `did`, `models`, `tokens` vynech, ne nuly).

### 6. Vlastní slova (volný text, jedna zpráva)

Zeptej se na větu na slide, tip pro ostatní a 3 témata „Zeptej se mě na“. Ke každému nabídni 2–3
hotové návrhy z nalezeného setupu, ať stačí odpovědět číslem. Vymyšlené texty před odesláním
výslovně označ jako tvoje návrhy.

**Nechtěl-li čísla aktivity ani tokeny**, slide stojí na člověku, ne na statistikách:
- „Zeptej se mě na“ až **5 témat** a tipů až **3** (`tip` = první, další do `tips`).
- Návrhy hledej v tom, čím je jeho setup **neobvyklý**, ne v tom, co má každý:
  vlastní skilly (ne převzaté balíčky), automatizace (hooky, plánované běhy), napojení na
  nečekané nástroje, druhý mozek / paměť, víc agentů najednou, kombinace nástrojů.
- Každý návrh formuluj jako otázku, kterou by mu někdo v sále položil u kafe
  („jak ti AI každé ráno připraví den“, „proč máš na kampaně vlastní skill“), max 60 znaků.
- Nabídni 6–8 návrhů očíslovaně, ať si vybere a případně dopíše vlastní.

### 7. Validace (smyčka, dokud neprojde)

Ulož slide do `~/ai-bootcamp-slide.json` a spusť `node <složka skillu>/scripts/over.mjs ~/ai-bootcamp-slide.json`.
- `CHYBA` → oprav přesně tu položku (zkrať, zobecni, vyhoď) a spusť znovu. Úniky (URL, e-mail,
  cesta, token) vždy odstraň, nikdy je neobcházej přeformulováním.
- `varování` → zvaž, případně řekni člověku.
- Bez Node zkontroluj stejná pravidla ručně podle tabulky v `docs/website-prezentation/README.md`.
Do náhledu jde až JSON, který prošel.

### 7b. Náhled a souhlas

Ukaž čitelné shrnutí slidu a pod ním přesně ten JSON, který odejde. Pošli až po výslovném „ano“.

### 8. Odeslání

- S odkazem: `POST <base>/api/prezentace/slide`, hlavička `Authorization: Bearer <token>`,
  tělo JSON ze souboru (`curl -sS --fail-with-body -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data @slide.json …`).
  Token čti ze souboru nastavení uvnitř příkazu, ne z výpisu. Úspěch → ukaž `preview_url`.
  Chyba `422` → ukaž `errors`, oprav a znovu se zeptej.
- Bez odkazu: ulož `~/ai-bootcamp-slide.json` a řekni, ať ho nahraje na stránce **Můj slide**.

## Co nikdy nejde na slide

URL a adresy serverů, tokeny a klíče, cesty k souborům, názvy repozitářů a projektů, e-maily,
obsah konverzací, název firemního modelu. Na pochybnost položku zobecni („vlastní MCP server“).

## Časté chyby

- Číst jen výchozí `~/.claude` — lidé mívají víc profilů; sběr je najde všechny, ty se zeptej, který je pracovní.
- Složka nástroje ≠ používání: `other_tools` (Cursor, Gemini…) dávej na slide jen po potvrzení.
- Technický žargon na slidu (hooky, worktree, LSP) — publikum jsou marketéři.
