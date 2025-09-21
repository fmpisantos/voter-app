# Voter App API

Python Flask REST API for multi-round collaborative idea ranking system with score normalization.

## Features

- **Multi-Round Voting System**: Progressive idea elimination across voting rounds
- **Multi-User Support**: Email-based authentication with voting status tracking
- **Score Normalization**: Fair comparison by normalizing user scoring tendencies
- **Automatic Round Progression**: System advances when all users complete voting
- **CORS Support**: Seamless frontend-backend communication
- **JSON File Storage**: Simple persistence for votes, results, and round data
- **Comprehensive Error Handling**: Detailed validation and user-friendly messages

## API Endpoints

### Core Voting Flow

#### GET /ideas?email=<email>
Returns ideas for current round or voting status if user has completed all rounds.

**Query Parameters:**
- `email` (required): User's email address

**Response (Active Voting):**
```json
[
  {
    "id": 1,
    "title": "Implement AI-powered customer support",
    "description": "AI solution for customer support automation",
    "score": null
  }
]
```

**Response (Completed Voting):**
```json
{
  "status": "already_voted",
  "message": "You have already completed your voting",
  "user_email": "user@example.com",
  "users": [
    {"email": "user1@example.com", "has_voted": true, "status": "completed"},
    {"email": "user2@example.com", "has_voted": false, "status": "waiting"}
  ],
  "all_voted": false,
  "total_users": 2,
  "voted_count": 1
}
```

#### POST /submit-final-results
Submit final accumulated scores from frontend after all rounds complete.

**Request Body:**
```json
{
  "email": "user@example.com",
  "finalResults": [
    {
      "id": 1,
      "title": "AI Customer Support",
      "description": "AI solution for customer support",
      "finalScore": 4.5
    }
  ]
}
```

**Response:**
```json
{
  "message": "Final results submitted successfully. All users completed.",
  "completed": true
}
```

### Status Endpoints

#### GET /all-users-status
Get voting completion status for all users.

**Response:**
```json
{
  "users": [
    {"email": "user1@example.com", "has_voted": true, "status": "completed"},
    {"email": "user2@example.com", "has_voted": false, "status": "waiting"}
  ],
  "all_voted": false,
  "total_users": 2,
  "voted_count": 1
}
```

#### GET /user-status?email=<email>
Check if specific user has completed voting.

**Response:**
```json
{
  "email": "user@example.com",
  "has_voted": true
}
```

#### GET /round-info
Get current round information and voting status.

**Response:**
```json
{
  "current_round": 1,
  "total_ideas": 20,
  "total_users": 2,
  "votes_submitted": 1,
  "all_votes_submitted": false,
  "round_complete": false
}
```

### Administrative Endpoints

#### POST /end-round
Manually advance to next round (70% survival rate).

**Response:**
```json
{
  "message": "Round 1 ended successfully",
  "next_round": 2,
  "total_ideas": 20,
  "surviving_ideas": 14,
  "survival_rate": 0.7
}
```

#### POST /validate-email
Validate user email address.

**Request Body:**
```json
{"email": "user@example.com"}
```

**Response:**
```json
{"valid": true, "email": "user@example.com"}
```

#### GET /final-results
Get normalized final results after all users complete voting.

**Response:**
```json
[
  {
    "id": 1,
    "title": "AI Customer Support",
    "description": "AI solution for customer support",
    "final_score": 4.2,
    "user_scores": {"user1@example.com": 4.0, "user2@example.com": 4.4},
    "normalized_user_scores": {"user1@example.com": 4.1, "user2@example.com": 4.3}
  }
]
```

### Legacy Endpoints

#### POST /submit-vote
Legacy single-round vote submission (auto-advances rounds).

#### POST /submit-all-votes
Legacy multi-round vote submission endpoint.

## Voting System

### Scoring Constraints (Per Round)
- **Score 2**: Maximum 20% of total ideas (highest priority)
- **Score 1**: Maximum 40% of total ideas (medium priority)
- **Score 0**: Remaining ideas (lowest priority/unlimited)
- **All ideas must be scored** before round submission

### Round Progression
- **Survival Rate**: Top 70% of ideas advance to next round
- **Selection Method**: Random selection from scored ideas (not purely score-based)
- **Automatic Advancement**: Triggers when all valid users complete current round
- **Data Accumulation**: Scores accumulate across all rounds for final results

### Score Normalization
- **Purpose**: Fair comparison by accounting for different user scoring tendencies
- **Process**: Calculate user totals → compute normalization factors → apply to all scores
- **Formula**: `normalized_score = raw_score × (average_total / user_total)`
- **Storage**: Normalized results saved to `final_results.json`

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Quick Start
```bash
cd API
pip install -r requirements.txt
python run.py
```

The API will be available at `http://localhost:8080`

### Manual Setup
1. **Create virtual environment** (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure environment** (optional):
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Run the application**:
```bash
python run.py  # or python main.py
```

## Project Structure

```
API/
├── main.py                    # Flask application and all API routes
├── config.py                  # Configuration settings and environment variables
├── run.py                     # Development server runner script
├── models.py                  # Data models (currently minimal/unused)
├── requirements.txt           # Python dependencies
├── round0.json               # Initial ideas data for round 0
├── round1.json               # Round 1 ideas (generated automatically)
├── user_final_results_*.json # Individual user final results
├── user_votes_*.json         # Individual user vote data (legacy)
├── final_results.json        # Normalized final results
├── deploy.sh                 # Deployment script
├── .env.example             # Environment variables template
└── README.md                # This documentation
```

## Deployment

### Development
```bash
cd API
python run.py
```

### Production
```bash
# Set production environment
export ENV=production
export DEBUG=False
export HOST=0.0.0.0
export PORT=8080

# Run the application
python run.py
```

### Hosting Platforms
- **Heroku**: Deploy directly from GitHub with Procfile
- **DigitalOcean App Platform**: Automatic deployments from repository
- **Railway**: GitHub integration with automatic scaling
- **Render**: Free tier available for small applications

### Environment Variables
Create a `.env` file in the API directory:

```bash
# Application Environment
ENV=production          # 'development' or 'production'
DEBUG=False            # True for development, False for production
HOST=0.0.0.0          # Bind to all interfaces in production
PORT=8080             # Port for the API server

# CORS Configuration (add your frontend domain)
# CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### User Configuration
Edit the `valid_emails` list in `main.py` to configure allowed users:
```python
valid_emails = [
    "user1@company.com",
    "user2@company.com",
    # Add your authorized users here
]
```

## Technologies & Architecture

### Core Technologies
- **Python 3.8+**: Runtime environment with modern language features
- **Flask**: Lightweight web framework for REST API development
- **Flask-CORS**: Cross-origin resource sharing for frontend integration
- **python-dotenv**: Environment variable management for configuration

### Data Management
- **JSON File Storage**: Simple file-based persistence for votes and results
- **Round-based Data**: Separate JSON files for each voting round
- **User Data Isolation**: Individual files for each user's votes and results
- **Automatic File Management**: System creates/manages round progression files

### Key Algorithms
- **Score Normalization**: Statistical normalization for fair user comparison
- **Round Progression**: 70% survival rate with random selection
- **Multi-user Coordination**: Status tracking and synchronization
- **Result Aggregation**: Combined scoring across multiple rounds

### Security Features
- **Email Validation**: Pre-configured user authentication
- **Input Sanitization**: All inputs validated and sanitized
- **CORS Protection**: Configurable origin restrictions
- **Error Handling**: Comprehensive error responses without data leakage