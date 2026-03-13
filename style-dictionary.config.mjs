/**
 * Style Dictionary v4 configuration — single source of truth.
 *
 * This is the only SD config file for the project. The previous
 * style-dictionary.config.json has been removed.
 *
 * Wraps the CSS custom-properties output in:
 *   @layer uds.tokens { :root { ... } }
 *
 * Non-CSS platforms (JS, JSON, iOS, Android) are unchanged.
 *
 * An optional "css-namespaced" platform produces --uds-* prefixed
 * tokens as an additional build artifact (build/css-namespaced/).
 */

const LAYER_ORDER = '@layer uds.tokens, uds.components, uds.utilities;';

export default {
  source: ['tokens/design-tokens.json'],

  hooks: {
    formats: {
      /**
       * Custom format: wraps the built-in css/variables output inside
       * @layer uds.tokens { ... } so consumers get explicit cascade control.
       */
      'css/variables-layered': ({ dictionary, options }) => {
        const selector = options.selector || ':root';
        const lines = [];

        lines.push('/**');
        lines.push(' * Do not edit directly, this file was auto-generated.');
        lines.push(' */');
        lines.push('');
        lines.push(LAYER_ORDER);
        lines.push('');
        lines.push('@layer uds.tokens {');
        lines.push(`  ${selector} {`);

        dictionary.allTokens.forEach((token) => {
          const name = token.name;
          let value = token.value ?? token.$value;
          const type = token.$type ?? token.type;

          // Skip object-type tokens (keyframes, starting-style) — not valid CSS variable values
          if (type === 'object' || (typeof value === 'object' && value !== null)) {
            return;
          }

          // Resolve references when outputReferences is enabled.
          // Look up the referenced token by path so that token.name is used,
          // which already has the platform prefix applied (e.g. --uds-color-*
          // in the css-namespaced build).
          if (options.outputReferences && token.original) {
            const orig = token.original.value ?? token.original.$value;
            if (typeof orig === 'string' && orig.startsWith('{') && orig.endsWith('}')) {
              const refPath = orig.slice(1, -1).split('.');
              const refToken = dictionary.allTokens.find(
                (t) => t.path && t.path.join('.') === refPath.join('.'),
              );
              if (refToken) {
                value = `var(--${refToken.name})`;
              } else {
                // Fallback: reconstruct the name from the path (no prefix)
                value = `var(--${refPath.join('-')})`;
              }
            }
          }

          const comment = token.comment || token.$description;
          if (comment) {
            lines.push(`    --${name}: ${value}; /** ${comment} */`);
          } else {
            lines.push(`    --${name}: ${value};`);
          }
        });

        lines.push('  }');
        lines.push('}');
        lines.push('');
        return lines.join('\n');
      },
    },
  },

  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables-layered',
          options: {
            outputReferences: true,
            selector: ':root',
          },
        },
      ],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
          filter: (token) => {
            const type = token.$type ?? token.type;
            return type !== 'object';
          },
        },
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
          filter: (token) => {
            const type = token.$type ?? token.type;
            return type !== 'object';
          },
        },
      ],
    },
    json: {
      transformGroup: 'web',
      buildPath: 'build/json/',
      files: [
        {
          destination: 'tokens.json',
          format: 'json/flat',
        },
      ],
    },
    'ios-swift': {
      transformGroup: 'ios-swift',
      buildPath: 'build/ios/',
      files: [
        {
          destination: 'DesignTokens.swift',
          format: 'ios-swift/class.swift',
          className: 'DesignTokens',
        },
      ],
    },
    android: {
      transformGroup: 'android',
      buildPath: 'build/android/',
      files: [
        {
          destination: 'design_tokens.xml',
          format: 'android/resources',
        },
      ],
    },
    'css-namespaced': {
      transformGroup: 'css',
      buildPath: 'build/css-namespaced/',
      prefix: 'uds',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables-layered',
          options: {
            outputReferences: true,
            selector: ':root',
          },
        },
      ],
    },
    brand: {
      transformGroup: 'css',
      buildPath: 'build/brand/',
      source: ['tokens/brands/*.json'],
      files: [
        {
          destination: 'brand-tokens.css',
          format: 'css/variables-layered',
          options: {
            outputReferences: true,
            selector: ':root',
          },
        },
        {
          destination: 'brand-tokens.json',
          format: 'json/flat',
        },
      ],
    },
  },
};
