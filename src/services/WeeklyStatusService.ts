// 주간 근태 연결용

export type WorkSummaryDTO = {
  userid: string;
  workdate: string;       
  dayofweek: string;
  workinghours: number;
  extendhours: number;
  totalhours: number;
  workstatus: string;
  arrivaltime: string;
};

export type AttendStatusDTO = {
  userid: string;
  workdate: string;
  attendstatus: string;
  arrivaltime: string;
};

type WeeklyData = {
  summary: WorkSummaryDTO[];
  attendance: AttendStatusDTO[];
};

export async function fetchWeeklyData(
  userid: string,
  start: string,
  end: string
): Promise<WeeklyData> {
  const params = new URLSearchParams({ userid, start, end }).toString();

  const summaryRes = await fetch(`/api/work/weekly/summary?${params}`);
  if (!summaryRes.ok) throw new Error('勤務状況の取得に失敗しました');
  const summary: WorkSummaryDTO[] = await summaryRes.json();

  const attendanceRes = await fetch(`/api/work/weekly/attendance?${params}`);
  if (!attendanceRes.ok) throw new Error('出勤状況の取得に失敗しました');
  const attendance: AttendStatusDTO[] = await attendanceRes.json();

  return { summary, attendance };
}
