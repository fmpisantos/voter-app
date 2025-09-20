from typing import List, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Idea:
    id: int
    title: str
    description: str
    score: Optional[int] = None

@dataclass
class VoteSubmission:
    ideas: List[Idea]

@dataclass
class VoteResult:
    id: int
    ideas: List[Idea]
    submitted_at: str
    total_score: int
    score_distribution: dict

class VotingService:
    MAX_SCORE_2_PERCENTAGE = 0.4
    MAX_SCORE_1_PERCENTAGE = 0.3

    @staticmethod
    def validate_scores(ideas: List[Idea]) -> tuple[bool, str]:
        """Validate scoring constraints"""
        if not ideas:
            return False, "No ideas provided"

        scored_count = sum(1 for idea in ideas if idea.score is not None)
        total_count = len(ideas)

        if scored_count != total_count:
            return False, f"All ideas must be scored. Currently scored: {scored_count}/{total_count}"

        score_counts = {0: 0, 1: 0, 2: 0}
        for idea in ideas:
            if idea.score is not None:
                score_counts[idea.score] += 1

        max_score_2 = int(total_count * VotingService.MAX_SCORE_2_PERCENTAGE)
        max_score_1 = int(total_count * VotingService.MAX_SCORE_1_PERCENTAGE)

        if score_counts[2] > max_score_2:
            return False, f"Too many score 2 assignments. Maximum allowed: {max_score_2}, current: {score_counts[2]}"

        if score_counts[1] > max_score_1:
            return False, f"Too many score 1 assignments. Maximum allowed: {max_score_1}, current: {score_counts[1]}"

        return True, "Valid"

    @staticmethod
    def calculate_total_score(ideas: List[Idea]) -> int:
        """Calculate total score from all ideas"""
        return sum(idea.score or 0 for idea in ideas)

    @staticmethod
    def get_score_distribution(ideas: List[Idea]) -> dict:
        """Get distribution of scores"""
        score_counts = {0: 0, 1: 0, 2: 0}
        for idea in ideas:
            if idea.score is not None:
                score_counts[idea.score] += 1
        return score_counts