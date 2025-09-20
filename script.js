let ideas = [];
let userRankings = [];
let hasSubmitted = false;
let draggedElement = null;
let dragClone = null;
let dragOffset = { x: 0, y: 0 };

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
        rank: null
    }));
}

function renderIdeas() {
    const ideasGrid = document.getElementById('ideasGrid');
    ideasGrid.innerHTML = '';

    const rankedIdeas = ideas.filter(idea => idea.rank !== null);
    const unrankedIdeas = ideas.filter(idea => idea.rank === null);

    rankedIdeas.sort((a, b) => a.rank - b.rank);
    rankedIdeas.forEach((idea, _index) => {
        const ideaCard = document.createElement('div');
        ideaCard.className = 'idea-card ranked';
        ideaCard.setAttribute('data-idea-id', idea.id);
        ideaCard.onclick = (e) => {
            if (draggedElement || e.target.classList.contains('drag-handle')) return;
            rankIdea(idea.id);
        };

        ideaCard.innerHTML = `
            <div class="rank-badge">${idea.rank}</div>
            <div class="drag-handle" title="Drag to reorder this idea">⇅</div>
            <div class="idea-title">${idea.title}</div>
            <div class="idea-description">${idea.description}</div>
            <div style="margin-top: 16px; font-size: 0.875rem; color: #10b981; font-weight: 500;">
                ✓ Ranked #${idea.rank} - Click card to unrank • Drag ⇅ to reorder
            </div>
        `;

        const dragHandle = ideaCard.querySelector('.drag-handle');
        if (dragHandle) {
            dragHandle.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            dragHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                startCustomDrag(e, ideaCard);
            });
        }

        ideasGrid.appendChild(ideaCard);
    });

    unrankedIdeas.forEach((idea, _index) => {
        const ideaCard = document.createElement('div');
        ideaCard.className = 'idea-card ';
        ideaCard.setAttribute('data-idea-id', idea.id);
        ideaCard.onclick = () => rankIdea(idea.id);
        ideaCard.innerHTML = `
            <div class="idea-title">${idea.title}</div>
            <div class="idea-description">${idea.description}</div>
            <div style="margin-top: 16px; font-size: 0.875rem; color: #64748b; font-weight: 500;">
                Click to rank this idea
            </div>
        `;
        ideasGrid.appendChild(ideaCard);
    });
}

function rankIdea(ideaId) {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    if (idea.rank !== null) {
        unrankIdea(ideaId);
        return;
    }

    const currentRank = userRankings.length + 1;
    idea.rank = currentRank;
    userRankings.push({ ideaId, rank: currentRank });

    const ideaCard = document.querySelector(`[data-idea-id="${ideaId}"]`);
    if (ideaCard) {
        moveIdeaToRankedPosition(ideaCard, currentRank);
    }

    updateUI();
}

function unrankIdea(ideaId) {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea || idea.rank === null) return;

    const removedRank = idea.rank;
    userRankings = userRankings.filter(r => r.ideaId !== ideaId);
    ideas.forEach(otherIdea => {
        if (otherIdea.rank > removedRank) {
            otherIdea.rank -= 1;
        }
    });

    idea.rank = null;
    const ideaCard = document.querySelector(`[data-idea-id="${ideaId}"]`);
    if (ideaCard) {
        moveIdeaToUnrankedPosition(ideaCard);
    }
    updateRemainingRankedCards();

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
    if (userRankings.length === 0) {
        alert('Please rank at least one idea before submitting!');
        return;
    }

    if (hasSubmitted) {
        alert('Vote already submitted!');
        return;
    }

    console.log('Submitting vote:', userRankings);
    alert('Vote submitted successfully! (This is a placeholder - actual server submission not implemented)');

    hasSubmitted = true;
    updateUI();
}

function resetRanking() {
    userRankings = [];
    hasSubmitted = false;

    ideas.forEach(idea => {
        idea.rank = null;
    });

    updateUI();
}

function updateUI() {
    const rankedCount = userRankings.length;
    const totalIdeas = ideas.length;
    document.getElementById('ideasRanked').textContent = rankedCount;
    document.getElementById('totalIdeas').textContent = totalIdeas;

    const progress = (rankedCount / totalIdeas) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;

    const submitBtn = document.getElementById('submitVoteBtn');
    submitBtn.disabled = rankedCount === 0 || hasSubmitted;
    submitBtn.textContent = hasSubmitted ? 'Vote Submitted' : 'Submit Vote';
    renderIdeas();
}

function startCustomDrag(e, cardElement) {
    draggedElement = cardElement;
    draggedElement.classList.add('dragging');

    const handle = draggedElement.querySelector('.drag-handle');
    if (handle) {
        handle.classList.add('dragging');
    }

    dragClone = cardElement.cloneNode(true);
    dragClone.classList.add('drag-clone');
    dragClone.classList.remove('dragging');
    dragClone.style.position = 'fixed';
    dragClone.style.pointerEvents = 'none';
    dragClone.style.zIndex = '1000';
    dragClone.style.opacity = '0.8';
    dragClone.style.transform = 'rotate(5deg)';

    const rect = cardElement.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    dragClone.style.left = (e.clientX - dragOffset.x) + 'px';
    dragClone.style.top = (e.clientY - dragOffset.y) + 'px';

    document.body.appendChild(dragClone);

    cardElement.style.opacity = '0.3';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    e.preventDefault();
}

function handleMouseMove(e) {
    if (dragClone) {
        dragClone.style.left = (e.clientX - dragOffset.x) + 'px';
        dragClone.style.top = (e.clientY - dragOffset.y) + 'px';
    }

    const target = document.elementFromPoint(e.clientX, e.clientY);
    const dropTarget = target ? target.closest('.idea-card') : null;

    document.querySelectorAll('.idea-card').forEach(card => {
        card.classList.remove('drag-over');
    });

    if (dropTarget && dropTarget !== draggedElement && draggedElement && draggedElement.classList.contains('ranked') && dropTarget.classList.contains('ranked')) {
        dropTarget.classList.add('drag-over');
    }
}

function handleMouseUp(e) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const dropTarget = target ? target.closest('.idea-card') : null;

    if (dropTarget && dropTarget !== draggedElement && draggedElement.classList.contains('ranked') && dropTarget.classList.contains('ranked')) {
        performCustomDrop(draggedElement, dropTarget);
    }

    if (dragClone) {
        document.body.removeChild(dragClone);
        dragClone = null;
    }

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    if (draggedElement) {
        draggedElement.style.opacity = '';
        draggedElement.classList.remove('dragging');

        const handle = draggedElement.querySelector('.drag-handle');
        if (handle) {
            handle.classList.remove('dragging');
        }

        draggedElement = null;
    }

    document.querySelectorAll('.idea-card').forEach(card => {
        card.classList.remove('drag-over');
    });
}

function performCustomDrop(draggedCard, targetCard) {
    const ideasGrid = document.getElementById('ideasGrid');
    const allCards = Array.from(ideasGrid.children);
    const draggedIndex = allCards.indexOf(draggedCard);
    const targetIndex = allCards.indexOf(targetCard);

    if (draggedIndex < targetIndex) {
        ideasGrid.insertBefore(draggedCard, targetCard.nextSibling);
    } else {
        ideasGrid.insertBefore(draggedCard, targetCard);
    }

    updateRankingsAfterReorder();

    updateUI();
}

function updateRankingsAfterReorder() {
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

document.getElementById('submitVoteBtn').addEventListener('click', submitVote);
document.getElementById('resetBtn').addEventListener('click', resetRanking);

initVoting();
