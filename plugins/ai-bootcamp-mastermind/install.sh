#!/bin/sh
# Instalace skillu ai-bootcamp-mastermind z GitHubu do nalezených AI nástrojů.
# Co dělá: stáhne soubory skillu (SKILL.md, reference/, examples/, scripts/, templates/) do složek skillů.
# Nic nespouští, nic neposílá. Spuštění: curl -fsSL <raw URL tohoto souboru> | sh
set -eu
RAW="https://raw.githubusercontent.com/ai-bootcamp-community/plugin-playground/main/plugins/ai-bootcamp-mastermind/skills/ai-bootcamp-mastermind"
NAME="ai-bootcamp-mastermind"
FILES="SKILL.md reference/temata.md reference/setupy.md reference/mereni.md reference/redakce.md examples/README.md examples/cc-konverzace.mjs examples/cc-nastaveni.mjs scripts/kontrola.mjs templates/prezentace.html"

targets="$HOME/.claude/skills"
[ -n "${CLAUDE_CONFIG_DIR:-}" ] && targets="$targets ${CLAUDE_CONFIG_DIR}/skills"
for d in "$HOME"/.claude-*; do [ -f "$d/settings.json" ] && targets="$targets $d/skills"; done
[ -d "$HOME/.codex" ] && targets="$targets $HOME/.codex/skills"
[ -n "${CODEX_HOME:-}" ] && targets="$targets ${CODEX_HOME}/skills"
[ -d "$HOME/.hermes" ] && targets="$targets $HOME/.hermes/skills"
targets="$targets $HOME/.agents/skills"   # Copilot CLI, Gemini CLI a další čtou ~/.agents/skills

tmp=$(mktemp -d)
for f in $FILES; do
  mkdir -p "$tmp/$(dirname "$f")"
  curl -fsSL "$RAW/$f" -o "$tmp/$f"
done

for t in $targets; do
  for f in $FILES; do
    mkdir -p "$t/$NAME/$(dirname "$f")"
    cp "$tmp/$f" "$t/$NAME/$f"
  done
  echo "nainstalováno: $t/$NAME"
done
rm -rf "$tmp"
echo
echo "Hotovo. Spusť ve svém agentovi: /ai-bootcamp-mastermind"
