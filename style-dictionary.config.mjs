/**
 * Style Dictionary v4 configuration with @layer CSS cascade control.
 *
 * Generates the same platform outputs as the previous JSON config,
 * but wraps the CSS custom-properties file in:
 *
 *   @layer uds.tokens { :root { ... } }
 *
 * Non-CSS platforms (JS, JSON, iOS, Android) are unchanged.
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
      'css/variables-layered': function ({ dictionary, options }) {
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

          // Resolve references when outputReferences is enabled
          if (options.outputReferences && token.original) {
            const orig = token.original.value ?? token.original.$value;
            if (typeof orig === 'string' && orig.startsWith('{') && orig.endsWith('}')) {
              const refName = orig.slice(1, -1).replace(/\./g, '-');
              value = `var(--${refName})`;
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
        },
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
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
  },
};
