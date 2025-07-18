//import { Outlet, NavLink } from "react-router-dom";

import { Outlet } from "react-router-dom";
import NavMemberCard from "../components/NavMemberCard";

export default function AdminLayout()
{
    return(
        <div className="flex flex-col h-screen">

        
            <div className="navbar bg-base-100 shadow-sm">
                <div className="navbar-start">
                    <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li><a href="/admin">홈페이지</a></li>
                        <li><a href="/admin/monthlysummary" >월별 근태 요약</a></li>
                        <li><a href="/admin/attendance">전체 출퇴근 기록</a></li>
                        {/*<li><a href="/admin/userdetail">사용자별 상세보기</a></li>*/}
                        <li><a href="/admin/usermanagement">사용자 계정 관리</a></li>
<<<<<<< HEAD
                        <li><a href="/admin/board">사내 게시판</a></li>
=======
>>>>>>> 8932ae1c1ca3ff2e63b5dd105654243ac5a9002b
                    </ul>
                    </div>
                </div>
                <div className="navbar-center">
                    <a className="btn btn-ghost text-xl">관리자 페이지</a>
                </div>
                <div className="navbar-end">
                    
                    {NavMemberCard()}
                </div>

                
            </div>
            {/* 하위 페이지 렌더링 영역*/}
            <div className="flex-1 overflow-auto p-6">
                <Outlet />
            </div>
        </div>
    )
}