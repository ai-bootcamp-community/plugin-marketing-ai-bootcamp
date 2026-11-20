# ai-bootcamp-prezentace

Skill, který z tvého AI setupu udělá jeden slide pro AI BOOTCAMP („jaký mám AI stack a v čem jedu“)
a po tvém souhlasu ho pošle do attendee app, odkud se promítá. Stav: **draft** (neotestovaný na
účastnících). Zadání pro API a web: [`docs/website-prezentation/`](../../docs/website-prezentation/README.md).

**Vyzkoušeno:** sběr dat (`scripts/sber.mjs`) na macOS s Claude Code a Codexem. Celý tok se skillem zatím ne.
**Autor:** Martin Žatkovič.

## Instalace (jeden příkaz)

```sh
curl -fsSL https://raw.githubusercontent.com/ai-bootcamp-community/plugin-playground/main/plugins/ai-bootcamp-prezentace/install.sh | sh
```

Skript stáhne `SKILL.md` a `scripts/sber.mjs` do složek skillů Claude Code (všech profilů), Codexu
a `~/.agents/skills`. Nic nespouští ani neposílá — přečti si ho předem: [`install.sh`](install.sh).

## Použití

1. V attendee app otevři **Můj slide** a zkopíruj příkaz s osobním odkazem.
2. V Claude Code nebo Codexu spusť `/ai-bootcamp-prezentace https://app.aibootcamp.cz/s/<token>`.
3. Odpověz na pár otázek, zkontroluj náhled, potvrď odeslání.

## Co skill čte a co posílá

- Čte jen **názvy** (skilly, pluginy, MCP servery, agenti) a **počty** (konverzace, akce, modely)
  za posledních 30 dní. Obsah konverzací, hesla, klíče ani hodnoty nastavení nevypisuje a neposílá.
- Ven jde jen JSON, který uvidíš v náhledu a potvrdíš. Bez odkazu ho jen uloží do `~/ai-bootcamp-slide.json`.

## Jen ChatGPT (bez agenta)

Vlož do ChatGPT: „Vyptej se mě na můj AI setup (nástroje, na co AI používám, napojení, co mám
nastavené, kolik s AI pracuju) a vytvoř JSON podle formátu z
https://github.com/ai-bootcamp-community/plugin-playground/blob/main/docs/website-prezentation/priklad-slide.json.
Nevkládej URL, e-maily ani interní názvy.“ Výsledek nahraj na stránce **Můj slide**.

## Známé limity (draft)

- Sběr potřebuje Node.js 18+ (bez něj se skill na stack vyptá). U autora (1 200 konverzací) 22 s.
- Firemní/vlastní model pomocníků se zatím nezapočítá do mixu modelů (jiný tvar záznamu v logu).
- Tokeny = vstup + výstup bez cache, jednou na odpověď; orientační.
- Codex: počítají se jen sessions, ne akce a modely.
