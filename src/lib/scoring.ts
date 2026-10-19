import { roundScore } from "./utils";

/**
 * Final Mastery Score:
 * - If no remediation required: equal to initial score
 * - Otherwise: 80% Initial + 20% Remediation Mastery Rate
 */
export function calculateFinalMasteryScore(
  initialScore: number,
  conceptsRequiringRemediation: number,
  conceptsSuccessfullyRemediated: number
): { remediationMasteryRate: number; finalMasteryScore: number } {
  if (conceptsRequiringRemediation === 0) {
    return {
      remediationMasteryRate: 100,
      finalMasteryScore: roundScore(initialScore),
    };
  }

  const remediationMasteryRate = roundScore(
    (conceptsSuccessfullyRemediated / conceptsRequiringRemediation) * 100
  );

  const finalMasteryScore = roundScore(
    0.8 * initialScore + 0.2 * remediationMasteryRate
  );

  return { remediationMasteryRate, finalMasteryScore };
}

export function calculateInitialScore(
  pointsEarned: number,
  totalPoints: number
): number {
  if (totalPoints <= 0) return 0;
  return roundScore((pointsEarned / totalPoints) * 100);
}
