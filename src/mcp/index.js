#!/usr/bin/env node

/**
 * Universal Design System -- MCP Server
 *
 * Exposes UDS capabilities (search, palettes, components, token generation)
 * to AI coding tools via the Model Context Protocol over stdio transport.
 *
 * Usage:
 *   node src/mcp/index.js
 *
 * Configure in your AI tool's MCP settings:
 *   {
 *     "mcpServers": {
 *       "universal-design-system": {
 *         "command": "node",
 *         "args": ["<path-to-repo>/src/mcp/index.js"]
 *       }
 *     }
 *   }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..", "..");
const TOKENS_PATH = resolve(PROJECT_ROOT, "tokens", "design-tokens.json");
const COMPONENTS_CSV = resolve(PROJECT_ROOT, "src", "data", "components.csv");
const SEARCH_SCRIPT = resolve(PROJECT_ROOT, "src", "scripts", "search.py");
const GENERATE_SCRIPT = resolve(
  PROJECT_ROOT,
  "src",
  "scripts",
  "design_system.py",
);

// ---------------------------------------------------------------------------
// Valid palettes
// ---------------------------------------------------------------------------

const VALID_PALETTES = [
  "minimal-saas",
  "ai-futuristic",
  "gradient-startup",
  "corporate",
  "apple-minimal",
  "illustration",
  "dashboard",
  "bold-lifestyle",
  "minimal-corporate",
];

const PALETTE_DESCRIPTIONS = {
  "minimal-saas":
    "Clean SaaS aesthetic with neutral tones and blue accents. Best for B2B software, productivity tools, and developer platforms.",
  "ai-futuristic":
    "Dark-mode forward with neon accents and deep purples. Best for AI/ML products, developer tools, and crypto platforms.",
  "gradient-startup":
    "Vibrant gradients with purple-to-pink energy. Best for consumer startups, creative tools, and social platforms.",
  corporate:
    "Traditional business palette with navy and conservative tones. Best for finance, insurance, enterprise, and government.",
  "apple-minimal":
    "Ultra-clean with generous whitespace and precise typography. Best for premium consumer products, hardware, and luxury.",
  illustration:
    "Warm, friendly palette with hand-drawn character. Best for education, kids products, onboarding, and community platforms.",
  dashboard:
    "Data-dense with high contrast and status colors. Best for analytics, admin panels, monitoring, and DevOps.",
  "bold-lifestyle":
    "High-energy editorial with strong brand identity. Best for fashion, sports, media, and entertainment.",
  "minimal-corporate":
    "Research-forward editorial with warm neutrals. Best for consulting, professional services, and content-heavy sites.",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run a Python script and return its stdout.
 */
function runPython(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    execFile(
      "python3",
      [scriptPath, ...args],
      { cwd: PROJECT_ROOT, timeout: 30_000, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          // Provide a clear message when python3 is not available
          if (error.code === "ENOENT") {
            reject(
              new Error(
                "python3 not found. The UDS reasoning engine requires Python 3 to be installed and on PATH.",
              ),
            );
            return;
          }
          reject(new Error(stderr || error.message));
          return;
        }
        resolve(stdout);
      },
    );
  });
}

/**
 * Parse a simple CSV string into an array of objects.
 * Handles quoted fields containing commas and newlines.
 */
function parseCSV(text) {
  const lines = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "\n" && !inQuotes) {
      if (current.trim()) {
        lines.push(current);
      }
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) {
    lines.push(current);
  }

  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || "";
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Split a single CSV line by commas, respecting quoted fields.
 */
function splitCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Load and cache the design tokens JSON file.
 */
let _tokensCache = null;
async function loadTokens() {
  if (_tokensCache) return _tokensCache;
  const raw = await readFile(TOKENS_PATH, "utf-8");
  _tokensCache = JSON.parse(raw);
  return _tokensCache;
}

/**
 * Load and cache the components CSV.
 */
let _componentsCache = null;
async function loadComponents() {
  if (_componentsCache) return _componentsCache;
  const raw = await readFile(COMPONENTS_CSV, "utf-8");
  _componentsCache = parseCSV(raw);
  return _componentsCache;
}

/**
 * Extract palette tokens from the design-tokens.json theme section.
 * Returns an object with color, structural, and dark-mode tokens.
 */
function extractPaletteTokens(tokens, paletteName) {
  const theme = tokens.theme || {};
  const paletteData = theme[paletteName];
  if (!paletteData) return null;

  const result = {
    name: paletteName,
    description: paletteData.$description || PALETTE_DESCRIPTIONS[paletteName] || "",
    light: {},
    dark: {},
    structural: {},
  };

  for (const [key, val] of Object.entries(paletteData)) {
    if (key === "$description") continue;
    if (key === "$structural") {
      result.structural = { ...val };
      continue;
    }
    if (typeof val !== "object" || !val.$value) continue;

    // Sort into light vs dark based on key suffix
    if (key.endsWith("_dark")) {
      const lightKey = key.replace(/_dark$/, "");
      result.dark[lightKey] = val.$value;
    } else {
      result.light[key] = val.$value;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: "search_design_system",
    description:
      "Search the Universal Design System using BM25 ranking across 17 CSV databases (1500+ rows). " +
      "Returns domain detection (sector + product type), recommended palette, matched components, " +
      "patterns, typography, styles, anti-patterns, and applied reasoning rules. " +
      "Use this for queries like 'fintech dashboard', 'saas landing page', 'healthcare portal'.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Design system search query, e.g. 'fintech dashboard', 'kids education app', 'ecommerce mobile store'",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_palette",
    description:
      "Get the full token set for a specific UDS palette. Returns light-mode colors, dark-mode colors, " +
      "and structural tokens (border-radius, shadow, font-display). " +
      "Valid palettes: minimal-saas, ai-futuristic, gradient-startup, corporate, apple-minimal, " +
      "illustration, dashboard, bold-lifestyle, minimal-corporate.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Palette name. One of: " + VALID_PALETTES.join(", "),
          enum: VALID_PALETTES,
        },
      },
      required: ["name"],
    },
  },
  {
    name: "get_component",
    description:
      "Get detailed information about a UDS component by its slug. Returns variants, sizes, states, " +
      "props, accessibility requirements, and usage guidance. " +
      "Example slugs: button, hero, modal, data-table, command-palette, side-nav.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description:
            "Component slug, e.g. 'button', 'hero', 'modal', 'data-table', 'input', 'tabs'",
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "generate_tokens",
    description:
      "Generate a complete design system specification for a given domain query. " +
      "Runs the full reasoning pipeline: domain detection, BM25 search, rule application, " +
      "and token resolution. Returns palette tokens, recommended components, patterns, " +
      "typography, anti-patterns, and design rules. Supports JSON or Tailwind CSS output.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Domain query for design system generation, e.g. 'saas landing page', 'healthcare portal'",
        },
        format: {
          type: "string",
          description: "Output format: 'json' for structured data, 'tailwind' for Tailwind CSS config preset",
          enum: ["json", "tailwind"],
          default: "json",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_palettes",
    description:
      "List all 9 UDS palettes with their descriptions and key attributes. " +
      "Use this to understand available palettes before selecting one.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "list_components",
    description:
      "List all 31+ UDS components with their names, slugs, and categories. " +
      "Use this to discover available components before requesting details with get_component.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

async function handleSearchDesignSystem(args) {
  const query = args.query;
  if (!query || typeof query !== "string") {
    return { isError: true, content: [{ type: "text", text: "Parameter 'query' is required and must be a string." }] };
  }

  const stdout = await runPython(SEARCH_SCRIPT, [query, "--json"]);
  const data = JSON.parse(stdout);
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

async function handleGetPalette(args) {
  const name = args.name;
  if (!name || typeof name !== "string") {
    return { isError: true, content: [{ type: "text", text: "Parameter 'name' is required and must be a string." }] };
  }
  if (!VALID_PALETTES.includes(name)) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Invalid palette '${name}'. Valid palettes: ${VALID_PALETTES.join(", ")}`,
        },
      ],
    };
  }

  const tokens = await loadTokens();
  const palette = extractPaletteTokens(tokens, name);

  if (!palette) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Palette '${name}' not found in design-tokens.json. This may indicate a corrupted tokens file.`,
        },
      ],
    };
  }

  return {
    content: [{ type: "text", text: JSON.stringify(palette, null, 2) }],
  };
}

async function handleGetComponent(args) {
  const slug = args.slug;
  if (!slug || typeof slug !== "string") {
    return { isError: true, content: [{ type: "text", text: "Parameter 'slug' is required and must be a string." }] };
  }

  const components = await loadComponents();
  const match = components.find(
    (c) => c.slug === slug || c.css_class === slug || c.name.toLowerCase() === slug.toLowerCase(),
  );

  if (!match) {
    const available = components.map((c) => c.slug).filter(Boolean).join(", ");
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Component '${slug}' not found. Available slugs: ${available}`,
        },
      ],
    };
  }

  const result = {
    id: match.id,
    name: match.name,
    slug: match.slug,
    category: match.category,
    css_class: match.css_class ? `uds-${match.css_class}` : undefined,
    variants: match.variants ? match.variants.split(";").map((v) => v.trim()) : [],
    sizes: match.sizes ? match.sizes.split(";").map((s) => s.trim()) : [],
    states: match.states ? match.states.split(";").map((s) => s.trim()) : [],
    props: match.props ? match.props.split(";").map((p) => p.trim()) : [],
    accessibility: match.accessibility ? match.accessibility.split(";").map((a) => a.trim()) : [],
    use_when: match.use_when || "",
    dont_use_when: match.dont_use_when || "",
  };

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

async function handleGenerateTokens(args) {
  const query = args.query;
  if (!query || typeof query !== "string") {
    return { isError: true, content: [{ type: "text", text: "Parameter 'query' is required and must be a string." }] };
  }

  const format = args.format || "json";
  if (!["json", "tailwind"].includes(format)) {
    return {
      isError: true,
      content: [{ type: "text", text: "Parameter 'format' must be 'json' or 'tailwind'." }],
    };
  }

  const stdout = await runPython(GENERATE_SCRIPT, [query, "--format", format]);

  // For JSON output, parse and re-serialize to validate it
  if (format === "json") {
    const data = JSON.parse(stdout);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }

  // Tailwind output is plain text (JS config)
  return {
    content: [{ type: "text", text: stdout }],
  };
}

async function handleListPalettes() {
  const tokens = await loadTokens();
  const palettes = VALID_PALETTES.map((name) => {
    const paletteData = (tokens.theme || {})[name] || {};
    const structural = paletteData.$structural || {};
    return {
      name,
      description: PALETTE_DESCRIPTIONS[name] || paletteData.$description || "",
      shape: structural.shape || null,
      radius: structural["radius-md"] || null,
      font_display: structural["font-display"] || null,
    };
  });

  return {
    content: [{ type: "text", text: JSON.stringify(palettes, null, 2) }],
  };
}

async function handleListComponents() {
  const components = await loadComponents();
  const list = components.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    category: c.category,
    css_class: c.css_class ? `uds-${c.css_class}` : undefined,
  }));

  return {
    content: [{ type: "text", text: JSON.stringify(list, null, 2) }],
  };
}

// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------

const server = new Server(
  {
    name: "universal-design-system",
    version: "0.1.1",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_design_system":
        return await handleSearchDesignSystem(args);
      case "get_palette":
        return await handleGetPalette(args);
      case "get_component":
        return await handleGetComponent(args);
      case "generate_tokens":
        return await handleGenerateTokens(args);
      case "list_palettes":
        return await handleListPalettes();
      case "list_components":
        return await handleListComponents();
      default:
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}. Available tools: ${TOOLS.map((t) => t.name).join(", ")}`,
            },
          ],
        };
    }
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
    };
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal: MCP server failed to start:", error.message);
  process.exit(1);
});
