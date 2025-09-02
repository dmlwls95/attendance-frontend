import { Outlet } from "react-router-dom";
import NavMemberCard from "../../components/NavMemberCard";
import Notification from "../../components/Notification";

export default function UserLayout() {
    const MAIN_ICON_SRC = "/Main_icon.svg";

    return (
        <div className="flex flex-col h-screen w-full">
            <div className="navbar bg-base-100 px-4 relative">
                <div className="navbar-start flex items-center gap-10">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h20M4 12h15M4 18h20" />
                            </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            <li><a href="/user/home">홈페이지</a></li>
                            <li><a href="/user/weeklysummary">주간 근로 분석</a></li>
                            <li><a href="/user/monthlysummary">월간 근로 분석</a></li>
                            <li><a href="/user/attendancehistory">기간별 출퇴근 관리</a></li>
                            <li><a href="/user/userboard/notice">사내 게시판</a></li>
                        </ul>
                    </div>
                    <span className="text-lg font-semibold whitespace-nowrap">유저페이지</span>
                </div>

                <div className="navbar-center">
                    <a className="btn btn-ghost text-xl">
                        <img src={MAIN_ICON_SRC} alt="메인 아이콘" className="w-40 h-20" />
                    </a>
                </div>
                <div className="navbar-end flex items-center gap-3">
                    <Notification />
                    <NavMemberCard />
                </div>
            </div>
            <br></br>
            <hr className="border-2 border-withe" />
            <br></br>
            <br></br>

            {/* 하위 페이지 렌더링 영역 */}
            <div className="w-full mx-auto">
                <Outlet />
            </div>

            <br></br>
            <br></br>
            <hr className="border-2 border-withe" />
            <div className="flex m-2">
                <div className="flex justify-center items-center w-2/5 pr-28">
                    <img src={MAIN_ICON_SRC} className="w-32 h-15" />
                </div>
                <div className="flex justify-end items-center w-full text-sm text-gray-500">
                    GLOBAL-IN IT PROJECT | 글로벌인 IT 프로젝트 | グローバルン IT プロジェクト
                </div>
            </div>
        </div>
    )
}