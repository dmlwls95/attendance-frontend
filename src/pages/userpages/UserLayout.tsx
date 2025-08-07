import { Outlet } from "react-router-dom";
import NavMemberCard from "../../components/NavMemberCard";

export default function UserLayout()
{
    return(
        <div className="flex flex-col h-screen w-full">
            <div className="navbar bg-base-100 shadow-sm">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> 
                            </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            <li><a href="/user">홈페이지</a></li>
                            <li><a href="/uesr">주간 근로 분석</a></li>
                            <li><a href="/user">월간 근로 분석</a></li>
                            <li><a href="/user">기간별 출퇴근 관리</a></li>
                            <li><a href="/user/board/notice">사내 게시판</a></li>
                        </ul>
                    </div>
                </div>
                <div className="navbar-center">
                    <a className="btn btn-ghost text-xl">유저 페이지</a>
                </div>
                <div className="navbar-end">
                    {NavMemberCard()}
                </div>
            </div>

            {/* 하위 페이지 렌더링 영역 */}
            <div className="w-full max-w-screen-lg mx-auto">
                <Outlet />
            </div>
        </div>
    )
}