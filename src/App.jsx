import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import './index.css';

const STORAGE_KEY = 'likes-quiz-students';

function loadStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [students, setStudents] = useState(loadStudents);
  const [quizMode, setQuizMode] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); } catch {}
  }, [students]);

  function startMode(mode) {
    setQuizMode(mode);
    setScreen('quiz');
  }

  function handleDone(res) {
    setResult(res);
    setScreen('results');
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <HomeScreen
          students={students}
          onSetup={() => setScreen('setup')}
          onStartMode={startMode}
        />
      )}
      {screen === 'setup' && (
        <SetupScreen
          students={students}
          onUpdate={setStudents}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'quiz' && (
        <QuizScreen
          key={quizMode + String(Date.now())}
          mode={quizMode}
          students={students}
          onDone={handleDone}
        />
      )}
      {screen === 'results' && result && (
        <ResultsScreen
          result={result}
          mode={quizMode}
          onReplay={() => startMode(quizMode)}
          onHome={() => setScreen('home')}
        />
      )}
    </div>
  );
}
