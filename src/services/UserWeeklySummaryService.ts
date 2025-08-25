// 유저 주간 근로 분석
import APIConfig from "../configs/API.config";
import {getAuthToken} from "./TokenManagementService";

export interface DayOfWeekResponse {
  dayOfweek : string;
  date : string;
  workTime : number;
  overTime : number;
  status : "NORMAL" | "LATE" | "ABSENCE" | "LEFTEARLY" | "LATEANDLEFTEARLY" | "DEFAULT";
  dayType : "WEEKDAY" | "WEEKEND";
  clockIn : string;
  clockOut : string;
}

export interface WeeklyDashboardResponse {
  info : DayOfWeekResponse[];
  totalWorktime : number;
  totalOvertime : number;
  leftTime : number;
  totalTime : number;
}

export async function getWeeklyData(date : string): Promise<WeeklyDashboardResponse> {

  const token = getAuthToken();
  const response = await fetch(`${APIConfig}/attendance/dashboard/weekly?date=${date}`, 
                    { method: "GET", 
                      headers: {Authorization: `Bearer ${token}`},
                      credentials: "include"}          
                  );
  
  if (!response.ok){
    console.error(response.statusText);
    throw new Error("조회 실패");
  }

  return await response.json();
}