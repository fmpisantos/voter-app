let ideas = [];
let hasSubmitted = false;

// Scoring constraints
const MAX_SCORE_2_PERCENTAGE = 0.4; // 40%
const MAX_SCORE_1_PERCENTAGE = 0.3; // 30%

function initVoting() {
    createIdeas();
    renderIdeas();
    updateUI();
}

function createIdeas() {
    const ideaTemplates = [
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
    ];

    ideas = ideaTemplates.map((title, index) => ({
        id: index + 1,
        title: title,
        description: `A comprehensive solution for ${title.toLowerCase()}.`,
        score: null
    }));
}

function renderIdeas() {
    const ideasGrid = document.getElementById('ideasGrid');
    ideasGrid.innerHTML = '';

    // Sort ideas by score (highest first) for better organization
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
            const isDisabled = !canAssignScore(score);
            const isActive = idea.score === score;
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
            ${idea.score !== null ? `<div class="score-badge">${idea.score}</div>` : ''}
            <div class="idea-title">${idea.title}</div>
            <div class="idea-description">${idea.description}</div>
            <div class="score-controls">
                ${scoreButtons}
            </div>
            <div class="score-status">
                ${idea.score !== null ?
                    `Score: ${idea.score}` :
                    'Select a score (0-2)'}
            </div>
        `;

        ideasGrid.appendChild(ideaCard);
    });
}

function canAssignScore(score) {
    const totalIdeas = ideas.length;
    const currentScores = ideas.map(idea => idea.score);

    if (score === 0) return true; // No limit on score 0

    if (score === 1) {
        const currentScore1Count = currentScores.filter(s => s === 1).length;
        const maxScore1Allowed = Math.floor(totalIdeas * MAX_SCORE_1_PERCENTAGE);
        return currentScore1Count < maxScore1Allowed;
    }

    if (score === 2) {
        const currentScore2Count = currentScores.filter(s => s === 2).length;
        const maxScore2Allowed = Math.floor(totalIdeas * MAX_SCORE_2_PERCENTAGE);
        return currentScore2Count < maxScore2Allowed;
    }

    return false;
}

function assignScore(ideaId, score) {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    // If trying to assign the same score, remove it
    if (idea.score === score) {
        idea.score = null;
        renderIdeas();
        updateUI();
        return;
    }

    // Check if we can assign this score
    if (!canAssignScore(score)) {
        const totalIdeas = ideas.length;
        if (score === 1) {
            const maxAllowed = Math.floor(totalIdeas * MAX_SCORE_1_PERCENTAGE);
            alert(`You can only assign score 1 to ${maxAllowed} ideas (${MAX_SCORE_1_PERCENTAGE * 100}% of total).`);
        } else if (score === 2) {
            const maxAllowed = Math.floor(totalIdeas * MAX_SCORE_2_PERCENTAGE);
            alert(`You can only assign score 2 to ${maxAllowed} ideas (${MAX_SCORE_2_PERCENTAGE * 100}% of total).`);
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

    const scores = ideas.map(idea => ({ ideaId: idea.id, score: idea.score }));
    console.log('Submitting scores:', scores);
    alert('Vote submitted successfully! (This is a placeholder - actual server submission not implemented)');

    hasSubmitted = true;
    updateUI();
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

    // Update stats
    document.getElementById('ideasRanked').textContent = scoredCount;
    document.getElementById('totalIdeas').textContent = totalIdeas;

    const progress = (scoredCount / totalIdeas) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;

    // Update submit button
    const submitBtn = document.getElementById('submitVoteBtn');
    submitBtn.disabled = scoredCount !== totalIdeas || hasSubmitted;
    submitBtn.textContent = hasSubmitted ? 'Vote Submitted' : 'Submit Vote';

    // Update score counts display
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

    // You could add a display for these counts if needed
    console.log('Score distribution:', scoreCounts);
    console.log(`Limits - Score 2: ${scoreCounts[2]}/${maxScore2}, Score 1: ${scoreCounts[1]}/${maxScore1}`);
}



document.getElementById('submitVoteBtn').addEventListener('click', submitVote);
document.getElementById('resetBtn').addEventListener('click', resetScoring);

initVoting();
