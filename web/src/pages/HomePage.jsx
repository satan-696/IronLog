// web/src/pages/HomePage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useSchedule } from '../hooks/useSchedule.js';
import { useMealLog } from '../hooks/useMealLog.js';
import { useWorkoutLog } from '../hooks/useWorkoutLog.js';
import { useWeight } from '../hooks/useWeight.js';
import { MOTIVATIONAL_TIPS } from '@ironlog/shared';
import { weekKey, dateKey, dayOfYear } from '@ironlog/shared';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';

const DAY_NAMES  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const FULL_DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'; };

export default function HomePage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { schedule, loadSchedule } = useSchedule();
  const { totals, loadMeals, loadTotals } = useMealLog();
  const { weekLogs, loadWeekLogs } = useWorkoutLog();
  const { logs: weightLogs, loadLogs: loadWeightLogs } = useWeight();

  const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0
  const today      = schedule?.[todayIndex];
  const tip        = MOTIVATIONAL_TIPS[dayOfYear(new Date()) % 30];
  const wk         = weekKey(new Date());
  const dk         = dateKey(new Date());

  useEffect(() => { loadSchedule(); }, []);
  useEffect(() => { if (wk) loadWeekLogs(wk); }, [wk]);
  useEffect(() => { loadWeightLogs(); }, [loadWeightLogs]);
  useEffect(() => { if (user?.mealTrackingEnabled && dk) { loadMeals(dk); loadTotals(dk); } }, [user?.mealTrackingEnabled, dk]);

  // Weekly streak: which days have logs?
  const loggedDays = new Set(weekLogs.filter(l => l.completed).map(l => l.dayIndex));
  const trainingDays = schedule?.filter(d => d.muscleGroups?.length > 0) || [];
  const completedCount = trainingDays.filter(d => loggedDays.has(d.dayIndex)).length;

  // Calorie ring
  const target   = user?.dailyCalorieTarget || 2000;
  const consumed = totals?.calories || 0;
  const ringPct  = Math.min(consumed / target, 1);
  const R = 54; const C = 2 * Math.PI * R;
  const dash = ringPct * C;

  return (
    <div className="space-y-6 fade-in">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-4xl text-text1 tracking-wide">
          GOOD {getGreeting().toUpperCase()},
        </h1>
        <h2 className="font-display text-4xl text-accent tracking-wide">{user?.name?.toUpperCase() || 'ATHLETE'}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Today's Plan */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display text-xl text-text1 tracking-wide">{FULL_DAYS[todayIndex]?.toUpperCase()}</h3>
                <p className="text-text2 text-xs font-body">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              {today?.muscleGroups?.length > 0
                ? <Badge variant="lime">TRAINING</Badge>
                : <Badge variant="gray">REST</Badge>}
            </div>
            {today?.muscleGroups?.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {today.muscleGroups.map(mg => (
                    <Badge key={mg} variant="lime" className="capitalize">{mg.replace('_',' ')}</Badge>
                  ))}
                </div>
                <Button variant="secondary" fullWidth onClick={() => navigate('/track')}>
                  Log Workout →
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="font-display text-4xl text-text2 tracking-widest">REST DAY</p>
                <p className="text-textMuted text-sm font-body italic mt-2">Recovery is where growth happens</p>
              </div>
            )}
          </Card>

          {/* Weekly Streak */}
          <Card>
            <p className="font-display text-sm text-text2 tracking-widest mb-3">THIS WEEK</p>
            <div className="flex justify-between mb-3">
              {Array.from({ length: 7 }, (_, i) => {
                const isTraining = schedule?.[i]?.muscleGroups?.length > 0;
                const isLogged   = loggedDays.has(i);
                const isRest     = !isTraining;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={[
                      'w-9 h-9 rounded-full flex items-center justify-center text-xs font-display transition-all',
                      isLogged ? 'bg-accent text-bg' :
                      isRest   ? 'bg-border text-textMuted' :
                                 'border-2 border-border text-text2',
                    ].join(' ')}>
                      {DAY_NAMES[i][0]}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-text2 text-sm font-body">
              <span className="text-accent font-medium">{completedCount}</span> / {trainingDays.length} sessions this week
            </p>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Calorie Ring */}
          {user?.mealTrackingEnabled && (
            <Card>
              <p className="font-display text-sm text-text2 tracking-widest mb-3">TODAY'S CALORIES</p>
              <div className="flex items-center gap-6">
                <svg width="128" height="128" className="flex-shrink-0">
                  <circle cx="64" cy="64" r={R} fill="none" stroke="#2A2A38" strokeWidth="10" />
                  <circle
                    cx="64" cy="64" r={R} fill="none"
                    stroke={ringPct >= 1 ? '#FF4444' : '#C8FF00'}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${dash} ${C}`}
                    strokeDashoffset={C * 0.25}
                    className="ring-progress"
                    transform="rotate(-90 64 64)"
                  />
                  <text x="64" y="60" textAnchor="middle" fill="#F0F0F0" fontFamily="Bebas Neue" fontSize="22">{Math.round(consumed)}</text>
                  <text x="64" y="75" textAnchor="middle" fill="#888899" fontFamily="DM Sans" fontSize="11">/ {target} kcal</text>
                </svg>
                <div className="space-y-2 flex-1">
                  {[
                    { label: 'Protein', val: totals?.protein || 0, color: '#C8FF00' },
                    { label: 'Carbs',   val: totals?.carbs   || 0, color: '#FFB800' },
                    { label: 'Fat',     val: totals?.fat     || 0, color: '#FF6B35' },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between">
                      <span className="text-text2 text-xs font-body">{m.label}</span>
                      <span className="text-text1 text-sm font-display" style={{ color: m.color }}>{Math.round(m.val)}g</span>
                    </div>
                  ))}
                  <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/meals')} className="mt-2">
                    Log Meals
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Weight */}
          <Card>
            <p className="font-display text-sm text-text2 tracking-widest mb-3">RECENT WEIGHT</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-4xl text-text1">
                  {weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : (user?.weightKg || '—')}
                  <span className="text-sm ml-1">kg</span>
                </p>
                <p className="text-textMuted text-[10px] font-body mt-1">
                  {weightLogs.length > 0 ? `Logged ${weightLogs[weightLogs.length - 1].dateKey}` : 'No logs yet'}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/weight')}>
                Track Progress
              </Button>
            </div>
          </Card>

          {/* Tip of the Day */}
          <Card active>
            <p className="font-display text-xs text-text2 tracking-widest mb-2">TIP OF THE DAY</p>
            <p className="text-text1 text-sm font-body italic leading-relaxed">{tip}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
