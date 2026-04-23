// server/src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from './prismaClient.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRouter            from './routes/auth.js';
import usersRouter           from './routes/users.js';
import schedulesRouter       from './routes/schedules.js';
import exercisesRouter       from './routes/exercises.js';
import customExercisesRouter from './routes/customExercises.js';
import workoutLogsRouter     from './routes/workoutLogs.js';
import mealLogsRouter        from './routes/mealLogs.js';
import weightLogsRouter      from './routes/weightLogs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3001;

// ---- CORS (Issue 12 fix) ----
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no Origin header (mobile apps / Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());

// ---- API Routes ----
app.use('/api/auth',            authRouter);
app.use('/api/users/me',        usersRouter);
app.use('/api/schedules',       schedulesRouter);
app.use('/api/exercises',       exercisesRouter);
app.use('/api/custom-exercises', customExercisesRouter);
app.use('/api/workout-logs',    workoutLogsRouter);
app.use('/api/meal-logs',       mealLogsRouter);
app.use('/api/weight-logs',     weightLogsRouter);

// ---- Serve Web Build in Production (Issue 11 fix) ----
// __dirname = server/src/  →  ../web-dist = server/web-dist/
if (process.env.NODE_ENV === 'production') {
  const webDistPath = path.join(__dirname, '../web-dist');
  app.use(express.static(webDistPath));
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: webDistPath });
  });
}

// ---- Global Error Handler (must be last) ----
app.use(errorHandler);

// ---- Start ----
async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    app.listen(PORT, () => {
      console.log(`🚀 IronLog server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

main();
