import APIConfig from "../configs/API.config";
import {getAuthToken} from "./TokenManagementService";


// enums (백엔드 EventType/SourceType과 1:1 매칭)
export type EventType =
  | 'CLOCK_IN'
  | 'BREAK_OUT'
  | 'BREAK_IN'
  | 'CLOCK_OUT'
  | 'CORRECTION';

export type SourceType = 'WEB' | 'MOBILE' | 'ADMIN' | 'BATCH';

export interface AttendanceEventResponse {
  eventType: EventType;
  occurredAt: string;        // ISO-8601 문자열 (예: "2025-08-08T09:10:16.367Z")
  source: SourceType;
  ipOrDevice?: string | null;
  userAgent?: string | null;
  note?: string | null;
  correlationId?: string | null;
  createdAt: string;         // ISO-8601
}

export interface BoardResponse {
  id: number;
  title: string;
  content: string;
  writeDate : string;
  boardType : 'FREE' | 'NOTICE' | 'SUGGEST';
  recmmendCount: number;
  writer : string;
}


export async function getRecommendedBoardList() : Promise<BoardResponse[] | string>{
    const token = getAuthToken();
    const response = await fetch(`${APIConfig}/user/userboard/recenttop`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!response.ok)
    {
      const errorText = await response.text();
      return errorText || "조회 실패";
    }
    return await response.json();
}

export async function getRecentAttendanceRecord() : Promise<AttendanceEventResponse[] | string> {
    const token = getAuthToken();
    const response = await fetch(`${APIConfig}/attendance/recent?howmany=${10}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  
    if (!response.ok)
    {
      const errorText = await response.text();
      return errorText || "조회 실패";
    }
    return await response.json();
}

//출근 여부 확인
export async function hasCheckedInToday(): Promise<boolean> {
  const token = getAuthToken();
  const response = await fetch(`${APIConfig}/attendance/hascheckin`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok)
  {
    console.error(response.statusText);
  }
  return await response.json();
}


//출근
export async function postCheckIn() {
  const token = getAuthToken();
  const response = await fetch(`${APIConfig}/attendance/clock-in`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok)
  {
    const errorText = await response.text();
    return errorText || "조회 실패";
  }
  return await response.json();
}

//퇴근
export async function postCheckOut() {
  const token = getAuthToken();
  const response = await fetch(`${APIConfig}/attendance/clock-out`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok)
  {
    const errorText = await response.text();
    return errorText || "조회 실패";
  }
  return await response.json();
}


//외출
export async function postOutingStart() {
  const token = getAuthToken();
  const response = await fetch(`${APIConfig}/attendance/outingstart`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok)
  {
    const errorText = await response.text();
    return errorText || "조회 실패";
  }
  return await response.json();
}

//복귀
export async function postOutingEnd() {
  const token = getAuthToken();
  const response = await fetch(`${APIConfig}/attendance/outingend`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok)
  {
    const errorText = await response.text();
    return errorText || "조회 실패";
  }
  return await response.json();
}

//외출 여부 확인
export async function hasBreakOut(): Promise<boolean> {
  const token = getAuthToken();
  const response = await fetch(`${APIConfig}/attendance/hasbreakout`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok)
  {
    console.error(response.statusText);
  }
  return await response.json();
}