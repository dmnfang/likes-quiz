import { useState } from 'react';
import confetti from 'canvas-confetti';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildLikesQuestions(students) {
  const qs = [];
  for (const student of students) {
    for (const cat of CATEGORY_ORDER) {
      const answer = student.picks[cat];
      if (!answer) continue;
      qs.push({ type: 'likes', student, category: cat, answer });
    }
  }
  return shuffle(qs);
}

function buildWhoLikesQuestions(students) {
  return shuffle(
    students
      .filter(s => CATEGORY_ORDER.some(c => s.picks[c]))
      .map(s => ({ type: 'who', student: s }))
  );
}

function getItem(category, id) {
  return id ? CATEGORIES[category].items.find(i => i.id === id) : null;
}

function ScorePopup({ value, x, y, id }) {
  return (
    <div className="score-popup" style={{ left: x, top: y, color: value > 0 ? '#22543D' : '#742A2A' }}>
      {value > 0 ? `+${value}` : value}
    </div>
  );
}

export default function QuizScreen({ mode, students, onDone }) {
  const [questions] = useState(() =>
    mode === 'likes' ? buildLikesQuestions(students) : buildWhoLikesQuestions(students)
  );
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [wrongItem, setWrongItem] = useState(null);
  const [correctItem, setCorrectItem] = useState(null);
  const [locked, setLocked] = useState(false);
  const [popups, setPopups] = useState([]);

  const q = questions[qIdx];
  const total = questions.length;

  function addPopup(value, e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setPopups(prev => [...prev, { value, x: rect.left + rect.width / 2 - 24, y: rect.top - 16, id }]);
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 900);
  }

  function handleAnswer(itemId, e) {
    if (locked) return;
    const correctAnswer = mode === 'likes' ? q.answer : q.student.id;
    const isCorrect = itemId === correctAnswer;

    if (isCorrect) {
      setCorrectItem(itemId);
      setLocked(true);
      const newCorrect = correct + 1;
      const newScore = score + 15;
      setCorrect(newCorrect);
      setScore(newScore);
      addPopup(15, e);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, zIndex: 300 });
      setTimeout(() => {
        setCorrectItem(null);
        setLocked(false);
        if (qIdx + 1 >= total) {
          onDone({ score: newScore, correct: newCorrect, wrong, total });
        } else {
          setQIdx(i => i + 1);
        }
      }, 900);
    } else {
      setWrongItem(itemId);
      setWrong(w => w + 1);
      const penalty = Math.min(10, score);
      setScore(s => s - penalty);
      addPopup(-penalty, e);
      setTimeout(() => setWrongItem(null), 400);
    }
  }

  if (!q) { onDone({ score, correct, wrong, total }); return null; }

  const exitResult = () => onDone({ score, correct, wrong, total });

  // ── Likes mode ──────────────────────────────────────────
  if (mode === 'likes') {
    const cat = CATEGORIES[q.category];
    return (
      <div className="quiz-fullscreen">
        {/* Top bar */}
        <div className="quiz-topbar">
          <button className="quiz-exit-btn" onClick={exitResult}>✕</button>
          <div className="quiz-progress">
            <div className="quiz-progress-fill" style={{ width: `${(qIdx / total) * 100}%` }} />
          </div>
          <span className="quiz-count">{qIdx + 1} / {total}</span>
          <span className="quiz-score-badge">⭐ {score}</span>
        </div>

        {/* Left / Right split */}
        <div className="quiz-split">
          {/* LEFT — question panel */}
          <div className="quiz-left">
            <div className="quiz-cat-label">{cat.emoji} {cat.label}</div>
            <div className="quiz-question-main">
              What {cat.label.toLowerCase()} does
            </div>
            <div className="quiz-student-name">{q.student.name}</div>
            <div className="quiz-question-main">like?</div>
          </div>

          {/* RIGHT — answer grid */}
          <div className="quiz-right">
            <div className="quiz-grid-label">TAP THE RIGHT {cat.label.toUpperCase()}</div>
            <div className="quiz-answer-grid">
              {cat.items.map(item => (
                <div
                  key={item.id}
                  className={`quiz-answer-item${correctItem === item.id ? ' correct' : ''}${wrongItem === item.id ? ' wrong' : ''}${locked && correctItem !== item.id ? ' disabled' : ''}`}
                  onClick={e => handleAnswer(item.id, e)}
                >
                  <img src={item.img} alt={item.label} />
                  <span className="quiz-answer-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {popups.map(p => <ScorePopup key={p.id} {...p} />)}
      </div>
    );
  }

  // ── Who Likes mode ───────────────────────────────────────
  const likedItems = CATEGORY_ORDER.map(cat => ({
    cat,
    item: getItem(cat, q.student.picks[cat]),
  })).filter(x => x.item);

  return (
    <div className="quiz-fullscreen">
      <div className="quiz-topbar">
        <button className="quiz-exit-btn" onClick={exitResult}>✕</button>
        <div className="quiz-progress">
          <div className="quiz-progress-fill" style={{ width: `${(qIdx / total) * 100}%` }} />
        </div>
        <span className="quiz-count">{qIdx + 1} / {total}</span>
        <span className="quiz-score-badge">⭐ {score}</span>
      </div>

      <div className="quiz-split">
        {/* LEFT — liked images */}
        <div className="quiz-left">
          <div className="quiz-question-main">Who likes…?</div>
          <div className="who-liked-grid">
            {likedItems.map(({ cat, item }) => (
              <div className="who-liked-cell" key={cat}>
                <div className="who-liked-img">
                  <img src={item.img} alt={item.label} />
                </div>
                <span className="who-liked-cat">{CATEGORIES[cat].label}</span>
                <span className="who-liked-name">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — name buttons */}
        <div className="quiz-right">
          <div className="quiz-grid-label">TAP THE RIGHT STUDENT</div>
          <div className="quiz-who-grid">
            {students.map(student => (
              <div
                key={student.id}
                className={`quiz-who-item${correctItem === student.id ? ' correct' : ''}${wrongItem === student.id ? ' wrong' : ''}${locked && correctItem !== student.id ? ' disabled' : ''}`}
                onClick={e => handleAnswer(student.id, e)}
              >
                {student.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {popups.map(p => <ScorePopup key={p.id} {...p} />)}
    </div>
  );
}