let ideas = [];
let originalIdeas = []; // Store original ideas for final results
let hasSubmitted = false;
let userEmail = null;
let currentRound = 1;
let votingGroups = []; // Array of groups to vote on
let currentGroupIndex = 0;
let finalResults = []; // Store final cumulative scores
let isVotingComplete = false;

const MAX_SCORE_2_PERCENTAGE = 0.2;
const MAX_SCORE_1_PERCENTAGE = 0.4;
const API_BASE_URL = 'http://localhost:8080';

function showEmailModal() {
    const modal = document.getElementById('emailModal');
    modal.classList.add('show');
}

function hideEmailModal() {
    const modal = document.getElementById('emailModal');
    modal.classList.remove('show');
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

    let email = emailInput.value.trim();

    if (!email) {
        emailError.textContent = 'Please enter an email address.';
        emailError.style.display = 'block';
        return;
    }

    emailError.style.display = 'none';
    submitButton.disabled = true;
    submitButton.textContent = 'Validating...';

    const validationResult = await validateUserEmail(email);

    if (validationResult.valid) {
        userEmail = validationResult.email;
        email = validationResult.email;
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
        const idea = ideas.find(i => i.id === savedScore.id);
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
        originalIdeas = [...ideas]; // Store original ideas for final results

        // Initialize Round 1 - vote on all ideas with quotas
        votingGroups = [{
            round: 1,
            ideas: [...ideas],
            groupType: 'round1_all',
            hasQuotas: true // Enable quotas for Round 1
        }];

        currentRound = 1;
        currentGroupIndex = 0;
        isVotingComplete = false;
        round1Results = [];

        renderIdeas();
        updateUI();
        window.scrollTo(0, 0);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error('Error initializing voting:', error);
        alert('Error loading ideas. Please refresh the page.');
    }
}

async function fetchIdeas() {
    const url = userEmail ? `${API_BASE_URL}/ideas?email=${encodeURIComponent(userEmail)}` : `${API_BASE_URL}/ideas`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch ideas');
    }
    ideas = await response.json();
}

function renderIdeas() {
    const ideasGrid = document.getElementById('ideasGrid');
    ideasGrid.innerHTML = '';

    if (isVotingComplete) {
        renderFinalResults();
        return;
    }

    const currentGroup = votingGroups[currentGroupIndex];
    const currentIdeas = currentGroup.ideas;

    const sortedIdeas = [...currentIdeas].sort((a, b) => {
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

        const previousScoreDisplay = currentGroup.previousScore > 0 ?
            ` (Previous: ${currentGroup.previousScore})` : '';

        ideaCard.innerHTML = `
            <div class="idea-title">${idea.title}</div>
            <div class="idea-description">${idea.description}</div>
            <div class="score-controls">
                ${scoreButtons}
            </div>
            <div class="score-status">
                ${idea.score !== null ?
                `Score: ${idea.score}${previousScoreDisplay} (click to change or remove)` :
                `Select a score (0-2)${previousScoreDisplay}`}
            </div>
        `;

        ideasGrid.appendChild(ideaCard);
    });
}

function renderFinalResults() {
    const ideasGrid = document.getElementById('ideasGrid');
    ideasGrid.innerHTML = '';

    finalResults.forEach((result, index) => {
        const resultCard = document.createElement('div');
        resultCard.className = 'idea-card final-result';

        const scoreBreakdown = result.finalScore > 0 ?
            `<small>Round 1: ${result.round1Score} | Round 2: ${result.round2Score} | Round 3: ${result.round3Score}</small>` :
            `<small>Eliminated in Round 1</small>`;

        resultCard.innerHTML = `
            <div class="rank-badge">#${index + 1}</div>
            <div class="idea-title">${result.title}</div>
            <div class="idea-description">${result.description}</div>
            <div class="final-score">
                <strong>Final Score: ${result.finalScore}</strong>
                <br>${scoreBreakdown}
            </div>
        `;

        ideasGrid.appendChild(resultCard);
    });
}

function canAssignScore(score, ideaId = null) {
    const currentGroup = votingGroups[currentGroupIndex];
    const currentIdeas = currentGroup.ideas;
    const totalIdeas = currentIdeas.length;
    const currentScores = currentIdeas.map(idea => idea.score);

    // No quotas for Round 2 and Round 3
    if (!currentGroup.hasQuotas) {
        return true;
    }

    if (score === 0) return true;

    // If we're checking for a specific idea, temporarily remove its current score from the count
    let adjustedScores = [...currentScores];
    if (ideaId !== null) {
        const ideaIndex = currentIdeas.findIndex(i => i.id === ideaId);
        if (ideaIndex !== -1) {
            adjustedScores[ideaIndex] = null; // Temporarily remove current score
        }
    }

    if (score === 1) {
        const currentScore1Count = adjustedScores.filter(s => s === 1).length;
        const maxScore1Allowed = Math.ceil(totalIdeas * MAX_SCORE_1_PERCENTAGE);
        return currentScore1Count < maxScore1Allowed;
    }

    if (score === 2) {
        const currentScore2Count = adjustedScores.filter(s => s === 2).length;
        const maxScore2Allowed = Math.ceil(totalIdeas * MAX_SCORE_2_PERCENTAGE);
        return currentScore2Count < maxScore2Allowed;
    }

    return false;
}

function assignScore(ideaId, score) {
    const currentGroup = votingGroups[currentGroupIndex];
    const currentIdeas = currentGroup.ideas;
    const idea = currentIdeas.find(i => i.id === ideaId);
    if (!idea) return;

    if (idea.score === score) {
        idea.score = null;
        renderIdeas();
        updateUI();
        return;
    }

    // Always check constraints when assigning any score (new or changing existing)
    if (!canAssignScore(score, ideaId)) {
        const totalIdeas = currentIdeas.length;
        if (score === 1) {
            const maxAllowed = Math.ceil(totalIdeas * MAX_SCORE_1_PERCENTAGE);
            alert(`You can only assign score 1 to ${maxAllowed} ideas (${MAX_SCORE_1_PERCENTAGE * 100}% of total). To assign more score 1, first remove a score 1 from another idea.`);
        } else if (score === 2) {
            const maxAllowed = Math.ceil(totalIdeas * MAX_SCORE_2_PERCENTAGE);
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

function submitVote() {
    if (isVotingComplete) {
        return;
    }

    const currentGroup = votingGroups[currentGroupIndex];
    const currentIdeas = currentGroup.ideas;
    const scoredCount = currentIdeas.filter(idea => idea.score !== null).length;
    const totalIdeas = currentIdeas.length;

    if (scoredCount !== totalIdeas) {
        alert(`Please score all ${totalIdeas} ideas before proceeding! Currently scored: ${scoredCount}/${totalIdeas}`);
        return;
    }

    // Process current round results
    processRoundResults();

    // Handle round progression based on current round
    if (currentRound === 1) {
        // Round 1 completed - store results and create Round 2 groups
        round1Results = currentIdeas.map(idea => ({
            ...idea,
            round1Score: idea.score
        }));

        const round2Groups = createRound2Groups();
        if (round2Groups.length > 0) {
            votingGroups = round2Groups;
            currentRound = 2;
            currentGroupIndex = 0;
        } else {
            // No ideas survived Round 1, complete voting
            completeVoting();
            return;
        }
    } else if (currentRound === 2) {
        // Check if all Round 2 groups are completed
        if (currentGroupIndex < votingGroups.length - 1) {
            // Move to next group in Round 2
            currentGroupIndex++;
        } else {
            // Round 2 completed - save all Round 2 results and create Round 3 groups
            saveRound2Results();

            const round3Groups = createRound3Groups();
            if (round3Groups.length > 0) {
                votingGroups = round3Groups;
                currentRound = 3;
                currentGroupIndex = 0;
            } else {
                // No groups qualify for Round 3, but all Round 2 results are saved
                completeVoting();
                return;
            }
        }
    } else if (currentRound === 3) {
        // Check if all Round 3 groups are completed
        if (currentGroupIndex < votingGroups.length - 1) {
            // Move to next group in Round 3
            currentGroupIndex++;
        } else {
            // Round 3 completed - show final results
            completeVoting();
            return;
        }
    }

    renderIdeas();
    updateUI();

    // Scroll to top
    window.scrollTo(0, 0);
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function processRoundResults() {
    const currentGroup = votingGroups[currentGroupIndex];
    const currentIdeas = currentGroup.ideas;

    if (currentRound === 1) {
        // Round 1: Store scores for grouping
        currentIdeas.forEach(idea => {
            if (idea.score !== null) {
                idea.cumulativeScore = idea.score;
            }
        });
    } else if (currentRound === 2) {
        // Round 2: Add Round 2 score to Round 1 score
        currentIdeas.forEach(idea => {
            if (idea.score !== null) {
                // Find the original idea to get Round 1 score
                const originalIdea = round1Results.find(r => r.id === idea.id);
                const round1Score = originalIdea ? originalIdea.round1Score : 0;
                idea.cumulativeScore = round1Score + idea.score;
            }
        });
    } else if (currentRound === 3) {
        // Round 3: Add Round 3 score to existing cumulative score
        currentIdeas.forEach(idea => {
            if (idea.score !== null) {
                idea.cumulativeScore = (idea.cumulativeScore || 0) + idea.score;
            }
        });
    }
}

function createRound2Groups() {
    const newGroups = [];

    // Group Round 1 results by score (only 2 and 1, eliminate 0/no vote)
    const scoreGroups = { 2: [], 1: [] };

    round1Results.forEach(idea => {
        const score = idea.round1Score;
        if (score === 2 || score === 1) {
            scoreGroups[score].push({
                ...idea,
                score: null, // Reset score for Round 2 voting
                cumulativeScore: score // Keep Round 1 score
            });
        }
        // Ideas with score 0 or null are eliminated
    });

    // Create groups for Round 2 (no quotas)
    [2, 1].forEach(score => {
        if (scoreGroups[score].length > 0) {
            newGroups.push({
                round: 2,
                ideas: scoreGroups[score],
                groupType: `round2_score_${score}`,
                hasQuotas: false, // No quotas for Round 2
                round1Score: score
            });
        }
    });

    return newGroups;
}

function saveRound2Results() {
    // Update round1Results with accumulated scores from Round 2
    votingGroups.forEach(group => {
        group.ideas.forEach(idea => {
            if (idea.cumulativeScore !== undefined) {
                // Find the corresponding idea in round1Results and update it
                const round1Idea = round1Results.find(r => r.id === idea.id);
                if (round1Idea) {
                    round1Idea.cumulativeScore = idea.cumulativeScore;
                    round1Idea.round2Score = idea.cumulativeScore - round1Idea.round1Score;
                }
            }
        });
    });
}

function createRound3Groups() {
    const newGroups = [];

    // Get all ideas with their current cumulative scores
    const allIdeas = [];
    votingGroups.forEach(group => {
        group.ideas.forEach(idea => {
            if (idea.cumulativeScore !== undefined) {
                allIdeas.push(idea);
            }
        });
    });

    // Group by cumulative score, only include scores >= 3
    const scoreGroups = {};
    allIdeas.forEach(idea => {
        const score = idea.cumulativeScore;
        if (score >= 3) {
            if (!scoreGroups[score]) {
                scoreGroups[score] = [];
            }
            scoreGroups[score].push({
                ...idea,
                score: null // Reset score for Round 3 voting
            });
        }
    });

    // Create groups for Round 3 (no quotas), sorted by score descending
    const sortedScores = Object.keys(scoreGroups)
        .map(key => parseInt(key))
        .sort((a, b) => b - a);

    sortedScores.forEach(score => {
        if (scoreGroups[score].length > 0) {
            newGroups.push({
                round: 3,
                ideas: scoreGroups[score],
                groupType: `round3_score_${score}`,
                hasQuotas: false, // No quotas for Round 3
                cumulativeScore: score
            });
        }
    });

    return newGroups;
}

function completeVoting() {
    isVotingComplete = true;

    // Collect final results from all original ideas with their total accumulated scores
    finalResults = originalIdeas.map(originalIdea => {
        // Find the idea in Round 1 results first
        const round1Idea = round1Results.find(idea => idea.id === originalIdea.id);

        if (!round1Idea || round1Idea.round1Score === 0) {
            // Idea was eliminated in Round 1 (score 0 or no score)
            return {
                id: originalIdea.id,
                title: originalIdea.title,
                description: originalIdea.description,
                finalScore: 0,
                round1Score: 0,
                round2Score: 0,
                round3Score: 0
            };
        }

        // Get the accumulated score from Round 1 + Round 2 (saved in round1Results)
        const round2Score = round1Idea.round2Score || 0;
        const round1Score = round1Idea.round1Score;
        let finalScore = round1Score + round2Score;

        // If we have Round 3 results, add them too
        let round3Score = 0;
        if (currentRound === 3) {
            const round3Idea = votingGroups.flatMap(group => group.ideas)
                .find(idea => idea.id === originalIdea.id);
            if (round3Idea && round3Idea.score !== null) {
                round3Score = round3Idea.score;
                finalScore += round3Score;
            }
        }

        return {
            id: originalIdea.id,
            title: originalIdea.title,
            description: originalIdea.description,
            finalScore: finalScore,
            round1Score: round1Score,
            round2Score: round2Score,
            round3Score: round3Score
        };
    }).sort((a, b) => b.finalScore - a.finalScore);

    renderIdeas();
    updateUI();
}

function resetScoring() {
    hasSubmitted = false;
    currentRound = 1;
    votingGroups = [];
    currentGroupIndex = 0;
    finalResults = [];
    isVotingComplete = false;
    round1Results = [];

    // Reset all ideas
    ideas.forEach(idea => {
        idea.score = null;
        delete idea.cumulativeScore;
        delete idea.round1Score;
    });

    // Reinitialize voting
    initVoting();
}

function updateUI() {
    if (isVotingComplete) {
        updateFinalResultsUI();
        return;
    }

    const currentGroup = votingGroups[currentGroupIndex];
    const currentIdeas = currentGroup.ideas;
    const scoredCount = currentIdeas.filter(idea => idea.score !== null).length;
    const totalIdeas = currentIdeas.length;

    document.getElementById('totalIdeas').textContent = totalIdeas;

    const progress = (scoredCount / totalIdeas) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;

    const submitBtn = document.getElementById('submitVoteBtn');
    submitBtn.disabled = scoredCount !== totalIdeas;
    submitBtn.textContent = scoredCount === totalIdeas ? 'Next Round' : 'Complete All Scores';

    updateScoreCounts();
    updateRoundInfo();
}

function updateScoreCounts() {
    const currentGroup = votingGroups[currentGroupIndex];
    const currentIdeas = currentGroup.ideas;
    const scoreCounts = { 0: 0, 1: 0, 2: 0 };
    currentIdeas.forEach(idea => {
        if (idea.score !== null) {
            scoreCounts[idea.score]++;
        }
    });
}

function updateRoundInfo() {
    const roundInfoElement = document.getElementById('roundInfo');
    const headerText = document.querySelector('.header p');
    const currentGroup = votingGroups[currentGroupIndex];

    let roundText = `Round ${currentRound}`;

    if (currentRound === 1) {
        roundText += `: Score all ideas (2, 1, or 0)`;
    } else if (currentRound === 2) {
        const round1Score = currentGroup.round1Score;
        roundText += `: Ideas that were previously scored with ${round1Score}`;
    } else if (currentRound === 3) {
        const cumulativeScore = currentGroup.cumulativeScore;
        roundText += `: Ideas with cumulative score ${cumulativeScore}`;
    }

    roundInfoElement.textContent = roundText;
    roundInfoElement.style.display = 'block';
    headerText.textContent = 'Multi-round elimination voting in progress...';
}

function updateFinalResultsUI() {
    const survivingIdeas = finalResults.filter(result => result.finalScore > 0).length;
    document.getElementById('totalIdeas').textContent = originalIdeas.length;
    document.getElementById('progressFill').style.width = '100%';

    const submitBtn = document.getElementById('submitVoteBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Voting Complete';

    const roundInfoElement = document.getElementById('roundInfo');
    roundInfoElement.style.display = 'none';

    const headerText = document.querySelector('.header p');
    headerText.textContent = `Voting Complete - ${survivingIdeas} ideas survived 3 rounds of elimination`;
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
    // Display total points instead of counts (count × score value)
    document.getElementById('avgScore2').textContent = ((results.score_distributions[2] || 0) * 2);
    document.getElementById('avgScore1').textContent = ((results.score_distributions[1] || 0) * 1);
    document.getElementById('avgScore0').textContent = ((results.score_distributions[0] || 0) * 0);

    const averageScoresList = document.getElementById('averageScoresList');
    averageScoresList.innerHTML = '';

    if (Object.keys(results.average_scores).length === 0) {
        averageScoresList.innerHTML = '<p>No votes submitted yet.</p>';
        return;
    }

    const sortedIdeas = Object.entries(results.average_scores)
        .sort(([, a], [, b]) => b - a)
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
