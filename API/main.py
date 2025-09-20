from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import re
import os
from datetime import datetime
from config import Config

app = Flask(__name__)
CORS(app, origins=Config.CORS_ORIGINS)

submitted_votes = []

valid_emails = [
    "Filipe",
    "Pedro"
]

# Load ideas from JSON file


def load_ideas():
    try:
        with open('ideas.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Warning: ideas.json not found, using empty list")
        return []
    except json.JSONDecodeError:
        print("Warning: Invalid JSON in ideas.json, using empty list")
        return []

# Round management functions


def get_current_round():
    """Get the current round number by finding the highest roundX.json file"""
    round_files = [f for f in os.listdir(
        '.') if f.startswith('round') and f.endswith('.json')]
    if not round_files:
        return 0

    round_numbers = []
    for f in round_files:
        try:
            round_num = int(f.replace('round', '').replace('.json', ''))
            round_numbers.append(round_num)
        except ValueError:
            continue

    return max(round_numbers) if round_numbers else 0


def load_current_round_ideas():
    """Load ideas for the current round"""
    current_round = get_current_round()

    round_file = f'round{current_round}.json'
    print(round_file)
    try:
        with open(round_file, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        print(f"Warning: Could not load {
              round_file}, falling back to ideas.json")


def check_all_users_voted():
    """Check if all valid users have submitted votes for the current round"""
    current_round = get_current_round()
    voted_users = set()

    # Check submitted votes for current round
    for vote in submitted_votes:
        # For now, we'll track votes by checking if they exist
        # In a real system, you'd want to track this more explicitly
        if vote.get('round', 0) == current_round:
            voted_users.add(vote.get('user_email', 'unknown'))

    return len(voted_users) >= len(valid_emails)


def create_next_round(ideas_with_scores):
    """Create the next round by eliminating ideas with 0 score"""
    current_round = get_current_round()
    next_round = current_round + 1

    # Filter out ideas with 0 score
    surviving_ideas = []
    for idea in ideas_with_scores:
        if idea.get('score', 0) > 0:
            # Reset score for next round
            idea_copy = idea.copy()
            idea_copy['score'] = None
            surviving_ideas.append(idea_copy)

    if not surviving_ideas:
        print("No ideas survived this round - voting complete!")
        return False

    # Save next round ideas
    round_file = f'round{next_round}.json'
    with open(round_file, 'w') as f:
        json.dump(surviving_ideas, f, indent=2)

    print(f"Created {round_file} with {len(surviving_ideas)} surviving ideas")
    return True

# Round management functions


def get_current_round():
    """Get the current round number by finding the highest roundX.json file"""
    round_files = [f for f in os.listdir(
        '.') if f.startswith('round') and f.endswith('.json')]
    if not round_files:
        return 0

    round_numbers = []
    for f in round_files:
        try:
            round_num = int(f.replace('round', '').replace('.json', ''))
            round_numbers.append(round_num)
        except ValueError:
            continue

    return max(round_numbers) if round_numbers else 0


def load_current_round_ideas():
    """Load ideas for the current round"""
    current_round = get_current_round()

    round_file = f'round{current_round}.json'
    try:
        with open(round_file, 'r') as f:
            ideas = json.load(f)

        # Check if ideas have ids, if not add them and save
        modified = False
        for idx, idea in enumerate(ideas):
            if 'id' not in idea:
                idea['id'] = idx + 1  # Use 1-based indexing for ids
                modified = True

        # Save the file if we added ids
        if modified:
            with open(round_file, 'w') as f:
                json.dump(ideas, f, indent=2)
            print(f"Added ids to ideas in {round_file}")

        return ideas
    except (FileNotFoundError, json.JSONDecodeError):
        print(f"Warning: Could not load {round_file}, falling back to ideas.json")


def check_all_users_voted():
    """Check if all valid users have submitted votes for the current round"""
    current_round = get_current_round()
    voted_users = set()

    # Check submitted votes for current round
    for vote in submitted_votes:
        # For now, we'll track votes by checking if they exist
        # In a real system, you'd want to track this more explicitly
        if vote.get('round', 0) == current_round:
            voted_users.add(vote.get('user_email', 'unknown'))

    return len(voted_users) >= len(valid_emails)


def create_next_round(ideas_with_scores):
    """Create the next round by eliminating ideas with 0 score"""
    current_round = get_current_round()
    next_round = current_round + 1

    # Filter out ideas with 0 score
    surviving_ideas = []
    for idea in ideas_with_scores:
        if idea.get('score', 0) > 0:
            # Reset score for next round
            idea_copy = idea.copy()
            idea_copy['score'] = None
            surviving_ideas.append(idea_copy)

    if not surviving_ideas:
        print("No ideas survived this round - voting complete!")
        return False

    # Save next round ideas
    round_file = f'round{next_round}.json'
    with open(round_file, 'w') as f:
        json.dump(surviving_ideas, f, indent=2)

    print(f"Created {round_file} with {len(surviving_ideas)} surviving ideas")
    return True


@app.route('/')
def root():
    return jsonify({
        "message": "Voter App API",
        "version": "1.0.0",
        "endpoints": {
            "GET /ideas": "Get all available ideas (with user scores if email provided)",
            "POST /submit-vote": "Submit scored ideas",
            "GET /results": "Get voting results",
            "GET /round-info": "Get current round information",
            "GET /user-scores": "Get user's saved scores from round files",
            "POST /save-scores": "Save user scores to round files"
        }
    })


@app.route('/round-info', methods=['GET'])
def get_round_info():
    """Get information about the current round"""
    current_round = get_current_round()
    current_ideas = load_current_round_ideas()

    # Count votes for current round
    round_votes = [vote for vote in submitted_votes if vote.get(
        'round', 0) == current_round]
    voted_users = set()
    for vote in round_votes:
        email = vote.get('user_email', '').strip().lower()
        if email in [v.lower() for v in valid_emails]:
            voted_users.add(email)

    return jsonify({
        "current_round": current_round,
        "total_ideas": len(current_ideas),
        "total_users": len(valid_emails),
        "votes_submitted": len(voted_users),
        "all_votes_submitted": len(voted_users) >= len(valid_emails),
        "round_complete": len(voted_users) >= len(valid_emails)
    })


@app.route('/ideas', methods=['GET'])
def get_ideas():
    """Get all available ideas for scoring"""
    current_ideas = load_current_round_ideas()
    current_round = get_current_round()

    # Get user email from query parameters
    email = request.args.get('email', '').strip().lower()

    ideas = []
    for idx, idea in enumerate(current_ideas):
        # Get user's previous score from the idea's user_scores
        previous_score = None
        if email and "user_scores" in idea and email in idea["user_scores"]:
            previous_score = idea["user_scores"][email]

        ideas.append({
            "id": idea["id"],  # use actual idea id
            "title": idea["title"],
            "description": idea["description"],
            "score": previous_score
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
    current_round = get_current_round()

    result = {
        "id": len(submitted_votes) + 1,
        "ideas": ideas,
        "submitted_at": datetime.utcnow().isoformat() + "Z",
        "total_score": total_score,
        "score_distribution": score_counts,
        "round": current_round,
        "user_email": data.get('email', 'unknown')  # Track which user voted
    }

    submitted_votes.append(result)

    # Save user scores directly to the round file
    email = data.get('email', '').strip().lower()
    if email:
        save_user_scores_to_round_file(current_round, email, ideas)
        print(f"Saved scores for user {email} in round {current_round}")

    # Check if this completes the round (all users have voted)
    if check_all_users_voted():
        print(f"All users have voted for round {
              current_round}. Creating next round...")
        create_next_round(ideas)

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

    recent_votes = submitted_votes[-5:] if len(
        submitted_votes) > 5 else submitted_votes

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

    match = next((e for e in valid_emails if e.lower() == email.lower()), None)

    if not match:
        return jsonify({"valid": False, "error": "Wrong email address check for typos"}), 400

    return jsonify({"valid": True, "email": match})


@app.route('/user-scores', methods=['GET'])
def get_user_scores():
    """Get saved scores for a user"""
    email = request.args.get('email')
    round_num = request.args.get('round')

    if not email:
        return jsonify({"scores": []}), 400

    email = email.strip().lower()

    # Load current round ideas to get user scores
    current_ideas = load_current_round_ideas()

    scores_list = []
    for idx, idea in enumerate(current_ideas):
        score = idea.get('user_scores', {}).get(email)
        if score is not None:
            scores_list.append({
                'id': idea['id'],  # use actual idea id
                'title': idea['title'],
                'score': score
            })

    response = {"scores": scores_list}
    if round_num:
        response["round"] = round_num

    return jsonify(response)


@app.route('/save-scores', methods=['POST'])
def save_user_scores():
    """Save user scores (called automatically when submitting votes)"""
    data = request.get_json()

    if not data or 'email' not in data or 'ideas' not in data:
        return jsonify({"success": False, "error": "Email and ideas are required"}), 400

    email = data['email'].strip().lower()
    ideas = data['ideas']
    round_num = str(data.get('round', get_current_round()))

    # Save the scores directly to the round file
    save_user_scores_to_round_file(int(round_num), email, ideas)

    return jsonify({"success": True, "round": round_num})


def save_user_scores_to_round_file(round_num, email, ideas):
    """Save a user's scores directly to the round file"""
    if round_num == 0:
        # For round 0, we need to create the round file first
        current_ideas = load_current_round_ideas()
        round_file = 'round0.json'
    else:
        round_file = f'round{round_num}.json'
        try:
            with open(round_file, 'r') as f:
                current_ideas = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            print(f"Warning: Could not load {round_file}")
            return

    # Update the user_scores for each idea
    for idea_data in ideas:
        # Find the idea by its id
        idea_id = idea_data['id']
        score = idea_data.get('score')

        # Find the idea with matching id
        idea = next((idea for idea in current_ideas if idea.get('id') == idea_id), None)
        if idea is not None:
            if 'user_scores' not in idea:
                idea['user_scores'] = {}
            idea['user_scores'][email] = score
        else:
            print(f"Warning: idea with id {idea_id} not found in round {round_num}")

    # Save the updated ideas back to the file
    with open(round_file, 'w') as f:
        json.dump(current_ideas, f, indent=2)


if __name__ == '__main__':
    app.run(debug=Config.DEBUG, host=Config.HOST, port=Config.PORT)
