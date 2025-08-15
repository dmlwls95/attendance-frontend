import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

dayjs.locale("ko");

/* ───────────────────────── 색상 (설계서 톤) */
const COLORS = {
  donut: {
    work:   "#374151", // 출근(진회색)
    late:   "#E5E7EB", // 지각(연회색)
    absent: "#A3A3A3", // 결근(회색)
    holiday:"#FFB7AE", // 휴일(연분홍)
  },
  bars: {
    base:    "#E5E9F0",
    std:     "#2DD4BF", // 소정 근로 시간 (민트)
    overtime:"#99A1EE", // 잔업 시간 (라벤더블루)
    holiday: "#FFB7AE", // 휴일 근로 시간 (연분홍)  // 공휴일 미반영(임시)
    night:   "#374151", // 야간 근로 시간 (진회색)
  },
};

// 아이콘(없으면 fallback)
const ICON_SRC = "/icon-monthly.svg";

/* 유틸 */
const mmToHHMM = (mm?: number) => {
  const m = Math.max(0, Math.round(mm ?? 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  return `${h}시간 ${String(r).padStart(2, "0")}분`;
};
const pct = (val: number, tot: number) =>
  tot > 0 ? Math.min(100, Math.round((val / tot) * 100)) : 0;

/* 타입 */
type MonthlyDashboardResponse = {
  presentDays: number;
  lateDays: number;
  absentDays: number;
  holidayDays: number;
  normalMinutes: number;
  overtimeMinutes: number;
  holidayMinutes: number; // 토/일 근무분(공휴일 미포함)
  nightMinutes: number;   // 22~05 근무분
  workableDays: number;
};
type AttendanceHistoryResponse = {
  workDays: number;
  workTimes: number; // 분
  overTimes: number; // 분
  absenceDays: number;
};

/* 안전한 JSON fetch (로그인 만료/권한 문제 시 HTML 반환 대비) */
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`요청 실패(${res.status}) • ${text.slice(0, 120)}`);
  }
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `JSON 아님(로그인 만료/권한 문제 가능) • 응답 앞부분: ${text.slice(0, 120)}`
    );
  }
  return res.json();
}

const UserMonthlySummary: React.FC = () => {
  const year = dayjs().year();
  const month = dayjs().month() + 1;

  const [monthly, setMonthly] = useState<MonthlyDashboardResponse | null>(null);
  const [weekly, setWeekly]   = useState<AttendanceHistoryResponse | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [iconOk, setIconOk]   = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setError(null);

        // 월간
        const m = await fetchJSON<MonthlyDashboardResponse>(
          `/attendance/dashboard/monthly?year=${year}&month=${month}`
        );
        if (!ignore) setMonthly(m);

        // 주간 (이번 주 월~일)
        const startOfWeek = dayjs().startOf("week").add(1, "day"); // 월요일
        const endOfWeek   = startOfWeek.add(6, "day");
        const from = startOfWeek.format("YYYY-MM-DD");
        const to   = endOfWeek.format("YYYY-MM-DD");

        const w = await fetchJSON<AttendanceHistoryResponse>(
          `/attendance/summary?from=${from}&to=${to}`
        );
        if (!ignore) setWeekly(w);
      } catch (e: any) {
        setError(`데이터를 불러오지 못했습니다. ${e?.message ?? ""}`);
      }
    })();
    return () => { ignore = true; };
  }, [year, month]);

  const donutData = useMemo(() => {
    const p = monthly?.presentDays ?? 0;
    const l = monthly?.lateDays ?? 0;
    const a = monthly?.absentDays ?? 0;
    const h = monthly?.holidayDays ?? 0;
    return [
      { name: "출근", value: p, color: COLORS.donut.work },
      { name: "지각", value: l, color: COLORS.donut.late },
      { name: "결근", value: a, color: COLORS.donut.absent },
      { name: "휴일", value: h, color: COLORS.donut.holiday },
    ];
  }, [monthly]);

  const totalDays = donutData.reduce((s, d) => s + d.value, 0);
  const attendanceRate = totalDays > 0
    ? Math.round(((monthly?.presentDays ?? 0) / totalDays) * 100)
    : 0;

  const normalMin   = monthly?.normalMinutes   ?? 0;
  const overtimeMin = monthly?.overtimeMinutes ?? 0;
  const holidayMin  = monthly?.holidayMinutes  ?? 0; // 토/일 근무 (공휴일 미반영, 임시)
  const nightMin    = monthly?.nightMinutes    ?? 0; // 22~05 근무
  const barTotal    = normalMin + overtimeMin + holidayMin + nightMin;

  return (
    <div className="p-6">
      {/* ───── 헤더 (아이콘 + 제목) ───── */}
      <div className="flex items-center gap-2 mb-4">
        {iconOk ? (
          <img
            src={ICON_SRC}
            alt="월간 아이콘"
            className="w-6 h-6"
            onError={() => setIconOk(false)}
          />
        ) : (
          <div className="w-6 h-6 rounded bg-gray-300 grid place-items-center text-xs">📊</div>
        )}
        <h2 className="text-xl font-semibold">월간 근로 분석</h2>
      </div>

      {/* ───── 상단: 도넛 + 라벨 (가로 가운데, 간격 좁게) ───── */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="text-sm text-gray-500 mb-2">
          {year}년 {String(month).padStart(2, "0")}월 근무 현황
        </div>

        <div className="w-full flex items-center justify-center gap-4">
          {/* 라벨 */}
          <div className="flex flex-col gap-2">
            {donutData.map((it) => (
              <div key={it.name} className="flex items-center gap-2 text-sm">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: it.color }} />
                <span className="text-gray-600">{it.name}</span>
                <span className="text-gray-800 font-medium">: {it.value} 일</span>
              </div>
            ))}
          </div>

          {/* 도넛 */}
          <div className="relative w-[260px] h-[180px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <div className="text-xs text-gray-500 mb-1">출근율</div>
              <div className="text-2xl font-semibold">{attendanceRate}%</div>
              <div className="text-[10px] text-gray-400">
                {year}-{String(month).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── 중간: 가로 막대 (소정/잔업/휴일/야간) ───── */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        {[
          { label: "소정 근로 시간", value: normalMin,  color: COLORS.bars.std },
          { label: "잔업 시간",     value: overtimeMin, color: COLORS.bars.overtime },
          { label: "휴일 근로 시간", value: holidayMin,  color: COLORS.bars.holiday }, // (토/일, 공휴일 미반영)
          { label: "야간 근로 시간", value: nightMin,    color: COLORS.bars.night   }, // (22:00~05:00)
        ].map((row) => (
          <div key={row.label} className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>{row.label}</span>
              <span>{pct(row.value, barTotal)}%</span>
            </div>
            <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.bars.base }}>
              <div
                className="h-4 rounded-full"
                style={{ width: `${pct(row.value, barTotal)}%`, backgroundColor: row.color }}
                title={`${row.label} • ${mmToHHMM(row.value)}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ───── 하단 카드: 월/주 지표 (6개) ───── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 월간 지각(‘시간’ 집계는 아직 없음) */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-2">월간 지각</div>
          <div className="w-full h-8 bg-gray-200 rounded-md flex items-center px-3">
            <span className="text-gray-800 text-sm">00시간 00분</span>
          </div>
        </div>

        {/* 월간 잔업 */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-2">월간 잔업</div>
          <div className="w-full h-8 bg-gray-200 rounded-md flex items-center px-3">
            <span className="text-gray-800 text-sm">{mmToHHMM(overtimeMin)}</span>
          </div>
        </div>

        {/* 월간 근무 총 시간 */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-2">월간 근무 총 시간</div>
          <div className="w-full h-8 bg-gray-200 rounded-md flex items-center px-3">
            <span className="text-gray-800 text-sm">
              {mmToHHMM(normalMin + overtimeMin + holidayMin + nightMin)}
            </span>
          </div>
        </div>

        {/* 주간 지각(집계 없음) */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-2">주간 지각</div>
          <div className="w-full h-8 bg-gray-200 rounded-md flex items-center px-3">
            <span className="text-gray-800 text-sm">00시간 00분</span>
          </div>
        </div>

        {/* 주간 잔업 */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-2">주간 잔업</div>
          <div className="w-full h-8 bg-gray-200 rounded-md flex items-center px-3">
            <span className="text-gray-800 text-sm">{mmToHHMM(weekly?.overTimes ?? 0)}</span>
          </div>
        </div>

        {/* 주간 근무 총 시간 */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-2">주간 근무 총 시간</div>
          <div className="w-full h-8 bg-gray-200 rounded-md flex items-center px-3">
            <span className="text-gray-800 text-sm">{mmToHHMM(weekly?.workTimes ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="mt-4 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default UserMonthlySummary;
