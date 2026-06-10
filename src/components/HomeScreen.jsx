export default function HomeScreen({ students, onSetup, onStartMode }) {
  const allFilled = students.length > 0 && students.every(
    s => s.picks.fruits && s.picks.vegetables && s.picks.sports && s.picks.colors
  );
  const hasEnough = students.length >= 2;

  return (
    <div className="screen home-screen">
      <div className="home-logo">Likes<span>Quiz</span></div>
      <div className="home-tagline">Who likes what? Let's find out!</div>

      <div className="home-cats">
        <span className="home-cat-pill">🍎 Fruit</span>
        <span className="home-cat-pill">🥦 Vegetable</span>
        <span className="home-cat-pill">⚽ Sport</span>
        <span className="home-cat-pill">🎨 Color</span>
      </div>

      {students.length > 0 && (
        <div className="student-count-badge">
          👥 {students.length} student{students.length !== 1 ? 's' : ''} ready
        </div>
      )}

      <div className="home-modes">
        <div
          className="mode-card"
          onClick={() => allFilled && hasEnough && onStartMode('likes')}
          style={{ opacity: allFilled && hasEnough ? 1 : 0.45 }}
        >
          <span className="mode-icon">🎯</span>
          <div className="mode-info">
            <div className="mode-name">Likes Quiz</div>
            <div className="mode-desc">What does [Name] like? Tap the right image.</div>
          </div>
        </div>
        <div
          className="mode-card"
          onClick={() => allFilled && hasEnough && onStartMode('who')}
          style={{ opacity: allFilled && hasEnough ? 1 : 0.45 }}
        >
          <span className="mode-icon">🤔</span>
          <div className="mode-info">
            <div className="mode-name">Who Likes?</div>
            <div className="mode-desc">See 4 likes, guess who they belong to.</div>
          </div>
        </div>
      </div>

      {!allFilled && (
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 16, textAlign: 'center', maxWidth: 280 }}>
          {students.length === 0
            ? 'Add students and assign their likes to play.'
            : !hasEnough
              ? 'Add at least 2 students to play.'
              : 'Finish assigning all likes to play.'}
        </div>
      )}

      <button className="home-setup-btn" onClick={onSetup}>
        ✏️ {students.length === 0 ? 'Add students' : 'Edit students'}
      </button>
    </div>
  );
}
