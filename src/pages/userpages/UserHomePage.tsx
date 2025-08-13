import { useCallback, useEffect, useState } from "react";

import { IoSunny } from "react-icons/io5";
import { FaMoon } from "react-icons/fa";
import { type BoardResponse, getRecentAttendanceRecord, getRecommendedBoardList, type AttendanceEventResponse, postCheckIn, hasCheckedInToday, postCheckOut, postOutingStart, hasBreakOut, postOutingEnd } from "../../services/UserHomepageService";
import { useNavigate } from "react-router-dom";
import { useAttendanceStomp } from "../../hooks/useAttendanceStomp";

interface AttendanceSignal {
    type : | 'CLOCK_IN'
  | 'BREAK_OUT'
  | 'BREAK_IN'
  | 'CLOCK_OUT'
  | 'CORRECTION';
    at : Date;

}
export default function UserHomePage()
{
    const navigate = useNavigate();
    const [nowClock, SetNowClock] = useState<Date>(new Date());
    const [userAttendanceLog, SetUserAttendanceLog] = useState<AttendanceEventResponse[]>();
    const [recentTopBoard, SetRecentTopBoard] = useState<BoardResponse[]>();

    const [hasAlreadyChecked, SetHasAlreadyChecked] = useState<boolean>();
    const [loading, setLoading] = useState(false);

    const [hasOutingStarted, SetHasOutingStarted] = useState<boolean>();

    //시계 설정
    useEffect(() => {
        const id = setInterval(() => {
            SetNowClock(new Date());
        }, 1000)
        return (() => clearInterval(id));
    }, [])


    // 유저 로그 가져오기
    useEffect(() => {
        (async () => {
            const res = await getRecentAttendanceRecord();
            if(typeof(res) === "string"){
                return;
            }
            SetUserAttendanceLog(res);
        })();
    },[])

    //보드 리스트 가져오기
    useEffect(() => {
        (async () => {
            const res = await getRecommendedBoardList();
            if(typeof(res)==="string"){
                return;
            }

            SetRecentTopBoard(res);
        })();
    }, [])

    //인기글 이동 함수
    const onClickBoardTitle = (id : number, type: string) =>{
        navigate(`/user/userboard/detail/${id}/${type}`);
    }

    // 최초 로딩시 서버에 출근 확인
    useEffect(() => {
        (async () => {
            const res = await hasCheckedInToday();
            SetHasAlreadyChecked(res);
        })();
    },[])

    useEffect(() => {
        (async () => {
            const res = await hasBreakOut();
            SetHasOutingStarted(res);
        })();
    },[])

    // stomp 수신시에 서버에 다시 물어보고 결과로만 업데이트
    const onLiveEvent = useCallback((msg : AttendanceSignal) => {
        if(msg.type == 'CLOCK_IN')
        {
            hasCheckedInToday()
            .then(SetHasAlreadyChecked)
            .catch(console.error)
        }else if(msg.type =='BREAK_OUT')
        {
            hasBreakOut()
            .then(SetHasOutingStarted)
            .catch(console.error)
        }
    }, []);
    useAttendanceStomp(onLiveEvent);

    

    

    //출근
    const onClickClockIn = () => {
        (async () => {
            try{
                setLoading(true);
                await postCheckIn();
            }finally{
                const checked = await hasCheckedInToday();
                SetHasAlreadyChecked(checked);
                setLoading(false);
            }
        })();
    }
    //퇴근
    const onClickClockOut = () => {
        (async () => {
            await postCheckOut();

        })();
    }

    //조퇴
    const onClickOuting = () => {
        (async () => {
            await postOutingStart();
        })();
    }

    //복귀
    const onClickOutingEnd = () => {
        (async () => {
            await postOutingEnd();
        })();
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
                                    <button className="btn btn-accent h-32 w-40 font-bold text-4xl" onClick={onClickClockIn} disabled={loading || hasAlreadyChecked === true} title={hasAlreadyChecked? "이미 출근 했습니다":undefined} ><IoSunny />출근</button>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <button className="btn btn-error h-32 w-40 font-bold text-4xl" onClick={onClickClockOut}><FaMoon />퇴근</button>
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

                                <button className="btn btn-info h-32 w-40 font-bold text-4xl" onClick={onClickOuting} disabled={loading || hasOutingStarted === true}>외출</button>
                                <button className="btn btn-info h-32 w-40 font-bold text-4xl" onClick={onClickOutingEnd} disabled={loading || hasOutingStarted === false}>복귀</button>
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