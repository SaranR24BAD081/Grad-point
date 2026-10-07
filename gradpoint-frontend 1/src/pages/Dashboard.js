import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAttendance, fetchMarks, fetchPredictions } from '../store/slices/academicSlice';
import GlassCard from '../components/GlassCard';
import ErrorHandler from '../components/ErrorHandler';
import RiskBadge from '../components/RiskBadge';
import { heroHeadingStyle } from '../styles/styles';

const scoreColor = (score) => (score < 40 ? '#f0707a' : score <= 70 ? '#f2b84b' : '#5ed3a8');

const suggestionFor = (prediction, attendancePct) => {
  const lowAttendance = attendancePct !== null && attendancePct < 75;
  if (prediction.riskLevel === 'HIGH RISK') {
    return lowAttendance
      ? `Attendance is ${attendancePct.toFixed(0)}%. Attend every class this month and book a catch-up session with your teacher.`
      : 'Marks are well below target. Revisit the weakest topics and ask your teacher for practice papers.';
  }
  return lowAttendance
    ? `Attendance is ${attendancePct.toFixed(0)}%. Raising it above 75% would move this subject toward LOW risk.`
    : 'You are close. One strong internal or final score would move this subject toward LOW risk.';
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { marks, attendance, predictions, error } = useSelector((state) => state.academic);

  const isStudent = !!user && user.role === 'ROLE_STUDENT';
  const studentId = isStudent ? user.id : undefined;

  useEffect(() => {
    dispatch(fetchMarks(studentId));
    dispatch(fetchPredictions(studentId));
    dispatch(fetchAttendance(studentId));
  }, [dispatch, studentId]);

  const stats = useMemo(() => {
    const scores = marks.filter((m) => m.score != null).map((m) => m.score);
    const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    const total = attendance.reduce((sum, a) => sum + (a.totalClasses || 0), 0);
    const attended = attendance.reduce((sum, a) => sum + (a.attendedClasses || 0), 0);
    const rate = total > 0 ? (attended * 100) / total : null;

    const risk = predictions.filter((p) => p.riskLevel && p.riskLevel !== 'LOW').length;
    return { average, rate, risk };
  }, [marks, attendance, predictions]);

  const chartData = useMemo(() => {
    const bySubject = {};
    predictions.forEach((p) => {
      const key = (p.subject && p.subject.name) || 'Unknown';
      bySubject[key] = bySubject[key] || { sum: 0, count: 0 };
      bySubject[key].sum += p.predictedScore || 0;
      bySubject[key].count += 1;
    });
    return Object.entries(bySubject).map(([subject, v]) => ({
      subject,
      predicted: Math.round((v.sum / v.count) * 10) / 10,
    }));
  }, [predictions]);

  const atRisk = predictions.filter((p) => p.riskLevel && p.riskLevel !== 'LOW');

  const attendanceFor = (prediction) => {
    const record = attendance.find(
      (a) =>
        a.subject && prediction.subject && a.subject.id === prediction.subject.id &&
        a.student && prediction.student && a.student.id === prediction.student.id
    );
    return record && record.totalClasses > 0 ? (record.attendedClasses * 100) / record.totalClasses : null;
  };

  const recent = [...marks]
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .slice(0, 8);

  const name = (user && (user.fullName || user.username)) || 'there';

  return (
    <div>
      <h1 className="hero-heading" style={{ ...heroHeadingStyle, marginBottom: 6 }}>Hello, {name}</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: 24 }}>
        {isStudent ? 'Your forecast across every subject.' : 'Forecast overview across all students.'}
      </p>

      <ErrorHandler error={error} />

      <div className="stat-grid">
        <GlassCard className="stat">
          <div className="value">{stats.average === null ? '–' : stats.average.toFixed(1)}</div>
          <div className="label">Average Score</div>
        </GlassCard>
        <GlassCard className="stat">
          <div className="value">{stats.rate === null ? '–' : `${stats.rate.toFixed(0)}%`}</div>
          <div className="label">Attendance Rate</div>
        </GlassCard>
        <GlassCard className="stat">
          <div className="value">{stats.risk}</div>
          <div className="label">Risk Subjects</div>
        </GlassCard>
      </div>

      <GlassCard className="page-card">
        <h2>Predicted score by subject</h2>
        {chartData.length === 0 ? (
          <p className="muted">Predictions appear once a teacher records marks for a subject.</p>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="subject" stroke="#a9aed6" />
                <YAxis domain={[0, 100]} stroke="#a9aed6" />
                <Tooltip contentStyle={{ background: '#23265a', border: '1px solid #4b4f9a', borderRadius: 10 }} />
                <Bar dataKey="predicted" name="Predicted score" radius={[8, 8, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.subject} fill={scoreColor(d.predicted)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      <GlassCard className="page-card">
        <h2>Improvement suggestions</h2>
        {atRisk.length === 0 ? (
          <p className="muted">No subjects need attention right now.</p>
        ) : (
          atRisk.map((p) => (
            <div className="suggestion" key={p.id}>
              <strong>{p.subject && p.subject.name}</strong> <RiskBadge level={p.riskLevel} />
              {!isStudent && p.student && <span className="muted"> · {p.student.fullName}</span>}
              <div className="muted">{suggestionFor(p, attendanceFor(p))}</div>
            </div>
          ))
        )}
      </GlassCard>

      <GlassCard className="page-card">
        <h2>Recent performance</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam Type</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((m) => (
                <tr key={m.id}>
                  <td>{m.subject && m.subject.name}</td>
                  <td>{m.examType}</td>
                  <td>{m.score}</td>
                  <td>{m.date}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={4} className="muted">No marks recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;
