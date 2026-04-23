// ============================================================
// @ironlog/shared — scoring.js
// scoreDay: evaluates a workout session and returns a score
// ============================================================

const COLORS = {
  SUCCESS: '#00E676',
  ACCENT:  '#C8FF00',
  WARNING: '#FFB800',
  DANGER:  '#FF4444',
};

// Compound movements eligible for scoring bonus
const COMPOUND_NAMES = new Set([
  'Bench Press', 'Incline Bench Press', 'Decline Bench Press',
  'Squat', 'Deadlift', 'Romanian Deadlift', 'Overhead Press',
  'Pull-ups', 'Lat Pulldown', 'Barbell Row', 'T-Bar Row',
  'Hip Thrust', 'Leg Press', 'Hack Squat', 'Close-grip Bench Press',
  'Clean and Press', 'Thrusters',
]);

/**
 * Score a workout day.
 * @param {Array<{ name: string, muscleGroup: string, sets: number, isCompound?: boolean }>} exercises
 * @returns {{ score: number, label: string, color: string, issues: string[], suggestions: string[] }}
 */
export function scoreDay(exercises = []) {
  let score = 0;
  const issues = [];
  const suggestions = [];

  if (!Array.isArray(exercises) || exercises.length === 0) {
    return { score: 0, label: 'Poor', color: COLORS.DANGER, issues: ['No exercises found'], suggestions: ['Add at least 3 exercises to score your workout'] };
  }

  // ---- RULE 1: Compound check (+20 or issue) ----
  const hasCompound = exercises.some(e => COMPOUND_NAMES.has(e.name));
  if (hasCompound) {
    score += 20;
  } else {
    issues.push('No compound movement found');
    suggestions.push('Add a compound lift like Bench Press, Squat, or Deadlift');
  }

  // ---- RULE 2: Exercise count ----
  const count = exercises.length;
  if (count < 3) {
    score -= 20;
    issues.push('Too few exercises for a productive session');
    suggestions.push('Add at least 3–4 exercises');
  } else if (count <= 6) {
    score += 20;
  } else if (count <= 8) {
    score += 10;
    issues.push('Session is getting long');
    suggestions.push('Consider dropping 1–2 exercises');
  } else {
    score -= 10;
    issues.push('Overtraining risk — too many exercises');
    suggestions.push('Reduce to 6–7 exercises max');
  }

  // ---- RULE 3: Total sets ----
  const totalSets = exercises.reduce((sum, e) => sum + (Number(e.sets) || 0), 0);
  if (totalSets < 9) {
    score -= 10;
    issues.push('Low total volume — increase sets');
  } else if (totalSets <= 20) {
    score += 20;
  } else if (totalSets <= 25) {
    score += 5;
    issues.push('High volume — monitor recovery');
  } else {
    score -= 15;
    issues.push('Very high overtraining risk');
    suggestions.push('Reduce total sets to under 25');
  }

  // ---- RULE 4: Variety (compound + isolation mix) (+10) ----
  const hasIsolation = exercises.some(e => !COMPOUND_NAMES.has(e.name));
  if (hasCompound && hasIsolation) {
    score += 10;
  } else {
    suggestions.push('Mix compound and isolation exercises for best results');
  }

  // ---- RULE 5: Antagonist pairing (+10 max) ----
  const groups = new Set(exercises.map(e => (e.muscleGroup || '').toLowerCase()));
  let antagonistBonus = 0;
  if (groups.has('chest') && groups.has('back'))      antagonistBonus = 10;
  if (groups.has('biceps') && groups.has('triceps'))  antagonistBonus = 10;
  score += antagonistBonus;

  // Clamp score to 0–100
  score = Math.max(0, Math.min(100, score));

  // Determine label + color
  let label, color;
  if (score >= 90)      { label = 'Elite'; color = COLORS.SUCCESS; }
  else if (score >= 75) { label = 'Great'; color = COLORS.SUCCESS; }
  else if (score >= 60) { label = 'Good';  color = COLORS.ACCENT;  }
  else if (score >= 40) { label = 'Fair';  color = COLORS.WARNING; }
  else                  { label = 'Poor';  color = COLORS.DANGER;  }

  return { score, label, color, issues, suggestions };
}
