// src/pages/UserMonthlySummary.tsx
import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
} from "recharts";

// ───────────────── 색상(설계서 톤과 유사)
const COLORS = {
  donutAttend: "#1F2937", // 진회색(출근)
  donutLate: "#9CA3AF",   // 중간 회색(지각)
  donutAbsent: "#6B7280", // 진한 회색(결근)
  donutHoliday: "#F8B4C6",// 연핑크(휴일)
  barBase: "#E5E7EB",     // 소정근로(연회색)
  barOver: "#8DA2FB",     // 잔업(파스텔 보라-파랑)
  barHoliday: "#F8B4C6",  // 휴일근로(연핑크)
  barNight: "#111827",    // 야간(매우 진회색)
};

const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:3980";
const DEFAULT_WORK_START = "09:00";

// ── 응답 타입
type MonthlyApi = {
  totalDaysWorked: number;
  totalHours: number;
  averageHours: number;
  missedDays: number;
};
type RangeItem = {
  workdate: string;
  clock_in: string | null;
  clock_out: string | null;
  workMinute: number;
  overtimeMinute: number;
};
type RangeApi = {
  workDays: number;
  workTimes: number;   // 총 근무(분)
  overTimes: number;   // 잔업(분)
  absenceDays: number; // 결근(일)
  historyList: RangeItem[];
};

// ── 유틸
function mmToHHmm(mm: number) {
  if (!Number.isFinite(mm) || mm <= 0) return "00시간 00분";
  const h = Math.floor(mm / 60);
  const m = Math.round(mm % 60);
  return `${String(h).padStart(2, "0")}시간 ${String(m).padStart(2, "0")}분`;
}
function pct(part: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.round((Math.max(part, 0) / total) * 100);
}

const UserMonthlySummary: React.FC = () => {
  const today = dayjs();
  const monthStartStr = today.startOf("month").format("YYYY-MM-DD");
  const monthEndStr = today.endOf("month").format("YYYY-MM-DD");
  const weekStartStr = today.subtract(6, "day").format("YYYY-MM-DD");
  const weekEndStr = today.format("YYYY-MM-DD");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const [monthly, setMonthly] = useState<MonthlyApi | null>(null);
  const [rangeMonth, setRangeMonth] = useState<RangeApi | null>(null);
  const [rangeWeek, setRangeWeek] = useState<RangeApi | null>(null);

  // ── API 불러오기
  useEffect(() => {
    let stop = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("token") || "";
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const mUrl = `${API_BASE}/attendance/summary/monthly?year=${today.year()}&month=${today.month() + 1}`;
        const rMonthUrl = `${API_BASE}/attendance/summary?from=${monthStartStr}&to=${monthEndStr}`;
        const rWeekUrl = `${API_BASE}/attendance/summary?from=${weekStartStr}&to=${weekEndStr}`;

        const [mRes, rmRes, rwRes] = await Promise.all([
          fetch(mUrl, { headers }),
          fetch(rMonthUrl, { headers }),
          fetch(rWeekUrl, { headers }),
        ]);

        if (!mRes.ok) throw new Error(`월 통계 실패(${mRes.status})`);
        if (!rmRes.ok) throw new Error(`월 범위 실패(${rmRes.status})`);
        if (!rwRes.ok) throw new Error(`주간 범위 실패(${rwRes.status})`);

        const mJson = (await mRes.json()) as MonthlyApi;
        const rmJson = (await rmRes.json()) as RangeApi;
        const rwJson = (await rwRes.json()) as RangeApi;

        if (!stop) {
          setMonthly(mJson);
          setRangeMonth(rmJson);
          setRangeWeek(rwJson);
        }
      } catch (e: any) {
        if (!stop) setErr(e?.message || "불러오기 실패");
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 월간 계산(출근/지각/결근/휴일, 근로시간 비율, 하단 월간 카드)
  const monthCalc = useMemo(() => {
    let presentDays = 0;     // 출근(지각 포함)
    let absentDays = 0;      // 결근
    let lateDays = 0;        // 지각 '일수'
    let lateMinutes = 0;     // 지각 '총 분'
    let total = 0;           // 총 근무 분
    let over = 0;            // 잔업 분
    let base = 0;            // 소정근로 = 총 - 잔업
    // (보유 데이터에 없어서) 휴일/야간 분은 0으로 두고 UI만 구성
    let holidayMinutes = 0;
    let nightMinutes = 0;

    if (rangeMonth) {
      total = Math.max(rangeMonth.workTimes || 0, 0);
      over = Math.max(rangeMonth.overTimes || 0, 0);
      base = Math.max(total - over, 0);
      presentDays = rangeMonth.workDays ?? rangeMonth.historyList?.length ?? 0;
      absentDays = rangeMonth.absenceDays ?? 0;

      const std = DEFAULT_WORK_START;
      rangeMonth.historyList?.forEach((h) => {
        if (h.clock_in) {
          const inTime = dayjs(h.clock_in);
          const standard = dayjs(`${h.workdate}T${std}:00`);
          if (inTime.isAfter(standard)) {
            lateDays += 1;
            lateMinutes += Math.max(inTime.diff(standard, "minute"), 0);
          }
        }
      });
    }

    if (monthly) {
      // 월간 요약 API에서 보강
      if (!presentDays && typeof monthly.totalDaysWorked === "number")
        presentDays = monthly.totalDaysWorked;
      if (!absentDays && typeof monthly.missedDays === "number")
        absentDays = monthly.missedDays;
    }

    const normalDays = Math.max(presentDays - lateDays, 0);
    const holidayDays = 0; // 휴일근로 일수(없으면 0)

    const totalDays = normalDays + lateDays + absentDays + holidayDays;
    const attendanceRate =
      totalDays > 0 ? Math.round(((normalDays + lateDays) / totalDays) * 100) : 0;

    return {
      // 도넛
      normalDays,
      lateDays,
      absentDays,
      holidayDays,
      attendanceRate,
      // 막대
      totalMinutes: total,
      baseMinutes: base,
      overMinutes: over,
      holidayMinutes,
      nightMinutes,
      // 하단 카드용
      monthLateMinutes: lateMinutes,
      monthTotalMinutes: total,
      monthOverMinutes: over,
    };
  }, [monthly, rangeMonth]);

  // ── 주간(하단 카드)
  const weekCalc = useMemo(() => {
    let wOver = 0;
    let wTotal = 0;
    let wLateMin = 0;

    if (rangeWeek) {
      const std = DEFAULT_WORK_START;
      rangeWeek.historyList?.forEach((h) => {
        wOver += Math.max(h.overtimeMinute || 0, 0);
        wTotal += Math.max(h.workMinute || 0, 0);
        if (h.clock_in) {
          const inTime = dayjs(h.clock_in);
          const standard = dayjs(`${h.workdate}T${std}:00`);
          if (inTime.isAfter(standard)) {
            wLateMin += Math.max(inTime.diff(standard, "minute"), 0);
          }
        }
      });
    }
    return {
      weeklyOverMinutes: wOver,
      weeklyTotalMinutes: wTotal,
      weeklyLateMinutes: wLateMin,
    };
  }, [rangeWeek]);

  // ── 도넛 데이터
  const donutData = [
    { name: "출근", value: monthCalc.normalDays, color: COLORS.donutAttend },
    { name: "지각", value: monthCalc.lateDays, color: COLORS.donutLate },
    { name: "결근", value: monthCalc.absentDays, color: COLORS.donutAbsent },
    { name: "휴일", value: monthCalc.holidayDays, color: COLORS.donutHoliday },
  ];

  // ── 가운데 수평 바(각 항목을 전체 근로 대비 퍼센트로)
  const basePct = pct(monthCalc.baseMinutes, monthCalc.totalMinutes);
  const overPct = pct(monthCalc.overMinutes, monthCalc.totalMinutes);
  const holidayPct = pct(monthCalc.holidayMinutes, monthCalc.totalMinutes);
  const nightPct = pct(monthCalc.nightMinutes, monthCalc.totalMinutes);

  // ── 렌더
  return (
    <div className="p-6">
      {/* 상단 카드 */}
      <div className="rounded-2xl border shadow-sm p-5">
        <div className="text-sm text-gray-600 mb-2">
          {today.format("YYYY년 MM월")} 근무 현황
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* 왼쪽 범례/텍스트 */}
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-center">
            <div className="space-y-3">
              {[
                { label: "출근", color: COLORS.donutAttend, val: monthCalc.normalDays },
                { label: "지각", color: COLORS.donutLate, val: monthCalc.lateDays },
                { label: "결근", color: COLORS.donutAbsent, val: monthCalc.absentDays },
                { label: "휴일", color: COLORS.donutHoliday, val: monthCalc.holidayDays },
              ].map((i) => (
                <div key={i.label} className="flex items-center gap-3 text-sm">
                  <span
                    className="inline-block h-3 w-3 rounded"
                    style={{ backgroundColor: i.color }}
                  />
                  <span className="text-gray-700">{i.label}</span>
                  <span className="text-gray-500 ml-1">: {i.val} 일</span>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽 도넛 */}
          <div className="col-span-12 lg:col-span-7">
            <div className="w-full h-64">
              <ResponsiveContainer>
                <PieChart>
                  <PieTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const p = payload[0];
                      return (
                        <div className="bg-white border rounded px-2 py-1 text-xs shadow">
                          {p.name}: {p.value}일
                        </div>
                      );
                    }}
                  />
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {donutData.map((d, idx) => (
                      <Cell key={idx} fill={d.color} />
                    ))}
                  </Pie>

                  {/* 중앙 라벨 */}
                  <foreignObject
                    x="38%"
                    y="40%"
                    width="120"
                    height="60"
                    pointerEvents="none"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-xs text-gray-500">출근율</div>
                      <div className="text-2xl font-bold">
                        {monthCalc.attendanceRate}%
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {today.format("YYYY-MM")}
                      </div>
                    </div>
                  </foreignObject>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 가운데: 수평 퍼센트 바 4줄 */}
      <div className="rounded-2xl border shadow-sm p-5 mt-6">
        {[
          { label: "소정 근로 시간", color: COLORS.barBase, value: basePct },
          { label: "잔업 시간", color: COLORS.barOver, value: overPct },
          { label: "휴일 근로 시간", color: COLORS.barHoliday, value: holidayPct },
          { label: "야간 근로 시간", color: COLORS.barNight, value: nightPct },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-3 mb-3 last:mb-0"
          >
            <div className="shrink-0 w-28 text-xs text-gray-600">
              {row.label}
            </div>
            <div className="flex-1 h-5 rounded bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.min(row.value, 100)}%`,
                  backgroundColor: row.color,
                  transition: "width .5s",
                }}
              />
            </div>
            <div className="shrink-0 w-12 text-right text-xs text-gray-600">
              {row.value}%
            </div>
          </div>
        ))}
      </div>

      {/* 하단 카드 6개 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* 월간 지각 */}
        <div className="rounded-2xl border shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-3">월간 지각</div>
          <div className="h-10 rounded bg-gray-100 flex items-center px-4 text-sm text-gray-700">
            {mmToHHmm(monthCalc.monthLateMinutes)}
          </div>
        </div>

        {/* 월간 잔업 */}
        <div className="rounded-2xl border shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-3">월간 잔업</div>
          <div className="h-10 rounded bg-gray-100 flex items-center px-4 text-sm text-gray-700">
            {mmToHHmm(monthCalc.monthOverMinutes)}
          </div>
        </div>

        {/* 월간 근무 총 시간 */}
        <div className="rounded-2xl border shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-3">월간 근무 총 시간</div>
          <div className="h-10 rounded bg-gray-100 flex items-center px-4 text-sm text-gray-700">
            {mmToHHmm(monthCalc.monthTotalMinutes)}
          </div>
        </div>

        {/* 주간 지각 */}
        <div className="rounded-2xl border shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-3">주간 지각</div>
          <div className="h-10 rounded bg-gray-100 flex items-center px-4 text-sm text-gray-700">
            {mmToHHmm(weekCalc.weeklyLateMinutes)}
          </div>
        </div>

        {/* 주간 잔업 */}
        <div className="rounded-2xl border shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-3">주간 잔업</div>
          <div className="h-10 rounded bg-gray-100 flex items-center px-4 text-sm text-gray-700">
            {mmToHHmm(weekCalc.weeklyOverMinutes)}
          </div>
        </div>

        {/* 주간 근무 총 시간 */}
        <div className="rounded-2xl border shadow-sm p-4">
          <div className="text-sm text-gray-600 mb-3">주간 근무 총 시간</div>
          <div className="h-10 rounded bg-gray-100 flex items-center px-4 text-sm text-gray-700">
            {mmToHHmm(weekCalc.weeklyTotalMinutes)}
          </div>
        </div>
      </div>

      {/* 상태 표시 */}
      {loading && (
        <div className="mt-6 text-sm text-gray-500">불러오는 중…</div>
      )}
      {!!err && (
        <div className="mt-6 text-sm text-red-600">
          에러: {err}
        </div>
      )}
    </div>
  );
};

export default UserMonthlySummary;
