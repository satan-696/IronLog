// web/src/components/ScoreModal.jsx
import { useEffect, useState } from 'react';
import { scoreDay } from '@ironlog/shared';
import Modal from './ui/Modal.jsx';

export default function ScoreModal({ isOpen, onClose, exercises = [] }) {
  const [displayScore, setDisplayScore] = useState(0);
  const result = scoreDay(exercises);

  // Animate score count-up
  useEffect(() => {
    if (!isOpen) { setDisplayScore(0); return; }
    let frame;
    let current = 0;
    const target = result.score;
    const step = () => {
      current = Math.min(current + Math.ceil((target - current) / 6) + 1, target);
      setDisplayScore(current);
      if (current < target) frame = requestAnimationFrame(step);
    };
    const t = setTimeout(() => { frame = requestAnimationFrame(step); }, 200);
    return () => { clearTimeout(t); cancelAnimationFrame(frame); };
  }, [isOpen, result.score]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Workout Score" size="sm">
      {/* Score display */}
      <div className="text-center mb-6 score-reveal">
        <div
          className="font-display text-8xl leading-none mb-2 transition-all"
          style={{ color: result.color }}
        >
          {displayScore}
        </div>
        <span
          className="inline-block px-4 py-1 rounded-full text-sm font-medium font-body border"
          style={{ color: result.color, borderColor: result.color, backgroundColor: `${result.color}20` }}
        >
          {result.label}
        </span>
      </div>

      {/* Score bar */}
      <div className="w-full h-2 bg-surface2 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${displayScore}%`, backgroundColor: result.color }}
        />
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-text2 uppercase tracking-wider mb-2">Issues</p>
          <ul className="space-y-2">
            {result.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-danger font-body">
                <span className="mt-0.5 flex-shrink-0">✗</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-text2 uppercase tracking-wider mb-2">Suggestions</p>
          <ul className="space-y-2">
            {result.suggestions.map((sug, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-warning font-body">
                <span className="mt-0.5 flex-shrink-0">→</span>
                {sug}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.issues.length === 0 && result.suggestions.length === 0 && (
        <p className="text-center text-success text-sm font-body">
          🎯 Perfect workout structure — no issues found!
        </p>
      )}
    </Modal>
  );
}
