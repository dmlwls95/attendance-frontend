import { useEffect, useState } from "react";
import { fetchAttendanceHistoryExportCsv, fetchAttendanceHistoryOfMine, type AttendanceHistoryResponse } from "../../services/UserAttendanceHistoryService";




type YMD = { y: number | ""; m: number | ""; d: number | "" };
export default function UserAttendanceHistory()
{

    const toHhMm = (min?: number) => {
        const m = Math.max(0, Math.round(min ?? 0));
        const h = Math.floor(m / 60);
        const r = m % 60;
        return `${h} 시간 ${String(r).padStart(2, "0")} 분`;
    };
    const [history, setHistory ] = useState<AttendanceHistoryResponse>();
    const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
    const [selectedTo, setSelectedTo] = useState<string | null>(null);
    const [fromYMD, setFromYMD] = useState<YMD>({ y: "", m: "", d: "" });
    const [toYMD, setToYMD] = useState<YMD>({ y: "", m: "", d: "" });

      // ---- options ----
    const years = rangeOptions(2020, 2030);
    const months = rangeOptions(1, 12);
    const days = rangeOptions(1, 31);

    const onDataChanged = async () =>
    {
        try {
            if(selectedFrom && selectedTo)
            {
                const data = await fetchAttendanceHistoryOfMine(selectedFrom, selectedTo);
                setHistory(data);

                
            }
        } catch (error) {
            console.error(error);
        }
        
    }

    useEffect(() => {
        if (fromYMD.y !== "" && fromYMD.m !== "" && fromYMD.d !== "") {
            setSelectedFrom(`${fromYMD.y}-${String(fromYMD.m).padStart(2, "0")}-${String(fromYMD.d).padStart(2, "0")}`);
            onDataChanged();
        }
    }, [fromYMD]); // ymd가 변경될 때마다 실행

    useEffect(() => {
        if (toYMD.y !== "" && toYMD.m !== "" && toYMD.d !== "") {
            setSelectedTo(`${toYMD.y}-${String(toYMD.m).padStart(2, "0")}-${String(toYMD.d).padStart(2, "0")}`);
            onDataChanged();
        }
    }, [toYMD]); // ymd가 변경될 때마다 실행

    //csv 출력
    const handleExport = async () =>{
        if(selectedFrom && selectedTo)
        {
            try {
                await fetchAttendanceHistoryExportCsv(selectedFrom, selectedTo);
            } catch (error) {
                console.error(error);
            }
        }
    }
    return (
        <div>
            {/* ① 기간(시작/종료) */}
            {/* 상단: 기간 카드 */}
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
            <br></br>

            {/* ⑥ 요약 카드 4개 */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <div className="text-sm opacity-70">출근일수</div>
                    <div className="text-2xl font-bold">{history?.workDays} 일</div>
                </div>
                </div>
                <div className="card bg-base-100 shadow text-nowrap">
                <div className="card-body">
                    <div className="text-sm opacity-70">근무시간</div>
                    <div className="text-2xl font-bold">{typeof(history?.workTimes) !== "undefined"?   Math.floor(history?.workTimes / 60) : 0} 시간 {typeof(history?.workTimes) !== "undefined"?   Math.floor(history?.workTimes % 60) : 0} 분</div>
                </div>
                </div>
                <div className="card bg-base-100 shadow text-nowrap">
                <div className="card-body">
                    <div className="text-sm opacity-70">잔업시간</div>
                    <div className="text-2xl font-bold">{typeof(history?.overTimes) !== "undefined"?   Math.floor(history?.overTimes / 60) : 0} 시간 {typeof(history?.overTimes) !== "undefined"?   Math.floor(history?.overTimes % 60) : 0} 분</div>
                </div>
                </div>
                <div className="card bg-base-100 shadow text-nowrap">
                <div className="card-body">
                    <div className="text-sm opacity-70">결근일수</div>
                    <div className="text-2xl font-bold">{history?.absenceDays} 일</div>
                </div>
                </div>
            </section>
            
            <br></br>
            {/* 툴바 + 테이블 */}
            <section className="space-y-4">
                {/* ② 검색 + ③ CSV + ④ 표시 */}
                <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-2">
                    <input
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered input-sm w-64"
                    aria-label="search"
                    />
                    <button className="btn btn-ghost btn-sm" aria-label="search">🔍</button>
                </div>
                <h3 className="text-xl font-bold text-center flex-1">근무기록</h3>
                <div className="flex items-center gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={handleExport}>csv 다운로드</button>
                    <button className="btn btn-primary btn-sm" onClick={onDataChanged}>조회</button>
                </div>
                </div>

                {/* ⑤ 테이블 */}
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
                                <tr key={idx ?? `${val.workdate}-${idx}`}>
                                    <td>{val.workdate ?? "-"}</td>
                                    <td>{val.clock_in ?? "-"}</td>
                                    <td>{val.clock_out ?? "-"}</td>
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
        <SelectBox
          label="년"
          value={ymd.y}
          options={years}
          onChange={(v) => setYMD((p) => ({ ...p, y: v }))}
        />
        <SelectBox
          label="월"
          value={ymd.m}
          options={months}
          onChange={(v) => setYMD((p) => ({ ...p, m: v }))}
        />
        <SelectBox
          label="일"
          value={ymd.d}
          options={days}
          onChange={(v) => setYMD((p) => ({ ...p, d: v }))}
        />
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
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
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