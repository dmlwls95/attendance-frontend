import APIConfig from "../configs/API.config";
import {getAuthToken} from "./TokenManagementService";

export type AttendanceHistoryResponse = {
    workDays: number;
    workTimes: number;
    overTimes: number;
    absenceDays: number;
    historyList: UserAttendanceHistory[]
}

export interface UserAttendanceHistory {
	workdate : string;
	clock_in : string;
	clock_out : string;
	workMinute : number;
	overtimeMinute : number;
}

export async function fetchAttendanceHistoryOfMine(from: string, to: string): Promise<AttendanceHistoryResponse> {
    const token = getAuthToken();
    
    const response = await fetch(
        `${APIConfig}/attendance/summary?from=${from}&to=${to}`, {
            method: "GET",
            headers: {
                "Authorization":`Bearer ${token}`
            },
            credentials: "include"
        }
    )
    
    if(!response.ok)
    {
        throw new Error("조회 실패");
    }
    return await response.json();
}

//csv
/**
 * 내 근태 이력 CSV 다운로드
 */
export async function fetchAttendanceHistoryExportCsv(start: string, end: string) {
  const token = getAuthToken();

  const res = await fetch(
    `${APIConfig}/attendance/export?start=${start}&end=${end}`,
    {
      method: "GET",
      headers: {
        Accept: "text/csv",
        Authorization: `Bearer ${token}`, // 세션이 아니라 JWT면 필요
      },
      credentials: "include", // 세션 방식이면 꼭 필요
    }
  );

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`CSV 다운로드 실패: ${res.status} ${t}`);
  }

  // 서버에서 내려준 Content-Disposition 헤더에서 파일명 파싱
  let filename = `attendance_${start}_${end}.csv`;
  const cd = res.headers.get("Content-Disposition") || res.headers.get("content-disposition");
  if (cd) {
    const matchStar = /filename\*\s*=UTF-8''([^;]+)/i.exec(cd);
    const match = /filename\s*=\s*"(.*?)"/i.exec(cd);
    if (matchStar) filename = decodeURIComponent(matchStar[1]);
    else if (match) filename = match[1];
  }

  // blob → 다운로드
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}