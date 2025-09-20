# AGENTS.md - Voter App Development Guide

## Build/Lint/Test Commands
### Frontend (JavaScript)
- **Serve**: `npm run serve` (dev server on port 3000)
- **Test**: Manual testing via `test.html` (no automated tests)
- **Deploy**: `./deploy.sh` (updates API URLs for production)

### Backend (Python/Flask)
- **Run**: `cd API && python run.py` (Flask on port 8080)
- **Install**: `cd API && pip install -r requirements.txt`
- **Test**: Manual API testing (no automated tests)
- **Deploy**: `cd API && ./deploy.sh` (production setup with venv)

## Code Style Guidelines
### Python (Backend)
- **Imports**: stdlib → third-party → local (blank lines between groups)
- **Naming**: snake_case (vars/fns), PascalCase (classes), UPPER_CASE (constants)
- **Types**: Use type hints, Optional for nullable, no Any types
- **Error handling**: Specific try/except blocks, log errors
- **Docstrings**: Triple quotes for functions/classes, describe params/returns
- **Formatting**: 4 spaces, <100 chars/line, trailing commas in multi-line

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
- **Frontend**: `index.html`, `styles.css`, `script.js` in root
- **Backend**: `main.py` (routes), `models.py` (data), `config.py` (settings)
- **Data**: Round JSON files (`round0.json`, etc.), `.env` for config
- **Scripts**: `deploy.sh` for deployment, `run.py` for development

### API Endpoints
- `GET /ideas` - Fetch ideas with optional user scores
- `POST /submit-final-results` - Submit final accumulated scores from frontend
- `POST /submit-all-votes` - Submit scores (legacy, round-by-round)
- `POST /submit-vote` - Submit scores (legacy, round-by-round)
- `POST /end-round` - Manual round advancement (70% survival)
- `GET /final-results` - Get combined final results
- `GET /results` - Voting results and statistics
- `GET /round-info` - Current round status
- `GET /user-status` - Check if specific user has voted
- `GET /all-users-status` - Get voting status for all users

### User Flow
- **Email Validation**: User enters email address
- **Status Check**: System checks if user has already voted
- **If Already Voted**: Shows status page with all users' voting progress
- **If All Users Done**: Displays final normalized results
- **If Not Voted**: Starts the 3-round voting process
- **Status Indicators**: ✅ for completed users, ⏳ for waiting users

### Score Calculation
- **Process**: Frontend calculates accumulated scores across all rounds
- **Formula**: `final_score = round1_score + round2_score + round3_score`
- **Purpose**: Simple accumulation of scores from each voting round
- **Storage**: Final scores sent to server and stored in user files

### Best Practices
- **Validation**: Input sanitization, scoring constraints (20% max score 2, 40% max score 1)
- **Security**: CORS config, email validation, no secrets in code
- **Performance**: Minimize DOM queries, efficient async ops, lazy loading
- **State**: Clear state management, avoid global vars, immutable updates
- **Error handling**: Graceful degradation, user-friendly messages, console logging
- **Testing**: Manual testing for critical paths, edge cases, and user flows