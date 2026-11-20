#!/bin/sh
# Instalace skillu ai-bootcamp-prezentace z GitHubu do všech nalezených AI nástrojů.
# Co dělá: stáhne SKILL.md, scripts/sber.mjs, scripts/over.mjs a reference/zdroje.md do složek skillů (Claude Code, Codex, ~/.agents).
# Nic nespouští, nic neposílá. Spuštění: curl -fsSL <raw URL tohoto souboru> | sh
set -eu
RAW="https://raw.githubusercontent.com/ai-bootcamp-community/plugin-playground/main/plugins/ai-bootcamp-prezentace/skills/ai-bootcamp-prezentace"
NAME="ai-bootcamp-prezentace"

targets="$HOME/.claude/skills"
[ -n "${CLAUDE_CONFIG_DIR:-}" ] && targets="$targets ${CLAUDE_CONFIG_DIR}/skills"
for d in "$HOME"/.claude-*; do [ -f "$d/settings.json" ] && targets="$targets $d/skills"; done
[ -d "$HOME/.codex" ] && targets="$targets $HOME/.codex/skills"
[ -n "${CODEX_HOME:-}" ] && targets="$targets ${CODEX_HOME}/skills"
[ -d "$HOME/.hermes" ] && targets="$targets $HOME/.hermes/skills"
targets="$targets $HOME/.agents/skills"   # Copilot CLI, Gemini CLI a další čtou ~/.agents/skills

tmp=$(mktemp -d)
curl -fsSL "$RAW/SKILL.md" -o "$tmp/SKILL.md"
mkdir -p "$tmp/scripts"
curl -fsSL "$RAW/scripts/sber.mjs" -o "$tmp/scripts/sber.mjs"
curl -fsSL "$RAW/scripts/over.mjs" -o "$tmp/scripts/over.mjs"
mkdir -p "$tmp/reference"
curl -fsSL "$RAW/reference/zdroje.md" -o "$tmp/reference/zdroje.md"

for t in $targets; do
  mkdir -p "$t/$NAME/scripts" "$t/$NAME/reference"
  cp "$tmp/SKILL.md" "$t/$NAME/SKILL.md"
  cp "$tmp/scripts/sber.mjs" "$tmp/scripts/over.mjs" "$t/$NAME/scripts/"
  cp "$tmp/reference/zdroje.md" "$t/$NAME/reference/zdroje.md"
  echo "nainstalováno: $t/$NAME"
done
rm -rf "$tmp"
echo
echo "Hotovo. V Claude Code / Codexu spusť: /ai-bootcamp-prezentace <tvůj odkaz ze stránky Můj slide>"
