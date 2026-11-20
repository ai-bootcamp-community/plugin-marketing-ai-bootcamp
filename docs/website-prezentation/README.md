# Prezentace AI stacku účastníků · produktové zadání pro API a web

Stav: návrh k odsouhlasení (2026-11-19, formáty Přehled + Hero 2026-11-20) · Akce: AI BOOTCAMP Marketingová edice, 20.–22. 11. 2026, Tábor
Kde se staví: API a web v `ai-bootcamp-community/attendee-app` (app.aibootcamp.cz),
skill v tomhle repu (`plugins/ai-bootcamp-prezentace/`).
Klikací prototyp vzhledu: lokálně u Martina (`ClaudeCodePersonal/workspace/stack-slide/prototyp.html`).

## Proč

Účastníci pracují s AI agenty (Claude Code, Codex, ChatGPT…), ale nevidí, jak to mají nastavené ostatní.
Každý si jedním skillem vytáhne svůj AI setup, schválí, co z něj ukáže, a pošle to do appky.
Na plátně pak běží slidy všech účastníků po skupinách podle nástroje, se souhrnem sálu a side questy.
Slide slouží i jako „za kým jít na kafe“: každý má sekci **Zeptej se mě na →**.

**Úspěch:** v sobotu večer běží na plátně slidy aspoň třetiny účastníků a nikdo na nich nenajde
nic, co tam mít nechtěl.

**Anti-cíle:** slide s interní adresou, tokenem nebo obsahem konverzace; účastník, za kterého poslal
slide někdo jiný; plátno, které se rozbije na dlouhém jménu nebo 140 skillech.

## Jak to běží (uživatelský tok)

1. **Instalace (1 příkaz)** — z GitHubu, viz `plugins/ai-bootcamp-prezentace/README.md`.
2. **Osobní odkaz** — účastník se přihlásí do attendee app (kód z e-mailu, už existuje), otevře
   **Můj slide** a zkopíruje příkaz `/ai-bootcamp-prezentace https://app.aibootcamp.cz/s/<token>`.
3. **Běh skillu** — agent lokálně projde nastavení (jen názvy a počty, obsah konverzací nikdy),
   přeloží ho do řeči marketéra, zeptá se na pár věcí, ukáže náhled a po potvrzení pošle JSON na API.
4. **Bez agenta (ChatGPT apod.)** — skill/prompt vygeneruje JSON, účastník ho nahraje na stránce
   **Můj slide** (je přihlášený, takže se ví, za koho to je).
5. **Promítání** — organizátor pustí `/promitani` na plátno. Nové slidy přibývají samy.

## Rozsah

### Musí být na 20. 11. (MVP)

| # | Co | Kde |
| --- | --- | --- |
| M1 | Osobní token na účastníka, stránka **Můj slide** s příkazem ke zkopírování a tlačítkem „vygenerovat nový token“ | web + API |
| M2 | `POST` slidu tokenem (upsert: jeden slide na účastníka, poslední vyhrává) | API |
| M3 | Ruční nahrání JSON na stránce Můj slide (přihlášený účastník) | web + API |
| M4 | Validace a čištění vstupu (schéma níže, limity, jen text, žádné HTML) | API |
| M5 | Náhled vlastního slidu na Můj slide + „smazat můj slide“ | web |
| M6 | Promítací stránka se dvěma formáty slidu, **Přehled** a **Hero** (viz „Formáty slidu“), barva podle člověka, pevné plátno 16:9 (1600×900) škálované na obrazovku, auto-zmenšení přetékajícího obsahu | web |
| M7 | Fronta: **Celý sál** (souhrn) → **skupiny podle hlavního nástroje** (úvodní slide skupiny) → lidé; lišta „Další na řadě“; auto-posun 20 s, šipky, mezerník = pauza; nové slidy se načtou bez reloadu (polling 15 s) | web + API |
| M8 | Admin: skrýt/odkrýt slide (pro případ, že na něm je něco nevhodného) | web + API |

### Mělo by být (pokud zbude čas)

| # | Co |
| --- | --- |
| S1 | **Side questy** na konci fronty: top 3 v kategoriích Největší token spender (jen kdo povolil), Nejvíc multiagentní, Sběratel MCP, Nejvíc skillů |
| S2 | Responzivní Můj slide na telefonu (slide přeskládaný do sloupce) |

### Fáze 2 (po akci)

Další formáty (Karta / Terminál / Plakát / Wrapped) a pozadí tmavé/světlé/barevné; změna formátu
a barvy přímo v appce s živým náhledem; ruční pořadí fronty v adminu; kontrola kontrastu barev.

## Formáty slidu (MVP)

Oba formáty se kreslí ze stejného JSON; formát volí účastník ve skillu (`style.layout`).
Skill doporučí **Hero**, když má člověk málo obsahu (méně než 5 skillů a méně než 4 napojení),
jinak **Přehled**. Chybí-li `style.layout` nebo je neznámý, použije se `prehled`.

**Přehled (`prehled`)** — hutný, pro bohatý setup:
- hlavička: jméno, věta, „jede v *nástroje*“, štítek (`badge`) vpravo;
- levý sloupec: „Na co používám AI“ (pruhy z `uses`, max 4), „Skilly · N“ (řádky *V práci* /
  *Osobně*, zbytek „+N dalších“), „MCP a napojení · N“ (stejně);
- pravý sloupec: „Co mám nastavené“ (`setup` + `tip`), „Kdy s AI pracuju“ (konverzace, pomocníci,
  peak, aktivní dny/série, heatmapa den × hodina), „Co za mě AI udělala“ (`did` + pruh `models`);
- dole přes celou šířku: pruh „Zeptej se mě na →“ (`ask`).
- Bez firemních položek se řádky *V práci / Osobně* nekreslí (jen jedna řada čipů).

**Hero (`hero`)** — jedna velká myšlenka, pro málo obsahu nebo pro ty, kdo chtějí výrazný slide:
- nahoře: jméno + „nástroj + nástroj“, štítek vpravo;
- uprostřed velkým písmem věta (`sentence`) a pod ní barvou člověka „Tip: …“ (`tip`);
- řada čísel: konverzace za 30 dní, pomocníci, úpravy souborů za mě (`did.edits`), čipy napojení
  (max 6 + „+N“);
- dole pruh „Zeptej se mě na →“.
- Chybí-li `sentence`, místo ní „Nejvíc: *první položka uses*“.

Společné: barva `style.accent` (pruh nahoře, štítek, zvýraznění, heatmapa), tmavé pozadí, chybějící
volitelné pole = sekce se nekreslí (žádné prázdné boxy). Vzor obou formátů je v prototypu.

## API

Base: `https://app.aibootcamp.cz/api/prezentace`. Vše JSON, UTF-8.

| Metoda a cesta | Auth | Co dělá |
| --- | --- | --- |
| `POST /slide` | `Authorization: Bearer <token>` | uloží/přepíše slide účastníka; vrátí `{ "ok": true, "preview_url": "…" }` |
| `GET /slide` | Bearer | vrátí uložený slide (skill ho může ukázat jako „už máš poslaný“) |
| `DELETE /slide` | Bearer | smaže slide |
| `POST /me/slide` | session (přihlášený) | ruční nahrání JSON z webu (stejná validace jako `POST /slide`) |
| `DELETE /me/slide` | session | smazání z webu |
| `POST /me/token` | session | vygeneruje nový token (starý přestane platit) |
| `GET /queue` | admin session nebo `?key=<projekční klíč>` | hotová fronta pro plátno (viz níže) |
| `POST /admin/slide/{id}/hidden` | admin session | `{ "hidden": true/false }` |

**Token:** náhodný, ≥ 128 bitů, v DB jen hash, svázaný s účastníkem. Osobní odkaz
`https://app.aibootcamp.cz/s/<token>` je jen nosič: skill z něj odvodí base URL a token. Otevřený
v prohlížeči ukáže návod (ne data).

**Chyby:** `401` neplatný token, `413` moc velké tělo (limit 64 kB), `422` neprošla validace
s `{"errors": [{"path": "skills.work[3]", "msg": "…"}]}` — skill chybu ukáže účastníkovi.

**Rate limit:** 10 `POST` za minutu na token.

### Fronta (`GET /queue`)

Server skládá frontu, web ji jen vykresluje:
`[{ "type": "room", … }, { "type": "group", "tool": "Claude Code", "members": [...] }, { "type": "person", "slide": {…} }, …, { "type": "quests", … }]`.
Skupina = `tools[0]` (skill posílá nástroje seřazené podle počtu konverzací). Skupiny podle
velikosti sestupně, lidé ve skupině podle času odeslání. Skryté slidy se nevrací.

## Datový formát slidu (v1)

Příklad: `priklad-slide.json` v téhle složce.

| Pole | Typ, limit | Povinné | Poznámka |
| --- | --- | --- | --- |
| `version` | `1` | ano | |
| `name` | text ≤ 60 | ano | server může přepsat jménem z registrace (doporučeno) |
| `sentence` | text ≤ 120 | ne | vlastní věta účastníka |
| `badge` | text ≤ 30 | ne | štítek („Ranní ptáče“) |
| `tip` | text ≤ 120 | ne | tip pro ostatní |
| `tools` | pole ≤ 6 textů ≤ 30 | ano | seřazené podle používání; první = skupina |
| `uses` | pole ≤ 6 `[text ≤ 40, číslo ≥ 0]` | ne | „na co AI používám“ + váha |
| `setup` | pole ≤ 5 textů ≤ 90 | ne | „co mám nastavené“ lidsky |
| `skills` | `{ total: int, work: [≤ 12 × text ≤ 40], personal: [≤ 12 × text ≤ 40] }` | ne | |
| `mcp` | `{ work: [≤ 16], personal: [≤ 16] }` texty ≤ 40 | ne | jen názvy |
| `ask` | pole ≤ 3 textů ≤ 60 | ne | „Zeptej se mě na“ |
| `stats.conversations` | int | ne | 30 dní |
| `stats.helpers` | int | ne | spuštění subagentů, 30 dní |
| `stats.peak` | text ≤ 20 | ne | „pátek 6:00“ |
| `stats.heat` | 7 × 24 int | ne | po–ne × 0–23 h; účastník může vypnout |
| `stats.active_days`, `stats.streak` | int | ne | |
| `did` | `{ edits, commands, web }` int | ne | co za něj AI udělala |
| `models` | pole ≤ 5 `[text ≤ 30, procento]` | ne | firemní model jen jako „firemní model“ |
| `tokens` | int nebo `null` | ne | **jen s výslovným souhlasem**, jinak `null` |
| `style` | `{ layout: "prehled" \| "hero", accent: "#rrggbb" }` | ne | neznámý layout → `prehled`, neplatná barva → výchozí oranžová |

Validace: neznámá pole zahodit, texty ořezat o bílé znaky, odmítnout řídicí znaky, vykreslovat
výhradně jako text. Odmítnout texty, které vypadají jako URL, e-mail nebo cesta (`/Users/`, `C:\`),
a známé tvary tokenů (`sk-`, `ghp_`, `glpat-`, `xox`) — druhá pojistka za skillem.

## Soukromí a bezpečnost

- Skill čte jen názvy a počty; obsah konverzací, `auth.json`, `.env`, hodnoty v `env` nastavení
  ani historii nečte. Ven jde jen to, co účastník viděl v náhledu a potvrdil.
- Firemní MCP a skilly smí jít ven jen po dotazu; URL, hosty, tokeny, cesty a názvy repozitářů nikdy.
- Data slidů smazat do 30 dnů po akci (zmínit na stránce Můj slide).
- Projekční klíč je jiný než admin session a jde zneplatnit.

## Akceptační kritéria MVP

1. Účastník s osobním odkazem pošle slide ze skillu; do 15 s je ve frontě na plátně.
2. Ruční nahrání příkladového JSON z webu projde; neplatný JSON vrátí srozumitelnou chybu.
3. Slide se 140 skilly, 18 MCP a 40znakovým jménem se na plátně 1920×1080 i 1024×768 vejde bez přetečení, v Přehledu i Hero.
6. Slide s `"layout": "hero"` se vykreslí jako Hero; bez `style` jako Přehled.
4. Cizí token → `401`; po „nový token“ starý nefunguje.
5. Skrytý slide zmizí z fronty do 15 s.

## Předpoklady a rizika

- **Repo `plugin-playground` musí být veřejné** nejpozději v pátek ráno, jinak instalace z GitHubu
  nebude fungovat (teď je soukromé).
- Attendee app je sama „připravená k ověření a prvnímu nasazení“ — tahle funkce se přidává těsně
  před ostrým startem. Pokud by ohrozila hlavní appku, vydat ji odděleně (feature flag) nebo vynechat.
- Počty z Codexu a dalších nástrojů jsou méně přesné než z Claude Code (jiná struktura logů).
