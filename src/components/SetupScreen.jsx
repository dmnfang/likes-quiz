import { useState } from 'react';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import ImagePickerModal from './ImagePickerModal';

const CAT_EMOJIS = { fruits: '🍎', vegetables: '🥦', sports: '⚽', colors: '🎨' };

function getItem(category, id) {
  return id ? CATEGORIES[category].items.find(i => i.id === id) : null;
}

export default function SetupScreen({ students, onUpdate, onBack }) {
  const [name, setName] = useState('');
  const [picker, setPicker] = useState(null);

  function addStudent() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onUpdate([...students, { id: Date.now(), name: trimmed, picks: { fruits: null, vegetables: null, sports: null, colors: null } }]);
    setName('');
  }

  function removeStudent(id) { onUpdate(students.filter(s => s.id !== id)); }

  function setPick(studentId, category, value) {
    onUpdate(students.map(s => s.id === studentId ? { ...s, picks: { ...s.picks, [category]: value } } : s));
  }

  function clearAll() { if (window.confirm('Remove all students?')) onUpdate([]); }

  const pickerStudent = picker ? students.find(s => s.id === picker.studentId) : null;

  return (
    <div className="setup-fullscreen">
      <div className="setup-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <span className="setup-title">Students</span>
        {students.length > 0 && (
          <button className="btn-ghost-sm" onClick={clearAll}>Clear all</button>
        )}
      </div>

      <div className="setup-add-row">
        <input
          className="setup-name-input"
          placeholder="Student name…"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addStudent()}
          maxLength={24}
          autoFocus
        />
        <button className="btn-add" onClick={addStudent} disabled={!name.trim()}>+ Add</button>
      </div>

      {students.length === 0 ? (
        <div className="setup-empty">
          <div style={{ fontSize: 48 }}>🎒</div>
          <div>Add students above to get started.</div>
        </div>
      ) : (
        <>
          <div className="setup-col-headers">
            <span className="setup-col-name">Name</span>
            {CATEGORY_ORDER.map(cat => (
              <span key={cat} className="setup-col-cat" title={CATEGORIES[cat].label}>{CAT_EMOJIS[cat]}</span>
            ))}
            <span style={{ width: 32 }} />
          </div>
          <div className="setup-student-list">
            {students.map(student => (
              <div className="setup-student-row" key={student.id}>
                <span className="setup-student-name">{student.name}</span>
                {CATEGORY_ORDER.map(cat => {
                  const val = student.picks[cat];
                  const item = val ? getItem(cat, val) : null;
                  return (
                    <div
                      key={cat}
                      className={`setup-pick-chip${!val ? ' empty' : ''}`}
                      onClick={() => setPicker({ studentId: student.id, category: cat })}
                      title={item ? item.label : `Pick ${CATEGORIES[cat].label}`}
                    >
                      {item ? <img src={item.img} alt={item.label} /> : <span>{CAT_EMOJIS[cat]}</span>}
                    </div>
                  );
                })}
                <button className="btn-remove" onClick={() => removeStudent(student.id)}>×</button>
              </div>
            ))}
          </div>
        </>
      )}

      {picker && pickerStudent && (
        <ImagePickerModal
          category={picker.category}
          currentValue={pickerStudent.picks[picker.category]}
          onSelect={val => setPick(picker.studentId, picker.category, val)}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}