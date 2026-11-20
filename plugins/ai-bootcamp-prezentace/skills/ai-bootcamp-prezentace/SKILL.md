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

Spusť `node <složka tohoto skillu>/scripts/sber.mjs` a výstup si přečti. U velkých historií může trvat
sběr desítky sekund — řekni to předem. Bez Node.js (`node --version` selže) přeskoč na otázky v kroku 4 a stack sestav z odpovědí.

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

### 4. Otázky (jedna zpráva, očíslované, s tvým doporučením u každé)

1. Kterou z nalezených konfigurací je pracovní (je-li jich víc)?
2. Firemní MCP a skilly na slide? Rozděl: běžné produkty (GitLab, Jira, Slack…) → doporuč ano;
   interní nástroje → „ano, pokud ti nevadí“; volby všechno / jen doporučené / vybrat / nic.
3. Heatmapa hodin na slide? (ano/ne)
4. Tokeny do side questu „největší token spender“? (výchozí ne → `tokens: null`)
5. Tvoje věta na slide, tip pro ostatní, úprava „Zeptej se mě na“.
6. Barva (oranžová, modrá, zelená, růžová, žlutá, červená, nebo #hex).
7. Formát slidu: **Přehled** (všechno, hutné) nebo **Hero** (velká věta + čísla). Doporuč Hero, když
   má méně než 5 skillů a méně než 4 napojení, jinak Přehled. Ulož do `style.layout` (`prehled` / `hero`).

### 5. Náhled a souhlas

Ukaž čitelné shrnutí slidu a pod ním přesně ten JSON, který odejde. Pošli až po výslovném „ano“.

### 6. Odeslání

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
