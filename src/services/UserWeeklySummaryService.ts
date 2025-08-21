// 유저 주간 근로 분석
import APIConfig from "../configs/API.config";

export interface DayOfWeekResponse {
  dayOfweek : string;
  date : string;
  workTime : number;
  overTime : number;
  status : "NOMAL" | "LATE" | "ABSENCE" | "LEFTEARLY" | "LATEANDLEFTEARLY";

}

export interface WeeklyDashboardResponse {
  info : DayOfWeekResponse[];
  totalWorktime : number;
  totalOvertime : number;
  leftTime : number;
  totalTime : number;
}

export async function fetchWeeklyData(): Promise<WeeklyDashboardResponse> {

  const token = localStorage.getItem("token");
  const response = await fetch(`${APIConfig}/dashboard/weekly`, 
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