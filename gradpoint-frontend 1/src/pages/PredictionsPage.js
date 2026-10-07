import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table } from 'antd';
import { fetchPredictions } from '../store/slices/academicSlice';
import GlassCard from '../components/GlassCard';
import ErrorHandler from '../components/ErrorHandler';
import RiskBadge from '../components/RiskBadge';

const PredictionsPage = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);
  const { predictions, error } = useSelector((state) => state.academic);
  const isStaff = role === 'ROLE_TEACHER' || role === 'ROLE_ADMIN';

  useEffect(() => {
    dispatch(fetchPredictions(isStaff ? undefined : user && user.id));
  }, [dispatch, isStaff, user]);

  const columns = [
    { title: 'Student', render: (_, p) => (p.student && p.student.fullName) || '–' },
    { title: 'Subject', render: (_, p) => (p.subject && p.subject.name) || '–' },
    {
      title: 'Predicted Score',
      dataIndex: 'predictedScore',
      sorter: (a, b) => a.predictedScore - b.predictedScore,
      render: (v) => (v == null ? '–' : v.toFixed(1)),
    },
    { title: 'Risk', dataIndex: 'riskLevel', render: (level) => <RiskBadge level={level} /> },
  ];

  return (
    <GlassCard className="page-card">
      <h2>{isStaff ? 'Forecasts' : 'My forecasts'}</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Predicted score = 70% average marks + 30% attendance. Below 40 is high risk, up to 70 is medium.
      </p>
      <ErrorHandler error={error} />
      <Table rowKey="id" columns={columns} dataSource={predictions} pagination={{ pageSize: 10 }} scroll={{ x: true }} />
    </GlassCard>
  );
};

export default PredictionsPage;
