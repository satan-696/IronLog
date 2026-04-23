// web/src/pages/WeightPage.jsx
import { useEffect, useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { Scale, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useWeight } from '../hooks/useWeight.js';
import { dateKey } from '@ironlog/shared';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function WeightPage() {
  const { user, updateMe } = useAuth();
  const { logs, loading, loadLogs, saveWeight } = useWeight();
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLogs();
    if (user?.weightKg) setWeight(user.weightKg.toString());
  }, [loadLogs, user?.weightKg]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!weight || saving) return;
    setSaving(true);
    try {
      const val = parseFloat(weight);
      const today = dateKey(new Date());
      await saveWeight(val, today);
      // Also update user's current weight in profile
      await updateMe({ weightKg: val });
    } finally {
      setSaving(false);
    }
  };

  // ── Stats Calculation ──────────────────────────────────
  const stats = useMemo(() => {
    if (logs.length === 0) return null;
    
    const sorted = [...logs].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    const latest = sorted[sorted.length - 1]?.weightKg || 0;
    const first  = sorted[0]?.weightKg || 0;
    const diff   = latest - first;
    
    // Weekly Average (last 7 logs)
    const last7 = sorted.slice(-7);
    const avg7  = last7.reduce((s, l) => s + l.weightKg, 0) / (last7.length || 1);
    
    // Previous 7 logs for trend
    const prev7 = sorted.slice(-14, -7);
    const avgPrev7 = prev7.length > 0 
      ? prev7.reduce((s, l) => s + l.weightKg, 0) / prev7.length 
      : avg7;

    const trend = avg7 - avgPrev7;

    return { latest, first, diff, avg7, trend };
  }, [logs]);

  const chartData = useMemo(() => {
    return logs.map(l => ({
      date: l.dateKey.split('-').slice(1).join('/'),
      weight: l.weightKg
    }));
  }, [logs]);

  const goalText = user?.goal === 'muscle_gain' ? 'Gain' : 'Loss';
  const isProgressing = user?.goal === 'muscle_gain' ? stats?.trend > 0 : stats?.trend < 0;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-text1 tracking-wide">WEIGHT TRACKER</h1>
        <Badge variant={isProgressing ? 'lime' : 'warning'}>
          {stats ? `${goalText} Goal: ${isProgressing ? 'On Track' : 'Stalling'}` : 'Start Logging'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Log */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="text-accent" size={20} />
            <h2 className="font-display text-xl text-text1 tracking-wide">DAILY LOG</h2>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <Input 
              label="Today's Weight (kg)"
              type="number"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 75.5"
              required
            />
            <Button type="submit" fullWidth loading={saving}>SAVE WEIGHT</Button>
            <p className="text-textMuted text-[10px] text-center font-body">
              Logging daily helps visualize trends and calculate accurate averages.
            </p>
          </form>
        </Card>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-text2 text-xs font-body mb-1">Weekly Average</p>
            <p className="font-display text-3xl text-text1">{stats ? stats.avg7.toFixed(1) : '—'} <span className="text-sm">kg</span></p>
            <div className="flex items-center gap-1 mt-1">
              {stats?.trend > 0.1 ? <TrendingUp size={12} className="text-danger" /> : 
               stats?.trend < -0.1 ? <TrendingDown size={12} className="text-accent" /> : 
               <Minus size={12} className="text-textMuted" />}
              <span className={`text-[10px] font-body ${stats?.trend > 0.1 ? 'text-danger' : stats?.trend < -0.1 ? 'text-accent' : 'text-textMuted'}`}>
                {stats ? `${stats.trend > 0 ? '+' : ''}${stats.trend.toFixed(2)} kg vs last week` : 'No data'}
              </span>
            </div>
          </Card>

          <Card>
            <p className="text-text2 text-xs font-body mb-1">Total Progress</p>
            <p className="font-display text-3xl text-text1">{stats ? stats.diff.toFixed(1) : '—'} <span className="text-sm">kg</span></p>
            <p className="text-textMuted text-[10px] font-body mt-1">Since first log ({stats ? logs[0].dateKey : '—'})</p>
          </Card>

          <Card>
            <p className="text-text2 text-xs font-body mb-1">Current Goal</p>
            <p className="font-display text-3xl text-accent capitalize">{user?.goal?.replace('_', ' ') || '—'}</p>
            <p className="text-textMuted text-[10px] font-body mt-1">Target: {user?.goal === 'fat_loss' ? 'Deficit' : 'Surplus'}</p>
          </Card>
        </div>

        {/* Progress Chart */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-accent" size={20} />
              <h2 className="font-display text-xl text-text1 tracking-wide">WEIGHT PROGRESS</h2>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-text2 font-body">
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-accent rounded-full"/> Progress</div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {logs.length < 2 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <Calendar size={48} className="mb-2" />
                <p className="font-body text-sm">Need at least 2 logs to show progress chart.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8FF00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C8FF00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888899', fontSize: 10, fontFamily: 'DM Sans' }} 
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888899', fontSize: 10, fontFamily: 'DM Sans' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111118', border: '1px solid #2A2A38', borderRadius: 8, fontFamily: 'DM Sans' }}
                    itemStyle={{ color: '#C8FF00', fontSize: 12 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#C8FF00" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
