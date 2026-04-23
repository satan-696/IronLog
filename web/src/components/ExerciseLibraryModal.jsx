// web/src/components/ExerciseLibraryModal.jsx
import { useState, useEffect } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import { EXERCISE_LIBRARY, MUSCLE_GROUPS } from '@ironlog/shared';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';
import Badge from './ui/Badge.jsx';
import Stepper from './ui/Stepper.jsx';
import SegmentedControl from './ui/SegmentedControl.jsx';

const DIFF_VARIANT = { beginner: 'gray', intermediate: 'warning', advanced: 'red' };

export default function ExerciseLibraryModal({
  isOpen, onClose, scheduleId, targetMuscleGroups = [],
  onAdd, customExercises = [], onAddCustom, onDeleteCustom,
}) {
  const [tab, setTab] = useState('browse');
  const [filterMg, setFilterMg] = useState('chest');
  const [search, setSearch] = useState('');
  const [configEx, setConfigEx] = useState(null);
  const [sets, setSets] = useState(3);
  const [targetReps, setTargetReps] = useState('8-12');
  const [adding, setAdding] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMg, setCustomMg] = useState('chest');
  const [customSets, setCustomSets] = useState(3);
  const [customReps, setCustomReps] = useState('8-12');
  const [customNotes, setCustomNotes] = useState('');
  const [customErr, setCustomErr] = useState('');
  const [savingCustom, setSavingCustom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab('browse');
      setSearch('');
      setConfigEx(null);
      setFilterMg(targetMuscleGroups[0] || MUSCLE_GROUPS[0]);
    }
  }, [isOpen]);

  const allForFilter = (EXERCISE_LIBRARY[filterMg] || []).filter(ex =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePick = async (ex) => {
    if (configEx?.name === ex.name) {
      setAdding(true);
      try {
        await onAdd({ scheduleId, name: ex.name, muscleGroup: filterMg, sets, targetReps });
        setConfigEx(null); onClose();
      } finally { setAdding(false); }
    } else {
      setConfigEx(ex); setSets(3); setTargetReps('8-12');
    }
  };

  const handleAddCustom = async () => {
    if (!customName.trim()) { setCustomErr('Name is required'); return; }
    setSavingCustom(true); setCustomErr('');
    try {
      await onAddCustom({ scheduleId, name: customName.trim(), muscleGroup: customMg, sets: customSets, targetReps: customReps, notes: customNotes });
      setCustomName(''); setCustomNotes(''); onClose();
    } catch (e) { setCustomErr(e.message || 'Failed'); }
    finally { setSavingCustom(false); }
  };

  const filterGroups = targetMuscleGroups.length ? targetMuscleGroups : MUSCLE_GROUPS;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Exercise" size="lg">
      <SegmentedControl options={['browse', 'my library', 'custom']} value={tab} onChange={setTab} className="mb-5" />

      {tab === 'browse' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {filterGroups.map(mg => (
              <button key={mg} type="button" onClick={() => { setFilterMg(mg); setConfigEx(null); }}
                className={`px-3 py-1 rounded-full text-xs font-medium font-body border transition-all capitalize ${filterMg === mg ? 'bg-accent/15 border-accent text-accent' : 'bg-surface2 border-border text-text2 hover:border-text2'}`}>
                {mg.replace('_', ' ')}
              </button>
            ))}
          </div>
          <Input placeholder="Search exercises…" value={search} onChange={e => setSearch(e.target.value)} icon={Search} />
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {allForFilter.map(ex => (
              <div key={ex.name}>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface2 hover:border-accent/50 cursor-pointer transition-colors" onClick={() => handlePick(ex)}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-text1 font-medium font-body text-sm">{ex.name}</span>
                    <Badge variant={DIFF_VARIANT[ex.difficulty]}>{ex.difficulty}</Badge>
                    {ex.isCompound && <Badge variant="lime">compound</Badge>}
                  </div>
                  <Plus size={16} className="text-accent flex-shrink-0 ml-2" />
                </div>
                {configEx?.name === ex.name && (
                  <div className="mt-2 p-4 bg-surface border border-accent/30 rounded-lg space-y-3 fade-in">
                    <div className="flex items-center gap-6 flex-wrap">
                      <Stepper label="Sets" value={sets} onChange={setSets} min={1} max={20} />
                      <div className="flex flex-col gap-1.5">
                        <span className="text-text2 text-sm font-medium font-body">Target Reps</span>
                        <input value={targetReps} onChange={e => setTargetReps(e.target.value)}
                          className="w-24 h-10 px-3 rounded-lg bg-surface2 border border-border text-text1 font-body text-sm focus:border-accent outline-none" placeholder="8-12" />
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handlePick(ex)} loading={adding}>Add to Workout</Button>
                  </div>
                )}
              </div>
            ))}
            {allForFilter.length === 0 && <p className="text-textMuted text-sm text-center py-8 font-body">No exercises found</p>}
          </div>
        </div>
      )}

      {tab === 'my library' && (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {customExercises.length === 0 && <p className="text-textMuted text-sm text-center py-8 font-body">Your library is empty — add custom exercises below.</p>}
          {customExercises.map(ex => (
            <div key={ex.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface2">
              <div>
                <span className="text-text1 font-medium font-body text-sm block">{ex.name}</span>
                <span className="text-textMuted text-xs capitalize font-body">{ex.muscleGroup.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={async () => { setAdding(true); try { await onAdd({ scheduleId, name: ex.name, muscleGroup: ex.muscleGroup, sets: 3, targetReps: '8-12' }); onClose(); } finally { setAdding(false); } }}>Add</Button>
                <button onClick={() => onDeleteCustom(ex.id)} className="text-text2 hover:text-danger transition-colors p-1" title="Remove from library"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'custom' && (
        <div className="space-y-4">
          <Input label="Exercise Name" value={customName} onChange={e => { setCustomName(e.target.value); setCustomErr(''); }} placeholder="e.g. Cable Crossover" error={customErr} />
          <div>
            <p className="text-text2 text-sm font-medium mb-2 font-body">Muscle Group</p>
            <select value={customMg} onChange={e => setCustomMg(e.target.value)} className="w-full h-[52px] px-4 rounded-button bg-surface2 border border-border text-text1 font-body outline-none focus:border-accent">
              {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{mg.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex gap-6 flex-wrap">
            <Stepper label="Sets" value={customSets} onChange={setCustomSets} min={1} max={20} />
            <div className="flex flex-col gap-1.5">
              <span className="text-text2 text-sm font-medium font-body">Target Reps</span>
              <input value={customReps} onChange={e => setCustomReps(e.target.value)} className="w-28 h-10 px-3 rounded-lg bg-surface2 border border-border text-text1 font-body text-sm focus:border-accent outline-none" placeholder="8-12" />
            </div>
          </div>
          <Input label="Notes (optional)" value={customNotes} onChange={e => setCustomNotes(e.target.value)} placeholder="Any cues or notes…" />
          <Button fullWidth onClick={handleAddCustom} loading={savingCustom}>Add Exercise</Button>
        </div>
      )}
    </Modal>
  );
}
