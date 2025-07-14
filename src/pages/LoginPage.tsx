import { useState } from "react";
import APIConfig from "../configs/API.config";
import { useNavigate } from "react-router-dom"


export default function LoginPage()
{
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError ] =useState<string | null>(null);

    const handleLogin = async () => {
        try {
            const response = await fetch(`${APIConfig}/auth/login`, {
                method: "POST",
                headers: { "Content-Type" : "application/json"},
                body: JSON.stringify({email, password})
            })

            if(!response.ok) throw new Error("로그인 실패");
            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            
            
            if(data.role === "ADMIN")
            {
                navigate("/admin/home");
                
            }else{
                navigate("/user");
            }


        
        } catch (e: unknown) {
            if(e instanceof Error)
            {
                setError(e.message);
            }else{
                setError("알 수 없는 오류가 발생했습니다.")
            }
            
        }
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">

            <h2 className="text-2xl font-bold">로그인</h2>
            {error && <p className="text-red-500">{error}</p>}
            <input
                type="email"
                placeholder="이메일 입력"
                className="input input-bordered w-64"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            
            <input
                type="password"
                placeholder="비밀번호"
                className="input input-bordered w-64"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin} className="btn btn-primary w-64">
                로그인
            </button>
            
        </div>
    );
}