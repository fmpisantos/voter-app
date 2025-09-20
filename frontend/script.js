let ideas = [];
let hasSubmitted = false;
let userEmail = null;

const MAX_SCORE_2_PERCENTAGE = 0.4;
const MAX_SCORE_1_PERCENTAGE = 0.3;
const API_BASE_URL = 'http://localhost:8080';

function showEmailModal() {
    const modal = document.getElementById('emailModal');
    modal.classList.add('show');
}

function hideEmailModal() {
    const modal = document.getElementById('emailModal');
    modal.classList.remove('show');
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function validateUserEmail(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/validate-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error validating email:', error);
        return { valid: false, error: 'Network error. Please try again.' };
    }
}

async function loadUserScores(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/user-scores?email=${encodeURIComponent(email)}`);
        if (response.ok) {
            const data = await response.json();
            return data.scores || [];
        }
        return [];
    } catch (error) {
        console.error('Error loading user scores:', error);
        return [];
    }
}

async function handleEmailSubmit(event) {
    event.preventDefault();

    const emailInput = document.getElementById('userEmail');
    const emailError = document.getElementById('emailError');
    const submitButton = event.target.querySelector('button[type="submit"]');

    const email = emailInput.value.trim();

    if (!email) {
        emailError.textContent = 'Please enter an email address.';
        emailError.style.display = 'block';
        return;
    }

    if (!validateEmail(email)) {
        emailError.textContent = 'Please enter a valid email address.';
        emailError.style.display = 'block';
        return;
    }

    emailError.style.display = 'none';
    submitButton.disabled = true;
    submitButton.textContent = 'Validating...';

    const validationResult = await validateUserEmail(email);

    if (validationResult.valid) {
        userEmail = email;
        hideEmailModal();

        // Show user email in the top left
        showUserEmail(email);

        const savedScores = await loadUserScores(email);
        if (savedScores.length > 0) {
            loadSavedScores(savedScores);
        }

        await initVoting();
    } else {
        emailError.textContent = validationResult.error || 'Invalid email address.';
        emailError.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = 'Continue';
    }
}

function loadSavedScores(savedScores) {
    savedScores.forEach(savedScore => {
        const idea = ideas.find(i => i.id === savedScore.ideaId);
        if (idea) {
            idea.score = savedScore.score;
        }
    });
}

function showUserEmail(email) {
    const userInfo = document.getElementById('userInfo');
    const displayEmail = document.getElementById('displayEmail');

    displayEmail.textContent = email;
    userInfo.style.display = 'block';
}

function hideUserEmail() {
    const userInfo = document.getElementById('userInfo');
    userInfo.style.display = 'none';
}

async function initApp() {
    showEmailModal();
}

async function initVoting() {
    try {
        await fetchIdeas();
        renderIdeas();
        updateUI();
    } catch (error) {
        console.error('Error initializing voting:', error);
        alert('Error loading ideas. Please refresh the page.');
    }
}

async function fetchIdeas() {
    const response = await fetch(`${API_BASE_URL}/ideas`);
    if (!response.ok) {
        throw new Error('Failed to fetch ideas');
    }
    ideas = await response.json();
}

function renderIdeas() {
    const ideasGrid = document.getElementById('ideasGrid');
    ideasGrid.innerHTML = '';

    const sortedIdeas = [...ideas].sort((a, b) => {
        if (a.score === null && b.score === null) return 0;
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return b.score - a.score;
    });

    sortedIdeas.forEach((idea) => {
        const ideaCard = document.createElement('div');
        ideaCard.className = `idea-card ${idea.score !== null ? 'scored' : ''}`;
        ideaCard.setAttribute('data-idea-id', idea.id);

        const scoreButtons = [0, 1, 2].map(score => {
            const isActive = idea.score === score;
            const canAssign = canAssignScore(score, idea.id);
            const canChange = idea.score !== null && idea.score !== score;
            const isDisabled = !isActive && !canChange && !canAssign;

            return `
                <button class="score-button ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}"
                        data-score="${score}"
                        ${isDisabled ? 'disabled' : ''}
                        onclick="assignScore(${idea.id}, ${score})">
                    ${score}
                </button>
            `;
        }).join('');

        ideaCard.innerHTML = `
            <div class="idea-title">${idea.title}</div>
            <div class="idea-description">${idea.description}</div>
            <div class="score-controls">
                ${scoreButtons}
            </div>
            <div class="score-status">
                ${idea.score !== null ?
                    `Score: ${idea.score} (click to change or remove)` :
                    'Select a score (0-2)'}
            </div>
        `;

        ideasGrid.appendChild(ideaCard);
    });
}

function canAssignScore(score, ideaId = null) {
    const totalIdeas = ideas.length;
    const currentScores = ideas.map(idea => idea.score);

    if (score === 0) return true;

    // If we're checking for a specific idea, temporarily remove its current score from the count
    let adjustedScores = [...currentScores];
    if (ideaId !== null) {
        const ideaIndex = ideas.findIndex(i => i.id === ideaId);
        if (ideaIndex !== -1) {
            adjustedScores[ideaIndex] = null; // Temporarily remove current score
        }
    }

    if (score === 1) {
        const currentScore1Count = adjustedScores.filter(s => s === 1).length;
        const maxScore1Allowed = Math.floor(totalIdeas * MAX_SCORE_1_PERCENTAGE);
        return currentScore1Count < maxScore1Allowed;
    }

    if (score === 2) {
        const currentScore2Count = adjustedScores.filter(s => s === 2).length;
        const maxScore2Allowed = Math.floor(totalIdeas * MAX_SCORE_2_PERCENTAGE);
        return currentScore2Count < maxScore2Allowed;
    }

    return false;
}

function assignScore(ideaId, score) {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    if (idea.score === score) {
        idea.score = null;
        renderIdeas();
        updateUI();
        return;
    }

    // Always check constraints when assigning any score (new or changing existing)
    if (!canAssignScore(score, ideaId)) {
        const totalIdeas = ideas.length;
        if (score === 1) {
            const maxAllowed = Math.floor(totalIdeas * MAX_SCORE_1_PERCENTAGE);
            alert(`You can only assign score 1 to ${maxAllowed} ideas (${MAX_SCORE_1_PERCENTAGE * 100}% of total). To assign more score 1, first remove a score 1 from another idea.`);
        } else if (score === 2) {
            const maxAllowed = Math.floor(totalIdeas * MAX_SCORE_2_PERCENTAGE);
            alert(`You can only assign score 2 to ${maxAllowed} ideas (${MAX_SCORE_2_PERCENTAGE * 100}% of total). To assign more score 2, first remove a score 2 from another idea.`);
        }
        return;
    }

    idea.score = score;
    renderIdeas();
    updateUI();
}

function moveIdeaToRankedPosition(ideaCard, rank) {
    const ideasGrid = document.getElementById('ideasGrid');

    ideaCard.className = 'idea-card fade-in-up ranked';
    const ideaData = ideas.find(i => i.id === parseInt(ideaCard.getAttribute('data-idea-id')));
    ideaCard.innerHTML = `
        <div class="rank-badge">${rank}</div>
        <div class="drag-handle" title="Drag to reorder this idea">⇅</div>
        <div class="idea-title">${ideaData.title}</div>
        <div class="idea-description">${ideaData.description}</div>
            <div style="margin-top: 16px; font-size: 0.875rem; color: #10b981; font-weight: 500;">
                ✓ Ranked #${rank} - Click card to unrank • Drag ⇅ to reorder
            </div>
    `;

    const allCards = Array.from(ideasGrid.children);
    const rankedCards = allCards.filter(card => card.classList.contains('ranked'));
    const unrankedCards = allCards.filter(card => !card.classList.contains('ranked'));

    let insertIndex = 0;
    for (let i = 0; i < rankedCards.length; i++) {
        const cardRank = parseInt(rankedCards[i].querySelector('.rank-badge')?.textContent || '0');
        if (cardRank > rank) {
            break;
        }
        insertIndex = i + 1;
    }

    ideaCard.remove();
    if (insertIndex < rankedCards.length) {
        ideasGrid.insertBefore(ideaCard, rankedCards[insertIndex]);
    } else if (unrankedCards.length > 0) {
        ideasGrid.insertBefore(ideaCard, unrankedCards[0]);
    } else {
        ideasGrid.appendChild(ideaCard);
    }

    ideaCard.style.transition = 'all 0.3s ease';
    ideaCard.classList.add('moving');
    setTimeout(() => {
        ideaCard.classList.remove('moving');
    }, 300);
}

function moveIdeaToUnrankedPosition(ideaCard) {
    const ideasGrid = document.getElementById('ideasGrid');

    ideaCard.className = 'idea-card fade-in-up';
    const ideaData = ideas.find(i => i.id === parseInt(ideaCard.getAttribute('data-idea-id')));
    ideaCard.innerHTML = `
        <div class="idea-title">${ideaData.title}</div>
        <div class="idea-description">${ideaData.description}</div>
        <div style="margin-top: 16px; font-size: 0.875rem; color: #64748b; font-weight: 500;">
            Click to rank this idea
        </div>
    `;

    const allCards = Array.from(ideasGrid.children);
    const unrankedCards = allCards.filter(card => !card.classList.contains('ranked'));

    ideaCard.remove();
    if (unrankedCards.length > 0) {
        ideasGrid.insertBefore(ideaCard, unrankedCards[unrankedCards.length - 1].nextSibling);
    } else {
        ideasGrid.appendChild(ideaCard);
    }

    ideaCard.style.transition = 'all 0.3s ease';
    ideaCard.classList.add('moving');
    setTimeout(() => {
        ideaCard.classList.remove('moving');
    }, 300);
}

function updateRemainingRankedCards() {
    const ideasGrid = document.getElementById('ideasGrid');
    const rankedCards = Array.from(ideasGrid.children).filter(card => card.classList.contains('ranked'));

    rankedCards.forEach((card, index) => {
        const ideaId = parseInt(card.getAttribute('data-idea-id'));
        const newRank = index + 1;

        const idea = ideas.find(i => i.id === ideaId);
        if (idea) {
            idea.rank = newRank;
        }

        const rankingIndex = userRankings.findIndex(r => r.ideaId === ideaId);
        if (rankingIndex !== -1) {
            userRankings[rankingIndex].rank = newRank;
        }

        const rankBadge = card.querySelector('.rank-badge');
        if (rankBadge) {
            rankBadge.textContent = newRank;
        }

        const rankText = card.querySelector('div[style*="margin-top: 16px"]');
        if (rankText) {
            rankText.innerHTML = `✓ Ranked #${newRank} - Click card to unrank • Drag ⇅ to reorder`;
        }
    });
}

async function submitVote() {
    const scoredCount = ideas.filter(idea => idea.score !== null).length;
    const totalIdeas = ideas.length;

    if (scoredCount !== totalIdeas) {
        alert(`Please score all ${totalIdeas} ideas before submitting! Currently scored: ${scoredCount}/${totalIdeas}`);
        return;
    }

    if (hasSubmitted) {
        alert('Vote already submitted!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/submit-vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail, ideas: ideas })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Vote submitted successfully:', result);

            // Also save the scores for this user
            try {
                await fetch(`${API_BASE_URL}/save-scores`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: userEmail, ideas: ideas })
                });
            } catch (saveError) {
                console.error('Error saving scores:', saveError);
                // Don't show error to user since vote was successful
            }

            alert('Vote submitted successfully!');
            hasSubmitted = true;
            updateUI();
        } else {
            alert(`Error submitting vote: ${result.error}`);
        }
    } catch (error) {
        console.error('Error submitting vote:', error);
        alert('Error submitting vote. Please try again.');
    }
}

function resetScoring() {
    hasSubmitted = false;

    ideas.forEach(idea => {
        idea.score = null;
    });

    updateUI();
}

function updateUI() {
    const scoredCount = ideas.filter(idea => idea.score !== null).length;
    const totalIdeas = ideas.length;

    document.getElementById('ideasRanked').textContent = scoredCount;
    document.getElementById('totalIdeas').textContent = totalIdeas;

    const progress = (scoredCount / totalIdeas) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;

    const submitBtn = document.getElementById('submitVoteBtn');
    submitBtn.disabled = scoredCount !== totalIdeas || hasSubmitted;
    submitBtn.textContent = hasSubmitted ? 'Vote Submitted' : 'Submit Vote';

    updateScoreCounts();
}

function updateScoreCounts() {
    const scoreCounts = { 0: 0, 1: 0, 2: 0 };
    ideas.forEach(idea => {
        if (idea.score !== null) {
            scoreCounts[idea.score]++;
        }
    });

    const totalIdeas = ideas.length;
    const maxScore2 = Math.floor(totalIdeas * MAX_SCORE_2_PERCENTAGE);
    const maxScore1 = Math.floor(totalIdeas * MAX_SCORE_1_PERCENTAGE);

    console.log('Score distribution:', scoreCounts);
    console.log(`Limits - Score 2: ${scoreCounts[2]}/${maxScore2}, Score 1: ${scoreCounts[1]}/${maxScore1}`);
}



async function fetchResults() {
    try {
        const response = await fetch(`${API_BASE_URL}/results`);
        if (!response.ok) {
            throw new Error('Failed to fetch results');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching results:', error);
        throw error;
    }
}

async function toggleResults() {
    const resultsSection = document.getElementById('resultsSection');

    if (resultsSection.style.display === 'none') {
        try {
            const results = await fetchResults();
            displayResults(results);
            resultsSection.style.display = 'block';
        } catch (error) {
            alert('Error loading results. Please try again.');
        }
    } else {
        resultsSection.style.display = 'none';
    }
}

function displayResults(results) {
    document.getElementById('totalVotes').textContent = results.total_votes;
    document.getElementById('avgScore2').textContent = results.score_distributions[2] || 0;
    document.getElementById('avgScore1').textContent = results.score_distributions[1] || 0;
    document.getElementById('avgScore0').textContent = results.score_distributions[0] || 0;

    const averageScoresList = document.getElementById('averageScoresList');
    averageScoresList.innerHTML = '';

    if (Object.keys(results.average_scores).length === 0) {
        averageScoresList.innerHTML = '<p>No votes submitted yet.</p>';
        return;
    }

    const sortedIdeas = Object.entries(results.average_scores)
        .sort(([,a], [,b]) => b - a)
        .map(([id, avg]) => {
            const idea = ideas.find(i => i.id == id);
            return {
                id: parseInt(id),
                title: idea ? idea.title : `Idea ${id}`,
                average: avg
            };
        });

    sortedIdeas.forEach(idea => {
        const ideaElement = document.createElement('div');
        ideaElement.className = 'average-score-item';
        ideaElement.innerHTML = `
            <div class="idea-title">${idea.title}</div>
            <div class="average-score">${idea.average.toFixed(2)}</div>
        `;
        averageScoresList.appendChild(ideaElement);
    });
}



document.getElementById('submitVoteBtn').addEventListener('click', submitVote);
document.getElementById('emailForm').addEventListener('submit', handleEmailSubmit);

initApp();
