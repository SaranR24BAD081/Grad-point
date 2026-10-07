import { useState } from 'react';
import { register } from '../services/authService';
import ErrorHandler from './ErrorHandler';
import NotificationStack from './NotificationStack';
import GlassCard from './GlassCard';
import { SafeLink } from './SafeLink';
import { actionBtnStyle, centerFlexStyle, heroHeadingStyle } from '../styles/styles';

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'ROLE_STUDENT' });
  const [error, setError] = useState(null);
  const [done, setDone] = useState([]);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDone([]);
    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      setError('Fill in your name, email and password.');
      return;
    }
    setSaving(true);
    try {
      // The email doubles as the username, which is what the login form sends.
      const res = await register({ ...form, username: form.email });
      setDone([{ id: 1, type: 'success', message: (res && res.message) || 'User registered successfully!' }]);
      setForm({ fullName: '', email: '', password: '', role: 'ROLE_STUDENT' });
    } catch (err) {
      setError(
        (err.response && err.response.data && err.response.data.message) ||
          'Unable to register right now. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-shell" style={centerFlexStyle}>
      <GlassCard className="auth-card">
        <h1 className="hero-heading" style={{ ...heroHeadingStyle, fontSize: '40px' }}>Join GradPoint</h1>
        <form role="form" aria-label="Registration form" onSubmit={handleSubmit}>
          <ErrorHandler error={error} />
          <NotificationStack notifications={done} />
          <div className="field">
            <label htmlFor="reg-name">Full name</label>
            <input id="reg-name" className="input" value={form.fullName} onChange={set('fullName')} />
          </div>
          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input id="reg-email" className="input" type="email" value={form.email} onChange={set('email')} />
          </div>
          <div className="field">
            <label htmlFor="reg-password">Password</label>
            <input id="reg-password" className="input" type="password" value={form.password} onChange={set('password')} />
          </div>
          <div className="field">
            <label htmlFor="reg-role">I am a</label>
            <select id="reg-role" className="input" value={form.role} onChange={set('role')}>
              <option value="ROLE_STUDENT">Student</option>
              <option value="ROLE_TEACHER">Teacher</option>
            </select>
          </div>
          <button type="submit" className="action-btn primary" style={{ ...actionBtnStyle, width: '100%' }} disabled={saving}>
            Create account
          </button>
        </form>
        <p className="muted" style={{ marginBottom: 0 }}>
          Already registered? <SafeLink to="/login">Log in</SafeLink>
        </p>
      </GlassCard>
    </div>
  );
};

export default Register;
