import { useEffect, useState } from "react";

import { IoSunny } from "react-icons/io5";
import { FaMoon } from "react-icons/fa";
import { type BoardResponse, getRecentAttendanceRecord, getRecommendedBoardList, type AttendanceEventResponse } from "../../services/UserHomepageService";
import { useNavigate } from "react-router-dom";


export default function UserHomePage()
{
    const navigate = useNavigate();
    const [nowClock, SetNowClock] = useState<Date>(new Date());
    const [userAttendanceLog, SetUserAttendanceLog] = useState<AttendanceEventResponse[]>();
    const [recentTopBoard, SetRecentTopBoard] = useState<BoardResponse[]>();

    useEffect(() => {
        const id = setInterval(() => {
            SetNowClock(new Date());
        }, 1000)
        return (() => clearInterval(id));
    }, [])

    useEffect(() => {
        (async () => {
            const res = await getRecentAttendanceRecord();
            if(typeof(res) === "string"){
                return;
            }
            SetUserAttendanceLog(res);
        })();
    },[])

    useEffect(() => {
        (async () => {
            const res = await getRecommendedBoardList();
            if(typeof(res)==="string"){
                return;
            }

            SetRecentTopBoard(res);
        })();
    }, [])

    const onClickBoardTitle = (id : number, type: string) =>{
        navigate(`/user/userboard/detail/${id}/${type}`);

    }
   
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="col-span-1 md:col-span-1">
                    <div className="card  bg-base-100 shadow-sm card-border">
                        <div className="card-body">
                            
                        </div>
                    </div>

                </div>
                <div className="col-span-1 md:col-span-2">
                    <div className="card  bg-base-100 shadow-sm card-border">
                        <div className="grid grid-rows-2 justify-center gap-4">
                            <div className="grid grid-cols-3">
                                <div className="col-span-2 gap-3">
                                    <button className="btn btn-accent h-32 w-40 font-bold text-4xl"><IoSunny />출근</button>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <button className="btn btn-error h-32 w-40 font-bold text-4xl"><FaMoon />퇴근</button>
                                </div>
                                <div className="col-span-1">

                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 justify-center items-center text-center">
                                <div className="card bg-gray-200 text-black w-36 h-16 justify-center ">
                                    <div className="items-center text-center justify-center">
                                        <p className="justify-center items-center text-center font-bold">{nowClock.toLocaleTimeString('ko-KR') }</p>
                                        
                                    </div>
                                </div>

                                <button className="btn btn-warning h-32 w-40 font-bold text-4xl">조퇴</button>
                                <button className="btn btn-info h-32 w-40 font-bold text-4xl">외출</button>
                            </div>
                        </div>
                        
                    </div>
                    
                </div>

            </div>
            <br></br>
            <div className="grid grid-cols-2 gap-3">
                <div className="card bg-base-100 shadow-sm card-border">
                    <div className="card-body whitespace-nowrap">
                        {/* 헤더 */}
                        <li className="list-row font-semibold text-sm border-b py-2">
                            <div className="grid grid-cols-9 gap-20 text-center">
                                <div>날짜</div>
                                <div>상태</div>
                            </div>
                        </li>
                        {
                            userAttendanceLog?.map((record, idx) => (
                                <li className="list-row text-sm border-b py-2" key={idx}>
                                    <div className="grid grid-cols-9 gap-20 text-center">
                                        <div>{record.createdAt}</div>
                                        <div>{record.eventType}</div>
                                    </div>
                                </li>
                            ))
                        }
                    </div>
                </div>
                <div className="card bg-base-100 shadow-sm card-border">
                    <div className="card-body whitespace-nowrap">
                        <p className="text-sm font-bold">인기글</p>

                        {/* 헤더 */}
                        <li className="list-row font-semibold text-sm border-b py-2">
                            <div className="grid grid-cols-3 gap-5 text-center">
                                <div></div>
                                <div>제목</div>
                                <div>등록일자</div>
                            </div>
                        </li>
                        {
                            recentTopBoard?.map((record, idx) => (
                                <li className="list-row text-sm border-b py-2" key={idx}>
                                    <div className="grid grid-cols-3 gap-5 text-center">
                                        <div>{record.id}</div>
                                        <button className="btn btn-link" onClick={() => onClickBoardTitle(record.id, record.boardType)}>{record.title}</button>
                                        <div>{new Date(record.writeDate).toLocaleDateString("ko-KR")}</div>
                                    </div>
                                </li>
                            ))
                        }


                        
                        
                    </div>
                </div>

            </div>


        </div>
       
    );

}