import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, message } from 'antd';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import ErrorHandler from '../components/ErrorHandler';

const SubjectsPage = () => {
  const role = useSelector((state) => state.auth.role);
  const isAdmin = role === 'ROLE_ADMIN';

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/subjects');
      setSubjects(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError('Error loading subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (subject) => {
    setEditing(subject || null);
    form.resetFields();
    if (subject) form.setFieldsValue(subject);
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const res = editing
        ? await api.put(`/subjects/${editing.id}`, values)
        : await api.post('/subjects', values);
      message.success(res.data);
      setModalOpen(false);
      load();
    } catch (err) {
      message.error((err.response && err.response.data && err.response.data.message) || 'Unable to save the subject.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/subjects/${id}`);
      message.success(res.data);
      load();
    } catch (err) {
      message.error((err.response && err.response.data && err.response.data.message) || 'Unable to delete the subject.');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Subject Name', dataIndex: 'name' },
    { title: 'Credits', dataIndex: 'credits', width: 110 },
    { title: 'Description', dataIndex: 'description' },
  ];
  if (isAdmin) {
    columns.push({
      title: 'Actions',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openModal(record)}>Edit</Button>
          <Popconfirm title="Delete this subject?" okText="Delete" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <GlassCard className="page-card">
      <div className="page-head">
        <h2 style={{ margin: 0 }}>Subjects</h2>
        {isAdmin && <Button type="primary" onClick={() => openModal(null)}>Add Subject</Button>}
      </div>
      <ErrorHandler error={error} />
      <Table rowKey="id" columns={columns} dataSource={subjects} loading={loading} pagination={{ pageSize: 8 }} scroll={{ x: true }} />

      <Modal
        title={editing ? 'Edit subject' : 'Add subject'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Save subject"
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ credits: 3 }}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a subject name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="credits" label="Credits" rules={[{ required: true, message: 'Enter the credits' }]}>
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </GlassCard>
  );
};

export default SubjectsPage;
