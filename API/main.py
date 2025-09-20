from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

IDEA_TEMPLATES = [
    'Implement AI-powered customer support',
    'Create mobile app for inventory management',
    'Develop blockchain-based voting system',
    'Build automated testing framework',
    'Design new user onboarding flow',
    'Create data analytics dashboard',
    'Implement real-time collaboration tools',
    'Build API gateway for microservices',
    'Develop machine learning recommendation engine',
    'Create cross-platform desktop application',
    'Implement advanced security protocols',
    'Build scalable cloud infrastructure',
    'Develop IoT device management system',
    'Create interactive learning platform',
    'Build automated deployment pipeline',
    'Implement voice recognition features',
    'Develop virtual reality training module',
    'Create social media analytics tool',
    'Build predictive maintenance system',
    'Implement multi-language support'
]

@app.route('/')
def root():
    return jsonify({
        "message": "Voter App API",
        "version": "1.0.0",
        "endpoints": {
            "GET /ideas": "Get all available ideas",
            "POST /submit-vote": "Submit scored ideas",
            "GET /results": "Get voting results"
        }
    })

@app.route('/ideas', methods=['GET'])
def get_ideas():
    """Get all available ideas for scoring"""
    ideas = []
    for index, title in enumerate(IDEA_TEMPLATES, 1):
        ideas.append({
            "id": index,
            "title": title,
            "description": f"A comprehensive solution for {title.lower()}.",
            "score": None
        })

    return jsonify(ideas)

@app.route('/submit-vote', methods=['POST'])
def submit_vote():
    """Submit scored ideas"""
    data = request.get_json()

    if not data or 'ideas' not in data:
        return jsonify({"error": "No ideas provided"}), 400

    ideas = data['ideas']
    if not ideas:
        return jsonify({"error": "No ideas provided"}), 400

    scored_count = sum(1 for idea in ideas if idea.get('score') is not None)
    total_count = len(ideas)

    if scored_count != total_count:
        return jsonify({
            "error": f"All ideas must be scored. Currently scored: {scored_count}/{total_count}"
        }), 400

    score_counts = {0: 0, 1: 0, 2: 0}
    for idea in ideas:
        score = idea.get('score')
        if score is not None:
            score_counts[score] += 1

    max_score_2 = int(total_count * 0.4)
    max_score_1 = int(total_count * 0.3)

    if score_counts[2] > max_score_2:
        return jsonify({
            "error": f"Too many score 2 assignments. Maximum allowed: {max_score_2}, current: {score_counts[2]}"
        }), 400

    if score_counts[1] > max_score_1:
        return jsonify({
            "error": f"Too many score 1 assignments. Maximum allowed: {max_score_1}, current: {score_counts[1]}"
        }), 400

    total_score = sum(idea.get('score', 0) for idea in ideas)

    result = {
        "id": 1,
        "ideas": ideas,
        "submitted_at": datetime.utcnow().isoformat() + "Z",
        "total_score": total_score,
        "score_distribution": score_counts
    }

    return jsonify(result)

@app.route('/results', methods=['GET'])
def get_results():
    """Get voting results (placeholder)"""
    return jsonify({
        "message": "Results endpoint - to be implemented",
        "total_votes": 0,
        "average_scores": {}
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)