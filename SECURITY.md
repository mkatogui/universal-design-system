# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.2.x   | Yes                |
| < 0.2   | No                 |

## Reporting a Vulnerability

If you discover a security vulnerability in Universal Design System, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

1. **GitHub Security Advisories (preferred):** Use [GitHub Security Advisories](https://github.com/mkatogui/universal-design-system/security/advisories/new) to report privately.
2. **Email:** Send details to the repository owner via GitHub profile contact.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Affected version(s)
- Potential impact

### Response Timeline

- **48 hours:** Acknowledgment of your report
- **7 days:** Initial assessment and severity classification
- **30 days:** Fix developed and released (for confirmed vulnerabilities)

## Scope

The following components are in scope for security reports:

- **CLI** (`cli/`): Command execution, file system access, user input handling
- **MCP Server** (`src/mcp/`): Protocol handling, tool execution
- **Design tokens** (`tokens/`): Token values, reference resolution
- **Python scripts** (`src/scripts/`): Search engine, spec generator, data processing

## Out of Scope

- **Demo HTML pages** (`docs/`): Static documentation with no server-side processing
- **CSV data files** (`src/data/`): Static data with no executable content
- **Visual design issues**: Color choices, typography, spacing (use regular issues)

## Acknowledgments

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. Contributors who report valid security issues will be acknowledged in the release notes (unless they prefer to remain anonymous).
