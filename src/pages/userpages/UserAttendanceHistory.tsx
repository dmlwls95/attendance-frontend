import { useState } from "react";
import { fetchAttendanceHistoryExportCsv, fetchAttendanceHistoryOfMine, type AttendanceHistoryResponse } from "../../services/UserAttendanceHistoryService";

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


    function onSelectedFrom(date : string)
    {
        setSelectedFrom(date);
        onDataChanged();
    }
    function onSelectedTo(date : string)
    {
        setSelectedTo(date);
        onDataChanged();
    }
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
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                {/* 開始日 */}
                <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title text-lg">시작일</h2>
                    <div className="grid grid-cols-3 gap-3">
                        
                        <input type="date" onChange={ (event) => onSelectedFrom(event.target.value)}/>
                    </div>
                </div>
                </div>

                {/* 終了日 */}
                <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title text-lg">종료일</h2>
                    <div className="grid grid-cols-3 gap-3">
                    <input type="date" onChange={ (event) => onSelectedTo(event.target.value)}/>
                    </div>
                </div>
                </div>
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
                    <div className="text-2xl font-bold">{typeof(history?.workTimes) !== "undefined"?   Math.round(history?.workTimes / 60) : 0} 시간 {typeof(history?.workTimes) !== "undefined"?   Math.round(history?.workTimes % 60) : 0} 분</div>
                </div>
                </div>
                <div className="card bg-base-100 shadow text-nowrap">
                <div className="card-body">
                    <div className="text-sm opacity-70">잔업시간</div>
                    <div className="text-2xl font-bold">{typeof(history?.overTimes) !== "undefined"?   Math.round(history?.overTimes) : 0} 시간 {typeof(history?.overTimes) !== "undefined"?   Math.round(history?.overTimes % 60) : 0} 분</div>
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
                    <button className="btn btn-ghost btn-sm" disabled>csv 다운로드</button>
                    <button className="btn btn-primary btn-sm">조회</button>
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