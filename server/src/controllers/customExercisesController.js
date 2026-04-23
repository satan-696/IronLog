// server/src/controllers/customExercisesController.js
import { prisma } from '../prismaClient.js';
import { validateCustomExercise } from '@ironlog/shared';

// GET /api/custom-exercises
export async function getCustomExercises(req, res, next) {
  try {
    const exercises = await prisma.customExercise.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'asc' },
    });
    return res.json(exercises);
  } catch (err) {
    next(err);
  }
}

// POST /api/custom-exercises
export async function createCustomExercise(req, res, next) {
  try {
    const { name, muscleGroup, isCompound, difficulty, notes } = req.body;

    const { valid, errors } = validateCustomExercise({ name, muscleGroup });
    if (!valid) return res.status(400).json({ error: 'Validation failed', errors });

    const exercise = await prisma.customExercise.create({
      data: {
        userId:      req.user.userId,
        name:        name.trim(),
        muscleGroup,
        isCompound:  isCompound === true || isCompound === 'true',
        difficulty:  difficulty || 'beginner',
        notes:       notes || null,
      },
    });
    return res.status(201).json(exercise);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/custom-exercises/:id
export async function deleteCustomExercise(req, res, next) {
  try {
    const exercise = await prisma.customExercise.findUnique({ where: { id: req.params.id } });
    if (!exercise || exercise.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.customExercise.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
