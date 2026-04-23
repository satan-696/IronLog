import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useAuth } from '../hooks/useAuth.jsx';
import { useWorkoutLog } from '../hooks/useWorkoutLog.js';
import { generateInsights } from '@ironlog/shared';
import DataService from '../services/dataService.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MACRO_COLORS = ['#C8FF00','#FFB800','#FF6B35'];

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-3">📊</div>
      <p className="text-text2 font-body text-sm">{message}</p>
    </div>
  );
}

export default function ReportPage() {
  const { user } = useAuth();
  const now      = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { monthLogs, loadMonthLogs } = useWorkoutLog();
  const [lastMonthLogs, setLastMonthLogs] = useState([]);

  const prevMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };

  useEffect(() => {
    loadMonthLogs(year, month);
    DataService.getMonthLogs(prevMonth.year, prevMonth.month)
      .then(setLastMonthLogs)
      .catch(() => {});
  }, [year, month]);

  // ── Stats ──────────────────────────────────────────────
  const sessions  = new Set(monthLogs.filter(l => l.completed).map(l => `${l.weekKey}-${l.dayIndex}`)).size;
  const totalSets = monthLogs.filter(l => l.completed).length;
  const totalVol  = monthLogs.reduce((s, l) => s + (l.weightKg || 0) * (l.reps || 0), 0);
  const streak    = sessions; // simplified

  // ── Exercise progress ──────────────────────────────────
  const byExercise = {};
  for (const l of monthLogs) {
    const name = l.exerciseName || l.exercise?.name;
    if (!name) continue;
    if (!byExercise[name]) byExercise[name] = [];
    byExercise[name].push(l);
  }
  const exerciseProgress = Object.entries(byExercise).slice(0, 8).map(([name, logs]) => {
    const byWeek = {};
    for (const l of logs) { if (!byWeek[l.weekKey]) byWeek[l.weekKey] = []; byWeek[l.weekKey].push(l); }
    const weeks = Object.keys(byWeek).sort();
    const data  = weeks.map(wk => ({ week: wk.split('-')[1], max: Math.max(...byWeek[wk].map(l => l.weightKg || 0)) }));
    const first = data[0]?.max || 0;
    const last  = data[data.length - 1]?.max || 0;
    const pct   = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
    return { name, data, first, last, pct };
  });

  // ── Volume chart ──────────────────────────────────────
  const volByWeek = {};
  for (const l of monthLogs) {
    if (!volByWeek[l.weekKey]) volByWeek[l.weekKey] = 0;
    volByWeek[l.weekKey] += (l.weightKg || 0) * (l.reps || 0);
  }
  const volData = Object.entries(volByWeek).sort().map(([wk, vol]) => ({
    week: `W${wk.split('-')[1]}`, vol: Math.round(vol),
  }));

  // ── Insights ──────────────────────────────────────────
  const insights = generateInsights(user || {}, monthLogs, lastMonthLogs, []);
  const insightIcon = (s) => s.includes('great') || s.includes('well') || s.includes('Excellent') ? '✅' : s.includes('Consider') || s.includes('No') || s.includes('dropped') ? '⚠️' : '💡';

  const navMonth = (dir) => {
    if (dir === -1) { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }
    else            { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-text1 tracking-wide">REPORTS</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navMonth(-1)} className="p-2 text-text2 hover:text-accent transition-colors"><ChevronLeft size={20}/></button>
          <span className="font-display text-xl text-text1 tracking-wide">{MONTH_NAMES[month-1].toUpperCase()} {year}</span>
          <button onClick={() => navMonth(1)} className="p-2 text-text2 hover:text-accent transition-colors"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sessions', value: sessions },
          { label: 'Total Sets', value: totalSets },
          { label: 'Volume (kg)', value: `${Math.round(totalVol / 1000)}k` },
          { label: 'Best Streak', value: `${streak}d` },
        ].map(s => (
          <Card key={s.label}>
            <p className="font-display text-4xl text-accent">{s.value || '—'}</p>
            <p className="text-text2 text-xs font-body mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Exercise Progress */}
      <Card>
        <p className="font-display text-xl text-text1 tracking-wide mb-4">EXERCISE PROGRESS</p>
        {exerciseProgress.length === 0
          ? <EmptyState message="Log some workouts this month to see progress" />
          : (
            <div className="space-y-4">
              {exerciseProgress.map(({ name, data, first, last, pct }) => (
                <div key={name} className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-text1 font-medium font-body text-sm">{name}</p>
                    <p className="text-text2 text-xs font-body">
                      {first}kg → <span className="text-accent">{last}kg</span>
                    </p>
                  </div>
                  <Badge variant={pct > 0 ? 'lime' : pct < 0 ? 'red' : 'gray'}>
                    {pct > 0 ? '+' : ''}{pct}%
                  </Badge>
                  <div className="w-28 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <Line type="monotone" dataKey="max" stroke="#C8FF00" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          )}
      </Card>

      {/* Volume chart */}
      <Card>
        <p className="font-display text-xl text-text1 tracking-wide mb-4">MONTHLY VOLUME</p>
        {volData.length === 0
          ? <EmptyState message="No volume data for this month" />
          : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" />
                <XAxis dataKey="week" tick={{ fill: '#888899', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888899', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid #2A2A38', borderRadius: 8, fontFamily: 'DM Sans' }} />
                <Bar dataKey="vol" fill="#C8FF00" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
      </Card>

      {/* Insights */}
      <Card>
        <p className="font-display text-xl text-text1 tracking-wide mb-4">INSIGHTS & TIPS</p>
        {insights.length === 0
          ? <p className="text-textMuted text-sm font-body text-center py-4">Log workouts and meals to unlock insights.</p>
          : (
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-surface2 rounded-lg border border-border">
                  <span className="text-lg flex-shrink-0">{insightIcon(ins)}</span>
                  <p className="text-text1 text-sm font-body">{ins}</p>
                </div>
              ))}
            </div>
          )}
      </Card>

      {/* Calorie compliance */}
      {user?.mealTrackingEnabled && (
        <Card>
          <p className="font-display text-xl text-text1 tracking-wide mb-4">CALORIE COMPLIANCE</p>
          <EmptyState message="Meal data for month view coming soon — check Meals page for daily tracking." />
        </Card>
      )}
    </div>
  );
}
