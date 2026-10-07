import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, InputNumber, Popconfirm, Select, Table, message } from 'antd';
import api from '../services/api';
import { fetchAttendance, fetchStudents, fetchSubjects } from '../store/slices/academicSlice';
import GlassCard from '../components/GlassCard';
import ErrorHandler from '../components/ErrorHandler';

const AttendancePage = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);
  const { attendance, subjects, students, error } = useSelector((state) => state.academic);
  const isStaff = role === 'ROLE_TEACHER' || role === 'ROLE_ADMIN';
  const isAdmin = role === 'ROLE_ADMIN';
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAttendance(isStaff ? undefined : user && user.id));
    if (isStaff) {
      dispatch(fetchSubjects());
      dispatch(fetchStudents());
    }
  }, [dispatch, isStaff, user]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await api.post('/attendance', {
        totalClasses: values.totalClasses,
        attendedClasses: values.attendedClasses,
        student: { id: values.studentId },
        subject: { id: values.subjectId },
      });
      message.success('Attendance saved. The forecast has been updated.');
      form.resetFields(['totalClasses', 'attendedClasses']);
      dispatch(fetchAttendance());
    } catch (err) {
      message.error((err.response && err.response.data && err.response.data.message) || 'Unable to save the attendance.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/attendance/${id}`);
      message.success(res.data);
      dispatch(fetchAttendance());
    } catch (err) {
      message.error((err.response && err.response.data && err.response.data.message) || 'Unable to delete the record.');
    }
  };

  const columns = [
    { title: 'Student', render: (_, a) => (a.student && a.student.fullName) || '–' },
    { title: 'Subject', render: (_, a) => (a.subject && a.subject.name) || '–' },
    { title: 'Attended', dataIndex: 'attendedClasses' },
    { title: 'Total', dataIndex: 'totalClasses' },
    {
      title: 'Rate',
      render: (_, a) => (a.totalClasses > 0 ? `${((a.attendedClasses * 100) / a.totalClasses).toFixed(0)}%` : '–'),
    },
  ];
  if (isAdmin) {
    columns.push({
      title: 'Actions',
      render: (_, a) => (
        <Popconfirm title="Delete this record?" okText="Delete" onConfirm={() => handleDelete(a.id)}>
          <Button size="small" danger>Delete</Button>
        </Popconfirm>
      ),
    });
  }

  return (
    <>
      {isStaff && (
        <GlassCard className="page-card">
          <h2>Record attendance</h2>
          <p className="muted" style={{ marginTop: 0 }}>Saving again for the same student and subject replaces the earlier record.</p>
          <Form form={form} layout="inline" onFinish={handleSave} style={{ rowGap: 12 }}>
            <Form.Item name="studentId" rules={[{ required: true, message: 'Pick a student' }]}>
              <Select
                placeholder="Student"
                style={{ width: 200 }}
                showSearch
                optionFilterProp="label"
                options={students.map((s) => ({ value: s.id, label: s.fullName }))}
              />
            </Form.Item>
            <Form.Item name="subjectId" rules={[{ required: true, message: 'Pick a subject' }]}>
              <Select placeholder="Subject" style={{ width: 200 }} options={subjects.map((s) => ({ value: s.id, label: s.name }))} />
            </Form.Item>
            <Form.Item name="totalClasses" rules={[{ required: true, message: 'Enter total classes' }]}>
              <InputNumber min={1} placeholder="Total classes" />
            </Form.Item>
            <Form.Item name="attendedClasses" rules={[{ required: true, message: 'Enter classes attended' }]}>
              <InputNumber min={0} placeholder="Classes attended" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving}>Save attendance</Button>
            </Form.Item>
          </Form>
        </GlassCard>
      )}

      <GlassCard className="page-card">
        <h2>{isStaff ? 'All attendance' : 'My attendance'}</h2>
        <ErrorHandler error={error} />
        <Table rowKey="id" columns={columns} dataSource={attendance} pagination={{ pageSize: 8 }} scroll={{ x: true }} />
      </GlassCard>
    </>
  );
};

export default AttendancePage;
