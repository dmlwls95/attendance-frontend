/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/LoginPage.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiHelpCircle } from "react-icons/fi";
import APIConfig from "../configs/API.config";
import { getAuthToken, getEmailFromToken, getStoredRole, isTokenExpired, setAuthToken } from "../services/TokenManagementService";
import HelpModal from "../components/HelpModal";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  useEffect(() => {
    const authToken = getAuthToken();
    if (authToken ) {
      setEmail(getEmailFromToken(authToken) || "");
      setPassword("****************"); // 보안상 비번은 저장하지 않음
    }
    


  }, [])

  async function handleLogin(e?: FormEvent) {
  e?.preventDefault();
  if (loading) return;

  setError(null);
  setLoading(true);
  try {
    // 1) 기존 토큰 체크
    const existing = getAuthToken();

    if (existing && !isTokenExpired(existing)) {
      const tokenEmail = getEmailFromToken(existing);
      if (email && tokenEmail && email === tokenEmail) {
        // 이메일 일치 → 비번 없이 통과
        const role = getStoredRole();
        navigate(role === "ADMIN" ? "/admin/home" : "/user/home");
        return; // ✅ 여기서 반드시 종료
      } else if (email && tokenEmail && email !== tokenEmail) {
        // 이메일 불일치 → 로그인 차단
        setError("이미 다른 계정으로 로그인되어 있습니다. 먼저 로그아웃해 주세요.");
        return; // ✅ 종료 (아래 로그인 시도 금지)
      }
      // tokenEmail이 비어있거나(sub가 email이 아니거나), 만료 등 애매하면 그냥 아래 로그인 시도
    }

    // 2) 로그인 요청
    const res = await fetch(`${APIConfig}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      // 서버 에러 메시지 추출
      let msg = "로그인에 실패했습니다.";
      try {
        const body = await res.json();
        if (body?.message) msg = body.message;
      } catch {}
      throw new Error(msg);
    }

    const data = await res.json(); // { token, role? }
    if (!data?.token) {
      throw new Error("토큰이 응답에 없습니다.");
    }

    // 3) 저장 (remember 선택에 따라 local vs session)
    setAuthToken(data.token, remember);
    if (data.role) {
      if (remember) localStorage.setItem("role", data.role);
      else sessionStorage.setItem("role", data.role);
    }

    navigate((data.role || getStoredRole()) === "ADMIN" ? "/admin/home" : "/user/home");
  } catch (err: unknown) {
    if (err instanceof Error) setError(err.message);
    else setError("알 수 없는 오류가 발생했습니다.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center  px-4">
      <div className="card w-full max-w-xl bg-base-100 border shadow-sm">
        <div className="card-body">
          {/* ① 헤더 영역 */}
          <div>
            <h1 className="text-4xl font-black leading-none">Global-in</h1>
            <p className="text-sm text-base-content/60 mt-1">근태관리시스템</p>
          </div>

          {error && (
            <div role="alert" className="alert alert-error mt-4">
              <span>{error}</span>
            </div>
          )}

          {/* ② ③ 입력 + ④ 로그인 버튼 그리드 */}
          <form
            className="mt-4 grid grid-cols-1 sm:[grid-template-columns:1fr_auto] gap-3 items-stretch"
            onSubmit={handleLogin}
          >
            {/* ID */}
            <label className="relative block">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
              <input
                type="email"
                placeholder="ID"
                className="input input-bordered w-full pl-10"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            {/* ④ 로그인 버튼 (우측, 두 줄 높이) */}
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary sm:row-span-2 sm:h-full sm:w-28 justify-center ${
                loading ? "loading" : ""
              }`}
            >
              {loading ? "loading" : "login"}
            </button>

            {/* password */}
            <label className="relative block">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
              <input
                type="password"
                placeholder="password"
                className="input input-bordered w-full pl-10"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {/* ⑤ 로그인 유지 체크박스 + ⑥ 도움말 */}
            <div className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" className="text-sm">
                로그인 정보 저장
              </label>
            </div>

            <div className="flex items-center justify-end text-sm text-base-content/70">
              <a className="link flex items-center gap-1" onClick={() => setOpenHelp(true)}>
                도움말 <FiHelpCircle />
              </a>
            </div>
          </form>

          <HelpModal
            open={openHelp}
            onClose={() => setOpenHelp(false)}
            // 필요 시 부서 목록 커스터마이즈
            // contacts={[
            //   { dept: "IT운영(1차)", phone: "02-1111-2222", email: "itops@company.com", hours: "평일 09~18시", notes: "초기문의" },
            // ]}
          />
        </div>
      </div>
    </div>
  );
}
