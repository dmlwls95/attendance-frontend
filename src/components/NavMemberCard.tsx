import { useEffect, useState } from "react";
import APIConfig from "../configs/API.config";
import RoleBadge from "./RoleBadge";
import { useNavigate } from "react-router-dom";
import { getAuthToken, removeAuthToken } from "../services/TokenManagementService";

type NavDataResponse = {
    name: string,
    empno: string,
    rank: string,
    profileUrl: string,
    role: string
}
export default function NavMemberCard() {
    const navigate = useNavigate();
    const [navdata, setNavdata] = useState<NavDataResponse | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await getNavBarData();
                setNavdata(data);
                console.log(data.profileUrl);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    const onClickLogout = () => {
        removeAuthToken();
        navigate("/");
    }

    return (
        <div>
            <div className="flex items-center bg-gray-500 rounded-xl px-2 py-1 h-14 gap-3">
                <div className="avatar">
                    <div className="w-10 h-10 rounded-full ">
                        <img src={navdata?.profileUrl} />
                    </div>
                </div>

                <div className="flex flex-col text-xs leading-tight">

                    <span>{navdata?.rank} + No. {navdata?.empno}</span>
                    <span>{navdata?.name} 様 {RoleBadge(navdata?.role)}</span>
                </div>


                <div className="ml-auto">
                    <button className="btn btn-secondary btn-base h-10 min-h-0 px-2" onClick={onClickLogout}>logout</button>
                </div>
            </div>
        </div>
    )


    async function getNavBarData(): Promise<NavDataResponse> {
        const token = getAuthToken();
        
        const response = await fetch(
            `${APIConfig}/auth/navdata`, {
            method: "GET",
            headers: {
                "Contetn-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            credentials: "include"
        }
        );

        if (!response.ok) {
            throw new Error("조회 실패");
        }
        return await response.json();
    }
}

