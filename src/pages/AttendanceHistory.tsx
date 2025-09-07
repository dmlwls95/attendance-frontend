import { useEffect, useMemo, useRef, useState } from "react";
import APIConfig from "../configs/API.config";
import {getAuthToken} from "../services/TokenManagementService";

type UserResponse = { name: string; email: string };
type AttendanceResponse = {
  id: number;
  name: string;
  email: string;
  date: string;
  clockIn: string;
  clockOut: string;
  isLate: number;
  isLeftEarly: number;
  totalHours: number;
};
type AttendanceUpdateRequest = {
  id: number;
  date: string;
  clockIn: string;
  clockOut: string;
  isLate: number;
  isLeftEarly: number;
};

type YMD = { y: number | ""; m: number | ""; d: number | "" };

export default function AttendanceHistory() {
  // ---- state ----
  const [users, setUsers] = useState<UserResponse[] | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);

  const [fromYMD, setFromYMD] = useState<YMD>({ y: "", m: "", d: "" });
  const [toYMD, setToYMD] = useState<YMD>({ y: "", m: "", d: "" });

  const selectedFrom = useMemo(() => ymdToStr(fromYMD), [fromYMD]);
  const selectedTo = useMemo(() => ymdToStr(toYMD), [toYMD]);

  const [history, setHistory] = useState<AttendanceResponse[] | null>(null);

  // single modal
  const editModalRef = useRef<HTMLDialogElement | null>(null);
  const [editing, setEditing] = useState<AttendanceUpdateRequest | null>(null);

  // ---- effects ----
  useEffect(() => {
    (async () => setUsers(await fetchAllUsersEmailAndName()))();
  }, []);

  // ---- handlers ----
  const onClickFetch = async (overrideUser?: UserResponse | null) => {
    if (!selectedFrom || !selectedTo) return;

    // 날짜 유효성 검사 추가
    const fromDate = new Date(selectedFrom);
    const toDate = new Date(selectedTo);

    if (fromDate > toDate) {
      alert("시작일은 종료일보다 이전이어야 합니다.");
      return;
    }
    const target = overrideUser === undefined ? user : overrideUser;

    const data = target
      ? await fetchAttendanceHistoryByEmail(
          target.email,
          selectedFrom,
          selectedTo
        )
      : await fetchAttendanceHistory(selectedFrom, selectedTo);

    setHistory(data);
  };

  const onExportCsv = async () => {
    if (!selectedFrom || !selectedTo) return;
    if (user) await fetchExportCsvbyEmail(user.email, selectedFrom, selectedTo);
    else await fetchExportCsv(selectedFrom, selectedTo);
  };

  const openEdit = (row: AttendanceResponse) => {
    setEditing({
      id: row.id,
      date: row.date,
      clockIn: row.clockIn,
      clockOut: row.clockOut,
      isLate: row.isLate,
      isLeftEarly: row.isLeftEarly,
    });
    editModalRef.current?.showModal();
  };

  const closeEdit = () => {
    editModalRef.current?.close();
    setEditing(null);
  };

  const submitEdit = async () => {
    if (!editing) return;
    await putAttendanceHistory({
      ...editing,
      clockIn: stripZ(editing.clockIn),
      clockOut: stripZ(editing.clockOut),
    });
    closeEdit();
    // 갱신
    await onClickFetch();
  };

  const onSelectUser = async (u: UserResponse | null) => {
    setUser(u);
    await onClickFetch(u); // 상태 업데이트 레이스 피하기
  };

  // ---- options ----
  const years = rangeOptions(2020, 2030);
  const months = rangeOptions(1, 12);
  const days = rangeOptions(1, 31);

  return (
    <main className="w-full mx-auto max-w-screen-xl px-4 pb-10">
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

      {/* 중앙 타이틀 & 액션 라인 */}
      <section className="mt-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {/* 좌: 검색 & 유저 선택 */}
          <div className="flex items-center gap-3">
            <label className="input input-bordered flex items-center gap-2 w-64">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                className="opacity-70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                className="grow"
                placeholder="Type here"
                onChange={(e) => {
                  const v = e.target.value.trim();
                  if (!history) return;
                  if (v === "") {
                    onClickFetch();
                    return;
                  }
                  setHistory(
                    (prev) =>
                      prev?.filter((r) =>
                        [r.name, r.email, r.date].some((s) =>
                          s?.toString().includes(v)
                        )
                      ) ?? null
                  );
                }}
              />
            </label>

            {/* 유저 드롭다운(설계서엔 직접 표시는 없지만 기능 유지) */}
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                {user ? user.name : "유저"}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-20 w-56 p-2 shadow"
              >
                <li>
                  <a onClick={() => onSelectUser(null)}>전체</a>
                </li>
                {users?.map((u) => (
                  <li key={u.email}>
                    <a onClick={() => onSelectUser(u)}>{u.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 중앙 제목 */}
          <h2 className="text-2xl font-semibold tracking-wide">근태집계</h2>

          {/* 우: 다운로드 & 표시 */}
          <div className="flex items-center gap-4">
            <button className="btn btn-link no-underline" onClick={onExportCsv}>
              <span className="mr-1">⬇</span> csv 다운로드
            </button>
            <button className="btn btn-primary" onClick={() => onClickFetch()}>
              표시
            </button>
          </div>
        </div>
      </section>

      {/* 표 */}
      <section className="mt-4">
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table table-zebra">
            <thead className="text-center">
              <tr>
                <th>사원</th>
                <th>이름</th>
                <th>날짜</th>
                <th>출근</th>
                <th>퇴근</th>
                <th>총 노동</th>
                <th>지각</th>
                <th>조퇴</th>
                <th>편집</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {history?.map((r) => (
                <tr key={r.id}>
                  <td>{r.email?.split("@")[0] ?? "-"}</td>
                  <td>{r.name}</td>
                  <td>{r.date}</td>
                  <td>{fmtHM(r.clockIn)}</td>
                  <td>{fmtHM(r.clockOut)}</td>
                  <td>{r.totalHours?.toFixed(2)}</td>
                  <td>{r.isLate ? "O" : "-"}</td>
                  <td>{r.isLeftEarly ? "O" : "-"}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => openEdit(r)}>
                      🖊️
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-sm">🗑️</button>
                  </td>
                </tr>
              ))}
              {!history?.length && (
                <tr>
                  <td colSpan={10} className="text-base-content/60">
                    데이터가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 단일 수정 모달 */}
      <dialog ref={editModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">기록 수정</h3>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">날짜</legend>
            <input
              type="date"
              className="input input-bordered"
              value={editing?.date ?? ""}
              onChange={(e) =>
                setEditing((p) => (p ? { ...p, date: e.target.value } : p))
              }
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">출근</legend>
            <input
              type="time"
              className="input input-bordered"
              value={editing?.clockIn ? fmtHM(editing.clockIn) : ""}
              onChange={(e) =>
                setEditing((p) =>
                  p
                    ? { ...p, clockIn: setTimePart(p.clockIn, e.target.value) }
                    : p
                )
              }
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">퇴근</legend>
            <input
              type="time"
              className="input input-bordered"
              value={editing?.clockOut ? fmtHM(editing.clockOut) : ""}
              onChange={(e) =>
                setEditing((p) =>
                  p
                    ? {
                        ...p,
                        clockOut: setTimePart(p.clockOut, e.target.value),
                      }
                    : p
                )
              }
            />
          </fieldset>

          <div className="flex gap-6 mt-2">
            <label className="label cursor-pointer gap-2">
              <span>지각</span>
              <input
                type="checkbox"
                className="toggle"
                checked={(editing?.isLate ?? 0) === 1}
                onChange={(e) =>
                  setEditing((p) =>
                    p ? { ...p, isLate: e.target.checked ? 1 : 0 } : p
                  )
                }
              />
            </label>
            <label className="label cursor-pointer gap-2">
              <span>조퇴</span>
              <input
                type="checkbox"
                className="toggle"
                checked={(editing?.isLeftEarly ?? 0) === 1}
                onChange={(e) =>
                  setEditing((p) =>
                    p ? { ...p, isLeftEarly: e.target.checked ? 1 : 0 } : p
                  )
                }
              />
            </label>
          </div>

          <div className="modal-action">
            <button className="btn btn-primary" onClick={submitEdit}>
              저장
            </button>
            <form method="dialog">
              <button className="btn">닫기</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </main>
  );
}

/* ---------- Presentational: Date Card ---------- */
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
        <option value="" disabled>{`${label} 선택`}</option>
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

function ymdToStr({ y, m, d }: YMD): string | null {
  if (y === "" || m === "" || d === "") return null;
  const yyyy = String(y);
  const MM = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${yyyy}-${MM}-${dd}`;
}

function fmtHM(datetimeStr: string): string {
  try {
    const date = new Date(datetimeStr);
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return "";
  }
}

function setTimePart(isoString: string, hhmm: string) {
  const d = new Date(isoString);
  const [hh, mm] = hhmm.split(":").map((n) => Number(n));
  d.setHours(hh);
  d.setMinutes(mm);
  return toLocalISO(d);
}

function toLocalISO(date: Date) {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;
}

function stripZ(s: string) {
  return s.replace(/\.000Z$/, "");
}

/* ---------- API ---------- */
async function fetchAllUsersEmailAndName(): Promise<UserResponse[]> {
  const token = getAuthToken();
  const res = await fetch(`${APIConfig}/admin/getallusers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error("조회 실패");
  return res.json();
}

async function fetchAttendanceHistory(
  from: string,
  to: string
): Promise<AttendanceResponse[]> {
  const token = getAuthToken();
  const res = await fetch(
    `${APIConfig}/admin/attendance/history?from=${from}&to=${to}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error("조회 실패");
  return res.json();
}

async function fetchAttendanceHistoryByEmail(
  email: string,
  from: string,
  to: string
): Promise<AttendanceResponse[]> {
  const token = getAuthToken();
  const res = await fetch(
    `${APIConfig}/admin/attendance/byemail?email=${email}&from=${from}&to=${to}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error("조회 실패");
  return res.json();
}

async function fetchExportCsv(from: string, to: string) {
  const token = getAuthToken();
  const res = await fetch(
    `${APIConfig}/admin/attendance/export?from=${from}&to=${to}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error("조회 실패");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_${from}_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function fetchExportCsvbyEmail(email: string, from: string, to: string) {
  const token = getAuthToken();
  const res = await fetch(
    `${APIConfig}/admin/attendance/exportbyemail?email=${email}&from=${from}&to=${to}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error("조회 실패");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_${from}_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function putAttendanceHistory(request: AttendanceUpdateRequest) {
  //request.date = new Date(request.date).toISOString();
  request.clockIn = removeZ(request.clockIn);
  console.log(request);
  try {
    const token = getAuthToken();
    const response = await fetch(`${APIConfig}/admin/attendance/history`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("조회 실패");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

function removeZ(clockIn: string): string {
  // Remove trailing ".000Z" or "Z" from ISO string
  return clockIn.replace(/(\.000)?Z$/, "");
}
