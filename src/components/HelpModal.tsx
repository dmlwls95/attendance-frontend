import { useEffect, useRef } from "react";

type Contact = {
  dept: string;
  phone?: string;
  email?: string;
  hours?: string;
  notes?: string;
};

type HelpModalProps = {
  open: boolean;
  onClose: () => void;
  // 필요하면 props로 교체 가능
  contacts?: Contact[];
};

const DEFAULT_CONTACTS: Contact[] = [
  { dept: "시스템관리팀(1차)", phone: "02-1234-5678", email: "it-support@company.com", hours: "평일 09:00~18:00", notes: "계정/비밀번호, 네트워크 이슈" },
  { dept: "보안팀(2차)",        phone: "02-9876-5432", email: "security@company.com",    hours: "평일 09:00~18:00", notes: "잠금/접속차단/의심활동" },
  { dept: "인사팀(계정권한)",    phone: "02-3333-4444", email: "hr@company.com",           hours: "평일 09:00~18:00", notes: "권한/부서 이동 반영" },
];

export default function HelpModal({ open, onClose, contacts = DEFAULT_CONTACTS }: HelpModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // open prop 변화에 따라 <dialog> 제어
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  const mailto = (to?: string, subject?: string, body?: string) => {
    if (!to) return "#";
    const q = new URLSearchParams();
    if (subject) q.set("subject", subject);
    if (body) q.set("body", body);
    return `mailto:${to}?${q.toString()}`;
  };

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-6xl">
        <form method="dialog">
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            aria-label="Close help"
          >
            ✕
          </button>
        </form>

        <h3 className="font-bold text-lg">도움말 · 로그인 문제 해결</h3>
        <p className="text-sm text-base-content/70 mt-1">
          아래 순서를 따라 문제가 해결되지 않으면 관련 부서에 연락해 주세요.
        </p>

        {/* 빠른 점검 (퀵 가이드) */}
        <div className="mt-4 grid gap-3">
          <div className="alert alert-info">
            <span className="font-semibold">빠른 점검</span>
            <ul className="list-disc ml-4">
              <li>이메일을 정확히 입력했는지 확인</li>
              <li>Caps Lock 끈 상태에서 비밀번호 다시 입력</li>
              <li>브라우저 캐시/쿠키 지우고 재시도</li>
              <li>사내망/VPN 연결 상태 확인</li>
            </ul>
          </div>

          <details className="collapse collapse-arrow bg-base-200">
            <summary className="collapse-title font-medium">자주 발생하는 현상 & 대처</summary>
            <div className="collapse-content text-sm leading-relaxed">
              <ul className="list-disc ml-5 space-y-1">
                <li><b>계정 잠금:</b> 5회 이상 실패 → 10분 후 재시도. 급하면 시스템관리팀에 잠금 해제 요청.</li>
                <li><b>비밀번호 분실:</b> 로그인 페이지의 “비밀번호 재설정” 또는 시스템관리팀 요청.</li>
                <li><b>권한 없음:</b> 인사팀에 권한/부서 업데이트 요청 후 재로그인.</li>
                <li><b>네트워크 오류:</b> 다른 사이트 접속으로 인터넷 확인, 회사 VPN 재연결.</li>
              </ul>
            </div>
          </details>
        </div>

        {/* 연락처 테이블 */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">관련 부서 연락처</h4>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>부서</th>
                  <th>전화</th>
                  <th>이메일</th>
                  <th>운영시간</th>
                  <th>비고</th>
                  <th className="w-36">동작</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr key={i}>
                    <td className="font-medium text-nowrap">{c.dept}</td>
                    <td className="text-nowrap">
                      {c.phone ? (
                        <a className="link" href={`tel:${c.phone.replace(/-/g, "")}`}>{c.phone}</a>
                      ) : "-"}
                    </td>
                    <td className="text-nowrap">
                      {c.email ? (
                        <a className="link" href={mailto(c.email, "[근태] 로그인 문의", "증상과 스크린샷을 첨부해 주세요.")}>
                          {c.email}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="text-nowrap">{c.hours || "-"}</td>
                    <td className="text-nowrap">{c.notes || "-"}</td>
                    <td className="flex gap-2">
                      <button className="btn btn-xs" onClick={() => copy(c.phone)}>전화 복사</button>
                      <button className="btn btn-xs" onClick={() => copy(c.email)}>이메일 복사</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 추가 액션 */}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              className="btn btn-primary btn-sm"
              href={mailto(contacts[0]?.email, "[근태] 로그인 오류 신고", "① 성함/사번 ② 로그인 이메일 ③ 발생 시각 ④ 오류 메시지(스크린샷)")}
            >
              오류 신고 메일 쓰기
            </a>
            <button className="btn btn-ghost btn-sm" onClick={() => copy(window.location.href)}>
              현재 페이지 주소 복사
            </button>
          </div>
        </div>

        <div className="modal-action">
          <form method="dialog">
            <button onClick={onClose} className="btn">닫기</button>
          </form>
        </div>
      </div>

      {/* 바깥 영역 클릭 시 닫힘 */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
