// ============================================================
// @ironlog/shared — calculations.js
// Pure calculation functions — zero external dependencies.
// ISO week implemented manually per ISO 8601 standard.
// ============================================================

import { ACTIVITY_LEVELS } from './constants.js';

// ---- Pure JS ISO 8601 Week Helper ----
function _isoData(date) {
  // Work in UTC to avoid DST edge cases
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;          // Sunday (0) → 7
  d.setUTCDate(d.getUTCDate() + 4 - day); // Move to Thursday of this week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

// ---- Maintenance Calories (Mifflin-St Jeor) ----
/**
 * @param {{ gender: string, weightKg: number, heightCm: number, age: number, activityLevel: string }} user
 * @returns {number} maintenance calories (rounded)
 */
export function maintenanceCalories(user) {
  const { gender, weightKg, heightCm, age, activityLevel } = user;
  const w = Number(weightKg) || 70;
  const h = Number(heightCm) || 170;
  const a = Number(age) || 25;

  const bmrMale   = (10 * w) + (6.25 * h) - (5 * a) + 5;
  const bmrFemale = (10 * w) + (6.25 * h) - (5 * a) - 161;

  let bmr;
  if (gender === 'male')        bmr = bmrMale;
  else if (gender === 'female') bmr = bmrFemale;
  else                          bmr = (bmrMale + bmrFemale) / 2;

  const level = ACTIVITY_LEVELS.find(l => l.id === activityLevel);
  const multiplier = level?.multiplier ?? 1.55;

  return Math.round(bmr * multiplier);
}

// ---- Caloric Status ----
/**
 * @param {number} consumed   calories consumed today
 * @param {number} maintenance maintenance calories
 * @returns {'surplus'|'deficit'|'maintenance'}
 */
export function caloricStatus(consumed, maintenance) {
  if (consumed > maintenance + 100)  return 'surplus';
  if (consumed < maintenance - 100)  return 'deficit';
  return 'maintenance';
}

// ---- Week Key (ISO 8601) ----
/**
 * Returns 'YYYY-WW' for the given date.
 * Pure JS ISO 8601 — week 1 = week containing first Thursday.
 */
export function weekKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const { week, year } = _isoData(d);
  return `${year}-${String(week).padStart(2, '0')}`;
}

// ---- Date Key ----
/**
 * Returns 'YYYY-MM-DD' using LOCAL date (not UTC).
 */
export function dateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---- BMI ----
/**
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {number} BMI rounded to 1 decimal
 */
export function bmi(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

// ---- Week Keys For Month ----
/**
 * Returns all ISO weekKeys that overlap with the given calendar month.
 * Iterates every day of the month to collect all weekKeys.
 * @param {number} year
 * @param {number} month  1-indexed
 * @returns {string[]}
 */
export function weekKeysForMonth(year, month) {
  const result = new Set();
  const lastDay = new Date(year, month, 0).getDate(); // last day of month
  for (let day = 1; day <= lastDay; day++) {
    result.add(weekKey(new Date(year, month - 1, day)));
  }
  return [...result];
}

// ---- Day of Year (for tip rotation) ----
export function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// ---- Generate Insights ----
/**
 * @param {object} user
 * @param {Array}  logsThisMonth  WorkoutLog records for current month
 * @param {Array}  logsLastMonth  WorkoutLog records for previous month
 * @param {Array}  mealLogs       MealLog records for current month
 * @returns {string[]} array of insight strings
 */
export function generateInsights(user, logsThisMonth = [], logsLastMonth = [], mealLogs = []) {
  const insights = [];

  // --- Group this month's logs by exercise name ---
  const byExercise = {};
  for (const log of logsThisMonth) {
    const name = log.exerciseName || log.exercise?.name;
    if (!name) continue;
    if (!byExercise[name]) byExercise[name] = [];
    byExercise[name].push(log);
  }

  // --- Group last month's logs by exercise name ---
  const lastByExercise = {};
  for (const log of logsLastMonth) {
    const name = log.exerciseName || log.exercise?.name;
    if (!name) continue;
    if (!lastByExercise[name]) lastByExercise[name] = [];
    lastByExercise[name].push(log);
  }

  // --- Per-exercise checks ---
  for (const [name, logs] of Object.entries(byExercise)) {
    // Group by weekKey
    const byWeek = {};
    for (const log of logs) {
      if (!byWeek[log.weekKey]) byWeek[log.weekKey] = [];
      byWeek[log.weekKey].push(log);
    }
    const weekKeys = Object.keys(byWeek).sort();
    const weekMaxWeights = weekKeys.map(wk =>
      Math.max(...byWeek[wk].map(l => l.weightKg || 0))
    );

    // Check stagnation: same max weight for 3+ consecutive weeks
    let stagnant = false;
    if (weekMaxWeights.length >= 3) {
      for (let i = 0; i <= weekMaxWeights.length - 3; i++) {
        if (weekMaxWeights[i] === weekMaxWeights[i + 1] &&
            weekMaxWeights[i] === weekMaxWeights[i + 2] &&
            weekMaxWeights[i] > 0) {
          stagnant = true;
          break;
        }
      }
    }
    if (stagnant) {
      insights.push(`Consider progressive overload on ${name}`);
    }

    // Check improvement vs last month
    const lastLogs = lastByExercise[name] || [];
    if (lastLogs.length > 0) {
      const lastMax = Math.max(...lastLogs.map(l => l.weightKg || 0));
      const thisMax = Math.max(...logs.map(l => l.weightKg || 0));
      if (lastMax > 0 && thisMax > lastMax * 1.05) {
        insights.push(`${name} is progressing well — keep it up!`);
      }
    }
  }

  // --- Consistency check ---
  // Count unique training days (dayIndex+weekKey combinations) with at least one completed set
  const completedSessions = new Set(
    logsThisMonth
      .filter(l => l.completed)
      .map(l => `${l.weekKey}-${l.dayIndex}`)
  ).size;

  // Estimate planned training days for the month (~4.33 weeks × days/week from schedule)
  const scheduledDays = user.schedule
    ? user.schedule.filter(d => d.type !== 'rest' && d.muscleGroups?.length > 0).length
    : 4;
  const plannedSessions = Math.round(scheduledDays * 4.33);

  if (plannedSessions > 0) {
    const ratio = completedSessions / plannedSessions;
    if (ratio < 0.6) {
      insights.push('Consistency dropped this month — aim for more sessions');
    } else if (ratio >= 0.9) {
      insights.push('Excellent consistency this month!');
    }
  }

  // --- No compound lifts check ---
  const compoundNames = new Set([
    'Bench Press', 'Incline Bench Press', 'Decline Bench Press',
    'Squat', 'Deadlift', 'Romanian Deadlift', 'Overhead Press',
    'Pull-ups', 'Lat Pulldown', 'Barbell Row', 'T-Bar Row',
    'Hip Thrust', 'Leg Press', 'Hack Squat', 'Close-grip Bench Press',
    'Clean and Press', 'Thrusters',
  ]);
  const hasAnyCompound = Object.keys(byExercise).some(n => compoundNames.has(n));
  if (Object.keys(byExercise).length > 0 && !hasAnyCompound) {
    insights.push('No compound lifts detected — add Squat, Deadlift, or Bench Press');
  }

  // --- Skipped muscle groups ---
  if (user.schedule) {
    const trainedGroups = new Set(
      logsThisMonth.map(l => (l.exercise?.muscleGroup || l.muscleGroup || '').toLowerCase())
    );
    for (const day of user.schedule) {
      if (day.type === 'rest') continue;
      for (const mg of (day.muscleGroups || [])) {
        if (!trainedGroups.has(mg)) {
          insights.push(`You haven't trained ${mg} this month — don't skip it!`);
          break; // one insight per muscle group
        }
      }
    }
  }

  // --- Calorie goal alignment ---
  if (mealLogs.length > 0) {
    const totalCalories = mealLogs.reduce((sum, m) => sum + (m.calories || 0), 0);
    const daysTracked = new Set(mealLogs.map(m => m.dateKey)).size;
    const avgDaily = daysTracked > 0 ? totalCalories / daysTracked : 0;
    const maintenance = maintenanceCalories(user);

    if (user.goal === 'muscle_gain' && avgDaily < maintenance - 200) {
      insights.push('You\'re in a calorie deficit — this may limit muscle gain');
    }
    if (user.goal === 'fat_loss' && avgDaily > maintenance + 100) {
      insights.push('You\'re eating above maintenance — adjust diet to reach fat loss goals');
    }
  }

  // --- Volume progression ---
  const totalVolumeThis = logsThisMonth.reduce(
    (sum, l) => sum + ((l.weightKg || 0) * (l.reps || 0)), 0
  );
  const totalVolumeLast = logsLastMonth.reduce(
    (sum, l) => sum + ((l.weightKg || 0) * (l.reps || 0)), 0
  );
  if (totalVolumeLast > 0 && totalVolumeThis > totalVolumeLast * 1.1) {
    insights.push('Total training volume increased this month — great progression!');
  }

  return insights;
}
