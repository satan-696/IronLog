// web/src/pages/TrackerPage.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useSchedule } from '../hooks/useSchedule.js';
import { useExercises } from '../hooks/useExercises.js';
import { useWorkoutLog } from '../hooks/useWorkoutLog.js';
import { weekKey } from '@ironlog/shared';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';

const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const FULL_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function weekStart(wk) {
  const [y, w] = wk.split('-').map(Number);
  const jan4 = new Date(y, 0, 4);
  const thursday = new Date(jan4);
  thursday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + 3);
  const weekOneThursday = new Date(thursday);
  weekOneThursday.setDate(thursday.getDate() - (w - 1) * 7);
  const monday = new Date(weekOneThursday);
  monday.setDate(weekOneThursday.getDate() - 3);
  return monday;
}

function weekLabel(wk) {
  const start = weekStart(wk);
  const end   = new Date(start); end.setDate(start.getDate() + 6);
  const fmt   = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${wk.replace('-', ' · W')} · ${fmt(start)}–${fmt(end)}`;
}

export default function TrackerPage() {
  const { schedule, loadSchedule } = useSchedule();
  const { exercisesByDay, loadExercises } = useExercises();
  const { weekLogs, loadWeekLogs, saveSet, deleteSet } = useWorkoutLog();

  const [wk, setWk]               = useState(weekKey(new Date()));
  const [activeDay, setActiveDay]  = useState(null);
  const [expanded, setExpanded]    = useState({});
  const [localSets, setLocalSets]  = useState({});
  const [celebrated, setCelebrated] = useState(false);
  const debounceRef = useRef({});

  const trainingDays = schedule?.filter(d => d.muscleGroups?.length > 0) || [];

  useEffect(() => { loadSchedule(); }, []);
  useEffect(() => {
    if (trainingDays.length && !activeDay) setActiveDay(trainingDays[0]);
  }, [trainingDays.length]);
  useEffect(() => { loadWeekLogs(wk); }, [wk]);
  useEffect(() => {
    if (activeDay?.id) loadExercises(activeDay.id);
  }, [activeDay?.id]);

  const exercises = activeDay ? (exercisesByDay[activeDay.id] || []) : [];

  // Build set state from weekLogs
  const logsForDay = weekLogs.filter(l => l.dayIndex === activeDay?.dayIndex);

  const getSetKey = (exId, setNum) => `${exId}-${setNum}`;

  const getSetData = (exId, setNum) => {
    const key = getSetKey(exId, setNum);
    if (localSets[key] !== undefined) return localSets[key];
    const log = logsForDay.find(l => l.exerciseId === exId && l.setNumber === setNum);
    return log ? { weightKg: log.weightKg ?? '', reps: log.reps ?? '', completed: log.completed, id: log.id } : { weightKg: '', reps: '', completed: false };
  };

  const updateSet = useCallback((exId, exName, setNum, field, value) => {
    const key = getSetKey(exId, setNum);
    setLocalSets(prev => ({ ...prev, [key]: { ...prev[key], ...getSetData(exId, setNum), [field]: value } }));

    clearTimeout(debounceRef.current[key]);
    debounceRef.current[key] = setTimeout(async () => {
      const current = { ...getSetData(exId, setNum), [field]: value };
      await saveSet({
        exerciseId: exId, exerciseName: exName, weekKey: wk,
        dayIndex: activeDay?.dayIndex, setNumber: setNum,
        weightKg: current.weightKg || null, reps: current.reps || null,
        completed: current.completed,
      });
    }, 500);
  }, [logsForDay, wk, activeDay]);

  // Completion stats
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const doneSets  = exercises.reduce((sum, ex) =>
    sum + Array.from({ length: ex.sets }, (_, i) => getSetData(ex.id, i + 1)).filter(s => s.completed).length, 0
  );
  const completionRatio = totalSets > 0 ? doneSets / totalSets : 0;

  const handleCompleteDay = () => {
    setCelebrated(true);
    setTimeout(() => setCelebrated(false), 2000);
  };

  const addSet = async (ex) => {
    const nextNum = ex.sets + 1;
    await saveSet({ exerciseId: ex.id, exerciseName: ex.name, weekKey: wk, dayIndex: activeDay?.dayIndex, setNumber: nextNum, completed: false });
    loadWeekLogs(wk);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => { const d = weekStart(wk); d.setDate(d.getDate()-7); setWk(weekKey(d)); }} className="p-2 text-text2 hover:text-accent transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="font-display text-2xl text-text1 tracking-wide">{weekLabel(wk)}</h1>
        </div>
        <button onClick={() => { const d = weekStart(wk); d.setDate(d.getDate()+7); setWk(weekKey(d)); }} className="p-2 text-text2 hover:text-accent transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekly ring + progress */}
      <div className="flex items-center gap-4">
        <svg width="56" height="56">
          <circle cx="28" cy="28" r="22" fill="none" stroke="#2A2A38" strokeWidth="6"/>
          <circle cx="28" cy="28" r="22" fill="none" stroke="#C8FF00" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${completionRatio * 138} 138`} strokeDashoffset="34.5"
            transform="rotate(-90 28 28)" className="ring-progress"/>
        </svg>
        <div>
          <p className="font-display text-2xl text-accent">{doneSets}<span className="text-text2 text-lg"> / {totalSets}</span></p>
          <p className="text-text2 text-xs font-body">sets completed today</p>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {trainingDays.map(day => {
          const dayLogs = weekLogs.filter(l => l.dayIndex === day.dayIndex && l.completed);
          const dayEx   = exercisesByDay[day.id] || [];
          const dayDone = dayEx.length > 0 && dayLogs.length >= dayEx.length * 0.5;
          return (
            <button key={day.dayIndex} onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-body whitespace-nowrap border transition-all flex-shrink-0 ${activeDay?.dayIndex === day.dayIndex ? 'bg-accent/15 border-accent text-accent' : 'border-border text-text2 hover:border-text2 bg-surface2'}`}>
              {DAY_NAMES[day.dayIndex]} {dayDone && '✓'}
            </button>
          );
        })}
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {exercises.map(ex => {
          const isOpen = expanded[ex.id];
          const setCount = ex.sets;
          return (
            <Card key={ex.id}>
              <button className="w-full flex items-center justify-between" onClick={() => setExpanded(p => ({ ...p, [ex.id]: !p[ex.id] }))}>
                <div className="flex items-center gap-3">
                  <span className="text-text1 font-medium font-body">{ex.name}</span>
                  <Badge variant="gray">{setCount} sets</Badge>
                </div>
                <ChevronDown size={16} className={`text-text2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="mt-4 space-y-2 fade-in">
                  {/* Set header */}
                  <div className="grid grid-cols-[60px_1fr_1fr_40px] gap-2 px-1">
                    <span className="text-textMuted text-xs font-body">SET</span>
                    <span className="text-textMuted text-xs font-body">KG</span>
                    <span className="text-textMuted text-xs font-body">REPS</span>
                    <span className="text-textMuted text-xs font-body">✓</span>
                  </div>
                  {Array.from({ length: setCount }, (_, i) => {
                    const setNum = i + 1;
                    const data   = getSetData(ex.id, setNum);
                    return (
                      <div key={setNum} className="grid grid-cols-[60px_1fr_1fr_40px] gap-2 items-center">
                        <span className="text-text2 text-sm font-body pl-1">Set {setNum}</span>
                        <input
                          type="number" value={data.weightKg}
                          onChange={e => updateSet(ex.id, ex.name, setNum, 'weightKg', e.target.value)}
                          className="h-9 px-2 bg-surface2 border border-border rounded-lg text-text1 font-body text-sm outline-none focus:border-accent"
                          placeholder="0"
                        />
                        <input
                          type="number" value={data.reps}
                          onChange={e => updateSet(ex.id, ex.name, setNum, 'reps', e.target.value)}
                          className="h-9 px-2 bg-surface2 border border-border rounded-lg text-text1 font-body text-sm outline-none focus:border-accent"
                          placeholder="0"
                        />
                        <button onClick={() => updateSet(ex.id, ex.name, setNum, 'completed', !data.completed)}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${data.completed ? 'bg-accent border-accent text-bg' : 'border-border text-text2 hover:border-accent'}`}>
                          {data.completed && <CheckCircle size={16} />}
                        </button>
                      </div>
                    );
                  })}
                  <button onClick={() => addSet(ex)} className="flex items-center gap-1 text-text2 text-sm font-body hover:text-accent transition-colors mt-2 pl-1">
                    <Plus size={14} /> Add Set
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Complete Day button */}
      {exercises.length > 0 && (
        <div className="sticky bottom-4">
          <Button
            fullWidth
            variant={completionRatio >= 0.5 ? 'primary' : 'secondary'}
            disabled={completionRatio < 0.5}
            onClick={handleCompleteDay}
            className={celebrated ? 'complete-pulse' : ''}
          >
            {celebrated ? '💪 Day Complete!' : `Complete Day (${doneSets}/${totalSets} sets)`}
          </Button>
        </div>
      )}
    </div>
  );
}
