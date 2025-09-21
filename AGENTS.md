# AGENTS.md - Voter App Development Guide

## Build/Lint/Test Commands
### Frontend (JavaScript/Vite)
- **Serve**: `cd frontend && npm run serve` (dev server on port 3000)
- **Build**: `cd frontend && npm run build` (production build)
- **Install**: `cd frontend && npm install`
- **Test**: Manual testing via browser (no automated tests)

### Backend (Python/Flask)
- **Run**: `cd API && python run.py` (Flask server on port 8080)
- **Install**: `cd API && pip install -r requirements.txt`
- **Test**: Manual API testing (no automated tests)
- **Lint**: No linting configured

## Code Style Guidelines
### Python (Backend)
- **Imports**: stdlib → third-party → local (blank lines between groups)
- **Naming**: snake_case (vars/fns), PascalCase (classes), UPPER_CASE (constants)
- **Types**: Use type hints, Optional for nullable, no Any types
- **Formatting**: 4 spaces, <100 chars/line, trailing commas in multi-line
- **Error handling**: Specific try/except blocks, log errors with print()
- **Docstrings**: Triple quotes for functions/classes, describe params/returns

### JavaScript (Frontend)
- **Features**: ES6+ (arrows, destructuring, async/await, template literals)
- **Naming**: camelCase (vars/fns), PascalCase (constructors/components)
- **Variables**: `const` preferred, `let` over `var`, descriptive names
- **Strings**: Single quotes, semicolons required, consistent formatting
- **DOM**: `querySelector`, `addEventListener`, avoid innerHTML when possible
- **Async**: async/await over Promises, proper error handling

### HTML/CSS
- **HTML**: Semantic elements, lowercase attrs, double quotes, alt text for images
- **CSS**: Grid/Flexbox, BEM-like naming (.idea-card), CSS vars for theming
- **Responsive**: Mobile-first approach, flexible layouts

### File Organization
- **Frontend**: `index.html`, `styles.css`, `script.js` in frontend/
- **Backend**: `main.py` (routes), `models.py` (data), `config.py` (settings)
- **Data**: Round JSON files (`round0.json`, etc.), user result files
- **Scripts**: `deploy.sh` for deployment, `run.py` for development

### API Design
- RESTful endpoints with JSON responses
- Email validation required for voting
- CORS configured for frontend-backend communication
- Error responses include descriptive messages

### Security & Best Practices
- Input sanitization, email validation, no secrets in code
- CORS config, environment variables via .env
- Graceful error handling, user-friendly messages, console logging
- No automated testing - manual testing for critical paths and edge cases