# Figma Integration

This directory contains configuration files for integrating the Universal Design System with Figma via Code Connect, Tokens Studio, and the Figma Variables API MCP server.

## Files

| File | Purpose |
|------|---------|
| `code-connect.json` | Figma Code Connect mappings for all 32 components |
| `tokens-studio.config.json` | Tokens Studio bidirectional sync configuration for 9 palettes |
| `figma-mcp.json` | Figma MCP server config for Variables API integration |

## Required Environment Variables

| Variable | Description |
|----------|-------------|
| `FIGMA_TOKEN` | Figma personal access token (Settings > Account > Personal access tokens) |

Export before running any Figma CLI or MCP tool:

```bash
export FIGMA_TOKEN=figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Code Connect Setup

Figma Code Connect links Figma components to their real code implementations so developers see live code snippets in Figma's Dev Mode.

### Prerequisites

- Figma Desktop App or access to the Figma REST API
- Node.js 18+

### Install the Code Connect CLI

```bash
npm install --save-dev @figma/code-connect
```

### Configure

Edit `.figma/code-connect.json` and replace each `figmaNodeUrl` placeholder with the real URL from your Figma file:

1. Open the Figma file
2. Right-click the component frame
3. Select "Copy link to selection"
4. Paste the URL into the `figmaNodeUrl` field for that component

### Publish

```bash
npx figma connect publish --token $FIGMA_TOKEN
```

### Verify

```bash
npx figma connect lint --token $FIGMA_TOKEN
```

After publishing, open the component in Figma Dev Mode — the "Code" tab will show the live React template from `code-connect.json`.

---

## Tokens Studio Bidirectional Sync

Tokens Studio for Figma enables round-trip token sync: edit tokens in Figma and push back to source, or push token changes from code into Figma Variables.

### Prerequisites

- [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978) plugin installed

### Configuration

The sync configuration is in `.figma/tokens-studio.config.json`. It maps all 9 palette token sets to the corresponding sections of `tokens/design-tokens.json` using W3C DTCG format.

Token sets mapped:

| Set | Source Path |
|-----|-------------|
| `primitives` | `tokens/design-tokens.json#color.primitives` |
| `semantic` | `tokens/design-tokens.json#color.semantic` |
| `minimal-saas` | `tokens/design-tokens.json#theme.minimal-saas` |
| `ai-futuristic` | `tokens/design-tokens.json#theme.ai-futuristic` |
| `gradient-startup` | `tokens/design-tokens.json#theme.gradient-startup` |
| `corporate` | `tokens/design-tokens.json#theme.corporate` |
| `apple-minimal` | `tokens/design-tokens.json#theme.apple-minimal` |
| `illustration` | `tokens/design-tokens.json#theme.illustration` |
| `dashboard` | `tokens/design-tokens.json#theme.dashboard` |
| `bold-lifestyle` | `tokens/design-tokens.json#theme.bold-lifestyle` |
| `minimal-corporate` | `tokens/design-tokens.json#theme.minimal-corporate` |

### Push tokens to Figma

1. Open Tokens Studio in Figma
2. Go to Settings > Sync > JSONbin (or your provider)
3. Paste the contents of `tokens/design-tokens.json` as the token source
4. Click "Pull from remote" to load the token sets
5. Click "Push to Figma" to create/update Figma Variables

### Pull tokens from Figma

1. Make changes to tokens in Figma (Variables panel or Tokens Studio UI)
2. In Tokens Studio, click "Push to remote"
3. Run `npm run validate` to confirm the updated tokens pass W3C DTCG validation
4. Run `npm run audit` to confirm WCAG 2.1 AA contrast is still passing
5. Run `npm run check` for the full validation suite

### Important: One palette per surface

Do not mix palette token sets. Each Figma page or frame should apply exactly one `data-theme` value corresponding to a single palette.

---

## Figma MCP Server (Variables API)

The MCP server integration (`figma-mcp.json`) exposes three tools for syncing design tokens with Figma Variables via the REST API.

### Tools

| Tool | Description |
|------|-------------|
| `sync_variables` | Push local tokens to Figma Variables collection |
| `pull_variables` | Pull Figma Variables back to local token files |
| `diff_variables` | Show differences between local tokens and Figma Variables |

### Setup with Claude Code (MCP)

Add to your `.claude/settings.json` or `~/.claude.json` MCP server config:

```json
{
  "mcpServers": {
    "figma-variables": {
      "command": "node",
      "args": ["src/mcp/figma-variables.js"],
      "env": {
        "FIGMA_TOKEN": "${FIGMA_TOKEN}",
        "FIGMA_FILE_KEY": "your-figma-file-key-here"
      }
    }
  }
}
```

The Figma file key is the alphanumeric ID in the Figma URL:
`https://www.figma.com/file/FILE_KEY/file-name`

### Usage

Once configured, Claude Code can invoke the tools directly:

```
sync_variables: Push tokens from tokens/design-tokens.json to Figma file abc123 collection "UDS Primitives"
pull_variables: Pull all Variables from Figma file abc123 to local tokens
diff_variables: Show what changed between local tokens and Figma file abc123
```

### Authentication

The MCP server uses a Figma personal access token. Generate one at:
`https://www.figma.com/settings` > Account > Personal access tokens

Required scopes: `File content` (read) + `Variables` (read + write)

---

## WCAG Compliance Note

After any token sync from Figma, always re-run the contrast audit:

```bash
npm run audit        # WCAG 2.1 AA (108 checks across 9 palettes x 2 modes)
npm run audit:apca   # APCA/WCAG 3.0 analysis
```

Palette-specific contrast gotchas to watch for:

- `illustration`: orange brand-primary (#E8590C) fails 4.5:1 on white/light backgrounds
- `ai-futuristic`: inherently dark backgrounds even in "light" mode
- `corporate` / `minimal-corporate`: bright brand-primary in dark mode (#79B8FF, #FBBF24) fail with white text-on-brand
