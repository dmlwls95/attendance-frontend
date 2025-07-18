import { useEffect, useRef, useState } from "react";
import APIConfig from "../configs/API.config"
type userResponse = {
    name: string,
    email: string
}
type AttendanceResponse = {
    id: number,
    name: string,
    email: string,
    date : string,
    clockIn : string,
    clockOut : string,
    isLate : number,
    isLeftEarly : number,
    totalHours : number
}

type AttendanceUpdateRequest = {
    id: number,
    date : string,
    clockIn : string,
    clockOut : string,
    isLate : number,
    isLeftEarly : number,
}
export default function AttendanceHistory()
{
    const [user, setUser] = useState<userResponse | null>(null);
    const [users, setUsers] = useState<userResponse[] | null >(null);
    const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
    const [selectedTo, setSelectedTo] = useState<string | null>(null);
    const [history, setHistory ] = useState<AttendanceResponse[] | null>(null);
    const [editModalData, setEditModalData] = useState<AttendanceUpdateRequest | null | undefined>(null);
    const [editModalFormData, setEditModalFormData ] = useState<AttendanceUpdateRequest | null>(null);


    const editModal = useRef<HTMLDialogElement | null>(null);


    useEffect(() => {
        handleAllUsers();
    }, []);

    async function handleAllUsers()
    {
        setUsers(await fetchAllUsersEmailAndName());
    }

    function onSelectedUser(user : userResponse)
    {
        setUser(user);
        onDataChanged();
    }

    function onSelectedFrom(date : string)
    {
        setSelectedFrom(date);
        onDataChanged();
    }
    function onSelectedTo(date : string)
    {
        setSelectedTo(date);
        onDataChanged();
    }
    //연도, 월, 유저 값중 하나라도 변경될 경우 서버에 데이터 요청 후 렌더
    const onDataChanged = async () =>
    {
        try {
            if(selectedFrom && selectedTo && user)
            {
                const data = await fetchAttendanceHistoryByEmail(user.email, selectedFrom, selectedTo);
                
                setHistory(data);
            }else if(selectedFrom && selectedTo)
            {
                const data = await fetchAttendanceHistory(selectedFrom, selectedTo);
                setHistory(data);
            }
            
        } catch (error) {
            console.error(error);
        }
        
    }

    //수정 모달 오픈 전 초기 데이터 셋업업
    const onOpenEditModal = (id: number) => {
        const target = history?.find((value) =>  value.id === id );
        if(target)
        {
            const data : AttendanceUpdateRequest ={
                id: target.id,
                date: target.date,
                clockIn: target.clockIn,
                clockOut: target.clockOut,
                isLate: target.isLate,
                isLeftEarly: target.isLeftEarly
            }
            setEditModalData(data);
            setEditModalFormData({...data});
            editModal.current?.showModal();
        }
    }

    //수정 버튼
    const onClickEdit = async () => {
        if(editModal.current?.open)
        {
            if(editModalFormData)
            {
                await putAttendanceHistory(editModalFormData);
            }
            editModal.current?.close();
        }
    }
    
    //csv 출력
    const handleExport = async () =>{
        if(selectedFrom && selectedTo)
        {
            try {
                await fetchExportCsv(selectedFrom, selectedTo);
            } catch (error) {
                console.error(error);
            }
        }
    }
    
    return(
        <div>
            


            <h3>기간별 조회</h3>
            {/*날짜 입력은 <input type="date" /> 또는 react-day-picker */}
            <div className="grid grid-cols-3">
                <fieldset className="fieldset bg-base-100 border-base-300 rounded-box  border p-4 ">
                    유저
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
                </fieldset>
                
                <fieldset className="fieldset bg-base-100 border-base-300 rounded-box  border p-4 ">
                    시작일
                    <input type="date" onChange={ (event) => onSelectedFrom(event.target.value)}/>
                </fieldset>
                
                <fieldset className="fieldset bg-base-100 border-base-300 rounded-box  border p-4 ">
                    종료일
                    <input type="date" onChange={ (event) => onSelectedTo(event.target.value)}/>
                </fieldset>
            </div>
            <div className="grid grid-cols-2">
                <button className="btn btn-accent btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl" onClick={onDataChanged}>조회하기</button>
                <button className="btn btn-primary btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl" onClick={handleExport}>다운로드</button>

            </div>
            

            <div className="divider"></div>

            <ul className="list bg-base-100 rounded-box shadow-md">
            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">조회 결과</li>

            {/* 헤더 */}
            <li className="list-row font-semibold text-sm border-b py-2">
                <div className="grid grid-cols-9 gap-20 text-center">
                <div>이름</div>
                <div>일자</div>
                <div>출근 시간</div>
                <div>퇴근 시간</div>
                <div>총 근무 시간</div>
                <div>지각</div>
                <div>조퇴</div>
                <div>수정</div>
                <div>삭제</div>
                </div>
            </li>

            {/* 데이터 */}
            {
                history?.map((record, idx) => (
                <li className="list-row text-sm border-b py-2" key={idx}>
                    <div className="grid grid-cols-9 gap-20 text-center">
                    <div>{record.name}</div>    
                    <div>{record.date}</div>
                    <div>{formatTimeForInput(record.clockIn)}</div>
                    <div>{formatTimeForInput(record.clockOut)}</div>
                    <div>{record.totalHours.toFixed(2)}</div>
                    <div>{record.isLate ? 'O' : '-'}</div>
                    <div>{record.isLeftEarly ? 'O' : '-'}</div>
                    <div>
                        <button className="btn" onClick={()=>onOpenEditModal(record.id)}>🖊️</button>


                        <dialog ref={editModal} className="modal">
                            <div className="modal-box">



                                <h3 className="font-bold text-lg">기록 수정</h3>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">날짜</legend>
                                        <input type="date" className="input"
                                        value={editModalFormData?.date || ""}
                                        onChange={(e) => setEditModalFormData(prev => prev && ({ ...prev, date: e.target.value }))}
                                        />
                                </fieldset>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">출근 기록</legend>
                                        <input type="time" className="input"
                                        value={editModalFormData?.clockIn ? formatTimeForInput(editModalFormData.clockIn) : ""}
                                        onChange={(e) => {
                                            const [hours, minutes] = e.target.value.split(":");
                                            setEditModalFormData((prev) => {
                                            if (!prev || !prev.clockIn) return prev;

                                            const date = new Date(prev.clockIn)
                                            date.setHours(Number(hours));
                                            date.setMinutes(Number(minutes));

                                            return {
                                                ...prev,
                                                clockIn: formatToLocalDateTimeString(date), // or custom formatting if needed
                                            };
                                            });
                                        }}
                                        />
                                    {/*<p className="label">Optional</p>*/}
                                </fieldset>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">퇴근 기록</legend>
                                        <input type="time" className="input"
                                        value={editModalFormData?.clockOut ? formatTimeForInput(editModalFormData.clockOut) : ""}
                                        onChange={(e) => {
                                            const [hours, minutes] = e.target.value.split(":");
                                            setEditModalFormData((prev) => {
                                            if (!prev || !prev.clockOut) return prev;

                                            const date = new Date(prev.clockOut);
                                            date.setHours(Number(hours));
                                            date.setMinutes(Number(minutes));

                                            return {
                                                ...prev,
                                                clockOut: formatToLocalDateTimeString(date), // or custom formatting if needed
                                            };
                                            });
                                        }}
                                        />
                                    {/*<p className="label">Optional</p>*/}
                                </fieldset>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">지각 여부</legend>
                                        <input type="checkbox" checked={editModalData?.isLate == 1} className="toggle" 
                                        onChange={(e) => setEditModalFormData(prev => prev && ({ ...prev, isLate: e.target.value ? 1 : 0 }))}
                                        />
                                    {/*<p className="label">Optional</p>*/}
                                </fieldset>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">조퇴 여부</legend>
                                        <input type="checkbox" checked={editModalData?.isLeftEarly == 1}  className="toggle" 
                                        onChange={(e) => setEditModalFormData(prev => prev && ({ ...prev, isLeftEarly: e.target.value ? 1 : 0 }))}
                                        />
                                    {/*<p className="label">Optional</p>*/}
                                </fieldset>

                                <button className="btn" onClick={onClickEdit}>수정</button>
                                <button className="btn">종료</button>



                            </div>
                            <form method="dialog" className="modal-backdrop">
                                <button>close</button>
                            </form>
                        </dialog>
                    
                    </div>
                    <div><button className="btn">🗑️</button></div>
                    </div>
                </li>
                ))
            }

            
            </ul>
        </div>
    )
}
const formatToLocalDateTimeString = (date: Date) => {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;
};

function formatTimeForInput(datetimeStr: string): string {
  try {
    const date = new Date(datetimeStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return "";
  }
}

async function fetchAttendanceHistory(from: string, to: string): Promise<AttendanceResponse[]> {
    const token = localStorage.getItem("token");
    
    const response = await fetch(
        `${APIConfig}/admin/attendance/history?from=${from}&to=${to}`, {
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

async function fetchExportCsv(from: string, to: string) {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `${APIConfig}/admin/attendance/export?from=${from}&to=${to}`, {
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


async function putAttendanceHistory(request : AttendanceUpdateRequest ) {
    //request.date = new Date(request.date).toISOString();
    request.clockIn = removeZ(request.clockIn);
    console.log(request);
    try {
      const token = localStorage.getItem("token");
        const response = await fetch(
          `${APIConfig}/admin/attendance/history` ,{
            method : "PUT",
            headers: {
              "Content-Type":"application/json",
              "Authorization": `Bearer ${token}`
            },
            credentials: "include",
            body: JSON.stringify(request)
          }      
        );
        
        if(!response.ok)
        {
          throw new Error("조회 실패");
        }
        return await response.json();  
    } catch (error) {
        console.error(error);
    }
      
}

function removeZ(dateStr: string): string {
  return dateStr.replace(/\.000Z$/, ''); // "2025-06-11T00:50:20"
}



async function fetchAttendanceHistoryByEmail(email : string ,from: string, to: string): Promise<AttendanceResponse[]> {
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