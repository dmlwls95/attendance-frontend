// src/pages/userpages/UserMonthlySummary.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/** -----------------------------
 *  ① 타입 정의 (데이터 모양)
 * ----------------------------- */
type MonthlySummary = {
  month: string;              // '2025-08' 형태(표시용)
  workDays: number;           // 출근일
  lateDays: number;           // 지각일
  absenceDays: number;        // 결근일
  holidays: number;           // 휴일
  attendanceRate: number;     // 출근율(%) 0~100
};

type WorkTimeSummary = {
  baseMinutes: number;        // 소정근로(분)
  overtimeMinutes: number;    // 잔업(분)
  holidayMinutes: number;     // 휴일근로(분)
  nightMinutes: number;       // 야간근로(분)
};

type Totals = {
  monthlyLateMinutes: number;
  monthlyOvertimeMinutes: number;
  monthlyTotalMinutes: number;
  weeklyLateMinutes: number;
  weeklyOvertimeMinutes: number;
  weeklyTotalMinutes: number;
};

/** -----------------------------
 *  ② 유틸: 분→"nn시간 nn분"
 * ----------------------------- */
const mmToHHmm = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}시간 ${String(mm).padStart(2, "0")}분`;
};

/** -----------------------------
 *  ③ 가짜데이터(백엔드 준비 전)
 * ----------------------------- */
const MOCK_MONTHLY: MonthlySummary = {
  month: dayjs().format("YYYY-MM"),
  workDays: 15,
  lateDays: 3,
  absenceDays: 1,
  holidays: 4,
  attendanceRate: 83,
};

const MOCK_TIMES: WorkTimeSummary = {
  baseMinutes: 160 * 60,
  overtimeMinutes: 22 * 60,
  holidayMinutes: 8 * 60,
  nightMinutes: 12 * 60,
};

const MOCK_TOTALS: Totals = {
  monthlyLateMinutes: 120,
  monthlyOvertimeMinutes: 600,
  monthlyTotalMinutes: 168 * 60,
  weeklyLateMinutes: 40,
  weeklyOvertimeMinutes: 180,
  weeklyTotalMinutes: 40 * 60,
};

/** daisyUI 톤과 어울리는 단색 팔레트(출근/지각/결근/휴일) */
const COLORS = ["#1f2937", "#9CA3AF", "#D1D5DB", "#FECACA"];

export default function UserMonthlySummary() {
  // 화면 상태
  const [monthly, setMonthly] = useState<MonthlySummary>(MOCK_MONTHLY);
  const [times, setTimes] = useState<WorkTimeSummary>(MOCK_TIMES);
  const [totals, setTotals] = useState<Totals>(MOCK_TOTALS);
  const [useApi, setUseApi] = useState(false); // 처음엔 가짜데이터로
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /** 도넛 그래프 데이터 */
  const pieData = useMemo(
    () => [
      { name: "출근", value: monthly.workDays },
      { name: "지각", value: monthly.lateDays },
      { name: "결근", value: monthly.absenceDays },
      { name: "휴일", value: monthly.holidays },
    ],
    [monthly]
  );

  /** 막대 그래프(퍼센트) */
  const totalMinutes =
    times.baseMinutes +
      times.overtimeMinutes +
      times.holidayMinutes +
      times.nightMinutes || 1;

  const barData = [
    { name: "소정 근로 시간", pct: Math.round((times.baseMinutes / totalMinutes) * 100) },
    { name: "잔업 시간", pct: Math.round((times.overtimeMinutes / totalMinutes) * 100) },
    { name: "휴일 근로 시간", pct: Math.round((times.holidayMinutes / totalMinutes) * 100) },
    { name: "야간 근로 시간", pct: Math.round((times.nightMinutes / totalMinutes) * 100) },
  ];

  /** -----------------------------
   *  ④ API 연결 (토글 켤 때만 요청)
   *  - 기본 주소는 .env 파일 또는 3980 포트
   *  - 토큰 있으면 Authorization 헤더로 전송
   * ----------------------------- */
  useEffect(() => {
    if (!useApi) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setErr(null);

        const baseURL =
          // Vite 환경변수 → CRA 환경변수 → 기본값
          (import.meta as any)?.env?.VITE_API_BASE ||
          (process.env as any)?.REACT_APP_API_BASE ||
          "http://localhost:3980";

        const headers: Record<string, string> = {};
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const [mRes, sRes, tRes] = await Promise.all([
          axios.get(`${baseURL}/attendance/summary/monthly`, { headers }),
          axios.get(`${baseURL}/attendance/summary`, { headers }),
          axios.get(`${baseURL}/attendance/today`, { headers }),
        ]);

        // ⚠️ 실제 응답 키 이름에 맞게 아래만 조정하면 됨
        const m = mRes.data || {};
        setMonthly({
          month: m.month ?? dayjs().format("YYYY-MM"),
          workDays: m.workDays ?? m.present ?? 0,
          lateDays: m.lateDays ?? 0,
          absenceDays: m.absenceDays ?? 0,
          holidays: m.holidays ?? m.holidayDays ?? 0,
          attendanceRate: m.attendanceRate ?? 0,
        });

        const s = sRes.data || {};
        setTimes({
          baseMinutes: s.baseMinutes ?? 0,
          overtimeMinutes: s.overtimeMinutes ?? 0,
          holidayMinutes: s.holidayMinutes ?? 0,
          nightMinutes: s.nightMinutes ?? 0,
        });

        const t = tRes.data || {};
        setTotals({
          monthlyLateMinutes: t.monthlyLateMinutes ?? 0,
          monthlyOvertimeMinutes: t.monthlyOvertimeMinutes ?? 0,
          monthlyTotalMinutes: t.monthlyTotalMinutes ?? 0,
          weeklyLateMinutes: t.weeklyLateMinutes ?? 0,
          weeklyOvertimeMinutes: t.weeklyOvertimeMinutes ?? 0,
          weeklyTotalMinutes: t.weeklyTotalMinutes ?? 0,
        });
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || "API 오류");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [useApi]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 상단: 제목 + 토글 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">월간 근로 분석</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">가짜데이터</span>
          <input
            type="checkbox"
            className="toggle"
            checked={useApi}
            onChange={(e) => setUseApi(e.target.checked)}
          />
          <span className="text-sm">API 연결</span>
        </div>
      </div>

      {/* 1) 원형(도넛) 차트 + 범례 + 출근율 */}
      <div className="card bg-base-100 shadow-md rounded-2xl">
        <div className="card-body">
          <p className="font-semibold">{dayjs().format("YYYY년 MM월")} 근무 현황</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* 차트 */}
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={"55%"}
                    outerRadius={"90%"}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* 출근율 카드 + 범례 */}
            <div className="space-y-4">
              <div className="stat bg-base-200 rounded-2xl">
                <div className="stat-title">출근율</div>
                <div className="stat-value">{monthly.attendanceRate}%</div>
                <div className="stat-desc">{monthly.month}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><span className="badge" style={{background:COLORS[0]}}></span>출근: {monthly.workDays}일</div>
                <div className="flex items-center gap-2"><span className="badge" style={{background:COLORS[1]}}></span>지각: {monthly.lateDays}일</div>
                <div className="flex items-center gap-2"><span className="badge" style={{background:COLORS[2]}}></span>결근: {monthly.absenceDays}일</div>
                <div className="flex items-center gap-2"><span className="badge" style={{background:COLORS[3]}}></span>휴일: {monthly.holidays}일</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2) 근로 시간 구성 비율(막대) */}
      <div className="card bg-base-100 shadow-md rounded-2xl">
        <div className="card-body">
          <p className="font-semibold">근로 시간 구성 비율</p>
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={barData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Bar dataKey="pct" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3) 하단 타일(월/주 합계) */}
      <div className="grid md:grid-cols-3 gap-4">
        <Tile title="월간 지각" value={mmToHHmm(totals.monthlyLateMinutes)} />
        <Tile title="월간 잔업" value={mmToHHmm(totals.monthlyOvertimeMinutes)} />
        <Tile title="월간 근무 총 시간" value={mmToHHmm(totals.monthlyTotalMinutes)} />
        <Tile title="주간 지각" value={mmToHHmm(totals.weeklyLateMinutes)} />
        <Tile title="주간 잔업" value={mmToHHmm(totals.weeklyOvertimeMinutes)} />
        <Tile title="주간 근무 총 시간" value={mmToHHmm(totals.weeklyTotalMinutes)} />
      </div>

      {/* 상태 표시 */}
      {loading && <div className="alert alert-info">불러오는 중…</div>}
      {err && <div className="alert alert-error">에러: {err}</div>}
    </div>
  );
}

/** 작은 타일 컴포넌트 */
function Tile({ title, value }: { title: string; value: string }) {
  return (
    <div className="card bg-base-100 shadow-md rounded-2xl">
      <div className="card-body p-4">
        <p className="text-sm opacity-70">{title}</p>
        <p className="text-xl font-semibold text-right">{value}</p>
      </div>
    </div>
  );
}
