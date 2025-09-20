# Voter App - Idea Ranking System

A modern, single-user idea ranking application with drag-and-drop functionality built with vanilla JavaScript, HTML, and CSS.

## Features

- **Click to Rank**: Click on any idea to rank it from best to worst
- **Drag to Reorder**: Use the ⇅ handle on ranked ideas to reorder them
- **Visual Feedback**: Smooth animations and hover effects
- **Progress Tracking**: See how many ideas you've ranked
- **Submit Rankings**: Send your rankings to a server (placeholder implementation)

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

1. **Rank Ideas**: Click on any idea card to rank it
2. **Reorder Rankings**: Use the ⇅ handle in the top-right corner of ranked cards to drag and reorder them
3. **Unrank Ideas**: Click on a ranked idea to remove its ranking
4. **Submit Vote**: Click the "Submit Vote" button when you're satisfied with your rankings

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
- **Drag and Drop API**: Native browser drag-and-drop functionality

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Drag and Drop API
- CSS Custom Properties

## Development

The application is built with a clean separation of concerns:
- **HTML**: Structure and content
- **CSS**: Presentation and styling
- **JavaScript**: Behavior and functionality

All code is well-commented and follows modern JavaScript best practices.