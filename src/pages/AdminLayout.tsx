import { Outlet } from "react-router-dom";
import NavMemberCard from "../components/NavMemberCard";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { TiWorld } from "react-icons/ti";

export default function AdminLayout()
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
                            <li><a href="/admin/home">홈페이지</a></li>
                            <li><a href="/admin/monthlysummary">월별 근태 요약</a></li>
                            <li><a href="/admin/attendance">전체 출퇴근 기록</a></li>
                            <li><a href="/admin/usermanagement">사용자 계정 관리</a></li>
                            <li><a href="/admin/adminboard/notice">사내 게시판</a></li>
                        </ul>
                    </div>
                </div>
                <div className="navbar-center">
                    <a className="btn btn-ghost text-xl">관리자 페이지</a>

                </div>
                
                <div className="navbar-end">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <TiWorld className="h-5 w-5" />
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-32 p-2 shadow">
                            <li><button className="btn btn-ghost"><span className="fi fi-kr"></span>한국어</button></li>
                            <li><button className="btn btn-ghost"><span className="fi fi-jp"></span>日本語</button></li>
                        </ul>
                    </div>
                    {/* 사용자 정보 카드 컴포넌트 */}
                    {NavMemberCard()}
                </div>
            </div>

            {/* 하위 페이지 렌더링 영역 */}
            <div className="w-full ">
                <Outlet />
            </div>
        </div>
    )
}