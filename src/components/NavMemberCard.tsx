import RoleBadge, { Role } from "./RoleBadge";

export default function NavMemberCard() {
    return (
        <div>
            <div className="card card-xs card-border bg-base-20 w-96">
            <div className="card-body">
                <div className="flex">

                    <div className="avatar w-1/5">
                        <div className="w-12 rounded-full">
                            <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
                        </div>
                    </div>

                    <div className="w-3/5">
                        
                        <h3>직급 + No. 사원번호</h3>
                        <h3>이름 様 {RoleBadge(Role.ADMIN)}</h3>
                    </div>


                    <div className="card-actions justify-end w-1/5">
                    <button className="btn btn-secondary">logout</button>
                    </div>

                </div>
                
                
            </div>
            </div>
        </div>
    )
}