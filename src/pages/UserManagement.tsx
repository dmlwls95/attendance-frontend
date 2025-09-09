// components/UserManagement.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  getRequiredDataOfRegister,
  postRequestRegister,
  getDefaultImageFile,
  type RegisterFormInfoRequest,
  type RegisterResponse,
  findAndGetUserdata,
  updateUserInfo,
  getPagedUsers,
  type UserdataResponse,
  type PageResponse,
  deleteUserByEmpno,
  findAttendanceByEmpnoNdate,
  type AttendanceResponse,
} from "../services/UserService";
import { DayPicker } from "react-day-picker";
import { MdOutlinePersonSearch } from "react-icons/md";
import { ImCalendar } from "react-icons/im";


type FormState = {
  empNumber: string;
  userName: string;
  email: string;
  pass: string;
  userType: "USER" | "ADMIN";
  dept: string;
  rank: string;
  workType: string;
  hiredate: Date;
  workStartTime: string;
  workEndTime: string;
  profileImageFile: File | null;
};

export default function UserManagement() {
  // 가입에 필요한 셀렉트 데이터
  const [formInfo, setFormInfo] = useState<RegisterFormInfoRequest | null>(null);
  //const today = new Date()
  // 폼 상태 (단일 객체)
  const [form, setForm] = useState<FormState>({
    empNumber: "",
    userName: "",
    email: "",
    pass: "",
    userType: "USER",
    dept: "",
    rank: "",
    workType: "",
    hiredate: new Date(),
    workStartTime: "09:00",
    workEndTime: "18:00",
    profileImageFile: null,
  });

  const [editForm, setEditForm] = useState<FormState>({
    empNumber: "",
    userName: "",
    email: "",
    pass: "",
    userType: "USER",
    dept: "",
    rank: "",
    workType: "",
    hiredate: new Date(),
    workStartTime: "09:00",
    workEndTime: "18:00",
    profileImageFile: null,
  });

  
  // 미리보기/토스트/모달
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [regiResMsg, setRegiResMsg] = useState<RegisterResponse | null>(null);
  // 계정 생성 모달
  const editModal = useRef<HTMLDialogElement | null>(null);
  const accountSettingModal = useRef<HTMLDialogElement | null> (null);
  // 계정 삭제 모달
  const deleteModal = useRef<HTMLDialogElement | null>(null);
  const [trytoDeleteData, SetTryToDeleteData] = useState<UserdataResponse | null> (null);
  // 근태 기록 편집 모달
  const editAttendanceModal = useRef<HTMLDialogElement | null> (null);
  const [attendanceRecord , SetAttendanceRecord] = useState<AttendanceResponse | null>(null);
  const [attendanceStatusRadio, SetAttendanceStatusRadio] = useState<number>(1);


  // 유저 데이터들 리스트
  const [users, setUsers] = useState<PageResponse<UserdataResponse> | null> (null);

  const onClickEdit = async (empnum : string) => {
    await onOpenAccountSettingModal();
    const res = await handleFindUserByEmpnumber(empnum);
    if(!res){
      accountSettingModal.current?.close();
      return;
    }
  }



  //pagenation
  const [nowpage, setNowpage] = useState<number>(0);
  const onClickpagePrev = () => {
    updatePagination(nowpage - 1);
    setNowpage(nowpage-1);

  }
  const onClickpageNext = () => {
    updatePagination(nowpage + 1)
    setNowpage(nowpage+1);
  }

  const updatePagination = async ( page: number) => {
    const usr = await getPagedUsers(page, 10);
    if(typeof usr === "string")
    {
      const errMessage = JSON.parse(usr);
      setRegiResMsg({success : false, message: errMessage.message});
      return;
    }
    setUsers(usr);
  }

  // 첫 리스트 불러오기
  useEffect(() =>{

    (async () => {
      const usr = await getPagedUsers(1, 10);
      if(typeof usr === "string")
      {
        const errMessage = JSON.parse(usr);
        setRegiResMsg({success : false, message: errMessage.message});
        return;
      }
      setUsers(usr);
      setNowpage(1);
    })();
  },[])

  // 토스트 자동 닫힘
  useEffect(() => {
    if (!regiResMsg) return;
    const timer = setTimeout(() => setRegiResMsg(null), 1500);
    return () => clearTimeout(timer);
  }, [regiResMsg]);

  // 공용 입력 핸들러 (input/select)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 계정 수정 공용 입력 핸들러
  const handleChangeForAccountSetting = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 날짜 입력 핸들러
  const handleDateChange = (date : Date | undefined) => {
    setForm((prev) => ({
      ...prev,
      hiredate: date?? new Date(),
    }));
    setEditForm((prev) => ({
      ...prev,
      hiredate: date?? new Date(),
    }));
  };

  // 근태 기록 편집 날짜 입력시 근태 기록 찾아봄
  const onClickAttendanceCalendar = async () => {
    if(typeof attendanceRecord?.empnum === "undefined")
    {
      editAttendanceModal.current?.close();
      return;
    }
    const res = await findAttendanceByEmpnoNdate(attendanceRecord?.empnum, attendanceRecord?.date);
    
    if(typeof(res) === "string")
    {
      const json = JSON.parse(res);
      
      setRegiResMsg({success : false, message: json.message});
      return;
    }
    
    SetAttendanceRecord( prev => {
      if(!prev) return prev;
      return {
        ...prev,
        clockIn : res.clockIn,
        clockOut : res.clockOut,
        isLate : res.isLate,
        isLeftEarly :res.isLeftEarly,
        totalHours : res.totalHours,
        outStart : res.outStart,
        outEnd : res.outEnd,
        isAbsence : res.isAbsence
      };
    });
    SetAttendanceStatusRadio(0);
    //출근
    if(res.isLate != "1" && res.isLeftEarly != "1" && res.outStart.length == 0 && res.isAbsence != "1")
    {
      SetAttendanceStatusRadio(1);
    }
    //지각
    else if(res.isLate =="1" && res.isLeftEarly != "1" && res.outStart.length == 0 && res.isAbsence != "1")
    {
      SetAttendanceStatusRadio(2);
    }
    //조퇴
    else if(res.isLate != "1" && res.isLeftEarly =="1" && res.outStart.length > 0  && res.isAbsence != "1")
    {
      SetAttendanceStatusRadio(3);
    }
    //결근
    else if(res.isAbsence =="1")
    {
      SetAttendanceStatusRadio(4);
    }
  };
  const handleAttendanceStatusRadio = (value : number) => {
    SetAttendanceStatusRadio(value);
  }


  // 입풋으로 입력된 사원번호로 유저 찾기 및 가져오기
  const handleFindUser = async (
  ) => {
    const data = await findAndGetUserdata(editForm.empNumber);

    if(typeof data === "string")
    {
      
      const errMessage = JSON.parse(data);
      setRegiResMsg({success : false, message: errMessage.message});
      return;
    }
    
    const img = await urlToFile(data.profileImageUrl, "profile.jpg");
    setEditForm(() => ({
      empNumber: data.empnum,
      userName: data.name,
      email: data.email,
      pass: "",
      userType: data.role,
      dept: data.depttype,
      rank: data.rank,
      workType: data.worktype,
      hiredate: data.hiredate?? new Date(),
      workStartTime: data.workStartTime,
      workEndTime: data.workEndTime,
      profileImageFile: img,
    }));
  }

  // 사원번호를 인자로 받아 유저 정보 가져오기
  const handleFindUserByEmpnumber = async(empnum : string) : Promise<boolean> => {
    const data = await findAndGetUserdata(empnum);

    if(typeof data === "string")
    {
      const errMessage = JSON.parse(data);
      setRegiResMsg({success : false, message: errMessage.message});
      return false;
    }
    
    const img = await urlToFile(data.profileImageUrl, "profile.jpg");
    setEditForm(() => ({
      empNumber: data.empnum,
      userName: data.name,
      email: data.email,
      pass: "",
      userType: data.role,
      dept: data.depttype,
      rank: data.rank,
      workType: data.worktype,
      hiredate: data.hiredate? new Date(data.hiredate): new Date(),
      workStartTime: data.workStartTime,
      workEndTime: data.workEndTime,
      profileImageFile: img,
    }));
    return true;
  }


  // url을 이미지로 변환
  async function urlToFile(url: string, filename: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    const mime = blob.type || "image/png"; // 기본 MIME 설정

    return new File([blob], filename, { type: mime });
  }
  // 파일 변경 + 미리보기
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, profileImageFile: file }));
    setEditForm((prev) => ({ ...prev, profileImageFile: file }));
    //setAccountSettingForm((prev) => ({ ...prev, profileImageFile: file }));
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  

  // 모달 열기: 서버에서 select에 필요한 값 로드 + 기본값 바인딩
  const onOpenCreateModal = async () => {
    try {
      const data = await getRequiredDataOfRegister();
      setFormInfo(data);

      setForm((prev) => ({
        ...prev,
        userType: "USER",
        dept: data.depts?.[0] ?? "",
        rank: data.ranks?.[0] ?? "",
        workType: data.worktypes?.[0] ?? "",
      }));

      editModal.current?.showModal();
    } catch (e) {
      console.error(e);
      setRegiResMsg({ success: false, message: "필수 데이터 조회 실패" });
    }
  };

  // 모달 열기: 서버에서 select에 필요한 값 로드 + 기본값 바인딩
  const onOpenAccountSettingModal = async () => {
    try {
      const data = await getRequiredDataOfRegister();
      setFormInfo(data);

      setEditForm((prev) => ({
        ...prev,
        userType: "USER",
        dept: data.depts?.[0] ?? "",
        rank: data.ranks?.[0] ?? "",
        workType: data.worktypes?.[0] ?? "",
      }));

      accountSettingModal.current?.showModal();
    } catch (e) {
      console.error(e);
      setRegiResMsg({ success: false, message: "필수 데이터 조회 실패" });
    }
  };

  // 모달 열기 : 확인 요청 모달
  const onOpenDeleteModal = async (empno : UserdataResponse) => {
    SetTryToDeleteData(empno);
    deleteModal.current?.show();
  }
  const tryToDeleteUser = async (empno : string | undefined) => {
    if(typeof empno === "undefined")
    {
      return;
    }
    try{
      const data = await deleteUserByEmpno(empno);
      
      if (data.success) {
        alert("삭제 완료");// ✅ 삭제 성공 → 목록 새로고침
        updateScreenData(); // 또는 updateScreenData(), getUsersList() 등 너희 프로젝트 함수명에 맞게
    } else {
      alert("삭제 실패: " + data.message);
    }

      deleteModal.current?.close();
      setRegiResMsg(data);
      updateScreenData();

    }catch(e){
      console.error(e);
      alert("삭제 중 오류 발생");
      setRegiResMsg({ success : false, message: "알 수 없는 사원"})
    }
  }
  //모달 열기 : 근무 기록 편집 모달
  const onOpenEditAttendanceModal = async (user : UserdataResponse) => {
    SetAttendanceRecord(() => ({
      email : user.email,
      name : user.name,
      empnum : user.empnum,
      date : new Date(),
      clockIn : "",
      clockOut : "",
      isLate : "",
      isLeftEarly : "",
      isAbsence : "",
      totalHours : 0,
      outStart : "",
      outEnd : "" 
    }));

    editAttendanceModal.current?.show();
  }

  const onClickRegister = async () => {
    try {
      // 프로필 기본 이미지 보정
      const profile =
        form.profileImageFile ?? (await getDefaultImageFile());
      
      
      const strDate = form.hiredate.toISOString();

      const res = await postRequestRegister({
        ...form,
        hiredate : strDate,
        profileImageFile: profile,
      });

      setRegiResMsg(res);
      editModal.current?.close();

      // 성공 시 폼 초기화
      if (res.success) {
        setForm(() => ({
          empNumber: "",
          userName: "",
          email: "",
          pass: "",
          userType: "USER",
          dept: formInfo?.depts?.[0] ?? "",
          rank: formInfo?.ranks?.[0] ?? "",
          workType: formInfo?.worktypes?.[0] ?? "",
          hiredate: new Date() ,
          workStartTime: "09:00",
          workEndTime: "18:00",
          profileImageFile: null,
        }));
        setPreviewUrl(null);

        //성공 시 화면 초기화
        updateScreenData();
      }
    } catch (e) {
      console.error(e);
      setRegiResMsg({ success: false, message: "계정 생성 실패" });
    }
  };

  const onClickUpdate = async () => {
    try {
      // 프로필 기본 이미지 보정
      const profile =
        editForm.profileImageFile ?? (await getDefaultImageFile());
      
      
      const strDate = editForm.hiredate.toISOString();
      

      const res = await updateUserInfo({
        ...editForm,
        hiredate : strDate,
        profileImageFile: profile,
      });

      setRegiResMsg(res);
      accountSettingModal.current?.close();

      // 성공 시 폼 초기화
      if (res.success) {
        setEditForm(() => ({
          empNumber: "",
          userName: "",
          email: "",
          pass: "",
          userType: "USER",
          dept: formInfo?.depts?.[0] ?? "",
          rank: formInfo?.ranks?.[0] ?? "",
          workType: formInfo?.worktypes?.[0] ?? "",
          hiredate: new Date() ,
          workStartTime: "09:00",
          workEndTime: "18:00",
          profileImageFile: null,
        }));
        setPreviewUrl(null);
        //성공 시 화면 업데이트
        updateScreenData();
      }
    } catch (e) {
      console.error(e);
      setRegiResMsg({ success: false, message: "계정 생성 실패" });
    }
  }

  const onResetForm = () => {
    setForm(() => ({
      empNumber: "",
      userName: "",
      email: "",
      pass: "",
      userType: "USER",
      dept: formInfo?.depts?.[0] ?? "",
      rank: formInfo?.ranks?.[0] ?? "",
      workType: formInfo?.worktypes?.[0] ?? "",
      hiredate : new Date(),
      workStartTime: "09:00",
      workEndTime: "18:00",
      profileImageFile: null,
    }));
    setPreviewUrl(null);
  };

  const onResetASForm = () => {
    setEditForm(() => ({
      empNumber: "",
      userName: "",
      email: "",
      pass: "",
      userType: "USER",
      dept: formInfo?.depts?.[0] ?? "",
      rank: formInfo?.ranks?.[0] ?? "",
      workType: formInfo?.worktypes?.[0] ?? "",
      hiredate : new Date(),
      workStartTime: "09:00",
      workEndTime: "18:00",
      profileImageFile: null,
    }));
    setPreviewUrl(null);
  };

  // 화면 업데이트
  const updateScreenData = async () => {
    const usr = await getPagedUsers(nowpage, 10);
    if(typeof usr === "string")
    {
      const errMessage = JSON.parse(usr);
      setRegiResMsg({success : false, message: errMessage.message});
      return;
    }
    setUsers(usr);
  }


  //유저 근태 시간 편집
  const onClickEditAttendance = (user : UserdataResponse) => {
    onOpenEditAttendanceModal(user);
    
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    SetAttendanceRecord(prev =>

      prev? {...prev, [name] : value} : prev
    );
  };

  return (
    
    <div>
      
      {/* 단일 토스트 블록로 정리 */}
      {regiResMsg && (
        <div className="toast">
          <div className={`alert ${regiResMsg.success ? "alert-info" : "alert-error"}`}>
            <span>{regiResMsg.message}</span>
          </div>
        </div>
      )}

      <button
        className="btn btn-accent btn-sm"
        onClick={onOpenCreateModal}>
        새 계정 추가
      </button>
      &nbsp;&nbsp;&nbsp;
      <button
        className="btn btn-warning btn-sm"
        onClick={onOpenAccountSettingModal}>
        계정 편집
      </button>
      <div className="divider"></div>

      {/** 표 출력 */}
      <div>
        {/* 헤더 */}
        <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr>
              <th>#</th>
              <th>사번</th>
              <th>이름</th>
              <th>입사일</th>
              <th>부서</th>
              <th>직급</th>
              <th>근무유형</th>
              <th>근무시간</th>
              <th>근태관리</th>
              <th>수정</th>
            </tr>
          </thead>
          <tbody>
            {users?.content?.map((user, idx) => (
              <tr key={user.empnum}>
                <th>{idx + 1}</th>
                <td>{user.empnum}</td>
                <td>{user.name}</td>
                <td>{user.hiredate? new Date(user.hiredate).toLocaleDateString("ko-KR") : ""}</td>
                <td>{user.depttype}</td>
                <td>{user.rank}</td>
                <td>{user.worktype}</td>
                <td>
                  {user.workStartTime} ~ {user.workEndTime}
                </td>
                <td>
                  <button className="btn btn-square" onClick={() => onClickEditAttendance(user)}><ImCalendar /></button>
                </td>
                <td>
                  <div className="grid grid-cols-2">
                    <div>
                      <button className="btn btn-info" onClick={() => onClickEdit(user.empnum)}>편집</button>
                    </div>
                    <div>
                      <button className="btn btn-error" onClick={() => {onOpenDeleteModal(user)}}>삭제</button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>#</th>
              <th>사번</th>
              <th>이름</th>
              <th>입사일</th>
              <th>부서</th>
              <th>직급</th>
              <th>근무유형</th>
              <th>근무시간</th>
              <th>근태관리</th>
              <th>수정</th>
            </tr>
          </tfoot>
        </table>
      </div>
        <div>
          <div className="join">
            {nowpage == 1 ? <button className="join-item btn btn-disabled"></button> :<button className="join-item btn" onClick={onClickpagePrev}>«</button> }
            <button className="join-item btn">{nowpage}</button>
            {nowpage == users?.totalPages? <button className="join-item btn btn-disabled"></button> : <button className="join-item btn" onClick={onClickpageNext}>»</button>}
          </div>
        </div>
      </div>
      
    

















      {/* 계정 생성 모달 */}
      <dialog ref={editModal} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">계정 생성</h3>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">사원 번호</legend>
            <input
              type="text"
              placeholder="a123456789"
              name="empNumber"
              value={form.empNumber}
              onChange={handleChange}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">이름</legend>
            <input
              type="text"
              placeholder="Peter"
              name="userName"
              value={form.userName}
              onChange={handleChange}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">이메일</legend>
            <input
              type="email"
              placeholder="admin@admin.com"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">비밀 번호</legend>
            <input
              type="password"
              placeholder=""
              name="pass"
              value={form.pass}
              onChange={handleChange}
            />
          </fieldset>

          <div className="grid grid-flow-row">
            <div className="grid grid-cols-2 gap-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">유저 타입</legend>
                <select
                  id="userType"
                  name="userType"
                  value={form.userType}
                  onChange={handleChange}
                >
                  <option value="ADMIN">관리자</option>
                  <option value="USER">유저</option>
                </select>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">부서</legend>
                <select
                  id="dept"
                  name="dept"
                  value={form.dept}
                  onChange={handleChange}
                >
                  {formInfo?.depts.map((deptdata) => (
                    <option key={deptdata} value={deptdata}>
                      {deptdata}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">직급</legend>
                <select
                  id="rank"
                  name="rank"
                  value={form.rank}
                  onChange={handleChange}
                >
                  {formInfo?.ranks.map((data) => (
                    <option key={data} value={data}>
                      {data}
                    </option>
                  ))}
                </select>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">근무 유형</legend>
                <select
                  id="workType"
                  name="workType"
                  value={form.workType}
                  onChange={handleChange}
                >
                  {formInfo?.worktypes.map((data) => (
                    <option key={data} value={data}>
                      {data}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>

            <button popoverTarget="rdp-popover" className="input input-border" style={{ anchorName: "--rdp" } as React.CSSProperties}>
              {form.hiredate ? new Date(form.hiredate).toLocaleDateString("ko-KR") : "입사일"}
            </button>
            <div popover="auto" id="rdp-popover" className="dropdown" style={{ positionAnchor: "--rdp" } as React.CSSProperties}>
              <DayPicker className="react-day-picker" mode="single" selected={form.hiredate} onSelect={handleDateChange} />
            </div>

            <br />

            <div className="grid grid-flow-row">
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm">출근 시간</p>
                <p className="text-sm">퇴근 시간</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  className="input"
                  name="workStartTime"
                  value={form.workStartTime}
                  onChange={handleChange}
                />
                <input
                  type="time"
                  className="input"
                  name="workEndTime"
                  value={form.workEndTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">프로필 사진</legend>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileChange}
            />
            <div className="avatar">
              <div className="w-24 rounded">
                <img
                  src={
                    previewUrl ??
                    "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
                  }
                  alt="미리보기"
                />
              </div>
            </div>
          </fieldset>

          <div className="divider"></div>
          <div className="text-center">
            <button
              className="btn btn-success btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
              onClick={onClickRegister}
            >
              계정 생성
            </button>
            &nbsp;&nbsp;&nbsp;
            <button
              className="btn btn-warning btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
              onClick={onResetForm}
            >
              리셋
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>














      {/* 계정 수정 모달 */}
      <dialog ref={accountSettingModal} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">계정 수정</h3>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">사원 번호</legend>
            <div className="join">
            <input
              type="text"
              placeholder=""
              name="empNumber"
              value={editForm.empNumber}
              onChange={handleChangeForAccountSetting}/>
            <button className="btn btn-square" onClick={handleFindUser}><MdOutlinePersonSearch /></button>
            
            </div>
          </fieldset>
          
          <fieldset className="fieldset">
            <legend className="fieldset-legend">이름</legend>
            <input
              type="text"
              placeholder="Peter"
              name="userName"
              value={editForm.userName}
              onChange={handleChangeForAccountSetting}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">이메일</legend>
            <input
              type="email"
              placeholder="admin@admin.com"
              name="email"
              value={editForm.email}
              onChange={handleChangeForAccountSetting}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">비밀 번호</legend>
            <input
              type="password"
              placeholder=""
              name="pass"
              value={editForm.pass}
              onChange={handleChangeForAccountSetting}
            />
          </fieldset>

          <div className="grid grid-flow-row">
            <div className="grid grid-cols-2 gap-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">유저 타입</legend>
                <select
                  id="userType"
                  name="userType"
                  value={editForm.userType}
                  onChange={handleChangeForAccountSetting}
                >
                  <option value="ADMIN">관리자</option>
                  <option value="USER">유저</option>
                </select>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">부서</legend>
                <select
                  id="dept"
                  name="dept"
                  value={editForm.dept}
                  onChange={handleChangeForAccountSetting}
                >
                  {formInfo?.depts.map((deptdata) => (
                    <option key={deptdata} value={deptdata}>
                      {deptdata}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">직급</legend>
                <select
                  id="rank"
                  name="rank"
                  value={editForm.rank}
                  onChange={handleChangeForAccountSetting}
                >
                  {formInfo?.ranks.map((data) => (
                    <option key={data} value={data}>
                      {data}
                    </option>
                  ))}
                </select>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">근무 유형</legend>
                <select
                  id="workType"
                  name="workType"
                  value={editForm.workType}
                  onChange={handleChangeForAccountSetting}
                >
                  {formInfo?.worktypes.map((data) => (
                    <option key={data} value={data}>
                      {data}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>

            <button popoverTarget="erdp-popover" className="input input-border" style={{ anchorName: "--rdp" } as React.CSSProperties}>
              {editForm.hiredate ? new Date(editForm.hiredate).toLocaleDateString("ko-KR") : new Date().toLocaleDateString()}
            </button>
            <div popover="auto" id="erdp-popover" className="dropdown" style={{ positionAnchor: "--rdp" } as React.CSSProperties}>
              <DayPicker className="react-day-picker" mode="single" selected={editForm.hiredate} onSelect={handleDateChange} />
            </div>

            <br />

            <div className="grid grid-flow-row">
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm">출근 시간</p>
                <p className="text-sm">퇴근 시간</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  className="input"
                  name="workStartTime"
                  value={editForm.workStartTime}
                  onChange={handleChangeForAccountSetting}
                />
                <input
                  type="time"
                  className="input"
                  name="workEndTime"
                  value={editForm.workEndTime}
                  onChange={handleChangeForAccountSetting}
                />
              </div>
            </div>
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">프로필 사진</legend>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileChange}
            />
            <div className="avatar">
              <div className="w-24 rounded">
                <img
                  src={
                    previewUrl ??
                    "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
                  }
                  alt="미리보기"
                />
              </div>
            </div>
          </fieldset>

          <div className="divider"></div>
          <div className="text-center">
            <button
              className="btn btn-success btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
              onClick={onClickUpdate}
            >
              계정 수정
            </button>
            &nbsp;&nbsp;&nbsp;
            <button
              className="btn btn-warning btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
              onClick={onResetASForm}
            >
              리셋
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>




      
      















      {/* 계정 삭제 모달 */}
      <dialog ref={deleteModal} className="modal">
        <div className="modal-box">
          <h1 className="font-bold text-lg">계정 삭제</h1>
          <br></br>
          <p className="text-4xl text-error font-bold">{trytoDeleteData?.name}</p><p className="text-xl">계정이 정말로 삭제됩니다 진행할까요?</p>
          
          <br></br>
          <div className="grid grid-cols-2 gap-7">
            <button className="btn btn-error" onClick={() => tryToDeleteUser(trytoDeleteData?.empnum)}>삭제</button>
            <button className="btn btn-success" onClick={() => {
              deleteModal.current?.close();
            }}>취소</button>

          </div>
          

        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>












      {/* 근태 기록 편집 모달*/}
      <dialog ref={editAttendanceModal} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">근태 기록 편집</h3>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">날짜</legend>
            <button popoverTarget="eardp-popover" className="input input-border" style={{ anchorName: "--rdp" } as React.CSSProperties}>
              {}
            </button>
            <div popover="auto" id="eardp-popover" className="dropdown" style={{ positionAnchor: "--rdp" } as React.CSSProperties}>
              <DayPicker className="react-day-picker" mode="single" selected={attendanceRecord?.date} onSelect={() => onClickAttendanceCalendar()} />
            </div>


            <div className="grid grid-flow-row">
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm">출근 시간</p>
                <p className="text-sm">퇴근 시간</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  className="input"
                  name="clockIn"
                  value={attendanceRecord?.clockIn ?? ""}
                  onChange={handleTimeChange}
                />
                <input
                  type="time"
                  className="input"
                  name="clockOut"
                  value={attendanceRecord?.clockOut ?? ""}
                  onChange={handleTimeChange}
                />
              </div>
            </div>
            
          </fieldset>
          <br></br>
          <fieldset className="fieldset">
            <div className="grid grid-flow-row">
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm">외출 시간</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  className="input"
                  name="outStart"
                />
                <input
                  type="time"
                  className="input"
                  name="outEnd"
                />
              </div>
            </div>


          </fieldset>
          <br></br>

          <fieldset className="fieldset">
            <p className="text-sm">상태</p>
            <div className="grid grid-cols-4">
              <div className="grid grid-cols-2 text-center">
                <p className="text-xs text-gray-400">출근</p>
                <input type="radio" name="attendance-status" className="radio"
                  checked={attendanceStatusRadio == 1}
                  onChange={() => handleAttendanceStatusRadio(1)}
                />
              </div>
              <div className="grid grid-cols-2 text-center">
                <p className="text-xs text-gray-400">지각</p>
                <input type="radio" name="attendance-status" className="radio" 
                  checked={attendanceStatusRadio == 2}
                  onChange={() => handleAttendanceStatusRadio(2)}
                />
              </div>
              <div className="grid grid-cols-2 text-center">
                <p className="text-xs text-gray-400">조퇴</p>
                <input type="radio" name="attendance-status" className="radio"
                  checked={attendanceStatusRadio == 3}
                  onChange={() => handleAttendanceStatusRadio(3)}
                />
              </div>
              <div className="grid grid-cols-2 text-center">
                <p className="text-xs text-gray-400">결근</p>
                <input type="radio" name="attendance-status" className="radio"
                  checked={attendanceStatusRadio == 4}
                  onChange={() => handleAttendanceStatusRadio(4)}
                />
              </div>

            </div>
          </fieldset>
          
          <div className="divider"></div>
          <div className="text-center">
            <button
              className="btn btn-success btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
              
            >
              기록 수정
            </button>
            &nbsp;&nbsp;&nbsp;
            <button
              className="btn btn-warning btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
              
            >
              리셋
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>






    </div>





  );
}
