import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import NotificationStack from '../NotificationStack';
import { actionBtnStyle } from '../../styles/styles';

const CREDIT_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const DISMISS_MS = 3000;

const SubjectForm = ({ onClose }) => {
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('3');
  const [description, setDescription] = useState('');
  const [notices, setNotices] = useState([]);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const notify = (type, message) => setNotices([{ id: `${type}-${Date.now()}`, type, message }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotices([]);

    const payload = { name, credits: Number(credits) };
    if (description.trim()) payload.description = description.trim();

    try {
      const res = await axios.post('/api/subjects', payload);
      notify('success', typeof res.data === 'string' ? res.data : 'Subject created successfully.');
      setName('');
      setDescription('');

      timer.current = setTimeout(() => {
        setNotices([]);
        if (onClose) onClose(true);
      }, DISMISS_MS);
    } catch (err) {
      const status = err && err.response && err.response.status;
      const serverMessage = err && err.response && err.response.data && err.response.data.message;
      if (status === 409) {
        notify('error', serverMessage || 'A subject with this title already exists');
      } else if (status === 400 && serverMessage) {
        notify('error', serverMessage);
      } else {
        notify('error', 'Unable to save the subject. Please try again.');
      }
    }
  };

  return (
    <form role="form" aria-label="New subject form" onSubmit={handleSubmit}>
      <h3>New subject</h3>
      <NotificationStack notifications={notices} />

      <div className="field">
        <label htmlFor="subject-name">Name</label>
        <input
          id="subject-name"
          className="input"
          type="text"
          placeholder="Subject name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="subject-credits">Credits</label>
        <select
          id="subject-credits"
          className="input"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
        >
          {CREDIT_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="subject-description">Description</label>
        <input
          id="subject-description"
          className="input"
          type="text"
          placeholder="Short description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        {onClose && (
          <button type="button" className="action-btn" style={actionBtnStyle} onClick={() => onClose(false)}>
            Cancel
          </button>
        )}
        <button type="submit" className="action-btn primary" style={actionBtnStyle}>
          Save subject
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;
