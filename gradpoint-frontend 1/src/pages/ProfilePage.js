import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Form, Input, message } from 'antd';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import ErrorHandler from '../components/ErrorHandler';

const ProfilePage = () => {
  const user = useSelector((state) => state.auth.user);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/students/${user.id}`)
      .then((res) => form.setFieldsValue(res.data.profile || {}))
      .catch(() => setError('Error loading your profile. Please try again.'));
  }, [user, form]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await api.post(`/students/${user.id}/profile`, values);
      message.success('Profile saved.');
    } catch (err) {
      message.error(
        err.response && err.response.status === 409
          ? 'That student ID is already taken.'
          : (err.response && err.response.data && err.response.data.message) || 'Unable to save your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard className="page-card" style={{ maxWidth: 520 }}>
      <h2>My profile</h2>
      <ErrorHandler error={error} />
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item name="studentId" label="Student ID"><Input /></Form.Item>
        <Form.Item name="department" label="Department"><Input /></Form.Item>
        <Form.Item name="year" label="Year"><Input placeholder="e.g. 2nd year" /></Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>Save profile</Button>
      </Form>
    </GlassCard>
  );
};

export default ProfilePage;
