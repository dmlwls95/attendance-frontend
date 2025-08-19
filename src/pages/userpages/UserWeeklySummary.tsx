import WeeklyAnalysis from "../../components/WeeklyAnalysis";
import WeeklyTable from "../../components/WeeklyTable";
import WeeklyLateStatus from "../../components/WeeklyLateStatus";

export default function UserWeeklySummary() {
  // 임시로 startDate, endDate를 지정 (API연동하려다 재차 실패해서 오시면 여쭤보겠습니다!)
  const startDate = "2025-08-01";
  const endDate = "2025-08-07";

  return (
    <div className="fullscreen">
      <WeeklyAnalysis startDate={startDate} endDate={endDate} />
      <WeeklyTable />
      <WeeklyLateStatus />
    </div>
  );
}
