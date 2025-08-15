import WeeklyAnalysis from '../components/WeeklyAnalysis';
import WeeklyTable from '../components/WeeklyTable';
import WeeklyLateStatus from '../components/WeeklyLateStatus';

const WeeklyAttendStatus = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 20 }}>週間勤怠状況</h1>

      {/* 週間勤労分析チャート */}
      <WeeklyAnalysis startDate="2025-08-12" endDate="2025-08-18" />

      {/* 週間テーブル */}
      <WeeklyTable />

      {/* 遅刻および欠勤状況 */}
      <WeeklyLateStatus />
    </div>
  );
};

export default WeeklyAttendStatus;
