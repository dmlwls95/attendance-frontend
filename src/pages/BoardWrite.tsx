import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import APIConfig from '../configs/API.config';

type BoardTypeParam = 'notice' | 'free' | 'suggest' | undefined;

const BoardWrite: React.FC = () => {
  const { type }     = useParams<{ type: BoardTypeParam }>();
  const location     = useLocation();
  const navigate     = useNavigate();

  const [title,   setTit] = useState('');
  const [writer,  setWri] = useState('');         // 백엔드가 토큰에서 유저를 읽으면 비워둬도 됨(정확한 정보 없음)
  const [content, setCon] = useState('');
  const [loading, setLoading] = useState(false);

  // 경로로 관리자 여부 판별
  const isAdmin  = location.pathname.startsWith('/admin');

  const typeKey  = (type ?? 'free').toUpperCase(); // 'NOTICE'|'FREE'|'SUGGEST'
  const listPath = `/${isAdmin ? 'admin/adminboard' : 'user/userboard'}/${typeKey.toLowerCase()}`;
  const postUrl  = `${APIConfig}/${isAdmin ? 'admin/adminboard' : 'user/userboard'}/write`;

  const submit = async () => {
    if (!title.trim() || !content.trim() || !typeKey) {
      alert('제목·내용을 입력하세요.');
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, any> = { title: title.trim(), content: content.trim(), boardType: typeKey };

      if (writer.trim()) payload.writer = writer.trim();

      // const typeIdMap = { NOTICE: 1, FREE: 2, SUGGEST: 3 };
      // const payload = { title: title.trim(), content: content.trim(), typeId: typeIdMap[typeKey] };

      await axios.post(postUrl, payload /* , { headers: { Authorization: `Bearer ${token}` } } */);

      alert('글이 등록되었습니다.');
      navigate(listPath, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : '') ||
        err?.message ||
        '등록 실패(원인: 정확한 정보 없음)';
      alert(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 font-sans">
      <h2 className="text-2xl font-bold mb-6">
        {isAdmin ? '관리자' : '사용자'} 글쓰기 ({typeKey})
      </h2>

      <table className="table w-full border border-base-200">
        <tbody>
          <tr className="border-b border-base-200">
            <th className="w-28 bg-base-200 text-right px-3 py-2">제목</th>
            <td className="px-3 py-2">
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={e => setTit(e.target.value)}
                className="input input-sm input-bordered input-neutral w-full
                           focus:outline-none focus:ring-0 focus:border-gray-400"
              />
            </td>
          </tr>

          <tr className="border-b border-base-200">
            <th className="w-28 bg-base-200 text-right px-3 py-2">작성자</th>
            <td className="px-3 py-2">
              <input
                type="text"
                placeholder="작성자 이름 (토큰에서 읽으면 비워두세요)"
                value={writer}
                onChange={e => setWri(e.target.value)}
                className="input input-sm input-bordered input-neutral w-60
                           focus:outline-none focus:ring-0 focus:border-gray-400"
              />
            </td>
          </tr>

          <tr>
            <th className="w-28 bg-base-200 text-right align-top px-3 py-2">내용</th>
            <td className="px-3 py-2">
              <textarea
                placeholder="내용을 입력하세요"
                value={content}
                onChange={e => setCon(e.target.value)}
                rows={10}
                className="textarea textarea-bordered textarea-neutral w-full
                           focus:outline-none focus:ring-0 focus:border-gray-400"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex gap-2 mt-6">
        <button className="btn btn-neutral" onClick={submit} disabled={loading}>
          {loading ? '등록 중…' : '등록'}
        </button>
        <button className="btn btn-outline" onClick={() => navigate(listPath)}>
          취소
        </button>
      </div>
    </div>
  );
};

export default BoardWrite;