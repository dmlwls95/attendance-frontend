import { useEffect, useState, useMemo } from "react";
import {
  fetchAttendanceHistoryExportCsv,
  fetchAttendanceHistoryOfMine,
  type AttendanceHistoryResponse,
} from "../../services/UserAttendanceHistoryService";

type YMD = { y: number | ""; m: number | ""; d: number | "" };

export default function UserAttendanceHistory() {
  const toHhMm = (min?: number) => {
    const m = Math.max(0, Math.round(min ?? 0));
    const h = Math.floor(m / 60);
    const r = m % 60;
    return `${h} 시간 ${String(r).padStart(2, "0")} 분`;
  };

  const [history, setHistory] = useState<AttendanceHistoryResponse>();
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [fromYMD, setFromYMD] = useState<YMD>({ y: "", m: "", d: "" });
  const [toYMD, setToYMD] = useState<YMD>({ y: "", m: "", d: "" });

  // ---- options ----
  // ★ 현재 연도 기준으로 만들어 주면 손이 덜 감
  const now = new Date();
  const years = useMemo(() => rangeOptions(2020, now.getFullYear() + 1), []);
  const months = useMemo(() => rangeOptions(1, 12), []);
  const days = useMemo(() => rangeOptions(1, 31), []);

  // ★ 조회 함수는 selectedFrom/selectedTo를 사용
  const onDataChanged = async () => {
    if (!selectedFrom || !selectedTo) return;
    try {
      const data = await fetchAttendanceHistoryOfMine(selectedFrom, selectedTo);
      setHistory(data);
    } catch (error) {
      console.error(error);
    }
  };

  // ★ YMD를 문자열로만 세팅하고, 실제 조회는 아래 effect 한 군데에서만 실행
  useEffect(() => {
    if (fromYMD.y !== "" && fromYMD.m !== "" && fromYMD.d !== "") {
      setSelectedFrom(
        `${fromYMD.y}-${String(fromYMD.m).padStart(2, "0")}-${String(
          fromYMD.d
        ).padStart(2, "0")}`
      );
    }
  }, [fromYMD]);

  useEffect(() => {
    if (toYMD.y !== "" && toYMD.m !== "" && toYMD.d !== "") {
      setSelectedTo(
        `${toYMD.y}-${String(toYMD.m).padStart(2, "0")}-${String(toYMD.d).padStart(2, "0")}`
      );
    }
  }, [toYMD]);

  // ★ 두 날짜가 모두 준비되면 그때 조회(상태 최신 보장)
  useEffect(() => {
    if (selectedFrom && selectedTo) {
      onDataChanged();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFrom, selectedTo]);

  // csv 출력
  const handleExport = async () => {
    if (!selectedFrom || !selectedTo) {
      alert("기간을 먼저 선택하세요.");
      return;
    }
    try {
      await fetchAttendanceHistoryExportCsv(selectedFrom, selectedTo);
    } catch (error) {
      console.error(error);
      alert("CSV 다운로드에 실패했습니다.");
    }
  };

  // ★ 백엔드가 ISO 문자열(예: 2025-09-03T09:00:00)로 주는 경우를 위해 포맷터 추가
  const fmtDate = (v?: string | null) => (v ? String(v).slice(0, 10) : "-");
  const fmtTime = (v?: string | null) =>
    v ? String(v).slice(11, 16).replace("T", "") : "-";

  return (
    <div>
      {/* ① 기간(시작/종료) */}
      <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DateCard
          title="시작일"
          ymd={fromYMD}
          setYMD={setFromYMD}
          years={years}
          months={months}
          days={days}
        />
        <DateCard
          title="종료일"
          ymd={toYMD}
          setYMD={setToYMD}
          years={years}
          months={months}
          days={days}
        />
      </section>

      <br />

      {/* ⑥ 요약 카드 4개 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="text-sm opacity-70">출근일수</div>
            <div className="text-2xl font-bold">{history?.workDays ?? 0} 일</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow text-nowrap">
          <div className="card-body">
            <div className="text-sm opacity-70">근무시간</div>
            <div className="text-2xl font-bold">{toHhMm(history?.workTimes)}</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow text-nowrap">
          <div className="card-body">
            <div className="text-sm opacity-70">잔업시간</div>
            <div className="text-2xl font-bold">{toHhMm(history?.overTimes)}</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow text-nowrap">
          <div className="card-body">
            <div className="text-sm opacity-70">결근일수</div>
            <div className="text-2xl font-bold">{history?.absenceDays ?? 0} 일</div>
          </div>
        </div>
      </section>

      <br />

      {/* 툴바 + 테이블 */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered input-sm w-64"
              aria-label="search"
            />
            <button className="btn btn-ghost btn-sm" aria-label="search">
              🔍
            </button>
          </div>
          <h3 className="text-xl font-bold text-center flex-1">근무기록</h3>
          <div className="flex items-center gap-2">
            {/* ★ 날짜 미선택시 비활성화 */}
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleExport}
              disabled={!selectedFrom || !selectedTo}
              title={!selectedFrom || !selectedTo ? "기간을 먼저 선택하세요" : ""}
            >
              csv 다운로드
            </button>
            <button className="btn btn-primary btn-sm" onClick={onDataChanged} disabled={!selectedFrom || !selectedTo}>
              조회
            </button>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>근무일</th>
                    <th>출근시간</th>
                    <th>퇴근시간</th>
                    <th>근무시간</th>
                    <th>잔업시간</th>
                  </tr>
                </thead>
                <tbody>
                  {(history?.historyList?.length ?? 0) > 0 ? (
                    history!.historyList!.map((val, idx) => (
                      <tr key={`${val.workdate ?? ""}-${idx}`}>
                        {/* ★ ISO → 포맷 */}
                        <td>{fmtDate(val.workdate as any)}</td>
                        <td>{fmtTime(val.clock_in as any)}</td>
                        <td>{fmtTime(val.clock_out as any)}</td>
                        <td>{toHhMm(val.workMinute)}</td>
                        <td>{toHhMm(val.overtimeMinute)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-base-content/60">
                        표시할 데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---- UI 컴포넌트 ---- */
function DateCard({
  title,
  ymd,
  setYMD,
  years,
  months,
  days,
}: {
  title: string;
  ymd: YMD;
  setYMD: React.Dispatch<React.SetStateAction<YMD>>;
  years: number[];
  months: number[];
  days: number[];
}) {
  return (
    <fieldset className="fieldset bg-base-100 border border-base-300 rounded-box p-5 shadow-sm">
      <legend className="font-semibold px-2">{title}</legend>
      <div className="grid grid-cols-3 gap-3">
        <SelectBox label="년" value={ymd.y} options={years} onChange={(v) => setYMD((p) => ({ ...p, y: v }))} />
        <SelectBox label="월" value={ymd.m} options={months} onChange={(v) => setYMD((p) => ({ ...p, m: v }))} />
        <SelectBox label="일" value={ymd.d} options={days} onChange={(v) => setYMD((p) => ({ ...p, d: v }))} />
      </div>
    </fieldset>
  );
}

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number | "";
  options: number[];
  onChange: (v: number | "") => void;
}) {
  return (
    <label className="form-control">
      <div className="label">
        <span className="label-text">{label}</span>
      </div>
      <select
        className="select select-bordered"
        value={value === "" ? "" : String(value)}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      >
        <option value="">00</option>
        {options.map((n) => (
          <option key={n} value={n}>
            {String(n).padStart(2, "0")}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------- helpers ---------- */
function rangeOptions(start: number, end: number) {
  const arr: number[] = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}