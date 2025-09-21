# Voter App - Multi-Round Idea Ranking System

A complete full-stack application for collaborative idea ranking through multiple voting rounds with score normalization. Users vote on ideas in successive rounds where only top-performing ideas survive to the next round.

## Project Structure

```
voter-app/
├── frontend/          # JavaScript/Vite frontend application
│   ├── index.html     # Main HTML file
│   ├── styles.css     # CSS styles
│   ├── script.js      # JavaScript functionality
│   ├── package.json   # Frontend dependencies
│   ├── vite.config.js # Vite configuration
│   └── README.md      # Frontend documentation
├── API/               # Python Flask API
│   ├── main.py        # Flask application and routes
│   ├── models.py      # Data models (currently unused)
│   ├── config.py      # Configuration settings
│   ├── requirements.txt # Python dependencies
│   ├── run.py         # Run script
│   ├── round0.json    # Initial ideas data
│   └── README.md      # API documentation
├── AGENTS.md          # Development guide for AI coding assistants
└── README.md          # This file
```

## Features

- **Multi-Round Voting**: Progressive elimination where only top 70% of ideas advance each round
- **Multi-User Support**: Email-based authentication with status tracking across users
- **Score Normalization**: Fair comparison by normalizing user scoring tendencies
- **Real-time Status**: Live updates showing which users have completed voting
- **Drag-and-Drop Interface**: Intuitive idea ranking with visual feedback
- **Automatic Round Progression**: System automatically advances when all users vote
- **Final Results**: Combined normalized scores across all rounds and users
- **RESTful API**: Well-documented Python Flask API with CORS support

## Quick Start

### Prerequisites
- Node.js 16+ (for frontend development)
- Python 3.8+ (for backend API)
- Git

### Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd voter-app
```

2. **Setup Backend API**
```bash
cd API
pip install -r requirements.txt
python run.py
```
API will be available at `http://localhost:8080`

3. **Setup Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm run serve
```
Frontend will be available at `http://localhost:3000`

### Usage
1. Open `http://localhost:3000` in your browser
2. Enter your email address (must be pre-configured in the system)
3. Vote on ideas by assigning scores (0-2) with the given constraints
4. Complete all rounds as the system automatically progresses
5. View final normalized results when all users complete voting

## Voting System

### Scoring Rules
- **Score 2**: Maximum 20% of total ideas (highest priority)
- **Score 1**: Maximum 40% of total ideas (medium priority)
- **Score 0**: Remaining ideas (lowest priority/unlimited)
- **All ideas must be scored** before submission

### Round Progression
- **Survival Rate**: Top 70% of ideas advance to next round
- **Selection Method**: Random selection from surviving ideas (not purely score-based)
- **Round Completion**: Automatic when all valid users have voted
- **Final Round**: Accumulates scores across all rounds for final ranking

### Score Normalization
- **Purpose**: Fair comparison by accounting for different user scoring tendencies
- **Method**: Each user's total scores are normalized to average across all users
- **Formula**: `normalized_score = raw_score × (average_total / user_total)`
- **Result**: Final rankings based on normalized scores across all rounds

## API Endpoints

### Core Voting Endpoints
- `GET /ideas?email=<email>` - Get ideas for current round or status if user completed voting
- `POST /submit-final-results` - Submit final accumulated scores from frontend
- `POST /submit-all-votes` - Submit all votes from all rounds (legacy)
- `POST /submit-vote` - Submit single round votes (legacy)

### Status & Results
- `GET /user-status?email=<email>` - Check if specific user completed voting
- `GET /all-users-status` - Get voting completion status for all users
- `GET /final-results` - Get normalized final results
- `GET /round-info` - Get current round information

### Administrative
- `POST /end-round` - Manually advance to next round (70% survival)
- `POST /validate-email` - Validate user email address
- `GET /` - API information and endpoint documentation

## Technologies

### Frontend
- **HTML5**: Semantic markup with modern structure
- **CSS3**: Grid/Flexbox layouts, CSS custom properties, responsive design
- **Vanilla JavaScript (ES6+)**: Async/await, fetch API, DOM manipulation
- **Vite**: Fast build tool and development server
- **Drag & Drop API**: Intuitive idea ranking interface

### Backend
- **Python 3.8+**: Core runtime environment
- **Flask**: Lightweight web framework
- **Flask-CORS**: Cross-origin resource sharing
- **python-dotenv**: Environment variable management
- **JSON file storage**: Simple data persistence for votes and results

## Development

### Architecture
1. **Frontend**: Single-page application handling user interaction and API communication
2. **Backend**: RESTful API serving JSON data with CORS support
3. **Data Flow**: Frontend → API calls → JSON file storage → Response
4. **State Management**: Client-side state with server synchronization

### Key Components
- **Multi-round voting logic** with automatic progression
- **Score normalization algorithm** for fair user comparison
- **Email-based user authentication** with pre-configured user list
- **Real-time status updates** showing voting progress across users

## Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
```
Upload the `dist/` folder contents to any static hosting service:
- **Netlify**: Drag & drop the `dist` folder
- **Vercel**: Connect repository and deploy automatically
- **GitHub Pages**: Use GitHub Actions for automated deployment

### Backend Deployment
```bash
cd API
# Set production environment variables
export ENV=production
export DEBUG=False
export HOST=0.0.0.0
export PORT=8080
python run.py
```

**Recommended hosting services:**
- **API**: Heroku, DigitalOcean App Platform, Railway, Render
- **Database**: Consider upgrading to PostgreSQL for production data persistence

### Production Checklist

- [ ] Update `API_BASE_URL` in `frontend/script.js` for production API endpoint
- [ ] Configure CORS origins in `API/config.py` for your domain
- [ ] Set production environment variables (`ENV=production`, `DEBUG=False`)
- [ ] Test email validation with production user list
- [ ] Ensure HTTPS is enabled for secure communication
- [ ] Set up monitoring for API endpoints and voting progress
- [ ] Configure backup strategy for JSON data files
- [ ] Test multi-user voting flow end-to-end

### Security Considerations
- **User Authentication**: Currently email-based with hardcoded user list
- **Data Storage**: JSON files (consider database for production)
- **CORS Policy**: Restrict to your domain in production
- **Input Validation**: All inputs validated on both frontend and backend
- **HTTPS Required**: Essential for production deployment

## Configuration

### API Environment Variables (.env)
```bash
ENV=production          # Set to 'production' for live deployment
DEBUG=False            # Disable debug mode in production
HOST=0.0.0.0          # Bind to all interfaces
PORT=8080             # API port (different from frontend)
```

### Frontend Configuration
Update `API_BASE_URL` in `frontend/script.js`:
```javascript
const API_BASE_URL = 'https://your-api-domain.com';
```

### User Management
Edit `valid_emails` list in `API/main.py` to configure allowed users:
```python
valid_emails = [
    "user1@example.com",
    "user2@example.com",
    # Add your users here
]
```
