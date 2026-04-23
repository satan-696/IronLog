// web/src/pages/SchedulePage.jsx
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { useSchedule } from '../hooks/useSchedule.js';
import { POPULAR_SPLITS } from '@ironlog/shared';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import DayScheduleModal from '../components/DayScheduleModal.jsx';

const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function SchedulePage() {
  const { schedule, loading, loadSchedule, saveDay, applyPresetSplit } = useSchedule();
  const [tab, setTab]           = useState('my schedule');
  const [editDay, setEditDay]   = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [applying, setApplying] = useState(null);

  useEffect(() => { loadSchedule(); }, []);

  const handleApplySplit = async (splitId) => {
    if (!window.confirm('This will replace your current schedule and exercises. Your workout history will be preserved. Continue?')) return;
    setApplying(splitId);
    try { await applyPresetSplit(splitId); setTab('my schedule'); }
    finally { setApplying(null); }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-text1 tracking-wide">SCHEDULE</h1>
        <SegmentedControl
          options={['my schedule', 'explore splits']}
          value={tab}
          onChange={setTab}
        />
      </div>

      {/* ── MY SCHEDULE ── */}
      {tab === 'my schedule' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && !schedule && Array.from({length:7}).map((_,i) => (
            <div key={i} className="h-24 bg-surface border border-border rounded-card animate-pulse" />
          ))}
          {schedule?.map((day) => (
            <Card key={day.dayIndex}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl text-text1 tracking-wide">{DAY_NAMES[day.dayIndex]?.toUpperCase()}</h3>
                  <Badge variant={day.muscleGroups?.length > 0 ? 'lime' : 'gray'} className="mt-1">
                    {day.muscleGroups?.length > 0 ? 'TRAINING' : 'REST'}
                  </Badge>
                </div>
                <button onClick={() => setEditDay(day)} className="p-2 text-text2 hover:text-accent transition-colors rounded-lg hover:bg-surface2">
                  <Edit2 size={16} />
                </button>
              </div>
              {day.muscleGroups?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {day.muscleGroups.map(mg => (
                    <Badge key={mg} variant="lime" className="capitalize text-xs">{mg.replace('_',' ')}</Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ── EXPLORE SPLITS ── */}
      {tab === 'explore splits' && (
        <div className="space-y-3">
          {POPULAR_SPLITS.map((split) => {
            const isExpanded = expanded === split.id;
            return (
              <Card key={split.id} className="cursor-pointer" onClick={() => setExpanded(isExpanded ? null : split.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-display text-xl text-text1 tracking-wide">{split.name.toUpperCase()}</h3>
                    <Badge variant="lime">{split.daysPerWeek} days/wk</Badge>
                    <span className="text-text2 text-xs font-body">{split.bestFor}</span>
                  </div>
                  {isExpanded ? <ChevronUp size={18} className="text-text2 flex-shrink-0" /> : <ChevronDown size={18} className="text-text2 flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4 fade-in" onClick={e => e.stopPropagation()}>
                    <p className="text-text2 text-sm font-body">{split.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-success text-xs font-medium mb-1.5 font-body uppercase tracking-wider">Pros</p>
                        <ul className="space-y-1">
                          {split.pros.map(p => <li key={p} className="text-text1 text-sm font-body flex gap-2"><span className="text-success">✓</span>{p}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="text-danger text-xs font-medium mb-1.5 font-body uppercase tracking-wider">Cons</p>
                        <ul className="space-y-1">
                          {split.cons.map(c => <li key={c} className="text-text1 text-sm font-body flex gap-2"><span className="text-danger">✗</span>{c}</li>)}
                        </ul>
                      </div>
                    </div>
                    {/* 7-day preview */}
                    <div className="overflow-x-auto">
                      <div className="flex gap-2 min-w-max">
                        {split.schedule.map(d => (
                          <div key={d.dayIndex} className="text-center">
                            <p className="text-textMuted text-xs font-body mb-1">
                              {['M','T','W','T','F','S','S'][d.dayIndex]}
                            </p>
                            <div className={`px-2 py-1 rounded text-xs font-body whitespace-nowrap ${d.muscleGroups.length ? 'bg-accent/15 text-accent border border-accent/30' : 'bg-border text-textMuted'}`}>
                              {d.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="secondary" fullWidth
                      loading={applying === split.id}
                      onClick={() => handleApplySplit(split.id)}
                    >
                      Use This Split
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <DayScheduleModal
        isOpen={!!editDay}
        onClose={() => setEditDay(null)}
        day={editDay}
        onSave={saveDay}
      />
    </div>
  );
}
