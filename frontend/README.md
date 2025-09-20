# Voter App - Idea Scoring System

A modern, single-user idea scoring application with constraint validation built with vanilla JavaScript, HTML, and CSS.

## Features

- **Score Assignment**: Assign scores (0-2) to all ideas with constraint validation
- **Constraint Enforcement**: Max 40% of ideas can have score 2, max 30% can have score 1
- **Visual Feedback**: Smooth animations and hover effects for score buttons
- **Progress Tracking**: See how many ideas you've scored
- **Complete Validation**: Ensures all ideas are scored before submission
- **Score Distribution**: Automatic sorting by score for better organization

## Getting Started

### Prerequisites

- Node.js (for the development server)

### Installation

1. Clone or download the project files
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Running the Application

Start the development server:

```bash
npm run serve
```

The application will be available at `http://localhost:3000`

## How to Use

1. **Score Ideas**: Click on score buttons (0, 1, 2) for each idea
2. **Constraint Limits**:
   - Score 2: Maximum 40% of total ideas (8 out of 20)
   - Score 1: Maximum 30% of total ideas (6 out of 20)
   - Score 0: Remaining ideas (unlimited)
3. **Change/Remove Scores**:
   - Click the same score button to remove it
   - Click a different score button to change it
   - You can always remove existing scores to free up slots
4. **Complete All**: You must score all ideas before submitting
5. **Submit Scores**: Click the "Submit Vote" button when all ideas are scored

## File Structure

```
voter-app/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
├── package.json        # Node.js dependencies and scripts
└── README.md           # This file
```

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **Vanilla JavaScript**: No frameworks, pure JavaScript for functionality
- **Constraint Validation**: Real-time validation of scoring limits
- **CSS Custom Properties**: Theme management with CSS variables

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- CSS Custom Properties

## Development

The application is built with a clean separation of concerns:
- **HTML**: Structure and content
- **CSS**: Presentation and styling with custom properties
- **JavaScript**: Behavior, scoring logic, and constraint validation

All code is well-commented and follows modern JavaScript best practices.