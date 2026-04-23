// server/src/controllers/workoutLogsController.js
import { prisma } from '../prismaClient.js';
import { weekKeysForMonth } from '@ironlog/shared';

// Helper — verify an exercise belongs to this user
async function ownsExercise(exerciseId, userId) {
  const ex = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { schedule: true },
  });
  return ex?.schedule?.userId === userId;
}

// GET /api/workout-logs/week/:weekKey?dayIndex=N
export async function getWeekLogs(req, res, next) {
  try {
    const { weekKey } = req.params;
    const { dayIndex } = req.query;

    const where = {
      userId: req.user.userId,
      weekKey,
      ...(dayIndex !== undefined && { dayIndex: parseInt(dayIndex, 10) }),
    };

    const logs = await prisma.workoutLog.findMany({
      where,
      include: { exercise: { select: { name: true, muscleGroup: true } } },
      orderBy: [{ dayIndex: 'asc' }, { setNumber: 'asc' }],
    });
    return res.json(logs);
  } catch (err) {
    next(err);
  }
}

// GET /api/workout-logs/month/:year/:month
export async function getMonthLogs(req, res, next) {
  try {
    const year  = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    const weekKeys = weekKeysForMonth(year, month);

    const logs = await prisma.workoutLog.findMany({
      where: {
        userId:  req.user.userId,
        weekKey: { in: weekKeys },
      },
      include: { exercise: { select: { name: true, muscleGroup: true } } },
      orderBy: [{ weekKey: 'asc' }, { dayIndex: 'asc' }, { setNumber: 'asc' }],
    });
    return res.json(logs);
  } catch (err) {
    next(err);
  }
}

// POST /api/workout-logs  (upsert)
export async function saveSet(req, res, next) {
  try {
    const {
      exerciseId, exerciseName, weekKey, dayIndex,
      setNumber, weightKg, reps, completed,
    } = req.body;

    // Verify exercise ownership if exerciseId provided
    if (exerciseId) {
      const owns = await ownsExercise(exerciseId, req.user.userId);
      if (!owns) return res.status(403).json({ error: 'Forbidden' });
    }

    const log = await prisma.workoutLog.upsert({
      where: {
        userId_exerciseId_weekKey_dayIndex_setNumber: {
          userId:     req.user.userId,
          exerciseId: exerciseId || null,
          weekKey,
          dayIndex:   Number(dayIndex),
          setNumber:  Number(setNumber),
        },
      },
      update: {
        weightKg:     weightKg != null ? Number(weightKg) : null,
        reps:         reps != null ? Number(reps) : null,
        completed:    Boolean(completed),
        exerciseName: exerciseName || '',
      },
      create: {
        userId:       req.user.userId,
        exerciseId:   exerciseId || null,
        exerciseName: exerciseName || '',
        weekKey,
        dayIndex:     Number(dayIndex),
        setNumber:    Number(setNumber),
        weightKg:     weightKg != null ? Number(weightKg) : null,
        reps:         reps != null ? Number(reps) : null,
        completed:    Boolean(completed),
      },
    });
    return res.json(log);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/workout-logs/:id
export async function deleteSet(req, res, next) {
  try {
    const log = await prisma.workoutLog.findUnique({ where: { id: req.params.id } });
    if (!log || log.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.workoutLog.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
