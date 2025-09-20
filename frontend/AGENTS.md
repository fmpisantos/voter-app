# AGENTS.md - Voter App Development Guide

## Development Commands

### Frontend (JavaScript)
- **Serve**: `npm run serve` (starts dev server on port 3000)
- **No build/lint/test commands** - vanilla JS project

### Backend (Python/Flask)
- **Run API**: `cd API && python run.py` (starts Flask on port 8080)
- **Run API (alt)**: `cd API && python main.py`
- **Install deps**: `cd API && pip install -r requirements.txt`
- **End Round**: `curl -X POST http://localhost:8080/end-round` (manually advance to next round)
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

### API Endpoints
- **GET /ideas**: Get all available ideas (with user scores if email provided)
- **POST /submit-vote**: Submit scored ideas (auto-advances rounds when all users vote)
- **POST /end-round**: Manually end current round and create next round with top 70% of ideas
- **GET /results**: Get voting results
- **GET /round-info**: Get current round information
- **GET /user-scores**: Get user's saved scores from round files
- **POST /save-scores**: Save user scores to round files

### Round Management
- **Automatic Round Advancement**: Rounds auto-advance when all valid users have submitted votes
- **Manual Round Control**: `/end-round` endpoint available for manual round advancement
- **Random Selection**: Both automatic and manual round ending randomly select 70% of ideas (scores are not transmitted between rounds)
- **Clean Round Files**: New round files contain only id, title, description (no user_scores)
- **Vote Tracking**: System reads from round JSON files to determine completion (not in-memory variables)
- **Detailed Logging**: `check_all_users_voted()` function provides comprehensive logging of vote status from files

### Best Practices
- **Validation**: Validate all inputs, especially scoring constraints
- **Error handling**: Graceful degradation, user-friendly error messages
- **Security**: Input sanitization, CORS configuration
- **Performance**: Minimize DOM queries, efficient event handling
- **State**: Clear state management, avoid global variables when possible
- **API**: RESTful endpoints, consistent JSON responses
- **Testing**: Manual testing for critical paths, consider adding unit tests for models