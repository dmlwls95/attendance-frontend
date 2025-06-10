//import { Outlet, NavLink } from "react-router-dom";

import { Outlet } from "react-router-dom";

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
                        <li><a href="/admin/userdetail">사용자별 상세보기</a></li>
                        <li><a href="/admin/usermanagement">사용자 계정 관리</a></li>
                    </ul>
                    </div>
                </div>
                <div className="navbar-center">
                    <a className="btn btn-ghost text-xl">관리자 페이지</a>
                </div>
                <div className="navbar-end">
                    
                    <button className="btn btn-ghost btn-circle">
                    <div className="indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg>
                        <span className="badge badge-xs badge-primary indicator-item"></span>
                    </div>
                    </button>
                </div>

                
            </div>
            {/* 하위 페이지 렌더링 영역*/}
            <div className="flex-1 overflow-auto p-6">
                <Outlet />
            </div>
        </div>
    )
}