# Voter App Frontend - Multi-Round Idea Ranking

A modern single-page application for collaborative idea ranking through multiple voting rounds. Built with vanilla JavaScript, featuring drag-and-drop interface, real-time status updates, and seamless API integration.

## Features

- **Multi-Round Voting**: Progressive idea elimination across voting rounds
- **Multi-User Support**: Email-based authentication with live status tracking
- **Drag & Drop Interface**: Intuitive idea ranking with visual feedback
- **Real-time Status Updates**: Live progress showing which users have completed voting
- **Score Validation**: Enforce scoring constraints (20% max score 2, 40% max score 1)
- **Automatic Progression**: System advances rounds when all users complete voting
- **Final Results Display**: View normalized rankings after all users finish
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites
- Node.js 16+ (for development server and build tools)
- Running backend API (see API README for setup)
- Modern web browser with ES6+ support

### Installation

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run serve
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
```

Upload the `dist/` folder to any static hosting service (Netlify, Vercel, etc.)

## How to Use

### User Flow

1. **Email Authentication**:
   - Enter your email address (must be pre-configured in the system)
   - System validates email and checks voting status

2. **Voting Rounds**:
   - If you've already completed voting: View status of all users
   - If active voting: Participate in current round
   - Score all ideas using drag-and-drop or button interface

3. **Scoring Constraints** (per round):
   - **Score 2** (High Priority): Maximum 20% of ideas
   - **Score 1** (Medium Priority): Maximum 40% of ideas
   - **Score 0** (Low Priority): Remaining ideas (unlimited)

4. **Round Progression**:
   - System automatically advances when all users complete current round
   - Top 70% of ideas survive to next round
   - Scores accumulate across all rounds

5. **Final Results**:
   - View normalized rankings after all users complete voting
   - Scores are normalized for fair comparison across users

### Interface Features

- **Drag & Drop**: Intuitive ranking with visual feedback
- **Button Scoring**: Alternative scoring method with constraint validation
- **Progress Tracking**: Real-time completion status
- **Status Updates**: Live view of other users' progress
- **Responsive Design**: Works on all device sizes

## File Structure

```
frontend/
├── index.html          # Main HTML structure and layout
├── styles.css          # CSS styles with responsive design
├── script.js           # Main application logic and API integration
├── package.json        # Node.js dependencies and build scripts
├── vite.config.js      # Vite build configuration
├── dist/               # Production build output (generated)
│   └── index.html
└── README.md           # This documentation
```

### Key Files

- **`index.html`**: Single-page application structure with modal dialogs
- **`script.js`**: ES6+ JavaScript with async/await, DOM manipulation, drag-and-drop
- **`styles.css`**: Modern CSS with Grid/Flexbox, custom properties, animations
- **`vite.config.js`**: Build configuration for optimal production bundles

## Technologies & Architecture

### Core Technologies
- **HTML5**: Semantic markup with accessibility considerations
- **CSS3**: Modern layouts with Grid/Flexbox, custom properties, smooth animations
- **Vanilla JavaScript (ES6+)**: Modern JavaScript without frameworks
- **Vite**: Fast build tool and development server
- **Fetch API**: Modern HTTP requests with async/await

### Key Features
- **Drag & Drop API**: Native browser drag-and-drop for intuitive ranking
- **Constraint Validation**: Real-time scoring limit enforcement
- **State Management**: Client-side state with server synchronization
- **Responsive Design**: Mobile-first approach with flexible layouts
- **Progressive Enhancement**: Works without JavaScript (graceful degradation)

### Browser Support
- **Modern Browsers**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **Required Features**: ES6+, Fetch API, Drag & Drop API, CSS Grid/Flexbox
- **Fallback Support**: Graceful degradation for older browsers

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- CSS Custom Properties

## Development

### Architecture
- **Single Page Application**: No page reloads, dynamic content updates
- **Separation of Concerns**: HTML structure, CSS presentation, JS behavior
- **API Integration**: RESTful communication with backend
- **State Synchronization**: Client state synced with server data

### Key Components

#### User Interface
- **Email Modal**: Authentication and status checking
- **Voting Interface**: Drag-and-drop scoring with validation
- **Status Display**: Real-time progress tracking
- **Results View**: Final normalized rankings display

#### JavaScript Modules
- **API Client**: Centralized HTTP request handling
- **State Management**: Application state and user data
- **UI Controllers**: DOM manipulation and event handling
- **Validation Engine**: Scoring constraint enforcement

### Development Workflow

1. **Local Development**:
```bash
npm run serve  # Start dev server with hot reload
```

2. **API Configuration**:
   - Update `API_BASE_URL` in `script.js` for different environments
   - Ensure CORS is configured in backend

3. **Build Process**:
```bash
npm run build  # Production build with optimization
```

### Code Quality
- **ES6+ Features**: Modern JavaScript with proper error handling
- **Consistent Naming**: camelCase for variables/functions
- **Commented Code**: Well-documented functions and complex logic
- **Error Handling**: Graceful failure with user feedback