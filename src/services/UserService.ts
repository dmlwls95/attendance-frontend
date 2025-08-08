// services/userService.ts
import APIConfig from "../configs/API.config";

export type RegisterFormInfoRequest = {
  depts: string[];
  ranks: string[];
  worktypes: string[];
};

export type RegisterResponse = {
  success: boolean; 
  message: string;
};

export type RegisterFormPayload = {
  empNumber: string;
  userName: string;
  email: string;
  pass: string;
  userType: string;
  dept: string;
  rank: string;
  workType: string;
  hiredate: string;
  workStartTime: string;
  workEndTime: string;
  profileImageFile: File | null;
};

export type UserdataResponse = {
	empnum : string;
	name : string;
	email: string;
	role: "USER" | "ADMIN";
	rank: string;
	worktype: string;
	depttype: string;
	profileImageUrl: string;
	hiredate: Date;
	workStartTime: string;
	workEndTime: string;
}

export interface PageResponse<T> {
  content : T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export type AttendanceResponse = {
  email : string,
  name : string,
  empnum : string,
  date : Date,
  clockIn : string,
  clockOut : string,
  isLate : string,
  isLeftEarly: string,
  totalHours: number
}

export async function getRequiredDataOfRegister(): Promise<RegisterFormInfoRequest> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${APIConfig}/admin/usermanagement/forminfo`, {
    method: "GET",
    headers: {
      // "Content-Type": "application/json", // GET이므로 불필요
      Authorization: `Bearer ${token ?? ""}`,
    },
    credentials: "include",
  });
  if (!response.ok) throw new Error("조회 실패");
  return await response.json();
}

export async function postRequestRegister(payload: RegisterFormPayload): Promise<RegisterResponse> {
  const {
    empNumber,
    email,
    userName,
    pass,
    userType,
    dept,
    rank,
    workType,
    profileImageFile,
    hiredate,
    workStartTime,
    workEndTime,
  } = payload;

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
  formData.append("hiredate", hiredate);
  formData.append("workstarttime", workStartTime);
  formData.append("workendtime", workEndTime);

  if (profileImageFile) {
    formData.append("profileImage", profileImageFile);
  }

  const response = await fetch(`${APIConfig}/admin/usermanagement/signup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
      // FormData 사용 시 Content-Type 지정 금지 (브라우저가 boundary 포함해 자동 세팅)
    },
    credentials: "include",
    body: formData,
  });

  if (!response.ok) throw new Error("등록 실패");
  return await response.json();
}

// 유저 정보 업데이트
export async function updateUserInfo(payload: RegisterFormPayload): Promise<RegisterResponse> {
  const {
    empNumber,
    email,
    userName,
    pass,
    userType,
    dept,
    rank,
    workType,
    profileImageFile,
    hiredate,
    workStartTime,
    workEndTime,
  } = payload;

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
  formData.append("hiredate", hiredate);
  formData.append("workstarttime", workStartTime);
  formData.append("workendtime", workEndTime);

  if (profileImageFile) {
    formData.append("profileImage", profileImageFile);
  }

  const response = await fetch(`${APIConfig}/admin/usermanagement/userupdate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
      // FormData 사용 시 Content-Type 지정 금지 (브라우저가 boundary 포함해 자동 세팅)
    },
    credentials: "include",
    body: formData,
  });


  if (!response.ok) throw new Error("등록 실패");
  return await response.json();
}

export async function getDefaultImageFile(): Promise<File> {
  const response = await fetch("https://img.daisyui.com/images/profile/demo/yellingcat@192.webp");
  const blob = await response.blob();
  return new File([blob], "yellingcat.webp", { type: blob.type });
}

export async function findAndGetUserdata(empno:string): Promise<UserdataResponse | string> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${APIConfig}/admin/usermanagement/checkuser?empno=${empno}`, {
    method: "GET",
    headers: {
      // "Content-Type": "application/json", // GET이므로 불필요
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok)
  {
    const errorText = await response.text();
    return errorText || "조회 실패";
  }
  return await response.json();
}

export async function  getPagedUsers(page: number, size: number): Promise<PageResponse<UserdataResponse> | string> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${APIConfig}/admin/usermanagement/userlist?page=${page-1}&size=${size}`, {
      method: "GET",
      headers: {
        // "Content-Type": "application/json", // GET이므로 불필요
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok)
    {
      const errorText = await response.text();
      return errorText || "조회 실패";
    }
    return await response.json();
}

export async function deleteUserByEmpno(empno:string): Promise<RegisterResponse> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${APIConfig}/admin/usermanagement/userdelete?empnum=${empno}`, {
    method: "DELETE",
    headers: {
      // "Content-Type": "application/json", // GET이므로 불필요
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  return await response.json();
}

export async function findAttendanceByEmpnoNdate(empno:string, date : Date): Promise<AttendanceResponse> {
  const token = localStorage.getItem("token");
  const datestr = date.toISOString().split("T")[0];
  const response = await fetch(`${APIConfig}/admin/usermanagement/findattendance?empnum=${empno}&adate=${datestr}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  return await response.json();
}