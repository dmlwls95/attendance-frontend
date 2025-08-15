// 주간 근태 연결용이나 머지 전이라 import에 엑스 뜨는 중. 머지 후 확인 예정.

// import React, { useState, useEffect } from 'react';
// import { fetchWeeklyData, WorkSummaryDTO, AttendStatusDTO } from '../services/WeeklyStatusService';
// import WeeklyAnalysis from '../components/WeeklyAnalysis';
// import WeeklyTable from '../components/WeeklyTable';
// import WeeklyLateStatus from '../components/WeeklyLateStatus';

// type Props = {
//   userid: string;
//   start: string;
//   end: string;
// };

// const WeeklyConnect: React.FC<Props> = ({ userid, start, end }) => {
//   const [summary, setSummary] = useState<WorkSummaryDTO[]>([]);
//   const [attendance, setAttendance] = useState<AttendStatusDTO[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchWeeklyData(userid, start, end)
//       .then(({ summary, attendance }) => {
//         setSummary(summary);
//         setAttendance(attendance);
//       })
//       .catch(err => {
//         console.error(err);
//         setError('データの取得に失敗しました');
//       })
//       .finally(() => setLoading(false));
//   }, [userid, start, end]);

//   if (loading) return <div>読み込み中…</div>;
//   if (error) return <div>{error}</div>;

//   // 차트용 데이터 준비
//   const barData = summary.map(item => ({
//     name: item.dayofweek,
//     勤務時間: item.workinghours,
//     残業時間: item.extendhours,
//     残り時間: item.totalhours - item.workinghours - item.extendhours,
//   }));

//   return (
//     <div style={{ fontFamily: 'Arial, sans-serif', padding: 20, maxWidth: 900, margin: '0 auto' }}>
//       <h1 style={{ textAlign: 'center', marginBottom: 20 }}>週間勤怠状況</h1>

//       {/* 3개 컴포넌트를 해당 데이터와 함께 호출 */}
//       <WeeklyAnalysis startDate={start} endDate={end} barData={barData} />
//       <WeeklyTable summary={summary} />
//       <WeeklyLateStatus attendance={attendance} />
//     </div>
//   );
// };

// export default WeeklyConnect;
