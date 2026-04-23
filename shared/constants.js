// ============================================================
// @ironlog/shared — constants.js
// All static data shared between server, web, and app
// ============================================================

export const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'quads', 'hamstrings', 'glutes', 'calves', 'core', 'full_body', 'cardio',
];

export const GOALS = [
  { id: 'muscle_gain',  label: 'Muscle Gain',  emoji: '💪', description: 'Build size and strength' },
  { id: 'fat_loss',     label: 'Fat Loss',     emoji: '🔥', description: 'Burn fat, stay lean' },
  { id: 'endurance',    label: 'Endurance',    emoji: '🏃', description: 'Improve stamina' },
  { id: 'maintenance',  label: 'Maintenance',  emoji: '⚖️', description: 'Stay where you are' },
  { id: 'strength',     label: 'Strength',     emoji: '🏋️', description: 'Lift heavier' },
];

export const ACTIVITY_LEVELS = [
  { id: 'sedentary',   label: 'Sedentary',    description: 'Little or no exercise',           multiplier: 1.2   },
  { id: 'light',       label: 'Light',        description: 'Light exercise 1–3 days/wk',      multiplier: 1.375 },
  { id: 'moderate',    label: 'Moderate',     description: 'Moderate exercise 3–5 days/wk',   multiplier: 1.55  },
  { id: 'active',      label: 'Active',       description: 'Hard exercise 6–7 days/wk',       multiplier: 1.725 },
  { id: 'very_active', label: 'Very Active',  description: 'Physical job or 2x training',     multiplier: 1.9   },
];

// ============================================================
// EXERCISE LIBRARY — keyed by muscle group
// { name, isCompound, difficulty: 'beginner'|'intermediate'|'advanced' }
// ============================================================
export const EXERCISE_LIBRARY = {
  chest: [
    { name: 'Bench Press',          isCompound: true,  difficulty: 'intermediate' },
    { name: 'Incline Bench Press',  isCompound: true,  difficulty: 'intermediate' },
    { name: 'Decline Bench Press',  isCompound: true,  difficulty: 'intermediate' },
    { name: 'Push-ups',             isCompound: true,  difficulty: 'beginner'     },
    { name: 'Cable Fly',            isCompound: false, difficulty: 'beginner'     },
    { name: 'Dumbbell Fly',         isCompound: false, difficulty: 'beginner'     },
    { name: 'Chest Dips',           isCompound: true,  difficulty: 'intermediate' },
    { name: 'Pec Deck Machine',     isCompound: false, difficulty: 'beginner'     },
  ],
  back: [
    { name: 'Deadlift',                    isCompound: true,  difficulty: 'advanced'     },
    { name: 'Pull-ups',                    isCompound: true,  difficulty: 'intermediate' },
    { name: 'Lat Pulldown',                isCompound: true,  difficulty: 'beginner'     },
    { name: 'Seated Cable Row',            isCompound: true,  difficulty: 'beginner'     },
    { name: 'Barbell Row',                 isCompound: true,  difficulty: 'intermediate' },
    { name: 'Single-arm Dumbbell Row',     isCompound: false, difficulty: 'beginner'     },
    { name: 'T-Bar Row',                   isCompound: true,  difficulty: 'intermediate' },
    { name: 'Face Pulls',                  isCompound: false, difficulty: 'beginner'     },
  ],
  shoulders: [
    { name: 'Overhead Press',       isCompound: true,  difficulty: 'intermediate' },
    { name: 'Arnold Press',         isCompound: true,  difficulty: 'intermediate' },
    { name: 'Lateral Raise',        isCompound: false, difficulty: 'beginner'     },
    { name: 'Front Raise',          isCompound: false, difficulty: 'beginner'     },
    { name: 'Rear Delt Fly',        isCompound: false, difficulty: 'beginner'     },
    { name: 'Upright Row',          isCompound: true,  difficulty: 'intermediate' },
    { name: 'Shrugs',               isCompound: false, difficulty: 'beginner'     },
    { name: 'Cable Lateral Raise',  isCompound: false, difficulty: 'beginner'     },
  ],
  biceps: [
    { name: 'Barbell Curl',            isCompound: false, difficulty: 'beginner' },
    { name: 'Dumbbell Curl',           isCompound: false, difficulty: 'beginner' },
    { name: 'Hammer Curl',             isCompound: false, difficulty: 'beginner' },
    { name: 'Preacher Curl',           isCompound: false, difficulty: 'beginner' },
    { name: 'Concentration Curl',      isCompound: false, difficulty: 'beginner' },
    { name: 'Cable Curl',              isCompound: false, difficulty: 'beginner' },
    { name: 'Incline Dumbbell Curl',   isCompound: false, difficulty: 'beginner' },
  ],
  triceps: [
    { name: 'Tricep Pushdown',              isCompound: false, difficulty: 'beginner'     },
    { name: 'Skull Crushers',              isCompound: false, difficulty: 'intermediate' },
    { name: 'Overhead Tricep Extension',   isCompound: false, difficulty: 'beginner'     },
    { name: 'Close-grip Bench Press',      isCompound: true,  difficulty: 'intermediate' },
    { name: 'Tricep Dips',                 isCompound: true,  difficulty: 'intermediate' },
    { name: 'Diamond Push-ups',            isCompound: true,  difficulty: 'beginner'     },
    { name: 'Kickbacks',                   isCompound: false, difficulty: 'beginner'     },
  ],
  quads: [
    { name: 'Squat',                  isCompound: true,  difficulty: 'intermediate' },
    { name: 'Leg Press',              isCompound: true,  difficulty: 'beginner'     },
    { name: 'Hack Squat',             isCompound: true,  difficulty: 'intermediate' },
    { name: 'Leg Extension',          isCompound: false, difficulty: 'beginner'     },
    { name: 'Bulgarian Split Squat',  isCompound: true,  difficulty: 'intermediate' },
    { name: 'Lunges',                 isCompound: true,  difficulty: 'beginner'     },
    { name: 'Goblet Squat',           isCompound: true,  difficulty: 'beginner'     },
  ],
  hamstrings: [
    { name: 'Romanian Deadlift',   isCompound: true,  difficulty: 'intermediate' },
    { name: 'Leg Curl',            isCompound: false, difficulty: 'beginner'     },
    { name: 'Good Mornings',       isCompound: true,  difficulty: 'intermediate' },
    { name: 'Nordic Curl',         isCompound: false, difficulty: 'advanced'     },
    { name: 'Stiff-leg Deadlift',  isCompound: true,  difficulty: 'intermediate' },
  ],
  glutes: [
    { name: 'Hip Thrust',           isCompound: true,  difficulty: 'beginner' },
    { name: 'Glute Kickback',       isCompound: false, difficulty: 'beginner' },
    { name: 'Sumo Squat',           isCompound: true,  difficulty: 'beginner' },
    { name: 'Cable Pull-through',   isCompound: false, difficulty: 'beginner' },
    { name: 'Step-ups',             isCompound: true,  difficulty: 'beginner' },
    { name: 'Donkey Kicks',         isCompound: false, difficulty: 'beginner' },
  ],
  calves: [
    { name: 'Standing Calf Raise',   isCompound: false, difficulty: 'beginner' },
    { name: 'Seated Calf Raise',     isCompound: false, difficulty: 'beginner' },
    { name: 'Leg Press Calf Raise',  isCompound: false, difficulty: 'beginner' },
    { name: 'Single-leg Calf Raise', isCompound: false, difficulty: 'beginner' },
  ],
  core: [
    { name: 'Plank',                isCompound: false, difficulty: 'beginner'     },
    { name: 'Crunches',             isCompound: false, difficulty: 'beginner'     },
    { name: 'Leg Raises',           isCompound: false, difficulty: 'beginner'     },
    { name: 'Russian Twists',       isCompound: false, difficulty: 'beginner'     },
    { name: 'Ab Rollout',           isCompound: false, difficulty: 'intermediate' },
    { name: 'Cable Crunch',         isCompound: false, difficulty: 'beginner'     },
    { name: 'Hanging Knee Raises',  isCompound: false, difficulty: 'intermediate' },
    { name: 'Side Plank',           isCompound: false, difficulty: 'beginner'     },
  ],
  full_body: [
    { name: 'Burpees',           isCompound: true, difficulty: 'beginner'     },
    { name: 'Clean and Press',   isCompound: true, difficulty: 'advanced'     },
    { name: 'Kettlebell Swing',  isCompound: true, difficulty: 'intermediate' },
    { name: 'Box Jumps',         isCompound: true, difficulty: 'intermediate' },
    { name: 'Thrusters',         isCompound: true, difficulty: 'intermediate' },
  ],
  cardio: [
    { name: 'Running',        isCompound: false, difficulty: 'beginner'     },
    { name: 'Cycling',        isCompound: false, difficulty: 'beginner'     },
    { name: 'Jump Rope',      isCompound: false, difficulty: 'beginner'     },
    { name: 'Rowing Machine', isCompound: true,  difficulty: 'beginner'     },
    { name: 'Stair Climber',  isCompound: false, difficulty: 'beginner'     },
    { name: 'HIIT',           isCompound: true,  difficulty: 'intermediate' },
  ],
};

// ============================================================
// POPULAR SPLITS
// ============================================================
export const POPULAR_SPLITS = [
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    daysPerWeek: 6,
    bestFor: 'Intermediate, muscle gain',
    description: 'Hit each muscle group twice a week with focused push, pull, and leg days.',
    pros: ['High frequency per muscle', 'Balanced pushing and pulling', 'Scalable volume'],
    cons: ['6 days demanding', 'Less rest', 'Can feel repetitive'],
    schedule: [
      { dayIndex: 0, label: 'Push',  muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { dayIndex: 1, label: 'Pull',  muscleGroups: ['back', 'biceps'] },
      { dayIndex: 2, label: 'Legs',  muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { dayIndex: 3, label: 'Push',  muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { dayIndex: 4, label: 'Pull',  muscleGroups: ['back', 'biceps'] },
      { dayIndex: 5, label: 'Legs',  muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { dayIndex: 6, label: 'Rest',  muscleGroups: [] },
    ],
  },
  {
    id: 'bro_split',
    name: 'Bro Split',
    daysPerWeek: 5,
    bestFor: 'Beginners, hypertrophy focus',
    description: 'One muscle group per day — simple, focused sessions with plenty of recovery.',
    pros: ['Simple structure', 'Focused sessions', 'Easy to follow'],
    cons: ['Low weekly frequency per muscle', 'Long recovery gaps', 'Less optimal for strength'],
    schedule: [
      { dayIndex: 0, label: 'Chest',     muscleGroups: ['chest'] },
      { dayIndex: 1, label: 'Back',      muscleGroups: ['back'] },
      { dayIndex: 2, label: 'Shoulders', muscleGroups: ['shoulders'] },
      { dayIndex: 3, label: 'Arms',      muscleGroups: ['biceps', 'triceps'] },
      { dayIndex: 4, label: 'Legs',      muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { dayIndex: 5, label: 'Rest',      muscleGroups: [] },
      { dayIndex: 6, label: 'Rest',      muscleGroups: [] },
    ],
  },
  {
    id: 'upper_lower',
    name: 'Upper / Lower',
    daysPerWeek: 4,
    bestFor: 'Intermediate, strength + size',
    description: 'Alternate upper and lower body days twice a week for high frequency training.',
    pros: ['Good muscle frequency', 'Manageable sessions', 'Strong research support'],
    cons: ['Upper days can run long', 'Less specialization'],
    schedule: [
      { dayIndex: 0, label: 'Upper', muscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { dayIndex: 1, label: 'Lower', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { dayIndex: 2, label: 'Rest',  muscleGroups: [] },
      { dayIndex: 3, label: 'Upper', muscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { dayIndex: 4, label: 'Lower', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { dayIndex: 5, label: 'Rest',  muscleGroups: [] },
      { dayIndex: 6, label: 'Rest',  muscleGroups: [] },
    ],
  },
  {
    id: 'full_body',
    name: 'Full Body',
    daysPerWeek: 3,
    bestFor: 'Beginners, fat loss, time-limited',
    description: 'Train all major muscle groups 3 times per week for maximum efficiency.',
    pros: ['High frequency', 'Great for beginners', 'Time efficient'],
    cons: ['Less volume per session', 'Hard to progress all lifts', 'Fatigue management needed'],
    schedule: [
      { dayIndex: 0, label: 'Full Body', muscleGroups: ['full_body'] },
      { dayIndex: 1, label: 'Rest',      muscleGroups: [] },
      { dayIndex: 2, label: 'Full Body', muscleGroups: ['full_body'] },
      { dayIndex: 3, label: 'Rest',      muscleGroups: [] },
      { dayIndex: 4, label: 'Full Body', muscleGroups: ['full_body'] },
      { dayIndex: 5, label: 'Rest',      muscleGroups: [] },
      { dayIndex: 6, label: 'Rest',      muscleGroups: [] },
    ],
  },
  {
    id: 'arnold_split',
    name: 'Arnold Split',
    daysPerWeek: 6,
    bestFor: 'Advanced bodybuilders, high volume',
    description: 'Arnold Schwarzenegger\'s classic 6-day split — chest+back, shoulders+arms, legs.',
    pros: ['Very high volume', 'Each muscle hit twice', 'Classic and proven'],
    cons: ['Requires advanced recovery', 'Time intensive', 'Not for beginners'],
    schedule: [
      { dayIndex: 0, label: 'Chest + Back',      muscleGroups: ['chest', 'back'] },
      { dayIndex: 1, label: 'Shoulders + Arms',  muscleGroups: ['shoulders', 'biceps', 'triceps'] },
      { dayIndex: 2, label: 'Legs',              muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { dayIndex: 3, label: 'Chest + Back',      muscleGroups: ['chest', 'back'] },
      { dayIndex: 4, label: 'Shoulders + Arms',  muscleGroups: ['shoulders', 'biceps', 'triceps'] },
      { dayIndex: 5, label: 'Legs',              muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { dayIndex: 6, label: 'Rest',              muscleGroups: [] },
    ],
  },
];

// ============================================================
// FOOD PRESETS
// ============================================================
export const FOOD_PRESETS = [
  { name: 'Chicken Breast',   defaultQty: 100, unit: 'g',     cal: 165, protein: 31,  carbs: 0,   fat: 3.6 },
  { name: 'Brown Rice',       defaultQty: 100, unit: 'g',     cal: 130, protein: 2.7, carbs: 28,  fat: 0.9 },
  { name: 'White Rice',       defaultQty: 100, unit: 'g',     cal: 130, protein: 2.4, carbs: 28,  fat: 0.3 },
  { name: 'Whole Egg',        defaultQty: 1,   unit: 'piece', cal: 78,  protein: 6,   carbs: 0.6, fat: 5   },
  { name: 'Egg White',        defaultQty: 1,   unit: 'piece', cal: 17,  protein: 3.6, carbs: 0.2, fat: 0   },
  { name: 'Oats',             defaultQty: 100, unit: 'g',     cal: 389, protein: 17,  carbs: 66,  fat: 7   },
  { name: 'Banana',           defaultQty: 1,   unit: 'piece', cal: 89,  protein: 1.1, carbs: 23,  fat: 0.3 },
  { name: 'Whole Milk',       defaultQty: 100, unit: 'ml',    cal: 61,  protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: 'Paneer',           defaultQty: 100, unit: 'g',     cal: 265, protein: 18,  carbs: 3.4, fat: 20  },
  { name: 'Roti (Chapati)',   defaultQty: 1,   unit: 'piece', cal: 120, protein: 3.1, carbs: 18,  fat: 3.7 },
  { name: 'Dal (Cooked)',     defaultQty: 100, unit: 'g',     cal: 116, protein: 9,   carbs: 20,  fat: 0.4 },
  { name: 'Whey Protein',     defaultQty: 1,   unit: 'piece', cal: 120, protein: 25,  carbs: 3,   fat: 1.5 },
  { name: 'Almonds',          defaultQty: 30,  unit: 'g',     cal: 173, protein: 6,   carbs: 6,   fat: 15  },
  { name: 'Greek Yogurt',     defaultQty: 100, unit: 'g',     cal: 59,  protein: 10,  carbs: 3.6, fat: 0.4 },
  { name: 'Sweet Potato',     defaultQty: 100, unit: 'g',     cal: 86,  protein: 1.6, carbs: 20,  fat: 0.1 },
  { name: 'Tuna (Canned)',    defaultQty: 100, unit: 'g',     cal: 116, protein: 25,  carbs: 0,   fat: 1   },
  { name: 'Peanut Butter',    defaultQty: 30,  unit: 'g',     cal: 188, protein: 8,   carbs: 6,   fat: 16  },
  { name: 'Idli',             defaultQty: 1,   unit: 'piece', cal: 39,  protein: 2,   carbs: 8,   fat: 0.2 },
  { name: 'Dosa',             defaultQty: 1,   unit: 'piece', cal: 168, protein: 3.8, carbs: 22,  fat: 7   },
  { name: 'Rajma (Cooked)',   defaultQty: 100, unit: 'g',     cal: 127, protein: 8.7, carbs: 22,  fat: 0.5 },
];

// ============================================================
// MOTIVATIONAL TIPS (30 strings)
// ============================================================
export const MOTIVATIONAL_TIPS = [
  'Progressive overload is the key to growth — add weight or reps every week, even if it\'s just a little.',
  'Sleep is your most powerful recovery tool. Aim for 7–9 hours to maximize muscle protein synthesis.',
  'Consistency beats intensity. Showing up 4 days a week for a year beats 2 weeks of grinding every time.',
  'Protein is the building block of muscle. Aim for 1.6–2.2g per kg of bodyweight daily.',
  'Compound lifts like Squat, Deadlift, and Bench Press build the most muscle in the least time.',
  'Rest days are growth days. Your muscles grow when you rest, not when you train.',
  'Form over ego. A perfect rep at 80% weight beats a dangerous rep at 100%.',
  'Hydration matters. Even mild dehydration reduces strength output by up to 10%.',
  'Track your lifts. You can\'t improve what you don\'t measure.',
  'Mental focus during a set is as important as the weight on the bar. Visualize the muscle working.',
  'Warming up isn\'t optional. 5 minutes of activation prevents months of injury recovery.',
  'Supersets save time and spike your heart rate. Pair chest with back for efficiency.',
  'Don\'t skip legs. Lower body training releases the most testosterone and growth hormone.',
  'The best workout is the one you\'ll actually do. Consistency > perfection.',
  'Eat the majority of your carbs around your workout window for optimal energy and recovery.',
  'Deload weeks every 4–6 weeks prevent burnout and CNS fatigue — you come back stronger.',
  'Mind-muscle connection: slow down the eccentric (lowering) phase to maximize time under tension.',
  'Your first rep and your last rep should look identical. If they don\'t, reduce the weight.',
  'Pre-workout meals matter. Eat protein + carbs 60–90 minutes before training.',
  'Creatine monohydrate is the most researched and proven supplement. 3–5g daily, no cycling needed.',
  'Muscle soreness (DOMS) doesn\'t equal a good workout. It means you did something new.',
  'Breathing counts — exhale during exertion, inhale on the return. Never hold your breath under load.',
  'Every elite athlete was once a beginner. Stop comparing your chapter 1 to someone\'s chapter 20.',
  'Small daily improvements compound into massive results over a year. 1% better each day.',
  'The iron is always honest. It doesn\'t care about your excuses — only your effort.',
  'Recovery nutrition: consume 20–40g protein within 2 hours post-workout for optimal muscle repair.',
  'Grip strength limits your pulling movements. Use straps for back work to let the target muscle fatigue first.',
  'Set weekly goals, not just daily ones. Missing one day doesn\'t break progress — missing a week does.',
  'Your body adapts to stress. If training feels easy, you\'re not applying enough progressive overload.',
  'Believe in your program. Consistency with a decent plan beats constantly switching to the "optimal" one.',
];
