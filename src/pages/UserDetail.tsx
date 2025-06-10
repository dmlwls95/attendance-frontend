import { useEffect, useState } from "react"
import APIConfig from "../configs/API.config";

type userResponse = {
    name: string,
    email: string
}
type AttendanceResponse = {
        date : string,
        clockIn : string,
        clockOut : string,
        isLate : number,
        isLeftEarly : number,
        totalHours : number
}
export default function UserDetail()
{
    const [user, setUser] = useState<userResponse | null>(null);
    const [users, setUsers] = useState<userResponse[] | null >(null);

    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [history, setHistory ] = useState<AttendanceResponse[] | null>(null);
    //렌더 되기 전에 호출되는 함수
    useEffect(() => {
      handleFecth();
    }, []);

    async function handleFecth()
    {
      setUsers(await fetchAllUsersEmailAndName());
    }

    const handleHistory = async () =>{
        if(selectedYear && selectedMonth)
        {
            try {
                const data = await fetchAttendanceHistory(selectedFrom, selectedTo);
                setHistory(data);
            } catch (error) {
                console.error(error);
            }
        }
    }

    function onSelectedUser(user : userResponse)
    {
      setUser(user);
      onDataChanged();
    }

    function onSelectedYear(num: number)
    {
      setSelectedYear(num);
      onDataChanged();
    }
    function onSelectedMonth(num: number)
    {
      setSelectedMonth(num);
      onDataChanged();
    }

    //연도, 월, 유저 값중 하나라도 변경될 경우 서버에 데이터 요청 후 렌더
    function onDataChanged()
    {
      handleHistory();
    }
    
    

    return(
        <div>
            <div className="grid grid-cols-3">
              <div>
                <div className="text-lg ">연도</div>
                <div className="dropdown">
                  <div tabIndex={0} role="button" className="btn m-1">
                    {selectedYear ? `${selectedYear}년` : "연도 입력"}
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm" >
                    {Array.from({length : 3}, (_, i) => (
                      <li key={i + 2023}>
                        <a onClick={ () => onSelectedYear(i + 2023)}>{i + 2023}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <div className="text-lg">월</div>
                <div className="dropdown">
                  <div tabIndex={0} role="button" className="btn m-1">
                    {selectedMonth ? `${selectedMonth}월` : "월 입력"}
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                    {Array.from({length:12}, (_, i)=> (
                      <li key={i + 1}>
                        <a onClick={() => onSelectedMonth(i + 1)}>{i + 1}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="dropdown">
                  <div tabIndex={0} role="button" className="btn m-1">
                    {user ? ` ${user.name} ` : "유저 선택"}
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm" >
                    {users?.map((user) => (
                      <li key={user.name}><a onClick={ () => {onSelectedUser(user)}}>{user.name}</a></li>
                    ))}
                  </ul>
              </div>
            </div>

            <div className="divider"></div>

            <ul className="list bg-base-100 rounded-box shadow-md">
            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">조회 결과</li>

            {/* 헤더 */}
            <li className="list-row font-semibold text-sm border-b py-2">
                <div className="grid grid-cols-6 gap-20 text-center">
                <div>일자</div>
                <div>출근 시간</div>
                <div>퇴근 시간</div>
                <div>총 근무 시간</div>
                <div>지각</div>
                <div>조퇴</div>
                </div>
            </li>

            {/* 데이터 */}
            {
                history?.map((record, idx) => (
                <li className="list-row text-sm border-b py-2" key={idx}>
                    <div className="grid grid-cols-6 gap-4 text-center">
                    <div>{record.date}</div>
                    <div>{record.clockIn}</div>
                    <div>{record.clockOut}</div>
                    <div>{record.totalHours}</div>
                    <div>{record.isLate ? 'O' : '-'}</div>
                    <div>{record.isLeftEarly ? 'O' : '-'}</div>
                    </div>
                </li>
                ))
            }
            </ul>


        </div>
        
    )
}

async function fetchAllUsersEmailAndName() : Promise<userResponse[]> {
      const token = localStorage.getItem("token");
        const response = await fetch(
          `${APIConfig}/admin/getallusers`,{
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

async function fetchAttendanceHistory(email: string, from: string, to: string): Promise<AttendanceResponse[]> {
    const token = localStorage.getItem("token");
    
    const response = await fetch(
        `${APIConfig}/admin/attendance/byemail?email=${email}&from=${from}&to=${to}`, {
            method: "GET",
            headers: {
                "Content-Type":"application/json",
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