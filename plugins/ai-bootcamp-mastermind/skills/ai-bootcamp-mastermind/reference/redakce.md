# Redakce · co ven nikdy, co navrhnout ke smazání

Do HTML jde jen to, co člověk v redakci viděl a schválil. Redakce běží **po sekcích**, ne jednou
na konci.

## Vždy ven (bez ptaní, jen to oznam)

URL a hosty serverů, tokeny/klíče/hesla, e-maily, telefonní čísla, absolutní cesty a domovská
složka (`/Users/…`, `~/…`, `C:\…`), obsah `auth.json` a `.env`, hodnoty `env` z nastavení.
Kontrolu dělá `../scripts/kontrola.mjs` (spusť na `data.json` i na hotové `prezentace.html`).
Bez Node hledej stejné vzory ručně: `https?://`, `www.`, `*.cz/.com/…`, `@` v adrese,
`/Users/`, `/home/`, `~/`, `sk-`, `ghp_`, `glpat-`, `xox?-`, `AKIA`, devítimístná čísla.
Nález **odstraň nebo zobecni**, nikdy ho neobcházej přeformulováním.

## Navrhni s příkladem, rozhodne člověk

| Kategorie | Příklad nálezu | Návrh |
| --- | --- | --- |
| Jména lidí | „Petr Novák mi poslal podklady“ | „kolega“, „šéf“, „agentura“ |
| Klienti, firmy | „kampaň pro velký e-shop s elektronikou (jméno)“ | „e-shop“, „klient“ |
| Interní nástroje a projekty | název interního projektu, firemní MCP | „interní nástroj“ / nechat, když nevadí |
| Názvy vlastních skillů a pluginů | `brief-pro-agenturu` | obvykle nechat (je to obsah deep divu); interní zkratky zobecnit |
| Obchodní čísla | tržby, rozpočty, ceny, marže | smazat / řádově („šestimístný rozpočet“) |
| Osobní | zdraví, rodina, finance, vztahy | smazat |
| Firemní model | název vlastního modelu | „firemní model“ |
| Citace z konverzací | doslovné výňatky | zkrátit, anonymizovat, max. 3 výměny |
| CLAUDE.md, memories | celé pasáže | shrnutí v bodech + max. 2–3 krátké citace |
| Struktura druhého mozku | absolutní cesta, názvy složek s klienty | relativně (`brain/projects/`), klienty zobecnit |
| Témata konverzací | konkrétní projekt nebo člověk | kategorie („kampaně“, „reporty“) |
| Názvy projektů | název složky (zakódovaná cesta), jméno klienta | lidský název („Podzimní kampaň“), klienta zobecnit |
| Popisy úkolů pomocníků | „Oprav fakturu pro (firma)“ | „Oprava faktury pro klienta“ |
| Pravidla permissions | `Bash(ssh prod-db-01:*)`, interní hosty | přeložit do lidské řeči („nesmí na produkční servery“); výňatek bez hostů |
| Ukázky memories | „Šéf je (jméno), nemá rád…“ | preference ano, lidi a vztahy pryč |
| Rozbor skriptů skillu | názvy interních API, endpointy | co skript dělá, ne kam volá |

Na pochybnost navrhni zobecnění, ne smazání — deep dive bez obsahu nikomu nepomůže.

## Formát redakce jedné sekce

```
### 05 · Napojení (MCP)
Co tam je:
  • Gmail (64×), Google Drive (51×), Kalendář (23×), firemni-analytika (9×)
  • Věta: „AI vidí do pošty, dokumentů a kalendáře, takže nekopíruju.“
Navrhuju:
  1. „firemni-analytika“ → „analytika (interní)“ — interní název nástroje
Vždy ven (už odstraněno): URL serveru analytiky
Volby: nechat · smazat · zobecnit · přepsat vlastními slovy (napiš čísla položek)
```

Bez výslovného schválení sekce nejde dál. Když člověk řekne „zbytek nech“, platí to jen pro
sekce, které už viděl.
