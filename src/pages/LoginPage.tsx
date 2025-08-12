/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/LoginPage.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiHelpCircle } from "react-icons/fi";
import APIConfig from "../configs/API.config";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: FormEvent) {
    e?.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${APIConfig}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        let msg = "ログインに失敗しました。";
        try {
          const body = await res.json();
          if (body?.message) msg = body.message;
        } catch(err) {console.error(err);}
        throw new Error(msg);
      }
      const data = await res.json();
      const storage = remember ? localStorage : sessionStorage;
      if (data.token) storage.setItem("token", data.token);
      if (data.role) storage.setItem("role", data.role);

      navigate(data.role === "ADMIN" ? "/admin/home" : "/user/home");
    } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("알 수 없는 오류가 발생했습니다.");
            }
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
            <h1 className="text-4xl font-black leading-none">globalin</h1>
            <p className="text-sm text-base-content/60 mt-1">勤怠管理システム</p>
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
              className={`btn btn-primary sm:row-span-2 sm:h-full sm:w-32 justify-center ${
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
              <a className="link flex items-center gap-1">
                도움말 <FiHelpCircle />
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
