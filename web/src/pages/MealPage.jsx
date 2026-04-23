// web/src/pages/MealPage.jsx
import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../hooks/useAuth.jsx';
import { useMealLog } from '../hooks/useMealLog.js';
import { dateKey, caloricStatus } from '@ironlog/shared';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import AddFoodModal from '../components/AddFoodModal.jsx';

const MEAL_TYPES = ['breakfast','lunch','dinner','snacks'];
const MACRO_COLORS = { protein: '#C8FF00', carbs: '#FFB800', fat: '#FF6B35' };
const STATUS_VARIANT = { surplus: 'warning', deficit: 'lime', maintenance: 'gray' };

function makeDateStrip() {
  const arr = [];
  const today = new Date();
  for (let i = -7; i <= 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    arr.push({ dk: dateKey(d), date: d, day: d.toLocaleDateString('en-US', { weekday: 'short' })[0], num: d.getDate() });
  }
  return arr;
}

export default function MealPage() {
  const { user } = useAuth();
  const { grouped, totals, loading, loadMeals, loadTotals, addFood, deleteFood } = useMealLog();
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [openMeal, setOpenMeal]         = useState('breakfast');
  const [showAdd, setShowAdd]           = useState(false);
  const [addMealType, setAddMealType]   = useState('breakfast');
  const strip = makeDateStrip();

  useEffect(() => {
    loadMeals(selectedDate);
    loadTotals(selectedDate);
  }, [selectedDate]);

  if (!user?.mealTrackingEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-sm w-full text-center">
          <div className="text-4xl mb-3">🍽️</div>
          <h2 className="font-display text-2xl text-text1 mb-2">Meal Tracking Disabled</h2>
          <p className="text-text2 text-sm font-body mb-4">Enable meal tracking in your profile to log foods and track macros.</p>
          <Button variant="secondary" fullWidth onClick={() => window.location.href = '/profile'}>Go to Profile</Button>
        </Card>
      </div>
    );
  }

  const target  = user?.dailyCalorieTarget || 2000;
  const status  = caloricStatus(totals?.calories || 0, target);
  const macroData = [
    { name: 'Protein', value: Math.round(totals?.protein || 0), color: MACRO_COLORS.protein },
    { name: 'Carbs',   value: Math.round(totals?.carbs   || 0), color: MACRO_COLORS.carbs   },
    { name: 'Fat',     value: Math.round(totals?.fat     || 0), color: MACRO_COLORS.fat      },
  ];

  return (
    <div className="space-y-6 fade-in">
      <h1 className="font-display text-4xl text-text1 tracking-wide">MEALS</h1>

      {/* Date strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {strip.map(({ dk, day, num }) => (
          <button key={dk} onClick={() => setSelectedDate(dk)}
            className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all flex-shrink-0 min-w-[52px] ${selectedDate === dk ? 'bg-accent border-accent' : 'bg-surface2 border-border hover:border-text2'}`}>
            <span className={`text-[10px] font-body ${selectedDate === dk ? 'text-bg' : 'text-text2'}`}>{day}</span>
            <span className={`font-display text-lg leading-none ${selectedDate === dk ? 'text-bg' : 'text-text1'}`}>{num}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — meal sections */}
        <div className="lg:col-span-2 space-y-3">
          {MEAL_TYPES.map(mt => {
            const foods    = grouped[mt] || [];
            const mtCals   = foods.reduce((s, f) => s + f.calories, 0);
            const isOpen   = openMeal === mt;
            return (
              <Card key={mt}>
                <div className="w-full flex items-center justify-between cursor-pointer" onClick={() => setOpenMeal(isOpen ? null : mt)}>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl text-text1 tracking-wide capitalize">{mt}</span>
                    {mtCals > 0 && <span className="text-accent text-sm font-body font-medium">{Math.round(mtCals)} kcal</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); setAddMealType(mt); setShowAdd(true); }}
                      className="p-1.5 text-text2 hover:text-accent transition-colors rounded-lg hover:bg-surface2">
                      <Plus size={16} />
                    </button>
                    <ChevronDown size={16} className={`text-text2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-3 space-y-2 fade-in">
                    {foods.length === 0 && (
                      <p className="text-textMuted text-sm font-body text-center py-3">No foods logged — tap + to add</p>
                    )}
                    {foods.map(f => (
                      <div key={f.id} className="flex items-start justify-between p-3 bg-surface2 rounded-lg group">
                        <div className="min-w-0">
                          <p className="text-text1 text-sm font-medium font-body">{f.foodName}</p>
                          <p className="text-text2 text-xs font-body">{f.quantity}{f.unit} · {Math.round(f.calories)} kcal</p>
                          <p className="text-textMuted text-xs font-body">P {f.proteinG}g · C {f.carbsG}g · F {f.fatG}g</p>
                        </div>
                        <button onClick={() => deleteFood(f.id)} className="p-1.5 text-text2 hover:text-danger transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right — daily summary */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <p className="font-display text-sm text-text2 tracking-widest mb-3">DAILY SUMMARY</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-text2 text-sm font-body">Calories</span>
              <span className="font-display text-lg text-text1">{Math.round(totals?.calories || 0)} / {target}</span>
            </div>
            <div className="w-full h-2 bg-surface2 rounded-full mb-3 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{
                width: `${Math.min((totals?.calories || 0) / target * 100, 100)}%`,
                backgroundColor: totals?.calories > target ? '#FF4444' : '#C8FF00',
              }} />
            </div>
            <Badge variant={STATUS_VARIANT[status] || 'gray'} className="mb-4 capitalize">{status}</Badge>

            {/* Macro donut */}
            <div className="flex justify-center mb-3">
              <PieChart width={140} height={140}>
                <Pie data={macroData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                  {macroData.map((m, i) => <Cell key={i} fill={m.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid #2A2A38', borderRadius: 8, fontFamily: 'DM Sans', fontSize: 12 }} />
              </PieChart>
            </div>
            <div className="space-y-2">
              {macroData.map(m => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-text2 text-xs font-body">{m.name}</span>
                  </div>
                  <span className="text-text1 text-sm font-body">{m.value}g</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <AddFoodModal isOpen={showAdd} onClose={() => setShowAdd(false)} mealType={addMealType} onAdd={addFood} />
    </div>
  );
}
