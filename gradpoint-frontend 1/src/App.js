import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ConfigProvider, theme } from 'antd';
import { logout } from './store/slices/authSlice';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import SubjectList from './components/subject/SubjectList';
import Dashboard from './pages/Dashboard';
import SubjectsPage from './pages/SubjectsPage';
import MarksPage from './pages/MarksPage';
import AttendancePage from './pages/AttendancePage';
import PredictionsPage from './pages/PredictionsPage';
import StudentsPage from './pages/StudentsPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';

const antTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#8e9bff',
    colorBgContainer: 'rgba(255, 255, 255, 0.06)',
    colorBgElevated: '#23265a',
    borderRadius: 10,
    fontFamily: "'Instrument Sans', 'Segoe UI', system-ui, sans-serif",
  },
};

const STAFF = ['ROLE_TEACHER', 'ROLE_ADMIN'];

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  // The API client fires this when the backend rejects the token (expired / invalid).
  useEffect(() => {
    const onExpired = () => dispatch(logout());
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [dispatch]);

  return (
    <ConfigProvider theme={antTheme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/marks" element={<MarksPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/profile" element={<ProtectedRoute roles={['ROLE_STUDENT']}><ProfilePage /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute roles={STAFF}><StudentsPage /></ProtectedRoute>} />
            <Route path="/subject-cards" element={<ProtectedRoute roles={['ROLE_ADMIN']}><SubjectList isAdmin={role === 'ROLE_ADMIN'} /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute roles={['ROLE_ADMIN']}><UsersPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
