# Component Lifecycle

Every component in the Universal Design System follows a defined lifecycle from proposal to deprecation.

## Stages

### 1. Proposal
- Component idea submitted via RFC
- Community discussion and feedback
- Acceptance criteria defined

### 2. Alpha
- Initial implementation
- API may change without notice
- Not recommended for production use
- Limited accessibility testing

### 3. Beta
- API stabilizing, breaking changes announced in advance
- Accessibility audit completed
- Cross-browser testing in progress
- Documentation draft available

### 4. Stable
- API frozen (semantic versioning for changes)
- Full WCAG 2.2 AA compliance verified
- Cross-browser and cross-palette tested (9 palettes × 2 modes)
- Complete documentation and examples
- Performance benchmarked

### 5. Deprecated
- Migration guide provided
- Maintained for 2 major versions
- Console warnings in development mode
- Removed in next major version after deprecation period

## Promotion Criteria

| From → To | Requirements |
|-----------|-------------|
| Proposal → Alpha | RFC approved, initial implementation |
| Alpha → Beta | API review complete, basic a11y audit |
| Beta → Stable | Full a11y audit, docs complete, 2+ palette tests |
| Stable → Deprecated | Replacement available, migration guide written |
