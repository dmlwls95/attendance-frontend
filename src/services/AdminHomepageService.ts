import APIConfig from "../configs/API.config";
import {getAuthToken} from "./TokenManagementService";
export interface AdminHomepageChartDataResponse {
  date: string;          // LocalDate → string 변환됨 (예: "2025-08-14")
  totalEmployees: number;
  present: number;
  left: number;
  leave: number;
  absent: number;
  lateArrivals: number;
  earlyLeaves: number;
  generatedAt: string;   // Instant → string 변환됨 (예: "2025-08-14T09:00:00Z")
}


export interface WorkingRowDTO {
  userId: number;
  empnum: string;
  name: string;
  deptName: string;
  clockIn: string | null;   // ISO 문자열
  clockOut: string | null;
  status: "PRESENT" | "LEFT" | "ABSENT" | "LEAVE";
}
export type WorkingStatus = "PRESENT" | "LEFT" | "ABSENT" | "LEAVE";
//외출 여부 확인
export async function getChartData(): Promise<AdminHomepageChartDataResponse> {
  const token = getAuthToken();

  const response = await fetch(`${APIConfig}/admin/today-summarychart`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    console.error(response.statusText);
    throw new Error("차트 데이터를 불러오지 못했습니다.");
  }

  return await response.json();
}


export async function getWorkingList(params: {
  date?: string; status?: string; page?: number; size?: number; sortBy?: string; direction?: "asc"|"desc";
}) {
  const token = getAuthToken();
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") query.append(k, String(v));
  });

  const res = await fetch(`${APIConfig}/admin/attendance/working-list?${query.toString()}`, {
    headers: { 
        Authorization: `Bearer ${token}` 
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    content: WorkingRowDTO[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
  }>;
}