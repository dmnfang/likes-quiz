import { useEffect } from 'react';
import { CATEGORIES } from '../data/categories';

export default function ImagePickerModal({ category, currentValue, onSelect, onClose }) {
  const cat = CATEGORIES[category];

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">{cat.emoji} Pick a {cat.label}</div>
        <div className="picker-grid">
          {cat.items.map(item => (
            <div
              key={item.id}
              className={`picker-item${currentValue === item.id ? ' selected' : ''}`}
              onClick={() => { onSelect(item.id); onClose(); }}
            >
              <img src={item.img} alt={item.label} />
              <span className="picker-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
