// web/src/pages/ProfilePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { bmi, maintenanceCalories, caloricStatus } from '@ironlog/shared';
import { GOALS, ACTIVITY_LEVELS } from '@ironlog/shared';
import DataService from '../services/dataService.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Avatar from '../components/ui/Avatar.jsx';

const STATUS_VARIANT = { surplus: 'warning', deficit: 'lime', maintenance: 'gray' };

export default function ProfilePage() {
  const { user, logout, updateMe } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({});
  const [error,   setError]   = useState('');

  if (!user) return null;

  const bmiVal   = user.heightCm && user.weightKg ? bmi(user.weightKg, user.heightCm) : null;
  const maint    = maintenanceCalories(user);
  const target   = user.dailyCalorieTarget || maint;
  const status   = caloricStatus(target, maint);
  const goalObj  = GOALS.find(g => g.id === user.goal);
  const actObj   = ACTIVITY_LEVELS.find(a => a.id === user.activityLevel);
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—';

  const startEdit = () => {
    setForm({
      name: user.name, gender: user.gender || 'male',
      age: user.age || '', heightCm: user.heightCm || '',
      weightKg: user.weightKg || '', goal: user.goal || '',
      activityLevel: user.activityLevel || 'moderate',
      dailyCalorieTarget: user.dailyCalorieTarget || '',
      mealTrackingEnabled: user.mealTrackingEnabled,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await updateMe({
        ...form,
        age: form.age ? Number(form.age) : undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        dailyCalorieTarget: form.dailyCalorieTarget ? Number(form.dailyCalorieTarget) : undefined,
      });
      setEditing(false);
    } catch (e) { setError(e.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const handleDelete = async () => {
    if (!window.confirm(`Delete your account and all data? This cannot be undone.`)) return;
    await DataService.deleteMe();
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <Avatar name={user.name} size="xl" className="mx-auto" />
        <div>
          <h1 className="font-display text-4xl text-text1 tracking-wide">{user.name.toUpperCase()}</h1>
          <p className="text-textMuted text-sm font-body">@{user.username}</p>
        </div>
        {goalObj && <Badge variant="lime">{goalObj.emoji} {goalObj.label}</Badge>}
      </div>

      {/* Stats row */}
      <Card>
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'Age',    value: user.age ? `${user.age}y`   : '—' },
            { label: 'Height', value: user.heightCm ? `${user.heightCm}cm` : '—' },
            { label: 'Weight', value: user.weightKg ? `${user.weightKg}kg` : '—' },
            { label: 'BMI',    value: bmiVal ?? '—' },
          ].map(s => (
            <div key={s.label}>
              <p className="font-display text-2xl text-text1">{s.value}</p>
              <p className="text-text2 text-xs font-body">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Maintenance card */}
      <Card>
        <p className="font-display text-sm text-text2 tracking-widest mb-2">MAINTENANCE CALORIES</p>
        <p className="font-display text-5xl text-text1 leading-none">{maint}</p>
        <p className="text-text2 text-sm font-body mt-1">{actObj?.label || 'Moderate activity'}</p>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm font-body">
            <span className="text-text2">Your Target</span>
            <span className="text-text1">{target} kcal</span>
          </div>
          <div className="flex justify-between text-sm font-body">
            <span className="text-text2">Maintenance</span>
            <span className="text-text1">{maint} kcal</span>
          </div>
          <div className="w-full h-2 bg-surface2 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(target / (maint * 1.5) * 100, 100)}%` }} />
          </div>
          <Badge variant={STATUS_VARIANT[status] || 'gray'} className="capitalize">{status}</Badge>
        </div>
      </Card>

      {/* Settings */}
      {!editing ? (
        <Card>
          <p className="font-display text-sm text-text2 tracking-widest mb-3">SETTINGS</p>
          <div className="space-y-1">
            {[
              { label: 'Edit Profile',    action: startEdit },
              { label: `Meal Tracking: ${user.mealTrackingEnabled ? 'ON' : 'OFF'}`, action: async () => { await updateMe({ mealTrackingEnabled: !user.mealTrackingEnabled }); } },
              { label: 'Account Info',   action: () => alert(`Username: ${user.username}\nMember since: ${memberSince}`) },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-text1 text-sm font-body hover:bg-surface2 transition-colors text-left">
                {item.label}
                <span className="text-textMuted">›</span>
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex gap-3">
            <Button variant="secondary" fullWidth onClick={handleLogout}>Logout</Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>Delete Account</Button>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="font-display text-sm text-text2 tracking-widest mb-4">EDIT PROFILE</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Full Name" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <Input label="Age" type="number" value={form.age || ''} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Height (cm)" type="number" value={form.heightCm || ''} onChange={e => setForm(p => ({ ...p, heightCm: e.target.value }))} />
              <Input label="Weight (kg)" type="number" value={form.weightKg || ''} onChange={e => setForm(p => ({ ...p, weightKg: e.target.value }))} />
            </div>
            <Input label="Daily Calorie Target" type="number" value={form.dailyCalorieTarget || ''} onChange={e => setForm(p => ({ ...p, dailyCalorieTarget: e.target.value }))} />
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setForm(p => ({ ...p, mealTrackingEnabled: !p.mealTrackingEnabled }))}
                className={`w-11 h-6 rounded-full transition-colors relative ${form.mealTrackingEnabled ? 'bg-accent' : 'bg-border'}`}>
                <div className={`w-4 h-4 rounded-full bg-bg absolute top-1 transition-transform ${form.mealTrackingEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
              <span className="text-text1 text-sm font-body">Meal Tracking</span>
            </label>
            {error && <p className="text-danger text-sm font-body">{error}</p>}
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setEditing(false)}>Cancel</Button>
              <Button fullWidth loading={saving} onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </Card>
      )}

      <p className="text-center text-textMuted text-xs font-body pb-4">IronLog v1.0 · Member since {memberSince}</p>
    </div>
  );
}
