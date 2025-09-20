from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import random
from datetime import datetime
from config import Config

app = Flask(__name__)
CORS(app, origins=Config.CORS_ORIGINS)

submitted_votes = []

valid_emails = [
    "Filipe",
    "Pedro"
]


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
    """Check if all valid users have submitted votes for the current round by reading from round file"""
    print("🔍 check_all_users_voted() called")

    current_round = get_current_round()
    print(f"📊 Checking round: {current_round}")

    voted_users = set()

    print(f"👥 Valid emails: {valid_emails} (total: {len(valid_emails)})")

    # Load current round file to check user_scores
    round_file = f'round{current_round}.json'
    try:
        with open(round_file, 'r') as f:
            current_ideas = json.load(f)

        print(f"📂 Loaded round file: {round_file} with {
              len(current_ideas)} ideas")

        # Check each idea's user_scores to see who has voted
        for idea in current_ideas:
            idea_id = idea.get('id')
            user_scores = idea.get('user_scores', {})

            if user_scores:
                print(f"  💡 Idea {idea_id} has scores from: {
                      list(user_scores.keys())}")

                # Check each user who scored this idea
                for user_email in user_scores.keys():
                    user_email_lower = user_email.strip().lower()

                    # Only count votes from valid email addresses
                    if any(user_email_lower == valid_email.lower() for valid_email in valid_emails):
                        voted_users.add(user_email_lower)
                        print(f"    ✅ Valid vote from: {user_email}")
                    else:
                        print(f"    ❌ Invalid/unknown voter: {user_email}")
            else:
                print(f"  💤 Idea {idea_id} has no scores yet")

    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"⚠️  Could not load round file {round_file}: {e}")
        print("  Assuming no votes have been submitted yet")
        voted_users = set()

    print(f"📈 Round {current_round} summary:")
    print(f"  - Valid votes found: {len(voted_users)}")
    print(f"  - Required votes: {len(valid_emails)}")
    print(f"  - Users who voted: {list(voted_users)}")

    all_voted = len(voted_users) == len(valid_emails)

    if all_voted:
        print(f"🎉 ROUND {
              current_round} COMPLETE - All {len(valid_emails)} users have voted!")
        print("🚀 Automatic round ending will be triggered")
    else:
        print(f"⏳ ROUND {current_round} INCOMPLETE - {len(voted_users)
                                                      }/{len(valid_emails)} users have voted")

    return all_voted


def create_next_round(ideas_with_scores):
    """Create the next round by eliminating ideas with 0 score"""
    current_round = get_current_round()
    next_round = current_round + 1

    surviving_ideas = []
    for idea in ideas_with_scores:
        if idea.get('score', 0) > 0:
            idea_copy = idea.copy()
            idea_copy['score'] = None
            surviving_ideas.append(idea_copy)

    if not surviving_ideas:
        print("No ideas survived this round - voting complete!")
        return False

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
            "POST /end-round": "End current round and create next round with top 60% of ideas",
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

    email = request.args.get('email', '').strip().lower()

    ideas = []
    for idx, idea in enumerate(current_ideas):
        previous_score = None
        if email and "user_scores" in idea and email in idea["user_scores"]:
            previous_score = idea["user_scores"][email]

        ideas.append({
            "id": idea["id"],
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

    max_score_2 = int(total_count * 0.2)
    max_score_1 = int(total_count * 0.4)

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
        "user_email": data.get('email', 'unknown')
    }

    submitted_votes.append(result)

    email = data.get('email', '').strip().lower()
    if email:
        save_user_scores_to_round_file(current_round, email, ideas)
        print(f"Saved scores for user {email} in round {current_round}")

    # Check if all users have voted and automatically end the round
    if check_all_users_voted():
        print(f"All users have voted for round {
              current_round}. Automatically ending round...")
        try:
            # Load current round ideas with user scores
            round_file = f'round{current_round}.json'
            with open(round_file, 'r') as f:
                current_ideas = json.load(f)

            # Randomly select 70% of ideas (scores are not transmitted between rounds)
            total_ideas = len(current_ideas)
            top_count = max(1, int(total_ideas * 0.7))  # At least 1 idea

            # Get all idea IDs and randomly select top_count of them
            all_idea_ids = [idea['id'] for idea in current_ideas]
            top_idea_ids = random.sample(all_idea_ids, top_count)

            print(f"🔀 Randomly selected {top_count} ideas out of {
                  total_ideas} for next round")
            print(f"📋 Selected idea IDs: {top_idea_ids}")

            # Create next round ideas (only id, title, description)
            next_round = current_round + 1
            next_round_ideas = []

            for idea in current_ideas:
                if idea['id'] in top_idea_ids:
                    next_round_ideas.append({
                        "id": idea["id"],
                        "title": idea["title"],
                        "description": idea["description"]
                    })

            # Save next round file
            next_round_file = f'round{next_round}.json'
            with open(next_round_file, 'w') as f:
                json.dump(next_round_ideas, f, indent=2)

            print(f"Automatically ended round {current_round}, created round {
                  next_round} with {len(next_round_ideas)} ideas")

        except Exception as e:
            print(f"Error automatically ending round {current_round}: {e}")

    return jsonify(result)


@app.route('/end-round', methods=['POST'])
def end_round():
    """End the current round and create the next round with top 70% of ideas"""
    current_round = get_current_round()

    try:
        round_file = f'round{current_round}.json'
        with open(round_file, 'r') as f:
            current_ideas = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return jsonify({"error": f"Could not load round {current_round} data"}), 500

    # Randomly select 70% of ideas (scores are not transmitted between rounds)
    total_ideas = len(current_ideas)
    top_count = max(1, int(total_ideas * 0.7))  # At least 1 idea

    # Get all idea IDs and randomly select top_count of them
    all_idea_ids = [idea['id'] for idea in current_ideas]
    top_idea_ids = random.sample(all_idea_ids, top_count)

    print(f"🔀 Manually ended round {
          current_round} - randomly selected {top_count} ideas out of {total_ideas}")
    print(f"📋 Selected idea IDs: {top_idea_ids}")

    next_round = current_round + 1
    next_round_ideas = []

    for idea in current_ideas:
        if idea['id'] in top_idea_ids:
            next_round_ideas.append({
                "id": idea["id"],
                "title": idea["title"],
                "description": idea["description"]
            })

    next_round_file = f'round{next_round}.json'
    with open(next_round_file, 'w') as f:
        json.dump(next_round_ideas, f, indent=2)

    print(f"Ended round {current_round}, created round {
          next_round} with {len(next_round_ideas)} ideas")

    return jsonify({
        "message": f"Round {current_round} ended successfully",
        "next_round": next_round,
        "total_ideas": total_ideas,
        "surviving_ideas": len(next_round_ideas),
        "survival_rate": len(next_round_ideas) / total_ideas if total_ideas > 0 else 0
    })


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

    current_ideas = load_current_round_ideas()

    scores_list = []
    for idx, idea in enumerate(current_ideas):
        score = idea.get('user_scores', {}).get(email)
        if score is not None:
            scores_list.append({
                'id': idea['id'],
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

    save_user_scores_to_round_file(int(round_num), email, ideas)

    return jsonify({"success": True, "round": round_num})


def save_user_scores_to_round_file(round_num, email, ideas):
    """Save a user's scores directly to the round file"""
    if round_num == 0:
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

    for idea_data in ideas:
        idea_id = idea_data['id']
        score = idea_data.get('score')

        idea = next(
            (idea for idea in current_ideas if idea.get('id') == idea_id), None)
        if idea is not None:
            if 'user_scores' not in idea:
                idea['user_scores'] = {}
            idea['user_scores'][email] = score
        else:
            print(f"Warning: idea with id {
                  idea_id} not found in round {round_num}")

    with open(round_file, 'w') as f:
        json.dump(current_ideas, f, indent=2)


if __name__ == '__main__':
    app.run(debug=Config.DEBUG, host=Config.HOST, port=Config.PORT)
