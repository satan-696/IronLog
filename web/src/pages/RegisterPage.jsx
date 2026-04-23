// web/src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { GOALS, ACTIVITY_LEVELS } from '@ironlog/shared';
import { maintenanceCalories, caloricStatus } from '@ironlog/shared';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import Badge from '../components/ui/Badge.jsx';

const GENDERS = ['male', 'female', 'other'];
const STEPS = ['Identity', 'Goals', 'Calories'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    name: '', gender: 'male', age: '', heightCm: '', weightKg: '',
    goal: '', activityLevel: 'moderate',
    dailyCalorieTarget: '', mealTrackingEnabled: false,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const maintenance = (form.weightKg && form.heightCm && form.age)
    ? maintenanceCalories({ gender: form.gender, weightKg: Number(form.weightKg), heightCm: Number(form.heightCm), age: Number(form.age), activityLevel: form.activityLevel })
    : 0;

  const calTarget = Number(form.dailyCalorieTarget) || maintenance;
  const calStatus = maintenance > 0 ? caloricStatus(calTarget, maintenance) : null;
  const calStatusVariant = { surplus: 'warning', deficit: 'lime', maintenance: 'gray' };

  const validateStep = () => {
    if (step === 0) {
      if (!form.username.trim() || form.username.length < 3) { setError('Username must be at least 3 characters'); return false; }
      if (!/^[a-zA-Z0-9_]+$/.test(form.username)) { setError('Username: letters, numbers, underscores only'); return false; }
      if (!form.password || form.password.length < 6) { setError('Password must be at least 6 characters'); return false; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return false; }
      if (!form.name.trim() || form.name.length < 2) { setError('Name must be at least 2 characters'); return false; }
    }
    if (step === 1) {
      if (!form.goal) { setError('Please select a goal'); return false; }
    }
    setError(''); return true;
  };

  const nextStep = () => { if (validateStep()) { setStep(s => s + 1); if (step === 1 && maintenance) set('dailyCalorieTarget', String(maintenance)); } };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      await register({
        ...form,
        age: form.age ? Number(form.age) : undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        dailyCalorieTarget: calTarget || undefined,
      });
      navigate('/home', { replace: true });
    } catch (err) { setError(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg fade-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl logo-text tracking-widest">IRONLOG</h1>
          <p className="text-text2 text-sm font-body mt-1">Create your account</p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display transition-all ${i <= step ? 'bg-accent text-bg' : 'bg-surface2 border border-border text-text2'}`}>{i + 1}</div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-accent' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-card p-6 space-y-4">
          <h2 className="font-display text-xl text-text1 tracking-wide">{STEPS[step].toUpperCase()}</h2>

          {/* Step 1: Identity */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input id="username" label="Username" value={form.username} onChange={e => set('username', e.target.value)} placeholder="john_doe" />
                <Input id="name" label="Full Name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input id="password" label="Password" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" />
                <Input id="confirmPassword" label="Confirm Password" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <p className="text-text2 text-sm font-medium mb-2 font-body">Gender</p>
                <div className="flex gap-2">
                  {GENDERS.map(g => (
                    <button key={g} type="button" onClick={() => set('gender', g)}
                      className={`flex-1 py-2.5 rounded-button text-sm font-medium font-body border capitalize transition-all ${form.gender === g ? 'bg-accent text-bg border-accent' : 'bg-surface2 border-border text-text2 hover:border-text2'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input id="age" label="Age" type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" />
                <Input id="height" label="Height (cm)" type="number" value={form.heightCm} onChange={e => set('heightCm', e.target.value)} placeholder="175" />
                <Input id="weight" label="Weight (kg)" type="number" value={form.weightKg} onChange={e => set('weightKg', e.target.value)} placeholder="75" />
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => (
                  <button key={g.id} type="button" onClick={() => set('goal', g.id)}
                    className={`p-4 rounded-card border text-left transition-all ${form.goal === g.id ? 'border-l-[3px] border-l-accent border-border/50 bg-accent/5' : 'border-border bg-surface2 hover:border-accent/40'}`}>
                    <div className="text-2xl mb-1">{g.emoji}</div>
                    <div className="font-display text-base text-text1 tracking-wide">{g.label.toUpperCase()}</div>
                    <div className="text-text2 text-xs font-body mt-0.5">{g.description}</div>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-text2 text-sm font-medium font-body">Activity Level</p>
                {ACTIVITY_LEVELS.map(al => (
                  <button key={al.id} type="button" onClick={() => set('activityLevel', al.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${form.activityLevel === al.id ? 'border-l-[3px] border-l-accent border-border/50 bg-surface2' : 'border-border bg-surface2 hover:border-accent/30'}`}>
                    <div className="text-left">
                      <p className="text-text1 text-sm font-medium font-body">{al.label}</p>
                      <p className="text-text2 text-xs font-body">{al.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ml-3 ${form.activityLevel === al.id ? 'bg-accent border-accent' : 'border-border'}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Calories */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-text2 text-sm font-body uppercase tracking-wider mb-1">Estimated Maintenance</p>
                <p className="font-display text-7xl text-accent leading-none">{maintenance || '—'}</p>
                <p className="text-text2 text-sm font-body mt-1">kcal / day</p>
              </div>
              <div>
                <Input
                  id="dailyCalTarget"
                  label="Daily Calorie Target"
                  type="number"
                  value={form.dailyCalorieTarget || String(maintenance)}
                  onChange={e => set('dailyCalorieTarget', e.target.value)}
                  placeholder={String(maintenance)}
                />
                {calStatus && (
                  <div className="mt-2">
                    <Badge variant={calStatusVariant[calStatus] || 'gray'} className="capitalize">{calStatus}</Badge>
                    <span className="text-text2 text-xs ml-2 font-body">
                      {calStatus === 'surplus' ? `+${calTarget - maintenance} kcal above maintenance` :
                       calStatus === 'deficit' ? `${maintenance - calTarget} kcal below maintenance` :
                       'At maintenance'}
                    </span>
                  </div>
                )}
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border bg-surface2">
                <div onClick={() => set('mealTrackingEnabled', !form.mealTrackingEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${form.mealTrackingEnabled ? 'bg-accent' : 'bg-border'}`}>
                  <div className={`w-4 h-4 rounded-full bg-bg absolute top-1 transition-transform ${form.mealTrackingEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
                <span className="text-text1 text-sm font-body">Enable Meal Tracking</span>
              </label>
            </div>
          )}

          {error && (
            <div className="text-danger text-sm font-body bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && <Button variant="secondary" onClick={() => setStep(s => s - 1)}>Back</Button>}
            {step < 2
              ? <Button fullWidth onClick={nextStep}>Next →</Button>
              : <Button fullWidth onClick={handleSubmit} loading={loading}>Create Account</Button>
            }
          </div>

          {step === 0 && (
            <p className="text-center text-text2 text-sm font-body">
              Already have an account? <Link to="/login" className="text-accent hover:underline">Login</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
