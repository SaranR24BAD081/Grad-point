import { useState } from 'react';
import { Button, Descriptions, Modal, Table, message } from 'antd';
import api from '../services/api';
import useFetch from '../hooks/useFetch';
import GlassCard from '../components/GlassCard';
import ErrorHandler from '../components/ErrorHandler';

const StudentsPage = () => {
  const { data, loading, error } = useFetch(() => api.get('/students').then((res) => res.data));
  const [detail, setDetail] = useState(null);

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/students/${id}`);
      setDetail(res.data);
    } catch (err) {
      message.error('Unable to load the student profile.');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Name', dataIndex: 'fullName' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Profile', width: 120, render: (_, s) => <Button size="small" onClick={() => openDetail(s.id)}>View</Button> },
  ];

  const profile = detail && detail.profile;

  return (
    <GlassCard className="page-card">
      <h2>Students</h2>
      <ErrorHandler error={error && 'Error loading students. Please try again.'} />
      <Table rowKey="id" columns={columns} dataSource={data || []} loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: true }} />

      <Modal title={detail && detail.user.fullName} open={!!detail} onCancel={() => setDetail(null)} footer={null}>
        {detail && (
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Email">{detail.user.email}</Descriptions.Item>
            <Descriptions.Item label="Student ID">{(profile && profile.studentId) || 'Not set yet'}</Descriptions.Item>
            <Descriptions.Item label="Department">{(profile && profile.department) || 'Not set yet'}</Descriptions.Item>
            <Descriptions.Item label="Year">{(profile && profile.year) || 'Not set yet'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </GlassCard>
  );
};

export default StudentsPage;
