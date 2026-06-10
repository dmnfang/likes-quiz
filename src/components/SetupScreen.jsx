import { useState } from 'react';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import ImagePickerModal from './ImagePickerModal';

const CAT_DEFAULTS = { fruits: null, vegetables: null, sports: null, colors: null };
const CAT_EMOJIS = { fruits: '🍎', vegetables: '🥦', sports: '⚽', colors: '🎨' };

function getItem(category, id) {
  return CATEGORIES[category].items.find(i => i.id === id);
}

export default function SetupScreen({ students, onUpdate, onBack }) {
  const [name, setName] = useState('');
  const [picker, setPicker] = useState(null); // { studentId, category }

  function addStudent() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newStudent = {
      id: Date.now(),
      name: trimmed,
      picks: { ...CAT_DEFAULTS },
    };
    onUpdate([...students, newStudent]);
    setName('');
  }

  function removeStudent(id) {
    onUpdate(students.filter(s => s.id !== id));
  }

  function setPick(studentId, category, value) {
    onUpdate(students.map(s =>
      s.id === studentId ? { ...s, picks: { ...s.picks, [category]: value } } : s
    ));
  }

  function clearAll() {
    if (window.confirm('Remove all students?')) onUpdate([]);
  }

  function handleKey(e) {
    if (e.key === 'Enter') addStudent();
  }

  const pickerStudent = picker ? students.find(s => s.id === picker.studentId) : null;

  return (
    <div className="screen setup-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <span className="screen-title">Students</span>
      </div>

      <div className="add-student-row">
        <input
          className="name-input"
          placeholder="Student name…"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKey}
          maxLength={24}
        />
        <button className="btn-add" onClick={addStudent} disabled={!name.trim()}>
          + Add
        </button>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🎒</div>
          Add students above to get started.
        </div>
      ) : (
        <>
          <div className="section-label">
            {students.length} student{students.length !== 1 ? 's' : ''} — tap chips to assign likes
          </div>
          <div className="student-list">
            {students.map(student => (
              <div className="student-card" key={student.id}>
                <span className="student-name">{student.name}</span>
                <div className="student-picks">
                  {CATEGORY_ORDER.map(cat => {
                    const val = student.picks[cat];
                    const item = val ? getItem(cat, val) : null;
                    return (
                      <div
                        key={cat}
                        className={`pick-chip${!val ? ' empty' : ''}`}
                        onClick={() => setPicker({ studentId: student.id, category: cat })}
                        title={item ? item.label : `Pick ${CATEGORIES[cat].label}`}
                      >
                        {item ? (
                          <img src={item.img} alt={item.label} />
                        ) : (
                          <span>{CAT_EMOJIS[cat]}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button className="btn-remove" onClick={() => removeStudent(student.id)} title="Remove">
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="setup-footer">
            <button className="btn-ghost" onClick={clearAll}>Clear all</button>
          </div>
        </>
      )}

      {picker && pickerStudent && (
        <ImagePickerModal
          category={picker.category}
          currentValue={pickerStudent.picks[picker.category]}
          onSelect={(val) => setPick(picker.studentId, picker.category, val)}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
