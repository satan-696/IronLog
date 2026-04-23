// server/src/controllers/usersController.js
import { prisma } from '../prismaClient.js';
import { maintenanceCalories } from '@ironlog/shared';

const USER_SELECT = {
  id: true, username: true, name: true, gender: true, age: true,
  heightCm: true, weightKg: true, goal: true, activityLevel: true,
  maintenanceCalories: true, dailyCalorieTarget: true,
  mealTrackingEnabled: true, createdAt: true, updatedAt: true,
};

// GET /api/users/me
export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: USER_SELECT,
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/me
export async function updateMe(req, res, next) {
  try {
    const {
      name, gender, age, heightCm, weightKg,
      goal, activityLevel, dailyCalorieTarget, mealTrackingEnabled,
    } = req.body;

    // Recalculate maintenance if body metrics changed
    const existing = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const updatedFields = {
      ...(name              !== undefined && { name }),
      ...(gender            !== undefined && { gender }),
      ...(age               !== undefined && { age: Number(age) }),
      ...(heightCm          !== undefined && { heightCm: Number(heightCm) }),
      ...(weightKg          !== undefined && { weightKg: Number(weightKg) }),
      ...(goal              !== undefined && { goal }),
      ...(activityLevel     !== undefined && { activityLevel }),
      ...(dailyCalorieTarget !== undefined && { dailyCalorieTarget: Number(dailyCalorieTarget) }),
      ...(mealTrackingEnabled !== undefined && { mealTrackingEnabled: Boolean(mealTrackingEnabled) }),
    };

    // Recalculate maintenance if any body stat changed
    const merged = { ...existing, ...updatedFields };
    updatedFields.maintenanceCalories = maintenanceCalories({
      gender:        merged.gender,
      weightKg:      merged.weightKg,
      heightCm:      merged.heightCm,
      age:           merged.age,
      activityLevel: merged.activityLevel,
    });

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updatedFields,
      select: USER_SELECT,
    });
    return res.json(user);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/me
export async function deleteMe(req, res, next) {
  try {
    await prisma.user.delete({ where: { id: req.user.userId } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
