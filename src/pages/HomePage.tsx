import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { LuAlarmClockCheck } from "react-icons/lu";
import { IoMdRefresh } from "react-icons/io";
import { useEffect, useState } from "react";
import { getChartData, getWorkingList, type AdminHomepageChartDataResponse, type WorkingRowDTO, type WorkingStatus } from "../services/AdminHomepageService";
import { getRecommendedBoardList, type BoardResponse } from "../services/UserHomepageService";
import type { PageResponse } from "../services/UserService";
import { useNavigate } from "react-router-dom";




export default function HomePage() {
    const navigate = useNavigate();

    //
    const [data, setData] = useState<AdminHomepageChartDataResponse | null>(null);
    const [recentTopBoard, SetRecentTopBoard] = useState<BoardResponse[]>();

    //근무자 상태
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10)); // YYYY-MM-DD
    const [status, setStatus] = useState<WorkingStatus | "" >("");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [resp, setResp] = useState<PageResponse<WorkingRowDTO> | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    //차트 데이터 초기화
    useEffect(() => {
        (async () =>{
            await refreshChartData();
        })();
    }, []);

    // 추천 보드 데이터 가져오기
    useEffect(() => {
        (async () => {
            const res = await getRecommendedBoardList();
            if(typeof(res)==="string"){
                return;
            }

            SetRecentTopBoard(res);
        })();
    }, [])

    useEffect(() => {
        setLoading(true);
        setErr(null);
        getWorkingList({
        date,
        status: (status || undefined) as WorkingStatus | undefined,
        page,
        size,
        sortBy: "empnum",
        direction: "asc",
        })
        .then((res) => {
            // Add missing 'first' and 'last' properties if not present
            setResp({
                ...res,
                first: 'first' in res ? Boolean(res.first) : res.number === 0,
                last: 'last' in res ? Boolean(res.last) : (res.number === res.totalPages - 1),
            });
        })
        .catch((e) => setErr(e.message || String(e)))
        .finally(() => setLoading(false));
    }, [date, status, page, size]);

    const rows = resp?.content ?? [];
    const totalPages = resp?.totalPages ?? 0;

    const refreshChartData = async () =>{
        const res = await getChartData()
        setData(res);
    }

    if (!data) return <p>데이터를 불러오는 중...</p>;


    //보드 리스트
    //보드 
    //인기글 이동 함수
    const onClickBoardTitle = (id : number, type: string) =>{
        navigate(`/admin/adminboard/detail/${id}/${type}`);
    }


    //type SummaryItem = { label: string; value: number; key: string };

    const COLORS = ["#4b5563", "#9ca3af", "#ef4444", "#f59e0b", "#60a5fa"]; // 출근/퇴근/결근/유급/휴직

    const chartData = [
        { name: "근무", value: data.present },
        { name: "퇴근", value: data.left },
        { name: "휴가", value: data.leave },
        { name: "결근", value: data.absent },
        { name: "지각", value: data.lateArrivals },
        { name: "조퇴", value: data.earlyLeaves },
    ];



    const hours = Array.from({ length: 24 }, (_, i) => i);

    const totalPeople = data.totalEmployees ? data.totalEmployees : 0;
    const presentPeople = chartData.find((d) => d.name === "근무")?.value ?? 0;






    // 시간 문자열 → Date
    const toDate = (s?: string | null) => (s ? new Date(s) : null);

    // 바(막대) 길이 계산용: 시간(정수)로 변환
    const hourOf = (d: Date) => d.getHours() + d.getMinutes() / 60;

    function StatusBadge({ status }: { status: WorkingStatus }) {
    const cls =
        status === "PRESENT" ? "badge badge-neutral"
        : status === "LEFT"   ? "badge badge-primary"
        : status === "LEAVE"  ? "badge badge-accent"
        : "badge";
    const label =
        status === "PRESENT" ? "근무중"
        : status === "LEFT"   ? "퇴근"
        : status === "LEAVE"  ? "휴가"
        : "결근";
    return <span className={cls}>{label}</span>;
    }
    function TimeBar({ row }: { row: WorkingRowDTO }) {
    const ci = toDate(row.clockIn);
    const co = toDate(row.clockOut);
    const start = ci ? hourOf(ci) : null;
    const end = co ? hourOf(co) : null;

    // PRESENT(퇴근 전)인 경우 현재 시간까지 표시
    const nowH = hourOf(new Date());
    const barStart = start ?? 0; // 시작 없으면 0에 붙임
    const barEnd =
        row.status === "PRESENT" && start !== null ? Math.max(start, Math.min(nowH, 24))
        : end ?? start ?? 0;

    if (barEnd <= barStart) return null;

    // 셀 하나를 2.5rem로 계산한 기존 스타일 유지
    const widthRem = (barEnd - barStart) * 2.5;
    const leftRem = barStart * 2.5;
    const tone =
        row.status === "PRESENT" ? "bg-neutral"
        : row.status === "LEFT"   ? "bg-primary"
        : row.status === "LEAVE"  ? "bg-accent"
        : "bg-base-300";

    return (
        <div
        className={`absolute inset-y-1 ${tone} rounded-sm`}
        style={{ left: `${leftRem}rem`, width: `${widthRem}rem` }}
        title={
            start !== null
            ? `${ci?.getHours().toString().padStart(2,"0")}:${ci?.getMinutes().toString().padStart(2,"0")} ~ ${
                row.status === "PRESENT"
                    ? "현재"
                    : end !== null
                    ? `${co?.getHours().toString().padStart(2,"0")}:${co?.getMinutes().toString().padStart(2,"0")}`
                    : "—"
                }`
            : "기록 없음"
        }
        />
    );
    }
  return (
    <div className="w-full p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 좌측 패널 */}
        <section className="space-y-6">
          {/* 상단 카드: 지점 선택 + 날짜/시간 */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* 지점 선택 
                <div className="flex items-center gap-3">
                  <select className="select select-sm select-bordered">
                    {branches.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>*/}
                {/* 날짜/시간 + 새로고침 */}
                <div className="flex items-center gap-2 text-base-content/70">
                  <LuAlarmClockCheck className="w-4 h-4" />
                  <span>{new Date(data.generatedAt).toLocaleDateString("ko-KR")} {new Date(data.generatedAt).toLocaleTimeString("ko-KR")}</span>
                  <button className="btn btn-ghost btn-xs" title="새로고침" onClick={refreshChartData}>
                    <IoMdRefresh className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 도넛 + 요약 테이블 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Recharts 도넛 */}
                <div className="flex items-center justify-center">
                  <div className="w-full h-64">
                    <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart
                                margin={{ top: 0, right: 16, bottom: 0, left: 16 }}
                            >
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                innerRadius={60}
                                outerRadius={82}
                                paddingAngle={1}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}명`}
                            >
                                {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}명`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 중앙 라벨 (도넛 위에 겹치기) */}
                  <div className="pointer-events-none absolute text-center">
                    <div className="text-base-content/70 text-sm">출근 인원</div>
                    <div className="text-2xl font-semibold">
                      {presentPeople} 명 / {totalPeople} 명
                    </div>
                  </div>
                </div>

                {/* 요약 테이블 */}
                <div className="overflow-hidden rounded-xl border border-base-300">
                  <table className="table table-sm">
                    <thead>
                      <tr className="bg-base-200">
                        <th className="w-1/2">구분</th>
                        <th className="text-right">인원</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((row) => (
                        <tr key={row.name}>
                          <td>{row.name}</td>
                          <td className="text-right">{row.value} 명</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 사내 뉴스 */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title text-base">사내 소식</h2>
                <button className="btn btn-ghost btn-xs">글쓰기 ✎</button>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-base-300">
                <table className="table table-sm text-nowrap table-auto w-full ">
                  <thead>
                    <tr className="bg-base-200">
                      <th className="w-12">#</th>
                      <th>제목</th>
                      <th className="w-40 text-right pr-6">등록자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTopBoard?.map((n) => (
                      <tr key={n.id}>
                        <td>{n.id}</td>
                        <td className="truncate" onClick={() => onClickBoardTitle(n.id, n.boardType)}>
                          <button className="text-left w-full text-ellipsis overflow-hidden hover:underline">
                            {n.title}
                          </button>
                        </td>
                        <td className="text-right pr-6">{n.writer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </section>

         {/* 우측: 근무자 리스트 */}
        <section className="card bg-base-100 shadow">
            <div className="card-body">
                <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="card-title text-base">근무자 리스트</h2>
                <div className="flex items-center gap-2">
                    <input
                    type="date"
                    className="input input-sm input-bordered"
                    value={date}
                    onChange={(e) => { setPage(0); setDate(e.target.value); }}
                    />
                    <select
                    className="select select-sm select-bordered"
                    value={status}
                    onChange={(e) => { setPage(0); setStatus(e.target.value as any); }}
                    >
                    <option value="">전체</option>
                    <option value="PRESENT">근무중</option>
                    <option value="LEFT">퇴근</option>
                    <option value="ABSENT">결근</option>
                    <option value="LEAVE">휴가</option>
                    </select>
                </div>
                </div>

                <div className="overflow-x-auto">
                <div className="relative">
                    

                    <table className="table table-xs">
                    <thead>
                        <tr>
                        <th className="w-28">사번</th>
                        <th className="w-32">이름</th>
                        <th className="w-24 text-center">상태</th>
                        {hours.map((h) => (
                            <th key={h} className="text-center font-normal">
                            {h}
                            </th>
                        ))}
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                        <tr>
                            <td colSpan={27}>불러오는 중…</td>
                        </tr>
                        )}
                        {err && !loading && (
                        <tr>
                            <td colSpan={27} className="text-error">{err}</td>
                        </tr>
                        )}
                        {!loading && !err && rows.length === 0 && (
                        <tr>
                            <td colSpan={27}>데이터가 없습니다.</td>
                        </tr>
                        )}

                        {rows.map((w) => {
                            const ci = w.clockIn ? new Date(w.clockIn) : null;
                            const co = w.clockOut ? new Date(w.clockOut) : null;
                            const hourOf = (d: Date) => d.getHours() + d.getMinutes() / 60;
                            const start = ci ? hourOf(ci) : null;
                            const end   = co ? hourOf(co) : null;
                            const nowH  = hourOf(new Date());

                            const barStart = start ?? 0;
                            const barEnd =
                                w.status === "PRESENT" && start !== null
                                ? Math.max(start, Math.min(nowH, 24))
                                : end ?? start ?? 0;

                            // 최소 너비(겹쳐 보이지 않게 0에 가까운 케이스 보정)
                            const width = Math.max(0, barEnd - barStart);
                            const safeWidth = Math.max(width, 0.05); // 0.05h ≈ 3분

                            const tone =
                                w.status === "PRESENT" ? "#737373"   // neutral
                                : w.status === "LEFT"   ? "#3b82f6"  // primary
                                : w.status === "LEAVE"  ? "#22d3ee"  // accent
                                : "#d1d5db";                         // base-300

                            return (
                                <tr key={w.userId} className="align-middle">
                                <td className="text-base-content/70">{w.empnum}</td>
                                <td className="text-nowrap whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                    <span>{w.name}</span>
                                    <span className="text-xs text-base-content/50">/ {w.deptName}</span>
                                    </div>
                                </td>
                                <td className="text-center text-nowrap whitespace-nowrap"><StatusBadge status={w.status} /></td>

                                {/* 🔽 24시간 영역을 SVG로 그려서 행마다 독립 좌표계 확보 */}
                                <td colSpan={24} className="p-0">
                                    <svg className="w-full h-6 block" viewBox="0 0 24 1" preserveAspectRatio="none">
                                    {/* 시간 눈금 (선택) */}
                                    <defs>
                                        <pattern id="grid24" width="1" height="1" patternUnits="userSpaceOnUse">
                                        <rect x="0" y="0" width="0.01" height="1" fill="rgba(0,0,0,0.12)" />
                                        </pattern>
                                    </defs>
                                    <rect x="0" y="0" width="24" height="1" fill="url(#grid24)" opacity="0.4" />
                                    {/* 막대 */}
                                    {safeWidth > 0 && (
                                        <rect
                                        x={barStart}
                                        y={0.25}
                                        width={safeWidth}
                                        height={0.5}
                                        rx={0.1}
                                        fill={tone}
                                        >
                                        <title>
                                            {ci
                                            ? `${ci.getHours().toString().padStart(2,"0")}:${ci.getMinutes().toString().padStart(2,"0")} ~ ${
                                                w.status === "PRESENT"
                                                    ? "현재"
                                                    : co
                                                    ? `${co.getHours().toString().padStart(2,"0")}:${co.getMinutes().toString().padStart(2,"0")}`
                                                    : "—"
                                                }`
                                            : "기록 없음"}
                                        </title>
                                        </rect>
                                    )}
                                    </svg>
                                </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    </table>
                </div>
                </div>

                {/* 페이지네이션 */}
                <div className="flex items-center justify-center gap-2 mt-3">
                <button className="btn btn-xs" disabled={page<=0} onClick={() => setPage(0)}>«</button>
                <button className="btn btn-xs" disabled={page<=0} onClick={() => setPage(p=>p-1)}>‹</button>
                <span className="text-sm px-2">
                    {totalPages === 0 ? 0 : page+1} / {totalPages}
                </span>
                <button className="btn btn-xs" disabled={page>=totalPages-1} onClick={() => setPage(p=>p+1)}>›</button>
                <button className="btn btn-xs" disabled={page>=totalPages-1} onClick={() => setPage(totalPages-1)}>»</button>

                <select
                    className="select select-xs select-bordered ml-2"
                    value={size}
                    onChange={(e)=>{ setPage(0); setSize(Number(e.target.value)); }}
                >
                    <option value={10}>10개</option>
                    <option value={20}>20개</option>
                    <option value={50}>50개</option>
                </select>
                </div>
            </div>
            </section>
        </div>
        </div>
  );
}