// server/src/controllers/schedulesController.js
import { prisma } from '../prismaClient.js';
import { POPULAR_SPLITS } from '@ironlog/shared';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function buildFullWeek(schedules) {
  const byIndex = Object.fromEntries(schedules.map(s => [s.dayIndex, s]));
  return Array.from({ length: 7 }, (_, i) => byIndex[i] ?? {
    dayIndex: i,
    label: DAY_NAMES[i],
    type: 'rest',
    muscleGroups: [],
    exercises: [],
  });
}

// GET /api/schedules
export async function getSchedule(req, res, next) {
  try {
    const schedules = await prisma.daySchedule.findMany({
      where: { userId: req.user.userId },
      include: {
        exercises: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { dayIndex: 'asc' },
    });
    return res.json(buildFullWeek(schedules));
  } catch (err) {
    next(err);
  }
}

// PUT /api/schedules/:dayIndex
export async function updateDay(req, res, next) {
  try {
    const dayIndex = parseInt(req.params.dayIndex, 10);
    if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
      return res.status(400).json({ error: 'dayIndex must be 0–6' });
    }

    const { type, muscleGroups } = req.body;

    const schedule = await prisma.daySchedule.upsert({
      where:  { userId_dayIndex: { userId: req.user.userId, dayIndex } },
      update: { type: type || 'rest', muscleGroups: muscleGroups || [] },
      create: {
        userId: req.user.userId,
        dayIndex,
        type: type || 'rest',
        muscleGroups: muscleGroups || [],
      },
    });
    return res.json(schedule);
  } catch (err) {
    next(err);
  }
}

// POST /api/schedules/apply-split
export async function applySplit(req, res, next) {
  try {
    const { splitId } = req.body;
    const split = POPULAR_SPLITS.find(s => s.id === splitId);
    if (!split) return res.status(404).json({ error: 'Split not found' });

    // Delete existing schedules (cascades exercises)
    await prisma.daySchedule.deleteMany({ where: { userId: req.user.userId } });

    // Create 7 new schedules
    const created = await Promise.all(
      split.schedule.map(day =>
        prisma.daySchedule.create({
          data: {
            userId: req.user.userId,
            dayIndex: day.dayIndex,
            type: day.muscleGroups.length > 0 ? 'training' : 'rest',
            muscleGroups: day.muscleGroups,
          },
        })
      )
    );
    return res.status(201).json(buildFullWeek(created));
  } catch (err) {
    next(err);
  }
}
