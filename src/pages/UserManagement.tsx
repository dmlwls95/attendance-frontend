import React, { useRef, useState } from "react";
import APIConfig from "../configs/API.config";



type userRegisterRequest = {
    empNumber : string,
    userName : string,
    email : string,
    userType : string,
    dept : string,
    rank : string,
    workType : string,
    profileImage : File
}

type RegisterFormInfoRequest = {
    
  depts : string[],
  ranks : string[],
  worktypes : string[]

}
export default function UserManagement()
{
    //**************************가입 데이터 */

    const [formInfo, setFormInfo] = useState<RegisterFormInfoRequest | null> (null);

    //**************************가입 데이터 끝 */

    //**************************폼 데이터 */
    
    const userRegisterdata : userRegisterRequest | null = null;

    const [empNumber, setEmpNumber] = useState<string |null> (null);
    const [userName, setUserName] = useState<string |null> (null);
    const [email, setEmail] = useState<string |null> (null);
    const [pass, setPass] = useState<string |null> (null);
    const [userType, setUserType] = useState("");
    const [dept, setDept] = useState("");
    const [rank, setRank] = useState("");
    const [workType, setWorkType] = useState("");

    /*const empNumber : string | null = null;
    const userName : string | null = null;
    const email : string | null = null;
    const pass : string | null = null;
    const userType : string | null = null;
    const dept : string | null = null;
    const rank : string | null = null;
    const workType : string | null = null;*/

    //**************************프로필 사진 */
    const [profileImage, setProfileImage] = useState<File | null> (null);
    const [previewUrl, setPreviewUrl] = useState<string | null> (null);
    
    const handleProfilechange = ( e : React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file){
            setProfileImage(file);

            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
        }
    };
    const handleUserTypeChange = (e : React.ChangeEvent<HTMLSelectElement>) => {
        setUserType(e.target.value);
    }
    const handleDeptChange = (e : React.ChangeEvent<HTMLSelectElement>) => {
        setDept(e.target.value);
    }

    const handleRankChange = (e : React.ChangeEvent<HTMLSelectElement>) => {
        setRank(e.target.value);
    }

    const handleWorkTypeChange = (e : React.ChangeEvent<HTMLSelectElement>) => {
        setWorkType(e.target.value);
    }
   


    const editModal = useRef<HTMLDialogElement | null>(null);
    const onOpenCreateModal = async () => {
        setFormInfo(await getRequiredDataOfRegister());
        editModal.current?.showModal();
        
    }

    return(
        <div>
            <button className="btn btn-accent btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl" onClick={onOpenCreateModal}>새 계정 추가</button>
            


            <dialog ref={editModal} className="modal">
                <div className="modal-box">



                    <h3 className="font-bold text-lg">계정 생성</h3>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">사원 번호</legend>
                        <input type="email" 
                        placeholder="a123456789"
                        onChange={ (e) => {setEmpNumber(e.target.value)}}
                        ></input>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">이름</legend>
                        <input type="text"
                        placeholder="Peter"
                        onChange={ (e) => {setUserName(e.target.value)}}
                        ></input>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">이메일</legend>
                        <input type="email"
                        placeholder="admin@admin.com"
                        onChange={ (e) => {setEmail(e.target.value)}}
                        ></input>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">비밀 번호</legend>
                        <input type="password"
                        placeholder=""
                        onChange={ (e) => {setPass(e.target.value)}}
                        ></input>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">유저 타입</legend>
                        <select id="userType" value={userType} onChange={handleUserTypeChange}>
                            <option value="admin">관리자</option>
                            <option value="user">유저</option>
                        </select>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">부서</legend>
                        <select id="dept" value={dept} onChange={handleDeptChange}>
                            {formInfo?.depts.map((deptdata) => (
                                <option value={deptdata}>{deptdata}</option>
                            ))}
                        </select>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">직급</legend>
                        <select id="rank" value={rank} onChange={handleRankChange}>
                            {formInfo?.ranks.map((data) => (
                                <option value={data}>{data}</option>
                            ))}
                        </select>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">근무 유형</legend>
                        <select id="worktype" value={workType} onChange={handleWorkTypeChange}>
                            {formInfo?.worktypes.map((data) => (
                                <option value={data}>{data}</option>
                            ))}
                        </select>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">프로필 사진</legend>
                        <input type="file"
                        accept="image/*"
                        onChange={handleProfilechange}
                        
                        />
                        <div className="avatar">
                            <div className="w-24 rounded">
                                <img
                                    src={previewUrl?previewUrl:"https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"}
                                    alt="미리보기"
                                    
                                />
                            </div>
                        </div>
                    </fieldset>

                    <button className="btn" >생성</button>



                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )

    async function getRequiredDataOfRegister() : Promise<RegisterFormInfoRequest> {
        const token = localStorage.getItem("token");
        const response = await fetch(
            `${APIConfig}/admin/usermanagement/forminfo` , {
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