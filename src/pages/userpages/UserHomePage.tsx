import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs"
import { IoSunny } from "react-icons/io5";
import { FaMoon } from "react-icons/fa";
import { type BoardResponse, getRecentAttendanceRecord, getRecommendedBoardList, type AttendanceEventResponse, postCheckIn, hasCheckedInToday, postCheckOut, postOutingStart, hasBreakOut, postOutingEnd } from "../../services/UserHomepageService";
import { useNavigate } from "react-router-dom";
import { useAttendanceStomp } from "../../hooks/useAttendanceStomp";

interface AttendanceSignal {
    type: | 'CLOCK_IN'
    | 'BREAK_OUT'
    | 'BREAK_IN'
    | 'CLOCK_OUT'
    | 'CORRECTION';
    at: Date;

}
export default function UserHomePage() {
    const navigate = useNavigate();
    const [nowClock, SetNowClock] = useState<Date>(new Date());
    const [userAttendanceLog, SetUserAttendanceLog] = useState<AttendanceEventResponse[]>();
    const [recentTopBoard, SetRecentTopBoard] = useState<BoardResponse[]>();

    const [hasAlreadyChecked, SetHasAlreadyChecked] = useState<boolean>();
    const [clockIn_out, SetClockIn_Out] = useState<boolean>(false);

    const [hasOutingStarted, SetHasOutingStarted] = useState<boolean>();
    const [outStart_end, SetOutStart_End] = useState<boolean>(false);

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
            if (typeof (res) === "string") {
                return;
            }
            SetUserAttendanceLog(res);
        })();
    }, [])

    //보드 리스트 가져오기
    useEffect(() => {
        (async () => {
            const res = await getRecommendedBoardList();
            if (typeof (res) === "string") {
                return;
            }

            SetRecentTopBoard(res);
        })();
    }, [])

    //인기글 이동 함수
    const onClickBoardTitle = (id: number, type: string) => {
        navigate(`/user/userboard/detail/${id}/${type}`);
    }

    // 최초 로딩시 서버에 출근 확인
    useEffect(() => {
        (async () => {
            const res = await hasCheckedInToday();
            SetHasAlreadyChecked(res);
            console.log("clokcIn : ", res)
        })();
    }, [])

    useEffect(() => {
        (async () => {
            const res = await hasBreakOut();
            SetHasOutingStarted(res);
            console.log("outing : ", res)
        })();
    }, [])

    // stomp 수신시에 서버에 다시 물어보고 결과로만 업데이트
    const onLiveEvent = useCallback((msg: AttendanceSignal) => {
        if (msg.type == 'CLOCK_IN') {
            hasCheckedInToday()
                .then(SetHasAlreadyChecked)
                .catch(console.error)
        } else if (msg.type == 'BREAK_OUT') {
            hasBreakOut()
                .then(SetHasOutingStarted)
                .catch(console.error)
        }
    }, []);
    useAttendanceStomp(onLiveEvent);

    //출근
    const onClickClockIn = () => {
        (async () => {
            try {
                await postCheckIn();
            } finally {
                const checked = await hasCheckedInToday();
                SetHasAlreadyChecked(checked);
                SetClockIn_Out(prev => !prev);
            }
        })();
    }
    //퇴근
    const onClickClockOut = () => {
        (async () => {
            try {
                await postCheckOut();
            } finally {
                SetClockIn_Out(prev => !prev);
            }
        })();
    }

    // 외출
    const onClickOuting = () => {
        (async () => {
            try {
                await postOutingStart();
            } finally {
                const checked = await hasBreakOut();
                SetHasOutingStarted(checked);
                SetOutStart_End(prev => !prev);
            }
        })();
    }

    //복귀
    const onClickOutingEnd = () => {
        (async () => {
            try {
                await postOutingEnd();
            } finally {
                SetOutStart_End(prev => !prev);
            }
        })();
    }

    useEffect(() => {
        console.log("clockIn_Out : ", clockIn_out)
        console.log("outStart_end : ", outStart_end)

    }, [clockIn_out, outStart_end])

    return (
        <div>
            <br></br>
            <hr className="border-2 border-withe" />
            <br></br>
   
            <div className="flex w-full h-full mb-4 gap-3">
                <div className="bg-gray-500 w-1/2 flex justify-center items-center rounded-xl">
                    <div>
                        <p className="font-bold text-7xl">{nowClock.toLocaleTimeString('ko-KR')}</p>
                    </div>
                </div>

                <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-2">
                    <button
                        className="btn btn-accent h-40 w-full font-bold text-4xl rounded-xl"
                        onClick={hasAlreadyChecked === false ? onClickClockIn : undefined}
                        disabled={hasAlreadyChecked === true}
                        title={hasAlreadyChecked ? "이미 출근 했습니다" : undefined}
                    >
                        <IoSunny />출근
                    </button>

                    <button
                        className="btn btn-error h-40 w-full font-bold text-4xl rounded-xl"
                        onClick={clockIn_out === true ? onClickClockOut : undefined}
                        disabled={clockIn_out === false}
                    >
                        <FaMoon />퇴근
                    </button>

                    <button
                        className="btn btn-info h-40 w-full font-bold text-4xl rounded-xl"
                        onClick={hasAlreadyChecked === true ? onClickOuting : undefined}
                        disabled={(hasOutingStarted === false && hasAlreadyChecked === false) ||
                            ((hasOutingStarted === true && hasAlreadyChecked === true))
                        }
                    >
                        외출
                    </button>

                    <button
                        className="btn btn-info h-40 w-full font-bold text-4xl rounded-xl"
                        onClick={outStart_end === true ? onClickOutingEnd : undefined}
                        disabled={outStart_end === false}
                    >
                        복귀
                    </button>

                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="card bg-base-100 shadow-sm card-border">
                    <div className="card-body whitespace-nowrap p-1">
                        {/* 헤더 */}
                        <ol className="list-row font-semibold text-sm border-b py-2">
                            <div className="grid grid-cols-9 gap-60 text-center">
                                <div>날짜</div>
                                <div>상태</div>
                            </div>
                        </ol>
                        {
                            userAttendanceLog?.map((record, idx) => (
                                <ol className="list-row text-sm border-b py-2" key={idx}>
                                    <div className="grid grid-cols-9 gap-60 text-center">
                                        <div>{dayjs(record.occurredAt).format("YYYY-MM-DD HH:mm:ss")}</div>
                                        <div>{record.eventType}</div>
                                    </div>
                                </ol>
                            ))
                        }
                    </div>
                </div>
                <div className="card bg-base-100 shadow-sm card-border border-gray-500">
                    <div className="card-body whitespace-nowrap p-1">
                        {/* 헤더 */}
                        <ol className="list-row font-semibold text-sm border-b py-2">
                            <div className="grid grid-cols-3">
                                <div>인기글</div>
                                <div>제목</div>
                                <div>등록일자</div>
                            </div>
                        </ol>
                        {
                            recentTopBoard?.map((record, idx) => (
                                <ol className="list-row text-sm border-b py-2" key={idx}>
                                    <div className="grid grid-cols-3">
                                        <div>{record.id}</div>
                                        <div>{record.title}</div>
                                        {/*<button className="btn btn-link w-1/3 h-1 p-1" onClick={() => onClickBoardTitle(record.id, record.boardType)}>{record.title}</button>*/}
                                        <div>{new Date(record.writeDate).toLocaleDateString("ko-KR")}</div>
                                    </div>
                                </ol>
                            ))
                        }
                    </div>
                </div>

            </div>


        </div>

    );

}