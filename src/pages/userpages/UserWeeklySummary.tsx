import WeeklyAnalysis from "../../components/WeeklyAnalysis";
import WeeklyTable from "../../components/WeeklyTable";
import WeeklyLateStatus from "../../components/WeeklyLateStatus";

export default function UserWeeklySummary() {
  // 임시로 startDate, endDate를 지정 (추후 API 데이터로 교체 가능)
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
