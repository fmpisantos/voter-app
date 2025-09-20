# AGENTS.md - Voter App Development Guide

## Development Commands
- **Serve**: `npm run serve` (starts dev server on port 3000)
- **No build/lint/test commands** - this is a vanilla JS project

## Code Style Guidelines

### JavaScript
- Use modern ES6+ features (arrow functions, template literals, destructuring)
- camelCase for variables, functions, and methods
- PascalCase for constructor functions
- 4 spaces indentation (following script.js conventions)
- Single quotes for strings
- Semicolons required

### HTML
- Semantic HTML5 elements
- Lowercase tag names and attributes
- Double quotes for attributes
- Proper indentation with 4 spaces

### CSS
- CSS Grid and Flexbox for layouts
- CSS custom properties for theming
- BEM-like naming convention (.idea-card, .score-badge)
- 4 spaces indentation
- Group related properties together

### File Organization
- `index.html`: Main HTML structure
- `styles.css`: All CSS styles
- `script.js`: Application logic and DOM manipulation
- Keep files focused and avoid mixing concerns

### Best Practices
- Use `const` for immutable variables, `let` for mutable
- Add event listeners properly with `addEventListener`
- Use `querySelector` and `querySelectorAll` for DOM selection
- Validate scoring constraints before assignment
- Ensure all ideas are scored before submission