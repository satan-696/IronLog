// web/src/pages/ExercisePage.jsx
import { useEffect, useState } from 'react';
import { GripVertical, Trash2, Edit2, Star } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSchedule } from '../hooks/useSchedule.js';
import { useExercises } from '../hooks/useExercises.js';
import DataService from '../services/dataService.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import ScoreModal from '../components/ScoreModal.jsx';
import ExerciseLibraryModal from '../components/ExerciseLibraryModal.jsx';

function SortableExercise({ exercise, onDelete, onUpdate, scheduleId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exercise.id });
  const [editing, setEditing] = useState(false);
  const [name, setName]   = useState(exercise.name);
  const [sets, setSets]   = useState(exercise.sets);
  const [reps, setReps]   = useState(exercise.targetReps);

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const handleSave = async () => {
    await onUpdate(exercise.id, scheduleId, { name, sets: Number(sets), targetReps: reps });
    setEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-surface2 border border-border rounded-lg p-3 flex items-start gap-3">
      <button {...attributes} {...listeners} className="mt-1 text-textMuted hover:text-text2 cursor-grab active:cursor-grabbing flex-shrink-0">
        <GripVertical size={18} />
      </button>
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <input value={name} onChange={e => setName(e.target.value)} className="w-full h-9 px-3 bg-bg border border-accent rounded-lg text-text1 font-body text-sm outline-none" />
            <div className="flex gap-2">
              <input type="number" value={sets} onChange={e => setSets(e.target.value)} className="w-20 h-9 px-3 bg-bg border border-border rounded-lg text-text1 font-body text-sm outline-none" placeholder="Sets" />
              <input value={reps} onChange={e => setReps(e.target.value)} className="w-24 h-9 px-3 bg-bg border border-border rounded-lg text-text1 font-body text-sm outline-none" placeholder="Reps" />
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text1 font-medium font-body">{exercise.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="gray">{exercise.sets} × {exercise.targetReps}</Badge>
                <Badge variant="lime" className="capitalize">{exercise.muscleGroup?.replace('_',' ')}</Badge>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditing(true)} className="p-1.5 text-text2 hover:text-accent transition-colors"><Edit2 size={15}/></button>
              <button onClick={() => onDelete(exercise.id, scheduleId)} className="p-1.5 text-text2 hover:text-danger transition-colors"><Trash2 size={15}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExercisePage() {
  const { schedule, loadSchedule } = useSchedule();
  const { exercisesByDay, loadExercises, addExercise, updateExercise, deleteExercise, reorderExercises } = useExercises();
  const [activeDay,      setActiveDay]      = useState(null);
  const [showScore,      setShowScore]      = useState(false);
  const [showLibrary,    setShowLibrary]    = useState(false);
  const [customExercises, setCustomExercises] = useState([]);

  const trainingDays = schedule?.filter(d => d.muscleGroups?.length > 0) || [];

  useEffect(() => { loadSchedule(); }, []);
  useEffect(() => {
    if (trainingDays.length && !activeDay) setActiveDay(trainingDays[0]);
  }, [trainingDays.length]);
  useEffect(() => {
    if (activeDay?.id) loadExercises(activeDay.id);
  }, [activeDay?.id]);
  useEffect(() => {
    DataService.getCustomExercises().then(setCustomExercises).catch(() => {});
  }, []);

  const exercises = activeDay ? (exercisesByDay[activeDay.id] || []) : [];

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = exercises.findIndex(e => e.id === active.id);
    const newIndex = exercises.findIndex(e => e.id === over.id);
    const reordered = arrayMove(exercises, oldIndex, newIndex);
    reorderExercises(activeDay.id, reordered.map(e => e.id));
  };

  const handleAddCustom = async (data) => {
    const newEx = await DataService.addCustomExercise({ name: data.name, muscleGroup: data.muscleGroup });
    setCustomExercises(prev => [...prev, newEx]);
    await addExercise(activeDay.id, { name: data.name, muscleGroup: data.muscleGroup, sets: data.sets, targetReps: data.targetReps, notes: data.notes });
  };

  const handleDeleteCustom = async (id) => {
    await DataService.deleteCustomExercise(id);
    setCustomExercises(prev => prev.filter(e => e.id !== id));
  };

  const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-4xl text-text1 tracking-wide">EXERCISES</h1>
        {activeDay && (
          <Button variant="secondary" size="sm" onClick={() => setShowLibrary(true)}>+ Add Exercise</Button>
        )}
      </div>

      {/* Day tabs */}
      {trainingDays.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {trainingDays.map(day => (
            <button key={day.dayIndex} onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-body whitespace-nowrap border transition-all flex-shrink-0 ${activeDay?.dayIndex === day.dayIndex ? 'bg-accent/15 border-accent text-accent' : 'border-border text-text2 hover:border-text2 bg-surface2'}`}>
              {DAY_NAMES[day.dayIndex]}
              <span className="ml-1.5 text-textMuted text-xs capitalize">{day.muscleGroups?.[0]?.replace('_',' ')}</span>
            </button>
          ))}
        </div>
      )}

      {/* Exercise list */}
      {activeDay && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-text1 tracking-wide">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][activeDay.dayIndex]} —{' '}
              <span className="text-accent capitalize">{activeDay.muscleGroups?.join(', ').replace(/_/g,' ')}</span>
            </h2>
            <button onClick={() => setShowScore(true)} className="flex items-center gap-1.5 text-sm font-medium font-body text-text2 hover:text-accent transition-colors">
              <Star size={15} /> Get Score
            </button>
          </div>

          {exercises.length === 0 && (
            <Card>
              <p className="text-textMuted text-center py-6 font-body text-sm">
                No exercises yet — click <span className="text-accent">+ Add Exercise</span> to get started
              </p>
            </Card>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={exercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
              {exercises.map(ex => (
                <SortableExercise
                  key={ex.id}
                  exercise={ex}
                  scheduleId={activeDay.id}
                  onDelete={deleteExercise}
                  onUpdate={updateExercise}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {trainingDays.length === 0 && (
        <Card>
          <p className="text-textMuted text-center py-8 font-body">
            No training days set. Go to <span className="text-accent">Schedule</span> to configure your week.
          </p>
        </Card>
      )}

      <ScoreModal isOpen={showScore} onClose={() => setShowScore(false)} exercises={exercises} />
      <ExerciseLibraryModal
        isOpen={showLibrary} onClose={() => setShowLibrary(false)}
        scheduleId={activeDay?.id}
        targetMuscleGroups={activeDay?.muscleGroups || []}
        onAdd={(data) => addExercise(activeDay.id, data)}
        customExercises={customExercises}
        onAddCustom={handleAddCustom}
        onDeleteCustom={handleDeleteCustom}
      />
    </div>
  );
}
