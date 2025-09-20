# AGENTS.md - Voter App Development Guide

## Development Commands

### Frontend (JavaScript)
- **Serve**: `npm run serve` (starts dev server on port 3000)
- **No build/lint/test commands** - vanilla JS project

### Backend (Python/Flask)
- **Run API**: `cd API && python run.py` (starts Flask on port 8080)
- **Run API (alt)**: `cd API && python main.py`
- **Install deps**: `cd API && pip install -r requirements.txt`
- **No build/lint/test commands** - pure Python project

### Running Tests
- No automated tests configured
- Manual testing via `frontend/test.html` for UI components

## Code Style Guidelines

### Python (Backend)
- **Imports**: Standard library first, then third-party, then local imports (blank lines between groups)
- **Naming**: snake_case for variables/functions, PascalCase for classes
- **Types**: Use type hints, Optional for nullable types
- **Error handling**: Use try/except with specific exceptions
- **Docstrings**: Use triple quotes for function/class documentation
- **Constants**: UPPER_CASE for module-level constants
- **Indentation**: 4 spaces
- **Line length**: Keep under 100 characters when possible

### JavaScript (Frontend)
- **Features**: Modern ES6+ (arrow functions, template literals, destructuring, async/await)
- **Naming**: camelCase for variables/functions/methods, PascalCase for constructor functions
- **Variables**: `const` for immutable, `let` for mutable, avoid `var`
- **Strings**: Single quotes preferred
- **Semicolons**: Required
- **Indentation**: 4 spaces
- **DOM**: Use `querySelector`/`querySelectorAll`, `addEventListener`
- **Async**: Use async/await over Promises when possible

### HTML
- **Structure**: Semantic HTML5 elements
- **Attributes**: Lowercase names, double quotes for values
- **Indentation**: 4 spaces
- **Accessibility**: Include proper ARIA labels where needed

### CSS
- **Layout**: CSS Grid and Flexbox preferred
- **Naming**: BEM-like convention (.idea-card, .score-badge)
- **Variables**: CSS custom properties for theming
- **Indentation**: 4 spaces
- **Organization**: Group related properties, logical order

### File Organization
- **Frontend**: `index.html`, `styles.css`, `script.js` in root
- **Backend**: `main.py` (routes), `models.py` (data structures), `config.py` (settings)
- **Data**: JSON files for round data (`round0.json`, `round1.json`, etc.)
- **Config**: `.env` for environment variables, `.env.example` as template

### Best Practices
- **Validation**: Validate all inputs, especially scoring constraints
- **Error handling**: Graceful degradation, user-friendly error messages
- **Security**: Input sanitization, CORS configuration
- **Performance**: Minimize DOM queries, efficient event handling
- **State**: Clear state management, avoid global variables when possible
- **API**: RESTful endpoints, consistent JSON responses
- **Testing**: Manual testing for critical paths, consider adding unit tests for models