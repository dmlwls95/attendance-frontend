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

export async function fetchAttendanceHistoryExportCsv(from: string, to: string) {
    try {
        const token = getAuthToken();

        const response = await fetch(
            `${APIConfig}/user/attendancehistory/export?from=${from}&to=${to}`, {
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

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance_${from}${to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error(error);
    }
}