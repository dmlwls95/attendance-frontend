import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from "recharts";
import APIConfig from '../../configs/API.config';

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
    holiday: "#FFB7AE", // 휴일 근로 시간 (연분홍)
    night:   "#374151", // 야간 근로 시간 (진회색)
  },
};

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
  holidayMinutes: number;
  nightMinutes: number;
  workableDays: number;
  lateMinutes: number;
  totalMinutes: number; // normal+overtime+holiday
};
type WeeklyKpiResponse = {
  lateMinutes: number;
  overMinutes: number;
  totalMinutes: number;
};

/* HTML 반환(로그인 만료/권한 문제) 대비 안전 fetch */
async function fetchJSON<T>(url: string): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(url, 
            { method: "GET", 
              headers: {Authorization: `Bearer ${token}`},
              credentials: "include" }
            );
  const textCt = res.headers.get("content-type") || "";
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`요청 실패(${res.status}) • ${body.slice(0, 140)}`);
  }
  if (!textCt.includes("application/json")) {
    const body = await res.text().catch(() => "");
    throw new Error(`JSON 아님(로그인 만료/권한 문제 가능) • 응답 앞부분: ${body.slice(0, 140)}`);
  }
  return res.json();
}

/* ───────────────────────────────────────────────────────────── */
const UserMonthlySummary: React.FC = () => {
  const now = dayjs();
  const year = now.year();
  const month = now.month() + 1;

  // 월(1일~오늘), 주(월~오늘) 범위 계산
  const monthFrom = now.startOf("month").format("YYYY-MM-DD");
  const monthTo   = now.format("YYYY-MM-DD");
  const weekStart = now.startOf("week").add(1, "day"); // 월요일
  const weekFrom  = weekStart.format("YYYY-MM-DD");
  const weekTo    = now.format("YYYY-MM-DD");

  const [monthly, setMonthly] = useState<MonthlyDashboardResponse | null>(null);
  const [weekly,  setWeekly]  = useState<WeeklyKpiResponse | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [iconOk,  setIconOk]  = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setError(null);

        // 월간 대시보드(백엔드: /attendance/dashboard/monthly)
        const m = await fetchJSON<MonthlyDashboardResponse>(
          `${APIConfig}/attendance/dashboard/monthly?year=${year}&month=${month}`
        );
        if (!ignore) setMonthly(m);

        // 주간 KPI(월~오늘) (백엔드: /attendance/kpi)
        const w = await fetchJSON<WeeklyKpiResponse>(
          `${APIConfig}/attendance/kpi?from=${weekFrom}&to=${weekTo}`
        );
        
        if (!ignore) setWeekly(w);
      } catch (e: any) {
        if (!ignore) setError(`데이터를 불러오지 못했습니다. ${e?.message ?? ""}`);
      }
    })();
    return () => { ignore = true; };
  }, [year, month, weekFrom, weekTo]);

  // ── 도넛 데이터
  const donutData = useMemo(() => {
    const p = monthly?.presentDays ?? 0;
    const l = monthly?.lateDays ?? 0;
    const a = monthly?.absentDays ?? 0;
    const h = monthly?.holidayDays ?? 0;
    return [
      { name: "출근", value: p, color: COLORS.donut.work,    unit: "일" },
      { name: "지각", value: l, color: COLORS.donut.late,    unit: "일" },
      { name: "결근", value: a, color: COLORS.donut.absent,  unit: "일" },
      { name: "휴일", value: h, color: COLORS.donut.holiday, unit: "일" },
    ];
  }, [monthly]);

  const totalDays = donutData.reduce((s, d) => s + d.value, 0);
  const attendanceRate = totalDays > 0
    ? Math.round(((monthly?.presentDays ?? 0) / totalDays) * 100)
    : 0;

  // ── 막대 합계/값
  const normalMin   = monthly?.normalMinutes   ?? 0;
  const overtimeMin = monthly?.overtimeMinutes ?? 0;
  const holidayMin  = monthly?.holidayMinutes  ?? 0;
  const nightMin    = monthly?.nightMinutes    ?? 0;
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

      {/* ───── 상단: 도넛 + 라벨 (중앙 정렬) ───── */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="text-sm text-gray-500 mb-2">
          {year}년 {String(month).padStart(2, "0")}월 근무 현황 (집계: {monthFrom} ~ {monthTo})
        </div>
        <div className="w-full flex items-center justify-center gap-4">
          {/* 라벨 목록 (항목이름 00일) */}
          <div className="flex flex-col gap-2">
            {donutData.map((it) => (
              <div key={it.name} className="flex items-center gap-2 text-sm">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: it.color }} />
                <span className="text-gray-600">{it.name}</span>
                <span className="text-gray-800 font-medium">: {it.value}{it.unit}</span>
              </div>
            ))}
          </div>

          {/* 도넛 차트 */}
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
                {/* Recharts Tooltip (항목이름 00일 (xx%)) */}
                <ReTooltip
                formatter={(value: any, name: any) => {
               const v = Number(value || 0);
               const per = pct(v, totalDays);
                return [`${v}일 (${per}%)`, name];
               }}
                wrapperStyle={{ 
                 borderRadius: 8, 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  zIndex: 9999               // ← 이 한 줄만 추가!
                }}
                contentStyle={{ borderRadius: 8 }}
              />
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
          { label: "휴일 근로 시간", value: holidayMin,  color: COLORS.bars.holiday },
          { label: "야간 근로 시간", value: nightMin,    color: COLORS.bars.night },
        ].map((row) => (
          <div key={row.label} className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>{row.label}</span>
              <span>{pct(row.value, barTotal)}%</span>
            </div>

            {/* ✅ 최소 변경: DaisyUI tooltip으로 막대 툴팁 추가 */}
            <div
              className="tooltip tooltip-top w-full"
              data-tip={`${row.label} • ${mmToHHMM(row.value)} (${pct(row.value, barTotal)}%)`}
            >
              <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.bars.base }}>
                <div
                  className="h-4 rounded-full"
                  style={{ width: `${pct(row.value, barTotal)}%`, backgroundColor: row.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ───── 하단 카드: 월/주 지표 (6개) ───── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 월간 지각(분→시:분) */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-2">월간 지각</div>
          <div className="w-full h-8 bg-gray-200 rounded-md flex items-center px-3">
            <span className="text-gray-800 text-sm">{mmToHHMM(monthly?.lateMinutes)}</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-400">지각 {monthly?.lateDays ?? 0}일</div>
        </div>

        {/* 월간 잔업 */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-2">월간 잔업</div>
          <div className="w-full h-8 bg-gray-200 rounded-md flex items-center px-3">
            <span className="text-gray-800 text-sm">{mmToHHMM(monthly?.overtimeMinutes)}</span>
          </div>
        </div>

        {/* 월간 근무 총 시간 */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-2">월간 근무 총 시간</div>
          <div className="w-full h-8 bg-gray-200 rounded-md flex items-center px-3">
            <span className="text-gray-800 text-sm">
              {mmToHHMM(monthly?.totalMinutes)}
            </span>
          </div>
        </div>

        {/* 주간 지각 */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-2">주간 지각</div>
          <div className="w-full h-8 bg-gray-200 rounded-md flex items-center px-3">
            <span className="text-gray-800 text-sm">{mmToHHMM(weekly?.lateMinutes)}</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-400">집계: {weekFrom} ~ {weekTo}</div>
        </div>

        {/* 주간 잔업 */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-2">주간 잔업</div>
          <div className="w-full h-8 bg-gray-200 rounded-md flex items-center px-3">
            <span className="text-gray-800 text-sm">{mmToHHMM(weekly?.overMinutes)}</span>
          </div>
        </div>

        {/* 주간 근무 총 시간 */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-2">주간 근무 총 시간</div>
          <div className="w-full h-8 bg-gray-200 rounded-md flex items-center px-3">
            <span className="text-gray-800 text-sm">{mmToHHMM(weekly?.totalMinutes)}</span>
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
