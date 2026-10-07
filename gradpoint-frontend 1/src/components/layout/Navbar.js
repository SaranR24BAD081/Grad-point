import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { SafeLink, SafeNavLink } from '../SafeLink';
import { actionBtnStyle } from '../../styles/styles';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/marks', label: 'Marks' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/predictions', label: 'Predictions' },
  { to: '/students', label: 'Students', roles: ['ROLE_TEACHER', 'ROLE_ADMIN'] },
  { to: '/profile', label: 'My profile', roles: ['ROLE_STUDENT'] },
  { to: '/subject-cards', label: 'Subject cards', roles: ['ROLE_ADMIN'] },
  { to: '/users', label: 'Users', roles: ['ROLE_ADMIN'] },
];

const roleLabel = (role) => (role ? role.replace('ROLE_', '').toLowerCase() : '');

const Navbar = () => {
  const dispatch = useDispatch();
  const { role, fullName, email, user } = useSelector((state) => state.auth);
  const name = fullName || (user && (user.fullName || user.username)) || email;

  const visible = LINKS.filter((l) => !l.roles || l.roles.includes(role));

  return (
    <nav className="navbar">
      <SafeLink to="/dashboard" className="brand">GradPoint</SafeLink>
      <div className="links">
        {visible.map((l) => (
          <SafeNavLink key={l.to} to={l.to}>{l.label}</SafeNavLink>
        ))}
      </div>
      {name && <span className="who">{name} · {roleLabel(role)}</span>}
      <button type="button" className="action-btn" style={actionBtnStyle} onClick={() => dispatch(logout())}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
