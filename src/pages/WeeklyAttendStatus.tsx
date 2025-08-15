import WeeklyAnalysis from '../components/WeeklyAnalysis';
import WeeklyTable from '../components/WeeklyTable';
import WeeklyLateStatus from '../components/WeeklyLateStatus';

const WeeklyAttendStatus = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 20 }}>주간 근태 현황</h1>

      {/* 주간 근로 분석 차트 */}
      <WeeklyAnalysis />

      {/* 주간 테이블 */}
      <WeeklyTable />

      {/* 지각 및 결근 현황 */}
      <WeeklyLateStatus />
    </div>
  );
};

export default WeeklyAttendStatus;
