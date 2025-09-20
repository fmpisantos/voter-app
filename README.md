# Voter App - Full Stack Application

A complete full-stack idea scoring application with a React frontend and Python Flask API.

## Project Structure

```
voter-app/
├── frontend/          # React frontend application
│   ├── index.html     # Main HTML file
│   ├── styles.css     # CSS styles
│   ├── script.js      # JavaScript functionality
│   ├── package.json   # Frontend dependencies
│   └── README.md      # Frontend documentation
├── API/               # Python Flask API
│   ├── main.py        # Flask application
│   ├── models.py      # Data models
│   ├── config.py      # Configuration
│   ├── requirements.txt # Python dependencies
│   ├── run.py         # Run script
│   └── README.md      # API documentation
└── README.md          # This file
```

## Features

- **Idea Scoring System**: Score ideas from 0-2 with constraint validation
- **Real-time Validation**: Enforce scoring limits (40% max for score 2, 30% max for score 1)
- **Flexible Score Management**: Add, remove, and change scores dynamically
- **Modern UI**: Clean, professional interface with ANA Aeroportos inspired design
- **RESTful API**: Well-documented Python Flask API
- **CORS Support**: Seamless frontend-backend communication

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run serve
```
Frontend will be available at `http://localhost:3000`

### API
```bash
cd API
pip install -r requirements.txt
python run.py
```
API will be available at `http://localhost:5000`

## Scoring Rules

- **Score 2**: Maximum 40% of total ideas (8 out of 20)
- **Score 1**: Maximum 30% of total ideas (6 out of 20)
- **Score 0**: Remaining ideas (unlimited)
- **All ideas must be scored** before submission

## API Endpoints

- `GET /` - API information
- `GET /ideas` - Get all ideas for scoring
- `POST /submit-vote` - Submit scored ideas
- `GET /results` - Get voting results

## Technologies

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- CSS Grid and Flexbox
- CSS Custom Properties for theming

### Backend
- Python Flask
- Flask-CORS for cross-origin requests
- RESTful API design

## Development

1. **Frontend**: All client-side logic in `frontend/` folder
2. **Backend**: All server-side logic in `API/` folder
3. **Communication**: Frontend makes API calls to backend for data operations

## Deployment

### Quick Deployment

#### Frontend
```bash
cd frontend
./deploy.sh
```
Upload all files to your static hosting provider (Netlify, Vercel, GitHub Pages, etc.)

#### API
```bash
cd API
./deploy.sh
```
Deploy to any Python hosting service (Heroku, DigitalOcean, AWS, etc.)

### Manual Deployment

#### Frontend
1. **Static Hosting**: Upload contents of `frontend/` directory to your web server
2. **Update API URL**: Edit `API_BASE_URL` in `frontend/script.js` for production
3. **CORS Configuration**: Update API's CORS settings for your domain

#### API
1. **Environment Setup**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Production Configuration**:
   ```bash
   export ENV=production
   export DEBUG=False
   export HOST=0.0.0.0
   export PORT=5000
   ```

3. **Start Server**:
   ```bash
   python main.py
   ```

### Production Checklist

- [ ] Update `API_BASE_URL` in frontend for production API endpoint
- [ ] Configure CORS in API for your domain
- [ ] Set `ENV=production` and `DEBUG=False` for API
- [ ] Test frontend-backend communication
- [ ] Ensure HTTPS is enabled for production
- [ ] Set up proper logging and monitoring
- [ ] Configure backup strategy for vote data (currently in-memory)

### Hosting Recommendations

- **Frontend**: Netlify, Vercel, GitHub Pages, Cloudflare Pages
- **API**: Heroku, DigitalOcean App Platform, AWS Elastic Beanstalk, Google App Engine
- **Database**: For production, consider PostgreSQL or MongoDB for persistent storage

## Environment Variables

### API (.env)
```bash
ENV=production
DEBUG=False
HOST=0.0.0.0
PORT=5000
```

### Frontend
Update `API_BASE_URL` in `script.js`:
```javascript
const API_BASE_URL = 'https://your-api-domain.com';
```