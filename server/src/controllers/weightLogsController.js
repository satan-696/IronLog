// server/src/controllers/weightLogsController.js
import { prisma } from '../prismaClient.js';

export const getWeightLogs = async (req, res, next) => {
  try {
    const logs = await prisma.weightLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { dateKey: 'asc' },
    });
    res.json(logs);
  } catch (err) { next(err); }
};

export const saveWeightLog = async (req, res, next) => {
  try {
    const { weightKg, dateKey } = req.body;
    const log = await prisma.weightLog.upsert({
      where: {
        userId_dateKey: { userId: req.user.userId, dateKey },
      },
      update: { weightKg },
      create: { userId: req.user.userId, weightKg, dateKey },
    });
    res.json(log);
  } catch (err) { next(err); }
};

export const deleteWeightLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.weightLog.delete({
      where: { id, userId: req.user.userId },
    });
    res.status(204).end();
  } catch (err) { next(err); }
};
