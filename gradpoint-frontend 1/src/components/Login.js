import { useState } from 'react';
import api from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { loginFailure, loginStart, loginSuccess } from '../store/slices/authSlice';
import ErrorHandler from './ErrorHandler';
import GlassCard from './GlassCard';
import { SafeLink } from './SafeLink';
import { actionBtnStyle, centerFlexStyle, heroHeadingStyle } from '../styles/styles';

const Login = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth && state.auth.loading);
  const authError = useSelector((state) => state.auth && state.auth.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('Enter your email and password.');
      return;
    }

    dispatch(loginStart());
    try {
      const res = await api.post('/auth/login', { username: email, password });
      const data = res.data || {};
      const role = data.role || (data.user && data.user.role);
      const user = {
        id: data.id,
        username: data.username || email,
        email: data.email || email,
        fullName: data.fullName || data.username || email,
        role,
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', role);
      dispatch(loginSuccess({ token: data.token, role, user }));
    } catch (err) {
      const status = err && err.response && err.response.status;
      dispatch(
        loginFailure(
          status === 401
            ? 'Incorrect email or password.'
            : (err && err.response && err.response.data && err.response.data.message) ||
                'Unable to reach the server. Check that the backend is running.'
        )
      );
    }
  };

  return (
    <div className="auth-shell" style={centerFlexStyle}>
      <GlassCard className="auth-card">
        <h1 className="hero-heading" style={heroHeadingStyle}>GradPoint</h1>
        <p className="muted" style={{ marginTop: 0 }}>See where every grade is heading, before exam day.</p>

        <form role="form" aria-label="Login form" onSubmit={handleSubmit}>
          <ErrorHandler error={localError || authError} />
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input"
              type="text"
              autoComplete="username"
              placeholder="email (e.g. admin@gradpoint.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="action-btn primary" style={{ ...actionBtnStyle, width: '100%' }} disabled={loading}>
            Login
          </button>
        </form>

        <p className="muted" style={{ marginBottom: 0 }}>
          New here? <SafeLink to="/register">Create an account</SafeLink>
        </p>
      </GlassCard>
    </div>
  );
};

export default Login;
