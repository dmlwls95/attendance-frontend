import { useEffect, useState } from "react";
import APIConfig from "../configs/API.config";
import RoleBadge from "./RoleBadge";
import { useNavigate } from "react-router-dom";

type NavDataResponse = {
	name: string,
	empno : string,
	rank : string,
	profileUrl : string,
    role : string
}
export default function NavMemberCard() 
{
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
    
    const onClickLogout = () =>{
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <div>
            <div className="card card-xs card-border bg-base-20 ">
            <div className="card-body">
                <div className="flex">

                    <div className="avatar w-1/5">
                        <div className="w-12 rounded-full">
                            <img src={navdata?.profileUrl} />
                        </div>
                    </div>

                    <div className="w-3/5">
                        
                        <h3> {navdata?.rank} + No. {navdata?.empno}</h3>
                        <h3>{navdata?.name} 様 {RoleBadge(navdata?.role)}</h3>
                    </div>


                    <div className="card-actions justify-end w-1/5">
                    <button className="btn btn-secondary" onClick={onClickLogout}>logout</button>
                    </div>

                </div>
                
                
            </div>
            </div>
        </div>
    )
    

    async function getNavBarData() : Promise<NavDataResponse> {
        const token = localStorage.getItem("token");
                const response = await fetch(
                    `${APIConfig}/auth/navdata` , {
                        method: "GET",
                        headers : {
                            "Contetn-Type" : "application/json",
                            "Authorization" : `Bearer ${token}`
                        },
                        credentials: "include"
                    }
                );
        
                if(!response.ok)
                {
                    throw new Error("조회 실패");
                }
                return await response.json();
    }
}

