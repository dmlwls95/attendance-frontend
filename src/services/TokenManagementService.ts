export function getAuthToken(): string | null {
  const local = localStorage.getItem("token");
  if (local && local !== "null" && local !== "") return local;
  const session = sessionStorage.getItem("token");
  if (session && session !== "null" && session !== "") return session;
  return null;
}

export function setAuthToken(token: string, remember: boolean) {
  if (remember) localStorage.setItem("token", token);
  else sessionStorage.setItem("token", token);
}

export function removeAuthToken() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  localStorage.removeItem("role");
  sessionStorage.removeItem("role");
}

export function getStoredRole(): string {
  return localStorage.getItem("role") || sessionStorage.getItem("role") || "";
}

export function parseJwt(token: string): any | null {
  try {
    const payload = token.split(".")[1];
    const binary = atob(payload);
    // UTF-8 안전 디코딩
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    console.log(json);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getEmailFromToken(token?: string | null): string {
  const t = token ?? getAuthToken();
  if (!t) return "";
  const obj = parseJwt(t);
  // 서버의 sub가 email인지 확인하고 맞게 쓰기 (아니면 obj.email로)
  return typeof obj?.sub === "string" ? obj.sub : "";
}

export function isTokenExpired(token?: string | null): boolean {
  const t = token ?? getAuthToken();
  if (!t) return true;
  const obj = parseJwt(t);
  if (!obj?.exp) return true;
  // exp는 초 단위 (JWT 표준)
  const nowSec = Math.floor(Date.now() / 1000);
  return obj.exp <= nowSec;
}