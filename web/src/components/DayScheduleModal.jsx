// web/src/components/DayScheduleModal.jsx
import { useState, useEffect } from 'react';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import SegmentedControl from './ui/SegmentedControl.jsx';
import { MUSCLE_GROUPS } from '@ironlog/shared';

const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function DayScheduleModal({ isOpen, onClose, day, onSave }) {
  const [type,         setType]         = useState('rest');
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    if (day) {
      setType(day.type || 'rest');
      setMuscleGroups(day.muscleGroups || []);
    }
  }, [day]);

  const toggleMuscle = (mg) => {
    setMuscleGroups(prev =>
      prev.includes(mg) ? prev.filter(m => m !== mg) : [...prev, mg]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(day.dayIndex, type, type === 'rest' ? [] : muscleGroups);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!day) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${DAY_NAMES[day.dayIndex] ?? 'Day'}`}>
      <div className="space-y-6">
        <div>
          <p className="text-text2 text-sm mb-3 font-body">Day type</p>
          <SegmentedControl
            options={['rest', 'training']}
            value={type}
            onChange={setType}
          />
        </div>

        {type === 'training' && (
          <div>
            <p className="text-text2 text-sm mb-3 font-body">
              Muscle groups <span className="text-textMuted">(select all that apply)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map(mg => {
                const selected = muscleGroups.includes(mg);
                return (
                  <button
                    key={mg}
                    type="button"
                    onClick={() => toggleMuscle(mg)}
                    className={[
                      'px-3 py-1.5 rounded-full text-xs font-medium font-body border transition-all capitalize',
                      selected
                        ? 'bg-accent/15 border-accent text-accent'
                        : 'bg-surface2 border-border text-text2 hover:border-text2',
                    ].join(' ')}
                  >
                    {mg.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Button fullWidth onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}
