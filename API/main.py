from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import re
from datetime import datetime
from config import Config

app = Flask(__name__)
CORS(app, origins=Config.CORS_ORIGINS)

submitted_votes = []
user_scores = {}

valid_emails = [
    "filipesantosdev@gmail.com",
    "pipas.sporting@gmail.com"
]

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
        "id": len(submitted_votes) + 1,
        "ideas": ideas,
        "submitted_at": datetime.utcnow().isoformat() + "Z",
        "total_score": total_score,
        "score_distribution": score_counts
    }

    submitted_votes.append(result)

    return jsonify(result)

@app.route('/results', methods=['GET'])
def get_results():
    """Get voting results"""
    if not submitted_votes:
        return jsonify({
            "total_votes": 0,
            "average_scores": {},
            "score_distributions": {},
            "recent_votes": []
        })

    total_votes = len(submitted_votes)

    idea_scores = {}
    score_distributions = {0: 0, 1: 0, 2: 0}

    for vote in submitted_votes:
        for idea in vote['ideas']:
            idea_id = idea['id']
            score = idea.get('score', 0)

            if idea_id not in idea_scores:
                idea_scores[idea_id] = []
            idea_scores[idea_id].append(score)

            score_distributions[score] += 1

    average_scores = {}
    for idea_id, scores in idea_scores.items():
        average_scores[idea_id] = sum(scores) / len(scores)

    recent_votes = submitted_votes[-5:] if len(submitted_votes) > 5 else submitted_votes

    return jsonify({
        "total_votes": total_votes,
        "average_scores": average_scores,
        "score_distributions": score_distributions,
        "recent_votes": recent_votes
    })

@app.route('/validate-email', methods=['POST'])
def validate_email():
    """Validate email address"""
    data = request.get_json()

    if not data or 'email' not in data:
        return jsonify({"valid": False, "error": "Email is required"}), 400

    email = data['email'].strip()

    # Basic email validation
    import re
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if not re.match(email_regex, email):
        return jsonify({"valid": False, "error": "Invalid email format"}), 400

    # Additional validation (you can add more sophisticated checks here)
    if len(email) > 254:  # RFC 5321 limit
        return jsonify({"valid": False, "error": "Email address too long"}), 400

    if not email in valid_emails:
        return jsonify({"valid": False, "error": "Wrong email address check for typos"}), 400

    return jsonify({"valid": True})

@app.route('/user-scores', methods=['GET'])
def get_user_scores():
    """Get saved scores for a user"""
    email = request.args.get('email')

    if not email:
        return jsonify({"scores": []}), 400

    email = email.strip().lower()
    scores = user_scores.get(email, [])

    return jsonify({"scores": scores})

@app.route('/save-scores', methods=['POST'])
def save_user_scores():
    """Save user scores (called automatically when submitting votes)"""
    data = request.get_json()

    if not data or 'email' not in data or 'ideas' not in data:
        return jsonify({"success": False, "error": "Email and ideas are required"}), 400

    email = data['email'].strip().lower()
    ideas = data['ideas']

    # Save the scores for this user
    user_scores[email] = ideas

    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=Config.DEBUG, host=Config.HOST, port=Config.PORT)
