/**
 * TypeScript types for design-tokens.json (W3C DTCG format).
 * Enables typed consumption: import tokens from '@mkatogui/universal-design-system'
 */

/** DTCG token leaf: has $value and optional $type, $description, $extensions */
export interface DTCGToken {
  $value?: string | number | object;
  $type?: string;
  $description?: string;
  $extensions?: Record<string, unknown>;
  $name?: string;
}

/** Recursive DTCG structure: groups and leaves */
export type DTCGTokenGroup = {
  [key: string]: string | number | DTCGToken | DTCGTokenGroup | DTCGTokenGroup[] | undefined;
  $value?: string | number | object;
  $type?: string;
  $description?: string;
  $name?: string;
  $extensions?: Record<string, unknown>;
  $version?: string;
  $schema?: string;
};

/** Root design tokens (design-tokens.json). Top-level keys: color, typography, spacing, etc. */
export type DesignTokens = DTCGTokenGroup;

declare module '@mkatogui/universal-design-system' {
  const tokens: DesignTokens;
  export default tokens;
  export type { DesignTokens, DTCGTokenGroup, DTCGToken };
}

declare module '@mkatogui/universal-design-system/tokens' {
  const tokens: DesignTokens;
  export default tokens;
  export type { DesignTokens, DTCGTokenGroup, DTCGToken };
}
