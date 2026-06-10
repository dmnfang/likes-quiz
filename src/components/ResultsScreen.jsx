import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function ResultsScreen({ result, mode, onReplay, onHome }) {
  const { score, correct, wrong, total } = result;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  useEffect(() => {
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 }, zIndex: 300 });
  }, []);

  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '⭐' : pct >= 60 ? '👍' : '💪';
  const title = pct === 100 ? 'Perfect!' : pct >= 80 ? 'Great job!' : pct >= 60 ? 'Nice work!' : 'Keep going!';

  return (
    <div className="screen results-screen">
      <div className="results-emoji">{emoji}</div>
      <div className="results-title">{title}</div>
      <div className="results-sub">{mode === 'likes' ? 'Likes Quiz' : 'Who Likes?'} — {total} question{total !== 1 ? 's' : ''}</div>

      <div className="results-stats">
        <div className="stat-box">
          <div className="stat-num">{score}</div>
          <div className="stat-label">Score</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{correct}</div>
          <div className="stat-label">Correct</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{pct}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
      </div>

      <div className="results-actions">
        <button className="btn-primary" onClick={onReplay}>Play Again</button>
        <button className="btn-ghost" onClick={onHome}>← Home</button>
      </div>
    </div>
  );
}
