// components/UserManagement.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  getRequiredDataOfRegister,
  postRequestRegister,
  getDefaultImageFile,
  type RegisterFormInfoRequest,
  type RegisterResponse,
  findAndGetUserdata,
  type UserdataResponse,
  updateUserInfo,
} from "../services/UserService";
import { DayPicker } from "react-day-picker";
import { MdOutlinePersonSearch } from "react-icons/md";
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

  const [getUserinfo, setGetuserinfo] = useState<UserdataResponse>({
    empnum: "",
    name: "",
    email: "",
    role: "USER",
    rank: "",
    worktype: "",
    depttype: "",
    profileImageUrl: "",
    hiredate: new Date(),
    workStartTime: "09:00",
    workEndTime: "18:00",
    
  });

  // 미리보기/토스트/모달
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [regiResMsg, setRegiResMsg] = useState<RegisterResponse | null>(null);
  // 계정 생성 모달
  const editModal = useRef<HTMLDialogElement | null>(null);
  const accountSettingModal = useRef<HTMLDialogElement | null> (null);

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


  // 사원번호로 유저 찾기 및 가져오기
  const handleFindUser = async (
  ) => {
    const data = await findAndGetUserdata(editForm.empNumber);
    const img = await urlToFile(data.profileImageUrl, "profile.jpg");
    setEditForm((prev) => ({
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
    console.log(editForm);
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
              {form.hiredate ? form.hiredate.toLocaleDateString() : "입사일"}
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
              {editForm.hiredate ? editForm.hiredate.toLocaleDateString() : new Date().toLocaleDateString()}
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
    </div>
  );
}
