#!/usr/bin/env node
/**
 * @mkatogui/uds-tokens build script
 *
 * Reads ../../tokens/design-tokens.json (W3C DTCG format),
 * resolves all token references, and generates:
 *   - dist/tokens.css   (CSS custom properties with palette classes)
 *   - dist/tokens.json  (flat JSON with resolved values)
 *   - dist/index.js     (CommonJS export)
 *   - dist/index.mjs    (ESM export)
 *   - dist/index.d.ts   (TypeScript declarations)
 */

const fs = require('fs');
const path = require('path');

const SOURCE = path.resolve(__dirname, '../../tokens/design-tokens.json');
const DIST = path.resolve(__dirname, 'dist');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Read and parse the source token file.
 */
function loadSource() {
  const raw = fs.readFileSync(SOURCE, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Flatten a nested DTCG token tree into a Map of dot-path -> raw $value.
 * Skips metadata keys ($schema, $version, $description, $extensions, $type,
 * $structural, palette-overrides, choreography).
 */
function flattenTokens(obj, prefix = '', out = new Map()) {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;

    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // If this node has a $value, record it as a token
      if ('$value' in val) {
        out.set(currentPath, val.$value);
      }
      // Continue recursing for nested tokens (groups can contain both
      // a $value AND child tokens)
      flattenTokens(val, currentPath, out);
    }
  }
  return out;
}

/**
 * Resolve a single reference string like "{color.primitive.blue.700}" to
 * its actual value, following chains if needed.
 */
function resolveRef(ref, flatMap, seen = new Set()) {
  if (typeof ref !== 'string') return ref;

  const match = ref.match(/^\{(.+)\}$/);
  if (!match) return ref;

  const refPath = match[1];
  if (seen.has(refPath)) {
    console.warn(`Circular reference detected: ${refPath}`);
    return ref;
  }
  seen.add(refPath);

  const resolved = flatMap.get(refPath);
  if (resolved === undefined) {
    // Try common fallback paths (e.g. "color.primitive.neutral.white" -> "color.primitive.neutral.0")
    console.warn(`Unresolved reference: ${refPath}`);
    return ref;
  }

  // The resolved value might itself be a reference
  return resolveRef(resolved, flatMap, seen);
}

/**
 * Resolve all references in the flat map.
 */
function resolveAll(flatMap) {
  const resolved = new Map();
  for (const [key, val] of flatMap) {
    if (typeof val === 'string' && val.startsWith('{')) {
      resolved.set(key, resolveRef(val, flatMap));
    } else {
      resolved.set(key, val);
    }
  }
  return resolved;
}

// ── CSS Variable Name Conversion ─────────────────────────────────────────────

/**
 * Convert a dot-path token key to a CSS custom property name.
 * e.g. "color.primitive.blue.50" -> "--color-primitive-blue-50"
 *      "spacing.4"               -> "--spacing-4"
 *      "typography.fontSize.body-md" -> "--font-size-body-md"
 */
function toCssVarName(dotPath) {
  // Apply semantic renaming for better CSS ergonomics
  let p = dotPath
    .replace(/^typography\.fontFamily\./, 'font-family-')
    .replace(/^typography\.fontWeight\./, 'font-weight-')
    .replace(/^typography\.fontSize\./, 'font-size-')
    .replace(/^typography\.lineHeight\./, 'line-height-')
    .replace(/^font-weight\./, 'font-weight-')
    .replace(/^line-height\./, 'line-height-')
    .replace(/\./g, '-');

  return `--${p}`;
}

/**
 * Convert a token value to a valid CSS value string.
 */
function toCssValue(val) {
  if (Array.isArray(val)) {
    // Font family arrays -> comma-separated quoted list
    if (val.every(v => typeof v === 'string')) {
      return val.map(f => (f.includes(' ') ? `"${f}"` : f)).join(', ');
    }
    // Numeric arrays (easing) -> cubic-bezier()
    if (val.every(v => typeof v === 'number')) {
      return `cubic-bezier(${val.join(', ')})`;
    }
    // Shadow arrays -> comma-separated shadow layers
    if (val.every(v => typeof v === 'object' && v !== null && 'offsetX' in v)) {
      return val
        .map(s => `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color}`)
        .join(', ');
    }
    return String(val);
  }
  if (typeof val === 'object' && val !== null) {
    // Single shadow object
    if ('offsetX' in val) {
      return `${val.offsetX} ${val.offsetY} ${val.blur} ${val.spread} ${val.color}`;
    }
    return JSON.stringify(val);
  }
  return String(val);
}

// ── Token Categories ─────────────────────────────────────────────────────────

/** Keys that should be excluded from the root CSS (they go in palette selectors) */
const PALETTE_SECTION_PREFIXES = ['theme.', 'color.palette-overrides.', 'shadow.palette-overrides.', 'radius.palette-overrides.', 'typography.fontFamily.palette-overrides.'];

/** Keys that are structural metadata, not real tokens */
const SKIP_PREFIXES = ['motion.choreography.'];

/**
 * Check whether a given dotPath should be skipped entirely.
 */
function shouldSkip(dotPath) {
  // Skip choreography (complex structured data, not simple tokens)
  if (SKIP_PREFIXES.some(p => dotPath.startsWith(p))) return true;
  // Skip $structural entries that leak through
  if (dotPath.includes('.$structural.') || dotPath.includes('$structural')) return true;
  return false;
}

/**
 * Check whether this is a palette-override token (goes in [data-theme] selector).
 */
function isPaletteToken(dotPath) {
  return PALETTE_SECTION_PREFIXES.some(p => dotPath.startsWith(p));
}

// ── Palette Extraction ───────────────────────────────────────────────────────

/**
 * The 9 palettes defined in the system.
 */
const PALETTES = [
  'minimal-saas',
  'ai-futuristic',
  'gradient-startup',
  'corporate',
  'apple-minimal',
  'illustration',
  'dashboard',
  'bold-lifestyle',
  'minimal-corporate',
];

/**
 * Extract palette-specific CSS variable overrides from the resolved flat map.
 * Returns a Map<paletteName, Map<cssVarName, cssValue>>.
 */
function extractPaletteOverrides(resolvedMap) {
  const palettes = new Map();

  for (const name of PALETTES) {
    palettes.set(name, new Map());
  }

  for (const [dotPath, val] of resolvedMap) {
    if (shouldSkip(dotPath)) continue;

    // ── theme.<palette>.light.* or theme.<palette>.* (flat format) ──
    const themeMatch = dotPath.match(/^theme\.([^.]+)\.(?:light\.)?(.+)$/);
    if (themeMatch) {
      const [, paletteName, tokenTail] = themeMatch;
      // Skip dark-mode tokens (they contain "_dark" or "dark." prefix)
      if (tokenTail.includes('_dark') || tokenTail.startsWith('dark.')) continue;
      // Skip $structural
      if (tokenTail.startsWith('$')) continue;

      const paletteMap = palettes.get(paletteName);
      if (!paletteMap) continue;

      // Normalize token names: bg_primary -> --color-bg-primary, brand_primary -> --color-brand-primary
      const normalized = tokenTail.replace(/_/g, '-');
      const cssVar = `--color-${normalized}`;
      paletteMap.set(cssVar, toCssValue(val));
      continue;
    }

    // ── radius.palette-overrides.<palette>.* ──
    const radiusMatch = dotPath.match(/^radius\.palette-overrides\.([^.]+)\.(.+)$/);
    if (radiusMatch) {
      const [, paletteName, size] = radiusMatch;
      const paletteMap = palettes.get(paletteName);
      if (!paletteMap) continue;
      paletteMap.set(`--radius-${size}`, toCssValue(val));
      continue;
    }

    // ── shadow.palette-overrides.<palette>.* ──
    const shadowMatch = dotPath.match(/^shadow\.palette-overrides\.([^.]+)\.(.+)$/);
    if (shadowMatch) {
      const [, paletteName, size] = shadowMatch;
      const paletteMap = palettes.get(paletteName);
      if (!paletteMap) continue;
      paletteMap.set(`--shadow-${size}`, toCssValue(val));
      continue;
    }

    // ── typography.fontFamily.palette-overrides.<palette> ──
    const fontMatch = dotPath.match(/^typography\.fontFamily\.palette-overrides\.([^.]+)$/);
    if (fontMatch) {
      const paletteName = fontMatch[1];
      const paletteMap = palettes.get(paletteName);
      if (!paletteMap) continue;
      paletteMap.set('--font-family-display', toCssValue(val));
      continue;
    }
  }

  // ── Dark mode overrides from theme.<palette>.dark.* ──
  const darkPalettes = new Map();
  for (const name of PALETTES) {
    darkPalettes.set(name, new Map());
  }

  for (const [dotPath, val] of resolvedMap) {
    if (shouldSkip(dotPath)) continue;

    // theme.<palette>.dark.* format
    const darkMatch = dotPath.match(/^theme\.([^.]+)\.dark\.(.+)$/);
    if (darkMatch) {
      const [, paletteName, tokenTail] = darkMatch;
      if (tokenTail.startsWith('$')) continue;
      const darkMap = darkPalettes.get(paletteName);
      if (!darkMap) continue;
      const normalized = tokenTail.replace(/_/g, '-');
      const cssVar = `--color-${normalized}`;
      darkMap.set(cssVar, toCssValue(val));
      continue;
    }

    // theme.<palette>.*_dark flat format
    const darkFlatMatch = dotPath.match(/^theme\.([^.]+)\.(.+_dark)$/);
    if (darkFlatMatch) {
      const [, paletteName, tokenTail] = darkFlatMatch;
      if (tokenTail.startsWith('$')) continue;
      const darkMap = darkPalettes.get(paletteName);
      if (!darkMap) continue;
      // "bg_primary_dark" -> "--color-bg-primary"
      const normalized = tokenTail.replace(/_dark$/, '').replace(/_/g, '-');
      const cssVar = `--color-${normalized}`;
      darkMap.set(cssVar, toCssValue(val));
      continue;
    }
  }

  return { light: palettes, dark: darkPalettes };
}

// ── CSS Generation ───────────────────────────────────────────────────────────

function generateCSS(resolvedMap) {
  const lines = [];
  lines.push('/**');
  lines.push(' * Universal Design System -- Design Tokens');
  lines.push(' * Auto-generated by @mkatogui/uds-tokens build script');
  lines.push(' * 496 W3C DTCG tokens across 9 palettes');
  lines.push(' */');
  lines.push('');

  // ── Layer order declaration ──
  lines.push('@layer uds.tokens, uds.components, uds.utilities;');
  lines.push('');

  // ── Open @layer uds.tokens ──
  lines.push('@layer uds.tokens {');

  // ── :root (foundation + semantic tokens) ──
  lines.push('  :root {');

  // Group tokens by category for readability
  const categories = new Map();

  for (const [dotPath, val] of resolvedMap) {
    if (shouldSkip(dotPath)) continue;
    if (isPaletteToken(dotPath)) continue;

    const cssVar = toCssVarName(dotPath);
    const cssVal = toCssValue(val);

    // Determine category from first segment
    const category = dotPath.split('.')[0];
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category).push({ cssVar, cssVal, dotPath });
  }

  // Define output order
  const categoryOrder = [
    'color',
    'typography',
    'spacing',
    'size',
    'radius',
    'shadow',
    'motion',
    'opacity',
    'breakpoint',
    'zIndex',
    'font-weight',
    'line-height',
    'border',
    'icon',
    'layout',
    'component',
  ];

  const categoryLabels = {
    color: 'Color Tokens',
    typography: 'Typography Tokens',
    spacing: 'Spacing Tokens (4px grid)',
    size: 'Size Tokens',
    radius: 'Border Radius Tokens',
    shadow: 'Shadow / Elevation Tokens',
    motion: 'Motion / Animation Tokens',
    opacity: 'Opacity Tokens',
    breakpoint: 'Breakpoint Tokens',
    zIndex: 'Z-Index Tokens',
    'font-weight': 'Font Weight Tokens',
    'line-height': 'Line Height Tokens',
    border: 'Border Width Tokens',
    icon: 'Icon Size Tokens',
    layout: 'Layout Tokens',
    component: 'Component Tokens',
  };

  for (const cat of categoryOrder) {
    const items = categories.get(cat);
    if (!items || items.length === 0) continue;

    lines.push('');
    lines.push(`    /* -- ${categoryLabels[cat] || cat} -- */`);

    for (const { cssVar, cssVal } of items) {
      lines.push(`    ${cssVar}: ${cssVal};`);
    }
  }

  lines.push('  }');
  lines.push('');

  // ── Palette overrides ──
  const { light: lightPalettes, dark: darkPalettes } = extractPaletteOverrides(resolvedMap);

  for (const name of PALETTES) {
    const overrides = lightPalettes.get(name);
    if (!overrides || overrides.size === 0) continue;

    lines.push(`  /* Palette: ${name} (light) */`);
    lines.push(`  [data-theme="${name}"] {`);
    for (const [cssVar, cssVal] of overrides) {
      lines.push(`    ${cssVar}: ${cssVal};`);
    }
    lines.push('  }');
    lines.push('');

    // Dark mode
    const darkOverrides = darkPalettes.get(name);
    if (darkOverrides && darkOverrides.size > 0) {
      lines.push(`  /* Palette: ${name} (dark) */`);
      lines.push(`  [data-theme="${name}"].dark,`);
      lines.push(`  [data-theme="${name}"] .dark {`);
      for (const [cssVar, cssVal] of darkOverrides) {
        lines.push(`    ${cssVar}: ${cssVal};`);
      }
      lines.push('  }');
      lines.push('');
    }
  }

  // ── Close @layer uds.tokens ──
  lines.push('}');

  return lines.join('\n');
}

// ── Flat JSON Generation ─────────────────────────────────────────────────────

function generateFlatJSON(resolvedMap) {
  const obj = {};
  for (const [dotPath, val] of resolvedMap) {
    if (shouldSkip(dotPath)) continue;

    // Set via dot-path into nested object
    const parts = dotPath.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = toCssValue(val);
  }
  return JSON.stringify(obj, null, 2);
}

// ── JS/TS Token Object Generation ────────────────────────────────────────────

/**
 * Build a nested token object where leaf values are CSS var() references.
 * This is what JS/TS consumers import.
 */
function buildVarRefObject(resolvedMap) {
  const obj = {};

  for (const [dotPath, val] of resolvedMap) {
    if (shouldSkip(dotPath)) continue;
    if (isPaletteToken(dotPath)) continue;

    const cssVar = toCssVarName(dotPath);

    // Build nested object keyed by semantic segments
    // e.g. "color.semantic.brand.primary" -> { color: { semantic: { brand: { primary: "var(--color-semantic-brand-primary)" } } } }
    const parts = dotPath.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    const leafKey = parts[parts.length - 1];

    // Determine fallback value for var()
    const cssVal = toCssValue(val);
    current[leafKey] = `var(${cssVar}, ${cssVal})`;
  }

  return obj;
}

/**
 * Generate TypeScript type declarations from the var-ref object.
 */
function generateTypeDeclarations(varRefObj) {
  const lines = [];
  lines.push('/**');
  lines.push(' * Universal Design System -- TypeScript Token Types');
  lines.push(' * Auto-generated by @mkatogui/uds-tokens build script');
  lines.push(' */');
  lines.push('');

  function typeFromObj(obj, indent = '') {
    const entries = Object.entries(obj);
    if (entries.length === 0) return 'Record<string, never>';

    const inner = entries.map(([key, val]) => {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        return `${indent}  readonly ${safeKey}: ${typeFromObj(val, indent + '  ')}`;
      }
      return `${indent}  readonly ${safeKey}: string`;
    });

    return `{\n${inner.join(';\n')};\n${indent}}`;
  }

  lines.push(`export declare const tokens: ${typeFromObj(varRefObj)};`);
  lines.push('');
  lines.push('export type Tokens = typeof tokens;');
  lines.push('');

  return lines.join('\n');
}

/**
 * Serialize the var-ref object as a JS literal string, preserving readability.
 */
function objToJSLiteral(obj, indent = '  ') {
  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';

  const lines = entries.map(([key, val]) => {
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      return `${indent}${safeKey}: ${objToJSLiteral(val, indent + '  ')}`;
    }
    // String value
    const escaped = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `${indent}${safeKey}: '${escaped}'`;
  });

  return `{\n${lines.join(',\n')},\n${indent.slice(2)}}`;
}

// ── Main Build ───────────────────────────────────────────────────────────────

function main() {
  console.log('Building @mkatogui/uds-tokens...');

  // Ensure dist exists
  if (!fs.existsSync(DIST)) {
    fs.mkdirSync(DIST, { recursive: true });
  }

  // Load and flatten
  const source = loadSource();
  const flatMap = flattenTokens(source);
  console.log(`  Flattened ${flatMap.size} token paths`);

  // Resolve references
  const resolved = resolveAll(flatMap);

  // Count actual output tokens (excluding skipped/palette tokens for root count)
  let rootCount = 0;
  let paletteCount = 0;
  for (const dotPath of resolved.keys()) {
    if (shouldSkip(dotPath)) continue;
    if (isPaletteToken(dotPath)) {
      paletteCount++;
    } else {
      rootCount++;
    }
  }
  console.log(`  Root tokens: ${rootCount}, Palette override tokens: ${paletteCount}`);

  // Generate outputs
  const css = generateCSS(resolved);
  const json = generateFlatJSON(resolved);
  const varRefObj = buildVarRefObject(resolved);
  const dts = generateTypeDeclarations(varRefObj);

  const jsLiteral = objToJSLiteral(varRefObj);

  const cjs = [
    '/**',
    ' * Universal Design System -- Design Tokens (CommonJS)',
    ' * Auto-generated by @mkatogui/uds-tokens build script',
    ' */',
    '"use strict";',
    '',
    `const tokens = ${jsLiteral};`,
    '',
    'module.exports = { tokens };',
    '',
  ].join('\n');

  const esm = [
    '/**',
    ' * Universal Design System -- Design Tokens (ESM)',
    ' * Auto-generated by @mkatogui/uds-tokens build script',
    ' */',
    '',
    `export const tokens = ${jsLiteral};`,
    '',
  ].join('\n');

  // Write outputs
  fs.writeFileSync(path.join(DIST, 'tokens.css'), css, 'utf-8');
  fs.writeFileSync(path.join(DIST, 'tokens.json'), json, 'utf-8');
  fs.writeFileSync(path.join(DIST, 'index.js'), cjs, 'utf-8');
  fs.writeFileSync(path.join(DIST, 'index.mjs'), esm, 'utf-8');
  fs.writeFileSync(path.join(DIST, 'index.d.ts'), dts, 'utf-8');

  console.log('  Generated:');
  console.log('    dist/tokens.css');
  console.log('    dist/tokens.json');
  console.log('    dist/index.js   (CommonJS)');
  console.log('    dist/index.mjs  (ESM)');
  console.log('    dist/index.d.ts (TypeScript)');
  console.log('Done.');
}

main();
