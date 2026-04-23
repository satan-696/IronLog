// server/src/controllers/mealLogsController.js
import { prisma } from '../prismaClient.js';
import { validateMeal } from '@ironlog/shared';

// GET /api/meal-logs/:dateKey
export async function getMealsForDay(req, res, next) {
  try {
    const meals = await prisma.mealLog.findMany({
      where: { userId: req.user.userId, dateKey: req.params.dateKey },
      orderBy: [{ mealType: 'asc' }, { loggedAt: 'asc' }],
    });

    // Group by mealType
    const grouped = meals.reduce((acc, meal) => {
      if (!acc[meal.mealType]) acc[meal.mealType] = [];
      acc[meal.mealType].push(meal);
      return acc;
    }, {});

    return res.json({ meals, grouped });
  } catch (err) {
    next(err);
  }
}

// GET /api/meal-logs/totals/:dateKey
export async function getDailyTotals(req, res, next) {
  try {
    const result = await prisma.mealLog.aggregate({
      where: { userId: req.user.userId, dateKey: req.params.dateKey },
      _sum: { calories: true, proteinG: true, carbsG: true, fatG: true },
      _count: { id: true },
    });

    return res.json({
      calories:  result._sum.calories  || 0,
      protein:   result._sum.proteinG  || 0,
      carbs:     result._sum.carbsG    || 0,
      fat:       result._sum.fatG      || 0,
      itemCount: result._count.id      || 0,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/meal-logs
export async function addFood(req, res, next) {
  try {
    const { dateKey, mealType, foodName, quantity, unit, calories, proteinG, carbsG, fatG } = req.body;

    const { valid, errors } = validateMeal({ foodName, quantity, unit, calories, proteinG, carbsG, fatG });
    if (!valid) return res.status(400).json({ error: 'Validation failed', errors });

    const meal = await prisma.mealLog.create({
      data: {
        userId:   req.user.userId,
        dateKey,
        mealType: mealType || 'snacks',
        foodName: foodName.trim(),
        quantity: Number(quantity),
        unit,
        calories: Number(calories),
        proteinG: Number(proteinG) || 0,
        carbsG:   Number(carbsG)   || 0,
        fatG:     Number(fatG)     || 0,
      },
    });
    return res.status(201).json(meal);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/meal-logs/:id
export async function deleteFood(req, res, next) {
  try {
    const meal = await prisma.mealLog.findUnique({ where: { id: req.params.id } });
    if (!meal || meal.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.mealLog.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
