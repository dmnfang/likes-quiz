import { useState, useEffect, useCallback } from 'react';
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
  // "What [cat] does [name] like?" — one question per student per category
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
  // "Who likes...?" — one question per student, showing all 4 liked items
  const qs = students
    .filter(s => CATEGORY_ORDER.some(c => s.picks[c]))
    .map(s => ({ type: 'who', student: s }));
  return shuffle(qs);
}

function getItem(category, id) {
  return id ? CATEGORIES[category].items.find(i => i.id === id) : null;
}

function ScorePopup({ value, x, y, id }) {
  return (
    <div
      key={id}
      className="score-popup"
      style={{
        left: x,
        top: y,
        color: value > 0 ? '#22543D' : '#742A2A',
      }}
    >
      {value > 0 ? `+${value}` : value}
    </div>
  );
}

export default function QuizScreen({ mode, students, onDone }) {
  const questions = useState(() =>
    mode === 'likes' ? buildLikesQuestions(students) : buildWhoLikesQuestions(students)
  )[0];

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
      setCorrect(c => c + 1);
      const pts = 15;
      setScore(s => s + pts);
      addPopup(pts, e);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, zIndex: 300 });
      setTimeout(() => {
        setCorrectItem(null);
        setLocked(false);
        if (qIdx + 1 >= total) {
          onDone({ score: score + pts, correct: correct + 1, wrong, total });
        } else {
          setQIdx(i => i + 1);
        }
      }, 900);
    } else {
      setWrongItem(itemId);
      setWrong(w => w + 1);
      const pts = -10;
      setScore(s => Math.max(0, s + pts));
      addPopup(Math.max(0, score + pts) - score, e);
      setTimeout(() => setWrongItem(null), 400);
    }
  }

  if (!q) {
    onDone({ score, correct, wrong, total });
    return null;
  }

  // ── Likes mode ──────────────────────────────────────────
  if (mode === 'likes') {
    const cat = CATEGORIES[q.category];
    return (
      <div className="screen quiz-screen">
        <QuizHeader qIdx={qIdx} total={total} score={score} onDone={() => onDone({ score, correct, wrong, total })} />
        <div className="quiz-body">
          <div className="quiz-question-box">
            <div className="quiz-question-text">
              What {cat.label.toLowerCase()} does <strong>{q.student.name}</strong> like?
            </div>
          </div>
          <div className="answer-label">TAP THE RIGHT {cat.label.toUpperCase()}</div>
          <div className="answer-grid">
            {cat.items.map(item => (
              <div
                key={item.id}
                className={`answer-item${correctItem === item.id ? ' correct' : ''}${wrongItem === item.id ? ' wrong' : ''}${locked && correctItem !== item.id ? ' disabled' : ''}`}
                onClick={e => handleAnswer(item.id, e)}
              >
                <img src={item.img} alt={item.label} />
                <span className="answer-item-label">{item.label}</span>
              </div>
            ))}
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
    <div className="screen quiz-screen">
      <QuizHeader qIdx={qIdx} total={total} score={score} onDone={() => onDone({ score, correct, wrong, total })} />
      <div className="quiz-body">
        <div className="quiz-question-box">
          <div className="quiz-question-text">Who likes…?</div>
          <div className="liked-images-row">
            {likedItems.map(({ cat, item }) => (
              <div className="liked-img-cell" key={cat}>
                <div className="liked-img-wrap">
                  <img src={item.img} alt={item.label} />
                </div>
                <span className="liked-cat-label">{CATEGORIES[cat].label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="answer-label">TAP THE RIGHT STUDENT</div>
        <div className="answer-grid who-grid">
          {students.map(student => (
            <div
              key={student.id}
              className={`answer-item${correctItem === student.id ? ' correct' : ''}${wrongItem === student.id ? ' wrong' : ''}${locked && correctItem !== student.id ? ' disabled' : ''}`}
              onClick={e => handleAnswer(student.id, e)}
            >
              <span className="who-name-btn">{student.name}</span>
            </div>
          ))}
        </div>
      </div>
      {popups.map(p => <ScorePopup key={p.id} {...p} />)}
    </div>
  );
}

function QuizHeader({ qIdx, total, score, onDone }) {
  return (
    <div className="quiz-header">
      <button className="btn-back" onClick={onDone}>✕</button>
      <div className="quiz-progress">
        <div className="quiz-progress-fill" style={{ width: `${((qIdx) / total) * 100}%` }} />
      </div>
      <span className="quiz-count">{qIdx + 1} / {total}</span>
    </div>
  );
}
