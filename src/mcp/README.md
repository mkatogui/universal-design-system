# UDS MCP Server

Model Context Protocol server for the Universal Design System. Exposes palette queries, component lookups, BM25 search, and token generation to AI coding tools.

**Auto-install:** Run `npx @mkatogui/universal-design-system install` (or `uds install`) in your project; it detects your platform and adds the MCP server. Supported: Claude Code (`.mcp.json`), Cursor (`.cursor/mcp.json`), Windsurf (`.windsurf/mcp.json`), VS Code/Copilot (`.vscode/mcp.json`), Zed (`.zed/settings.json` with `context_servers`), Continue (`.continue/mcpServers/universal-design-system.yaml`), and Cline (`.cline_mcp_servers.json` at project root).

## Prerequisites

- Node.js 18+
- Python 3.8+ (for the BM25 reasoning engine)

## Install

```bash
cd src/mcp
npm install
```

## Available Tools

| Tool | Description |
|------|-------------|
| `search_design_system` | BM25 search across 20 CSV databases. Returns domain detection, palette, components, patterns, and rules. |
| `get_palette` | Retrieve the full token set (colors, structural tokens) for one of the 9 palettes. |
| `get_component` | Look up a component by slug. Returns variants, sizes, states, props, and accessibility requirements. |
| `generate_tokens` | Run the full reasoning pipeline and return a complete design system spec. Formats: `json`, `tailwind`, `css-in-js`, `markdown`, `box`. |
| `list_palettes` | List all 9 palettes with descriptions and key attributes. |
| `list_components` | List all components (72 in React package) with names and categories. |
| `get_anti_patterns` | Get anti-patterns to avoid for a sector (e.g. finance, healthcare). Returns severity, description, alternatives. |
| `get_foundation_tokens` | Get palette-independent tokens: spacing, motion, typography, z-index, opacity. |

## Configuration

Add the server to your AI tool's MCP configuration. The `command` is `node` and the single argument is the absolute path to `index.js`.

### Claude Code

In your project's `.mcp.json` or `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "universal-design-system": {
      "command": "node",
      "args": ["/absolute/path/to/src/mcp/index.js"]
    }
  }
}
```

### Cursor

In `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "universal-design-system": {
      "command": "node",
      "args": ["/absolute/path/to/src/mcp/index.js"]
    }
  }
}
```

### VS Code (Copilot)

In `.vscode/mcp.json`:

```json
{
  "servers": {
    "universal-design-system": {
      "command": "node",
      "args": ["/absolute/path/to/src/mcp/index.js"]
    }
  }
}
```

### Windsurf

In `.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "universal-design-system": {
      "command": "node",
      "args": ["/absolute/path/to/src/mcp/index.js"]
    }
  }
}
```

### Cline

`uds install` writes to `.cline_mcp_servers.json` at the project root (Cline’s project-level MCP config). For manual setup, create that file with:

```json
{
  "mcpServers": {
    "universal-design-system": {
      "command": "node",
      "args": ["/absolute/path/to/src/mcp/index.js"]
    }
  }
}
```

### Zed

`uds install` writes to `.zed/settings.json` in your project and adds a `context_servers` entry. If you need to configure manually (e.g. user-level settings), use:

```json
{
  "context_servers": {
    "universal-design-system": {
      "source": "custom",
      "command": "node",
      "args": ["/absolute/path/to/src/mcp/index.js"],
      "env": {}
    }
  }
}
```

Use `node_modules/@mkatogui/universal-design-system/src/mcp/index.js` when the package is installed in your project.

### Continue

`uds install` creates `.continue/mcpServers/universal-design-system.yaml` with the MCP server entry. For manual setup, create that file with:

```yaml
name: Universal Design System MCP
version: 0.5.0
schema: v1
mcpServers:
  - name: universal-design-system
    command: node
    args:
      - "/absolute/path/to/src/mcp/index.js"
```

## Usage Examples

Once configured, your AI coding tool can call these tools directly:

**Search for a design system recommendation:**
```
search_design_system({ "query": "fintech dashboard for mobile banking" })
```

**Get a specific palette:**
```
get_palette({ "name": "corporate" })
```

**Look up a component:**
```
get_component({ "slug": "data-table" })
```

**Generate a full design system specification:**
```
generate_tokens({ "query": "saas landing page", "format": "json" })
generate_tokens({ "query": "ecommerce store", "format": "tailwind" })
```

**List all available palettes or components:**
```
list_palettes()
list_components()
```

**Get anti-patterns for a sector or foundation tokens:**
```
get_anti_patterns({ "sector": "finance" })
get_foundation_tokens()
```

## Architecture

```
AI Tool  -->  MCP stdio  -->  index.js  -->  Python subprocess (search/generate)
                                         -->  design-tokens.json (palette lookup)
                                         -->  components.csv (component lookup)
```

The server runs as a stdio process. AI tools spawn it and communicate via JSON-RPC over stdin/stdout per the MCP specification. Python scripts are invoked as subprocesses only for search and generation tasks; palette and component lookups read files directly for speed.

## Troubleshooting

- **"python3" not found:** The server calls Python for `search_design_system` and `generate_tokens`. Ensure `python3` is on the PATH used by the AI tool (often a minimal env). Install Python or point the tool to a venv that has it.
- **Tool timeout:** Search and generation allow 30s; very large queries may time out. Narrow the query or run the scripts locally (`python3 src/scripts/search.py "query"`).
- **Wrong path in config:** If the AI tool reports "server failed to start", check that the `args` path in your MCP config points to the real `index.js` (e.g. `node_modules/@mkatogui/universal-design-system/src/mcp/index.js` when the package is installed).
