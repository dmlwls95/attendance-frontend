import React, { useEffect, useRef, useState } from "react";
import APIConfig from "../configs/API.config";


type RegisterFormInfoRequest = {
  depts : string[],
  ranks : string[],
  worktypes : string[]
}

type RegisterResponse  = {
	success : string,
	message : string
}

export default function UserManagement()
{
    
    //**************************가입 데이터 */
    const [formInfo, setFormInfo] = useState<RegisterFormInfoRequest | null> (null);
    //**************************가입 데이터 끝 */

    //**************************폼 데이터 */
    const [empNumber, setEmpNumber] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [userType, setUserType] = useState("");
    const [dept, setDept] = useState("");
    const [rank, setRank] = useState("");
    const [workType, setWorkType] = useState("");
    //**************************폼 데이터 끝*/

    //**************************수신 데이터*/
    //const [regiMsg, setRegiMsg] = useState<string | null> (null);
    const [regiResMsg, setRegiResMsg] = useState<RegisterResponse | null> (null);
    
    //**************************수신 데이터 끝*/

    //**************************프로필 사진 */
    const [profileImageFile, setProfileImage] = useState<File | null> (null);
    const [previewUrl, setPreviewUrl] = useState<string | null> (null);
    let sendProfile :File;
    //**************************프로필 사진 끝 */


    useEffect(() => {
    if (regiResMsg?.success) {
        const timer = setTimeout(() => {
            setRegiResMsg(null); // 메시지 숨기기
        }, 1500);

        return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 제거
    }
    }, [regiResMsg]);

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

    const getDefaultImageFile = async (): Promise<File> => {
        const response = await fetch("https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"); // public 경로 기준
        const blob = await response.blob();
        return new File([blob], 'yellingcat.webp', { type: blob.type });
    };
   
    const onClickRegister = async () => {
        
        setRegiResMsg(await postRequestRegister());
        editModal.current?.close();
    }

    const editModal = useRef<HTMLDialogElement | null>(null);
    const onOpenCreateModal = async () => {
        const data  = await getRequiredDataOfRegister();
        setFormInfo(data)
        setUserType("USER");
        setDept(data.depts[0] ?? "");
        setRank(data.ranks[0] ?? "");
        setWorkType(data.worktypes[0] ?? "");
        editModal.current?.showModal();
        
    }

    return(
        <div>
            {
                regiResMsg?.success && (
                    <div className="toast">
                        <div className="alert alert-info">
                            <span>{regiResMsg.message}</span>
                        </div>
                    </div>
                )
            }
            {
                !regiResMsg?.success && (
                    <div className="toast">
                        <div className="alert alert-error">
                            <span>{regiResMsg?.message}</span>
                        </div>
                    </div>
                )
            }
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
                            <option value="ADMIN">관리자</option>
                            <option value="USER">유저</option>
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
                    
                    <div className="text-center">

                        <button className="btn btn-success btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl" onClick={onClickRegister}>계정생성</button>
                        &nbsp;&nbsp;&nbsp;
                        <button className="btn btn-warning btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">리셋</button>
                    </div>
                    <div className="divider"></div>
                    


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

    async function postRequestRegister() : Promise<RegisterResponse> {
        sendProfile = profileImageFile?? await getDefaultImageFile();

        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("empnum", empNumber);
        formData.append("email", email);
        formData.append("work_name", userName);
        formData.append("password", pass);
        formData.append("role", userType);
        formData.append("dept", dept);
        formData.append("rank", rank);
        formData.append("worktype", workType);
        formData.append("profileImage", sendProfile);

        const response = await fetch(
            `${APIConfig}/admin/usermanagement/signup` , {
                method: "POST",
                headers : {
                    "Authorization" : `Bearer ${token}`
                },
                credentials: "include",
                body: formData
            }
        );

        if(!response.ok)
        {
            throw new Error("조회 실패");
        }
        return await response.json();
    }

    
}