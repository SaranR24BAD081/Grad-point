import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import axios from 'axios';
import store from '../store';
import Login from '../components/Login';
import Navbar from '../components/layout/Navbar';
import SubjectList from '../components/subject/SubjectList';
import SubjectForm from '../components/subject/SubjectForm';
import ErrorHandler from '../components/ErrorHandler';
import NotificationStack from '../components/NotificationStack';
import { loginSuccess, logout } from '../store/slices/authSlice';

jest.mock('axios');

const subjects = [{ id: 1, name: 'Mathematics', description: 'Advanced Calculus and Linear Algebra', credits: 4 }];
const wrap = (ui) => render(<Provider store={store}>{ui}</Provider>);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('auth', () => {
  test('login stores token and role', async () => {
    axios.post.mockResolvedValue({ data: { token: 'mocked.jwt.token', role: 'ROLE_ADMIN', id: 1, username: 'admin@gradpoint.com' } });
    wrap(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'admin@gradpoint.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => expect(localStorage.getItem('token')).toBe('mocked.jwt.token'));
    expect(localStorage.getItem('role')).toBe('ROLE_ADMIN');
    expect(axios.post).toHaveBeenCalledWith('/api/auth/login', { username: 'admin@gradpoint.com', password: 'secret' });
  });

  test('logout clears storage and state', () => {
    store.dispatch(loginSuccess({ token: 't', role: 'ROLE_ADMIN', user: { email: 'a@b.com', fullName: 'A', role: 'ROLE_ADMIN' } }));
    wrap(<Navbar />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(logout.type).toBe('auth/logout');
  });
});

describe('SubjectList', () => {
  test('renders subjects, hides add for non-admin, fetches once', async () => {
    axios.get.mockResolvedValue({ data: subjects });
    wrap(<SubjectList isAdmin={false} />);
    expect(await screen.findByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Advanced Calculus and Linear Algebra')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add subject|create subject|\+ new subject/i })).toBeNull();
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test('admin: add dialog, edit dialog, delete message, filter refetch', async () => {
    axios.get.mockResolvedValue({ data: subjects });
    axios.delete.mockResolvedValue({ data: 'Subject deleted successfully.' });
    wrap(<SubjectList isAdmin />);
    await screen.findByText('Mathematics');

    fireEvent.click(screen.getByRole('button', { name: /add subject/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    fireEvent.click(screen.getByLabelText('edit'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mathematics')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Mathematics' } });
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByLabelText('delete'));
    expect(await screen.findByText('Subject deleted successfully.')).toBeInTheDocument();
    expect(axios.delete).toHaveBeenCalledWith('/api/subjects/1');
  });

  test('update shows backend string', async () => {
    axios.get.mockResolvedValue({ data: subjects });
    axios.put.mockResolvedValue({ data: 'Subject updated successfully.' });
    wrap(<SubjectList isAdmin />);
    await screen.findByText('Mathematics');
    fireEvent.click(screen.getByLabelText('edit'));
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText('Subject updated successfully.')).toBeInTheDocument();
  });

  test('401 -> session expired, token removed', async () => {
    localStorage.setItem('token', 'x');
    axios.get.mockRejectedValue({ response: { status: 401 } });
    wrap(<SubjectList isAdmin />);
    expect(await screen.findByText(/session expired/i)).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('500 -> error loading subjects', async () => {
    axios.get.mockRejectedValue({ response: { status: 500 } });
    wrap(<SubjectList isAdmin />);
    expect(await screen.findByText(/error loading subjects/i)).toBeInTheDocument();
  });
});

describe('SubjectForm', () => {
  test('inputs, success + auto-dismiss', async () => {
    jest.useFakeTimers();
    axios.post.mockResolvedValue({ data: 'Subject created successfully.' });
    const onClose = jest.fn();
    render(<SubjectForm onClose={onClose} />);
    expect(screen.getByRole('form')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/subject name/i), { target: { value: 'Mathematics' } });
    expect(screen.getByDisplayValue('Mathematics')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '4' } });
    expect(select.value).toBe('4');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /save|create|submit/i })); });
    expect(screen.getByText('Subject created successfully.')).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith('/api/subjects', { name: 'Mathematics', credits: 4 });
    act(() => { jest.runAllTimers(); });
    expect(onClose).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('409 and 500 messages', async () => {
    render(<SubjectForm />);
    axios.post.mockRejectedValueOnce({ response: { status: 409, data: {} } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
    axios.post.mockRejectedValueOnce({ response: { status: 500 } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByText(/unable to save/i)).toBeInTheDocument();
  });
});

describe('small components & store', () => {
  test('ErrorHandler', () => {
    const { container, rerender } = render(<ErrorHandler error="" />);
    expect(container.firstChild).toBeNull();
    rerender(<ErrorHandler error="Subject-specific failure during Attendance load" />);
    expect(screen.getByTestId('error-handler')).toHaveTextContent(/specific failure during/i);
  });

  test('NotificationStack shows both', () => {
    render(<NotificationStack notifications={[
      { id: 1, type: 'success', message: 'Subject created successfully.' },
      { id: 2, type: 'error', message: 'Failed to load Attendance list.' },
    ]} />);
    expect(screen.getByTestId('notification-stack')).toBeInTheDocument();
    expect(screen.getByText('Subject created successfully.')).toBeInTheDocument();
    expect(screen.getByText('Failed to load Attendance list.')).toBeInTheDocument();
  });

  test('store shape', () => {
    expect(store.getState().auth).not.toBeUndefined();
    expect(store.getState().academic).not.toBeUndefined();
    expect(typeof store.getState).toBe('function');
  });
});
