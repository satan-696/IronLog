// server/src/controllers/exercisesController.js
import { prisma } from '../prismaClient.js';
import { validateExercise } from '@ironlog/shared';

// Helper — verify a scheduleId belongs to the requesting user
async function ownsSchedule(scheduleId, userId) {
  const schedule = await prisma.daySchedule.findUnique({ where: { id: scheduleId } });
  return schedule && schedule.userId === userId;
}

// Helper — verify an exercise belongs to the requesting user via schedule
async function ownsExercise(exerciseId, userId) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { schedule: true },
  });
  return exercise && exercise.schedule.userId === userId ? exercise : null;
}

// GET /api/exercises/:scheduleId
export async function getExercises(req, res, next) {
  try {
    const { scheduleId } = req.params;
    if (!await ownsSchedule(scheduleId, req.user.userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const exercises = await prisma.exercise.findMany({
      where: { scheduleId },
      orderBy: { sortOrder: 'asc' },
    });
    return res.json(exercises);
  } catch (err) {
    next(err);
  }
}

// POST /api/exercises
export async function createExercise(req, res, next) {
  try {
    const { scheduleId, name, muscleGroup, sets, targetReps, notes } = req.body;

    const { valid, errors } = validateExercise({ name, muscleGroup, sets, targetReps });
    if (!valid) return res.status(400).json({ error: 'Validation failed', errors });

    if (!await ownsSchedule(scheduleId, req.user.userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get current max sortOrder for this schedule
    const last = await prisma.exercise.findFirst({
      where: { scheduleId },
      orderBy: { sortOrder: 'desc' },
    });
    const sortOrder = last ? last.sortOrder + 1 : 0;

    const exercise = await prisma.exercise.create({
      data: {
        scheduleId,
        name: name.trim(),
        muscleGroup,
        sets:       Number(sets) || 3,
        targetReps: targetReps || '8-12',
        sortOrder,
        notes:      notes || null,
      },
    });
    return res.status(201).json(exercise);
  } catch (err) {
    next(err);
  }
}

// PUT /api/exercises/:id
export async function updateExercise(req, res, next) {
  try {
    const exercise = await ownsExercise(req.params.id, req.user.userId);
    if (!exercise) return res.status(403).json({ error: 'Forbidden' });

    const { name, muscleGroup, sets, targetReps, notes } = req.body;
    const updated = await prisma.exercise.update({
      where: { id: req.params.id },
      data: {
        ...(name        !== undefined && { name: name.trim() }),
        ...(muscleGroup !== undefined && { muscleGroup }),
        ...(sets        !== undefined && { sets: Number(sets) }),
        ...(targetReps  !== undefined && { targetReps }),
        ...(notes       !== undefined && { notes }),
      },
    });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/exercises/:id
export async function deleteExercise(req, res, next) {
  try {
    const exercise = await ownsExercise(req.params.id, req.user.userId);
    if (!exercise) return res.status(403).json({ error: 'Forbidden' });

    await prisma.exercise.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// PUT /api/exercises/reorder
export async function reorderExercises(req, res, next) {
  try {
    const { exerciseIds } = req.body;
    if (!Array.isArray(exerciseIds)) {
      return res.status(400).json({ error: 'exerciseIds must be an array' });
    }

    // Verify all belong to the user
    for (const id of exerciseIds) {
      const exercise = await ownsExercise(id, req.user.userId);
      if (!exercise) return res.status(403).json({ error: 'Forbidden' });
    }

    // Bulk update sort orders
    await Promise.all(
      exerciseIds.map((id, index) =>
        prisma.exercise.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
