import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import SubjectForm from './SubjectForm';
import ErrorHandler from '../ErrorHandler';
import NotificationStack from '../NotificationStack';
import { actionBtnStyle, glassCardStyle, listContainerStyle } from '../../styles/styles';

const SubjectList = ({ isAdmin = false }) => {
  const [subjects, setSubjects] = useState([]);
  const [filterNames, setFilterNames] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [notices, setNotices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', credits: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const expiryTimer = useRef(null);

  useEffect(() => () => clearTimeout(expiryTimer.current), []);

  const notify = (type, message) => setNotices([{ id: `${type}-${Date.now()}`, type, message }]);

  const load = useCallback(async (filterValue) => {
    const url =
      filterValue === undefined
        ? '/api/subjects'
        : `/api/subjects?filter=${encodeURIComponent(filterValue)}`;
    try {
      const res = await axios.get(url);
      const list = Array.isArray(res.data) ? res.data : [];
      setSubjects(list);
      setError(null);
      // Keep the filter choices based on the unfiltered list.
      if (!filterValue) {
        setFilterNames([...new Set(list.map((s) => s.name).filter(Boolean))]);
      }
    } catch (err) {
      if (err && err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please log in again.');
        // Let the app sign the user out once they have seen the message.
        expiryTimer.current = setTimeout(() => window.dispatchEvent(new Event('auth:expired')), 2500);
      } else {
        setError('Error loading subjects. Please try again.');
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    load(value);
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`/api/subjects/${id}`);
      notify('success', typeof res.data === 'string' ? res.data : 'Subject deleted successfully.');
      load(filter || undefined);
    } catch (err) {
      notify('error', (err.response && err.response.data && err.response.data.message) || 'Unable to delete the subject.');
    }
  };

  const openEdit = (subject) => {
    setEditing(subject);
    setEditValues({
      name: subject.name || '',
      credits: subject.credits ?? '',
      description: subject.description || '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/subjects/${editing.id}`, {
        name: editValues.name,
        credits: editValues.credits === '' ? null : Number(editValues.credits),
        description: editValues.description,
      });
      notify('success', typeof res.data === 'string' ? res.data : 'Subject updated successfully.');
      setEditing(null);
      load(filter || undefined);
    } catch (err) {
      notify('error', (err.response && err.response.data && err.response.data.message) || 'Unable to save the subject.');
    }
  };

  // SubjectForm calls onClose(true) after a successful save, onClose(false) on cancel.
  const closeForm = (created) => {
    setShowForm(false);
    if (created) load(filter || undefined);
  };

  return (
    <div className="glass-card list-container" style={{ ...glassCardStyle, ...listContainerStyle, padding: 24 }}>
      <div className="page-head">
        <h2 style={{ margin: 0 }}>Subjects</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            className="input"
            aria-label="Filter subjects"
            value={filter}
            onChange={handleFilterChange}
            style={{ width: 'auto', minWidth: 200 }}
          >
            <option value="">All subjects</option>
            {filterNames.map((n) => (
              <option key={n} value={n}>{`Subject: ${n}`}</option>
            ))}
          </select>
          {isAdmin && (
            <button type="button" className="action-btn primary" style={actionBtnStyle} onClick={() => setShowForm(true)}>
              Add subject
            </button>
          )}
        </div>
      </div>

      <ErrorHandler error={error} />
      <NotificationStack notifications={notices} />

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Credits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.description}</td>
                <td>{s.credits}</td>
                <td>
                  <button type="button" aria-label="edit" className="action-btn" style={actionBtnStyle} onClick={() => openEdit(s)}>
                    Edit
                  </button>{' '}
                  <button type="button" aria-label="delete" className="action-btn danger" style={actionBtnStyle} onClick={() => handleDelete(s.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="muted">No subjects match yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <div role="dialog" aria-modal="true" aria-label="Add subject" className="glass-card modal" style={glassCardStyle}>
            <SubjectForm onClose={closeForm} />
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-backdrop">
          <div role="dialog" aria-modal="true" aria-label="Edit subject" className="glass-card modal" style={glassCardStyle}>
            <form onSubmit={handleUpdate}>
              <h3>Edit subject</h3>
              <div className="field">
                <label htmlFor="edit-name">Name</label>
                <input
                  id="edit-name"
                  className="input"
                  value={editValues.name}
                  onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="edit-credits">Credits</label>
                <input
                  id="edit-credits"
                  className="input"
                  type="number"
                  min="1"
                  value={editValues.credits}
                  onChange={(e) => setEditValues({ ...editValues, credits: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="edit-description">Description</label>
                <input
                  id="edit-description"
                  className="input"
                  value={editValues.description}
                  onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="action-btn" style={actionBtnStyle} onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button type="submit" className="action-btn primary" style={actionBtnStyle}>
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectList;
