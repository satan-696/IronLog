// web/src/components/AddFoodModal.jsx
import { useState } from 'react';
import { Search } from 'lucide-react';
import { FOOD_PRESETS } from '@ironlog/shared';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';
import SegmentedControl from './ui/SegmentedControl.jsx';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];
const UNITS = ['g', 'ml', 'piece'];

export default function AddFoodModal({ isOpen, onClose, mealType = 'snacks', onAdd }) {
  const [tab, setTab] = useState('presets');
  const [search, setSearch] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [presetQty, setPresetQty] = useState(100);
  const [selectedMealType, setSelectedMealType] = useState(mealType);
  const [adding, setAdding] = useState(false);

  // Manual form
  const [manualName, setManualName] = useState('');
  const [manualQty,  setManualQty]  = useState('100');
  const [manualUnit, setManualUnit] = useState('g');
  const [manualCal,  setManualCal]  = useState('');
  const [manualPro,  setManualPro]  = useState('');
  const [manualCarb, setManualCarb] = useState('');
  const [manualFat,  setManualFat]  = useState('');
  const [manualErr,  setManualErr]  = useState('');

  const filteredPresets = FOOD_PRESETS.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const calcScaled = (preset, qty) => {
    const ratio = qty / (preset.defaultQty || 100);
    return {
      cal:     Math.round(preset.cal     * ratio * 10) / 10,
      protein: Math.round(preset.protein * ratio * 10) / 10,
      carbs:   Math.round(preset.carbs   * ratio * 10) / 10,
      fat:     Math.round(preset.fat     * ratio * 10) / 10,
    };
  };

  const handleAddPreset = async () => {
    if (!selectedPreset) return;
    const scaled = calcScaled(selectedPreset, Number(presetQty));
    setAdding(true);
    try {
      await onAdd({
        dateKey: new Date().toISOString().split('T')[0],
        mealType: selectedMealType,
        foodName: selectedPreset.name,
        quantity: Number(presetQty),
        unit: selectedPreset.unit,
        calories: scaled.cal,
        proteinG: scaled.protein,
        carbsG: scaled.carbs,
        fatG: scaled.fat,
      });
      setSelectedPreset(null); setSearch(''); onClose();
    } finally { setAdding(false); }
  };

  const handleAddManual = async () => {
    if (!manualName.trim()) { setManualErr('Food name is required'); return; }
    if (!manualCal || Number(manualCal) < 0) { setManualErr('Calories must be 0 or more'); return; }
    setAdding(true); setManualErr('');
    try {
      await onAdd({
        dateKey: new Date().toISOString().split('T')[0],
        mealType: selectedMealType,
        foodName: manualName.trim(),
        quantity: Number(manualQty) || 1,
        unit: manualUnit,
        calories: Number(manualCal) || 0,
        proteinG: Number(manualPro) || 0,
        carbsG: Number(manualCarb) || 0,
        fatG: Number(manualFat) || 0,
      });
      setManualName(''); setManualCal(''); setManualPro(''); setManualCarb(''); setManualFat('');
      onClose();
    } catch (e) { setManualErr(e.message || 'Failed to add food'); }
    finally { setAdding(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Food" size="md">
      {/* Meal type selector */}
      <div className="mb-4">
        <p className="text-text2 text-xs uppercase tracking-wider mb-2 font-body">Meal</p>
        <div className="flex gap-2 flex-wrap">
          {MEAL_TYPES.map(mt => (
            <button key={mt} type="button" onClick={() => setSelectedMealType(mt)}
              className={`px-3 py-1 rounded-full text-xs font-medium font-body border transition-all capitalize ${selectedMealType === mt ? 'bg-accent/15 border-accent text-accent' : 'bg-surface2 border-border text-text2'}`}>
              {mt}
            </button>
          ))}
        </div>
      </div>

      <SegmentedControl options={['presets', 'manual']} value={tab} onChange={setTab} className="mb-4" />

      {tab === 'presets' && (
        <div className="space-y-3">
          <Input placeholder="Search foods…" value={search} onChange={e => setSearch(e.target.value)} icon={Search} />
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {filteredPresets.map(f => (
              <div key={f.name}>
                <div onClick={() => { setSelectedPreset(f); setPresetQty(f.defaultQty); }}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedPreset?.name === f.name ? 'border-accent bg-accent/5' : 'border-border bg-surface2 hover:border-accent/50'}`}>
                  <div>
                    <p className="text-text1 text-sm font-medium font-body">{f.name}</p>
                    <p className="text-textMuted text-xs font-body">{f.defaultQty}{f.unit} · {f.cal} kcal · P{f.protein}g C{f.carbs}g F{f.fat}g</p>
                  </div>
                </div>
                {selectedPreset?.name === f.name && (
                  <div className="mt-2 p-3 bg-surface border border-accent/30 rounded-lg fade-in space-y-3">
                    <div className="flex items-end gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-text2 text-xs font-body">Quantity ({f.unit})</span>
                        <input type="number" value={presetQty} onChange={e => setPresetQty(Math.max(1, Number(e.target.value)))}
                          className="w-24 h-9 px-3 rounded-lg bg-surface2 border border-border text-text1 font-body text-sm focus:border-accent outline-none" min={1} />
                      </div>
                      <div className="text-center">
                        <p className="font-display text-2xl text-accent leading-none">{calcScaled(f, presetQty).cal}</p>
                        <p className="text-textMuted text-xs font-body">kcal</p>
                      </div>
                      <div className="flex gap-3 text-xs font-body text-text2">
                        <span>P {calcScaled(f, presetQty).protein}g</span>
                        <span>C {calcScaled(f, presetQty).carbs}g</span>
                        <span>F {calcScaled(f, presetQty).fat}g</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={handleAddPreset} loading={adding} fullWidth>
                      Add to {selectedMealType}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'manual' && (
        <div className="space-y-3">
          <Input label="Food Name" value={manualName} onChange={e => { setManualName(e.target.value); setManualErr(''); }} placeholder="e.g. Homemade Dal" error={manualErr} />
          <div className="flex gap-3">
            <Input label="Quantity" value={manualQty} onChange={e => setManualQty(e.target.value)} type="number" className="flex-1" />
            <div className="flex flex-col gap-1.5">
              <span className="text-text2 text-sm font-medium font-body">Unit</span>
              <div className="flex border border-border rounded-button overflow-hidden h-[52px]">
                {UNITS.map(u => (
                  <button key={u} type="button" onClick={() => setManualUnit(u)}
                    className={`px-4 font-body text-sm transition-colors ${manualUnit === u ? 'bg-accent text-bg' : 'bg-surface2 text-text2 hover:text-text1'}`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Input label="Calories (kcal)" value={manualCal} onChange={e => setManualCal(e.target.value)} type="number" />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Protein (g)" value={manualPro} onChange={e => setManualPro(e.target.value)} type="number" />
            <Input label="Carbs (g)" value={manualCarb} onChange={e => setManualCarb(e.target.value)} type="number" />
            <Input label="Fat (g)" value={manualFat} onChange={e => setManualFat(e.target.value)} type="number" />
          </div>
          <Button fullWidth onClick={handleAddManual} loading={adding}>Add Food</Button>
        </div>
      )}
    </Modal>
  );
}
