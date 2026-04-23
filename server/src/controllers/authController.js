// server/src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient.js';
import { validateUser } from '@ironlog/shared';
import { maintenanceCalories } from '@ironlog/shared';

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function safeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const {
      username, password, confirmPassword, name, gender, age,
      heightCm, weightKg, goal, activityLevel,
      dailyCalorieTarget, mealTrackingEnabled,
    } = req.body;

    // Validate
    const { valid, errors } = validateUser(
      { username, password, confirmPassword, name, gender, age, heightCm, weightKg, goal, activityLevel },
      true // server mode
    );
    if (!valid) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    // Check username uniqueness
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Calculate maintenance calories
    const maintenance = maintenanceCalories({
      gender, weightKg: Number(weightKg), heightCm: Number(heightCm),
      age: Number(age), activityLevel,
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        name,
        gender:              gender || null,
        age:                 age ? Number(age) : null,
        heightCm:            heightCm ? Number(heightCm) : null,
        weightKg:            weightKg ? Number(weightKg) : null,
        goal:                goal || null,
        activityLevel:       activityLevel || null,
        maintenanceCalories: maintenance,
        dailyCalorieTarget:  dailyCalorieTarget ? Number(dailyCalorieTarget) : maintenance,
        mealTrackingEnabled: mealTrackingEnabled === true || mealTrackingEnabled === 'true',
      },
    });

    const token = signToken(user.id);
    return res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user.id);
    return res.status(200).json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/verify  (requires verifyToken middleware)
export async function verify(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { passwordHash: false, id: true, username: true, name: true,
                gender: true, age: true, heightCm: true, weightKg: true,
                goal: true, activityLevel: true, maintenanceCalories: true,
                dailyCalorieTarget: true, mealTrackingEnabled: true,
                createdAt: true, updatedAt: true },
    });
    if (!user) return res.status(401).json({ error: 'User not found' });
    return res.json({ valid: true, user });
  } catch (err) {
    next(err);
  }
}
