# Voter App API

Python Flask API for the Idea Scoring System.

## Features

- **RESTful API** for idea scoring operations
- **CORS support** for frontend integration
- **Input validation** with scoring constraints
- **Score distribution tracking**
- **Error handling** with detailed messages

## Endpoints

### GET /
Returns API information and available endpoints.

### GET /ideas
Returns all available ideas for scoring.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Implement AI-powered customer support",
    "description": "A comprehensive solution for implement ai-powered customer support.",
    "score": null
  }
]
```

### POST /submit-vote
Submit scored ideas for validation and processing.

**Request Body:**
```json
{
  "ideas": [
    {
      "id": 1,
      "title": "Implement AI-powered customer support",
      "description": "A comprehensive solution for implement ai-powered customer support.",
      "score": 2
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "ideas": [...],
  "submitted_at": "2024-01-01T12:00:00Z",
  "total_score": 45,
  "score_distribution": {
    "0": 6,
    "1": 6,
    "2": 8
  }
}
```

### GET /results
Get voting results (placeholder endpoint).

## Scoring Constraints

- **Score 2**: Maximum 40% of total ideas
- **Score 1**: Maximum 30% of total ideas
- **Score 0**: Remaining ideas (no limit)
- **All ideas must be scored** before submission

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the API:
```bash
python main.py
```

The API will be available at `http://localhost:5000`

## Project Structure

```
API/
├── main.py           # Flask application
├── models.py         # Data models and validation logic
├── requirements.txt  # Python dependencies
└── README.md         # This file
```

## Technologies

- **Flask**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Python 3.8+**: Runtime environment