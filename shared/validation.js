// ============================================================
// @ironlog/shared — validation.js
// Input validators for user, exercise, and meal data
// ============================================================

import { MUSCLE_GROUPS, GOALS, ACTIVITY_LEVELS } from './constants.js';

const VALID_GOAL_IDS          = GOALS.map(g => g.id);
const VALID_ACTIVITY_LEVEL_IDS = ACTIVITY_LEVELS.map(a => a.id);

/**
 * Returns { valid: boolean, errors: string[] }
 * @param {object} data
 * @param {boolean} serverMode  if true, validates username+password
 */
export function validateUser(data, serverMode = false) {
  const errors = [];
  const { name, gender, age, heightCm, weightKg, goal, activityLevel, username, password, confirmPassword } = data || {};

  // name — required, min 2 chars
  if (!name || String(name).trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  // gender — optional, but if provided must be valid
  if (gender !== undefined && gender !== null && gender !== '') {
    if (!['male', 'female', 'other'].includes(gender)) {
      errors.push('Gender must be male, female, or other');
    }
  }

  // age — optional, 10–100
  if (age !== undefined && age !== null && age !== '') {
    const a = Number(age);
    if (isNaN(a) || a < 10 || a > 100) {
      errors.push('Age must be between 10 and 100');
    }
  }

  // heightCm — optional, 50–300
  if (heightCm !== undefined && heightCm !== null && heightCm !== '') {
    const h = Number(heightCm);
    if (isNaN(h) || h < 50 || h > 300) {
      errors.push('Height must be between 50 and 300 cm');
    }
  }

  // weightKg — optional, 20–500
  if (weightKg !== undefined && weightKg !== null && weightKg !== '') {
    const w = Number(weightKg);
    if (isNaN(w) || w < 20 || w > 500) {
      errors.push('Weight must be between 20 and 500 kg');
    }
  }

  // goal — optional, but if provided must be valid
  if (goal !== undefined && goal !== null && goal !== '') {
    if (!VALID_GOAL_IDS.includes(goal)) {
      errors.push(`Goal must be one of: ${VALID_GOAL_IDS.join(', ')}`);
    }
  }

  // activityLevel — optional, but if provided must be valid
  if (activityLevel !== undefined && activityLevel !== null && activityLevel !== '') {
    if (!VALID_ACTIVITY_LEVEL_IDS.includes(activityLevel)) {
      errors.push(`Activity level must be one of: ${VALID_ACTIVITY_LEVEL_IDS.join(', ')}`);
    }
  }

  // Server mode: username + password required
  if (serverMode) {
    if (!username || String(username).trim().length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username may only contain letters, numbers, and underscores');
    }
    if (!password || String(password).length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      errors.push('Passwords do not match');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate exercise data
 */
export function validateExercise(data) {
  const errors = [];
  const { name, muscleGroup, sets, targetReps } = data || {};

  if (!name || String(name).trim().length < 2) {
    errors.push('Exercise name must be at least 2 characters');
  }

  if (!muscleGroup || !MUSCLE_GROUPS.includes(muscleGroup)) {
    errors.push(`Muscle group must be one of: ${MUSCLE_GROUPS.join(', ')}`);
  }

  const s = Number(sets);
  if (isNaN(s) || s < 1 || s > 20) {
    errors.push('Sets must be between 1 and 20');
  }

  if (!targetReps || String(targetReps).trim().length === 0) {
    errors.push('Target reps is required (e.g. "8-12" or "10")');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate meal log entry
 */
export function validateMeal(data) {
  const errors = [];
  const { foodName, quantity, unit, calories, proteinG, carbsG, fatG } = data || {};

  if (!foodName || String(foodName).trim().length === 0) {
    errors.push('Food name is required');
  }

  const q = Number(quantity);
  if (isNaN(q) || q <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (!['g', 'ml', 'piece'].includes(unit)) {
    errors.push('Unit must be g, ml, or piece');
  }

  const cal = Number(calories);
  if (isNaN(cal) || cal < 0) {
    errors.push('Calories must be 0 or greater');
  }

  if (proteinG !== undefined && proteinG !== null && Number(proteinG) < 0) {
    errors.push('Protein must be 0 or greater');
  }
  if (carbsG !== undefined && carbsG !== null && Number(carbsG) < 0) {
    errors.push('Carbs must be 0 or greater');
  }
  if (fatG !== undefined && fatG !== null && Number(fatG) < 0) {
    errors.push('Fat must be 0 or greater');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate custom exercise for library
 */
export function validateCustomExercise(data) {
  const errors = [];
  const { name, muscleGroup } = data || {};

  if (!name || String(name).trim().length < 2) {
    errors.push('Exercise name must be at least 2 characters');
  }

  if (!muscleGroup || !MUSCLE_GROUPS.includes(muscleGroup)) {
    errors.push(`Muscle group must be one of: ${MUSCLE_GROUPS.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
