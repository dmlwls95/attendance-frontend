import { useEffect, useState } from "react";
import { HiSpeakerphone } from "react-icons/hi";
import { IoSunny } from "react-icons/io5";
import { FaMoon } from "react-icons/fa";
import { getRecentAttendanceRecord, type AttendanceEventResponse } from "../../services/UserHomepageService";

export default function UserHomePage()
{
    const [nowClock, SetNowClock] = useState<Date>(new Date());
    const [userAttendanceLog, SetUserAttendanceLog] = useState<AttendanceEventResponse[]>();
    

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
   
    return (
        <div>
            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                    <div className="card bg-base-100 shadow-sm card-border">
                        <div className="card-body">
                            <span className="badge badge-xs badge-warning">Most Popular</span>
                            <div className="flex justify-between">
                            <h2 className="text-3xl font-bold">Premium</h2>
                            <span className="text-xl">$29/mo</span>
                            </div>
                            <ul className="mt-6 flex flex-col gap-2 text-xs">
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-4 me-2 inline-block text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <span>High-resolution image generation</span>
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-4 me-2 inline-block text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <span>Customizable style templates</span>
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-4 me-2 inline-block text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <span>Batch processing capabilities</span>
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-4 me-2 inline-block text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <span>AI-driven image enhancements</span>
                            </li>
                            <li className="opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-4 me-2 inline-block text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <span className="line-through">Seamless cloud integration</span>
                            </li>
                            <li className="opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-4 me-2 inline-block text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <span className="line-through">Real-time collaboration tools</span>
                            </li>
                            </ul>
                            <div className="mt-6">
                            </div>
                        </div>
                        </div>

                </div>
                <div className="col-span-2">
                    <div className="card bg-base-100 shadow-sm card-border">
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
                    <div className="card-body">
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
                    <div className="card-body">
                            <p className="text-sm font-bold"><HiSpeakerphone />社内 NEWS</p>
                        
                        
                    </div>
                </div>

            </div>


        </div>
       
    );

}