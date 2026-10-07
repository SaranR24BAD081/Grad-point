import { useSelector } from 'react-redux';
import { Button, Popconfirm, Table, Tag, message } from 'antd';
import api from '../services/api';
import useFetch from '../hooks/useFetch';
import GlassCard from '../components/GlassCard';
import ErrorHandler from '../components/ErrorHandler';

const ROLE_COLORS = { ROLE_ADMIN: 'volcano', ROLE_TEACHER: 'geekblue', ROLE_STUDENT: 'green' };

const UsersPage = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const { data, loading, error, refetch } = useFetch(() => api.get('/users').then((res) => res.data));

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      message.success('User deleted.');
      refetch();
    } catch (err) {
      message.error((err.response && err.response.data && err.response.data.message) || 'Unable to delete the user.');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Name', dataIndex: 'fullName' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Role', dataIndex: 'role', render: (r) => <Tag color={ROLE_COLORS[r]}>{r.replace('ROLE_', '').toLowerCase()}</Tag> },
    {
      title: 'Actions',
      render: (_, u) => (
        <Popconfirm title="Delete this user?" okText="Delete" onConfirm={() => handleDelete(u.id)} disabled={currentUser && currentUser.id === u.id}>
          <Button size="small" danger disabled={currentUser && currentUser.id === u.id}>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <GlassCard className="page-card">
      <h2>Users</h2>
      <ErrorHandler error={error && 'Error loading users. Please try again.'} />
      <Table rowKey="id" columns={columns} dataSource={data || []} loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: true }} />
    </GlassCard>
  );
};

export default UsersPage;
