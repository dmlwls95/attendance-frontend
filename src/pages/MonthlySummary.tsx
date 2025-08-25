import { useState } from "react";
import APIConfig from "../configs/API.config";
import {getAuthToken} from "../services/TokenManagementService";


type MonthlySummary = {
  totalDaysWorked: number;
  totalHours: number;
  averageHours: number;
  missedDays: number;
}

export default function MonthlySummary() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  
  const [summary, setSummary] = useState<MonthlySummary | null>();

  const handleFecth = async () => {
    if(selectedYear && selectedMonth)
    {
      try {
        const data = await fetchMonthlySummary(selectedYear, selectedMonth);
        setSummary(data);
        
      } catch (e) {
        console.error(e);
      }
    }
  }
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <fieldset className="w-full fieldset bg-base-100 border-base-300 rounded-box  border p-4 ">

          <div className="text-lg ">연도</div>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn m-1">
              {selectedYear ? `${selectedYear}년` : "연도 입력"}
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm" >
              {Array.from({length : 3}, (_, i) => (
                <li key={i + 2023}>
                  <a onClick={ () => setSelectedYear(i + 2023)}>{i + 2023}</a>
                </li>
              ))}
            </ul>
          </div>
        </fieldset>
        
        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box  border p-4 ">
          <div className="text-lg">월</div>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn m-1">
              {selectedMonth ? `${selectedMonth}월` : "월 입력"}
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
              {Array.from({length:12}, (_, i)=> (
                <li key={i + 1}>
                  <a onClick={() => setSelectedMonth(i + 1)}>{i + 1}</a>
                </li>
              ))}
            </ul>
          </div>
        </fieldset>

        <div>
          <button className="btn btn-xl" onClick={handleFecth}>조회하기</button>
        </div>
      </div>
      
      <div className="divider"></div>


      {summary &&(
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
        <div className="stat">
          <div className="stat-title">평균 출근일</div>
          <div className="stat-value">{summary.totalDaysWorked}</div>
          
        </div>

        <div className="stat">
          <div className="stat-title">총 근무 시간</div>
          <div className="stat-value">{summary.totalHours}</div>
          
        </div>

        <div className="stat">
          <div className="stat-title">평균 근무 시간</div>
          <div className="stat-value">{summary.averageHours}</div>
          
        </div>
        <div className="stat">
          <div className="stat-title">평균 결근일</div>
          <div className="stat-value">{summary.missedDays}</div>
        </div>
        </div>
      )}
      
    </div>
  );
}

async function fetchMonthlySummary(year:number, month: number): Promise<MonthlySummary> {
  const token = getAuthToken();
  const response = await fetch(
    `${APIConfig}/admin/attendance/monthly-summary?year=${year}&month=${month}`,{
      method : "GET",
      headers: {
        "Content-Type":"application/json",
        "Authorization": `Bearer ${token}`
      },
      credentials: "include"
    }

    
  );
  
  if(!response.ok)
  {
    throw new Error("조회 실패");
  }
  return await response.json();
}

