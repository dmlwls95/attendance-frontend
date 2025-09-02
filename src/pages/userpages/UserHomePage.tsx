import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs"
import { IoSunny } from "react-icons/io5";
import { FaMoon } from "react-icons/fa";
import { type BoardResponse, getRecentAttendanceRecord, getRecommendedBoardList, type AttendanceEventResponse, postCheckIn, hasCheckedInToday, postCheckOut, postOutingStart, hasBreakOut, postOutingEnd } from "../../services/UserHomepageService";
import { useNavigate } from "react-router-dom";
import { useAttendanceStomp } from "../../hooks/useAttendanceStomp";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface AttendanceSignal {
    type: | 'CLOCK_IN'
    | 'BREAK_OUT'
    | 'BREAK_IN'
    | 'CLOCK_OUT'
    | 'CORRECTION';
    at: Date;

}

const images = [
    "/image.jpg",
    "/image2.jpg",
    "/image3.jpg",
    "/image4.jpg",
    "/image5.jpg",
];

export default function UserHomePage() {
    const dayNames = ['(일)', '(월)', '(화)', '(수)', '(목)', '(금)', '(토)'];

    const BOARD_ICON_SRC = "/boardicon.svg";
    const CLOCK_ICON_SRC = "/Alarm.svg";

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


    const [current, setCurrent] = useState(0);
    // 자동 슬라이드 전환 (3초마다)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div>
            <div className="flex mb-4 gap-3">
                <div className="w-1/2 flex justify-center items-center">
                    <div className="flex flex-col w-full h-full justify-center items-center gap-2">
                        <div className="flex justify-center items-center w-full h-2/3">
                            <div className="relative w-full max-w-xl mx-auto overflow-hidden rounded-xl h-52">
                                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
                                    {images.map((src, idx) => (
                                        <img
                                            key={idx}
                                            src={src}
                                            alt={`Slide ${idx}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ))}
                                </div>
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                                    {images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1 h-1 rounded-full transition-all duration-300 ${idx === current ? "bg-blue-500" : "bg-gray-400"}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center items-center w-full h-full bg-gray-500 font-bold text-4xl text-center rounded-xl gap-8">
                            <img
                                src={CLOCK_ICON_SRC}
                                className="w-24 h-24 pt-2"
                            />
                            {dayjs().format("YYYY년 MM월 DD일")}
                            {dayNames[dayjs().day()]}<br></br>
                            {nowClock.toLocaleTimeString('ko-KR')}
                        </div>
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

            <div className="flex gap-2">
                <div className="w-2/5 border-2 border-gray-500 rounded-xl p-5">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">출퇴근 기록</h2>
                    </div>

                    <ul className="font-semibold text-sm border-b p-5 ">
                        <div className="flex">
                            <div className="w-1/2 text-center">날짜</div>
                            <div className="w-1/2 text-center pl-10">상태</div>
                        </div>
                    </ul>
                    {
                        userAttendanceLog?.map((record, idx) => (
                            <ul className="text-sm border-b p-5" key={idx}>
                                <div className="flex">
                                    <div className="w-1/2 text-center">{dayjs(record.occurredAt).format("YYYY-MM-DD HH:mm:ss")}</div>
                                    <div className="w-1/2 pl-16">{record.eventType}</div>
                                </div>
                            </ul>
                        ))
                    }
                </div>

                <div className="w-3/5 border-2 border-gray-500 rounded-xl p-5">
                    <div className="flex items-center gap-2">
                        <img
                            src={BOARD_ICON_SRC}
                            className="w-7 h-7"
                        />
                        <h2 className="text-xl font-semibold">사내 NEWS</h2>
                    </div>

                    <ul className="font-semibold text-sm border-b p-5">
                        <div className="flex">
                            <div className="w-1/6 text-center">번호</div>
                            <div className="w-4/6 text-center">제목</div>
                            <div className="w-1/6 text-center">등록일자</div>
                        </div>
                    </ul>
                    {
                        recentTopBoard?.map((record, idx) => (
                            <ul className="text-sm border-b p-5" key={idx}>
                                <div className="flex">
                                    <div className="w-1/6 text-center">{record.id}</div>
                                    <div
                                        className="w-4/6 pl-10"
                                        onClick={() => onClickBoardTitle(record.id, record.boardType)}
                                    >
                                        {record.title}
                                    </div>
                                    {/*<button className="btn btn-link w-1/3 h-1 p-1" onClick={() => onClickBoardTitle(record.id, record.boardType)}>{record.title}</button>*/}
                                    <div className="w-1/6 pl-2">{new Date(record.writeDate).toLocaleDateString("ko-KR")}</div>
                                </div>
                            </ul>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}