import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, DatePicker, Form, InputNumber, Select, Table, message } from 'antd';
import api from '../services/api';
import { fetchMarks, fetchStudents, fetchSubjects } from '../store/slices/academicSlice';
import GlassCard from '../components/GlassCard';
import ErrorHandler from '../components/ErrorHandler';

const EXAM_TYPES = ['Internal', 'Final'];

const MarksPage = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);
  const { marks, subjects, students, error } = useSelector((state) => state.academic);
  const isStaff = role === 'ROLE_TEACHER' || role === 'ROLE_ADMIN';
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchMarks(isStaff ? undefined : user && user.id));
    if (isStaff) {
      dispatch(fetchSubjects());
      dispatch(fetchStudents());
    }
  }, [dispatch, isStaff, user]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      await api.post('/marks', {
        score: values.score,
        examType: values.examType,
        date: values.date ? values.date.format('YYYY-MM-DD') : undefined,
        student: { id: values.studentId },
        subject: { id: values.subjectId },
      });
      message.success('Marks saved. The forecast has been updated.');
      form.resetFields(['score', 'date']);
      dispatch(fetchMarks());
    } catch (err) {
      message.error((err.response && err.response.data && err.response.data.message) || 'Unable to save the marks.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'Student', render: (_, m) => (m.student && m.student.fullName) || '–' },
    { title: 'Subject', render: (_, m) => (m.subject && m.subject.name) || '–' },
    { title: 'Exam Type', dataIndex: 'examType' },
    { title: 'Score', dataIndex: 'score', sorter: (a, b) => a.score - b.score },
    { title: 'Date', dataIndex: 'date', defaultSortOrder: 'descend', sorter: (a, b) => String(a.date).localeCompare(String(b.date)) },
  ];

  return (
    <>
      {isStaff && (
        <GlassCard className="page-card">
          <h2>Record marks</h2>
          <Form form={form} layout="inline" onFinish={handleSave} initialValues={{ examType: 'Internal' }} style={{ rowGap: 12 }}>
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
            <Form.Item name="examType">
              <Select style={{ width: 120 }} options={EXAM_TYPES.map((t) => ({ value: t, label: t }))} />
            </Form.Item>
            <Form.Item name="score" rules={[{ required: true, message: 'Enter a score' }]}>
              <InputNumber min={0} max={100} placeholder="Score (0–100)" />
            </Form.Item>
            <Form.Item name="date">
              <DatePicker placeholder="Date (today if empty)" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving}>Save marks</Button>
            </Form.Item>
          </Form>
        </GlassCard>
      )}

      <GlassCard className="page-card">
        <h2>{isStaff ? 'All marks' : 'My marks'}</h2>
        <ErrorHandler error={error} />
        <Table rowKey="id" columns={columns} dataSource={marks} pagination={{ pageSize: 8 }} scroll={{ x: true }} />
      </GlassCard>
    </>
  );
};

export default MarksPage;
