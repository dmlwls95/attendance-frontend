
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import APIConfig from '../configs/API.config';

const BoardWrite: React.FC = () => {
  const { type }           = useParams<{ type: string }>();
  const navigate           = useNavigate();
  const [title,   setTit ] = useState('');
  const [writer,  setWri ] = useState('');
  const [content, setCon ] = useState('');

  /* default FREE */
  const boardType = (type ?? 'free').toUpperCase();

  const submit = () => {
    if (!title.trim() || !writer.trim() || !content.trim()) {
      alert('제목·작성자·내용을 모두 입력하세요.');
      return;
    }
    axios.post(`${APIConfig}/admin/board/write`, {
      title, content, writer, boardType
    })
    .then(() => {
      alert('글이 등록되었습니다.');
      navigate(`/admin/board/${boardType.toLowerCase()}`);
    })
    .catch(console.error);
  };

  /* ───── view ───── */
  return (
    <div className="max-w-xl mx-auto p-6 font-sans">
      <h2 className="text-2xl font-bold mb-6">글쓰기</h2>

      {/* 테이블 레이아웃 */}
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
                placeholder="작성자 이름"
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

      {/* 버튼 */}
      <div className="flex gap-2 mt-6">
        <button className="btn btn-neutral" onClick={submit}>등록</button>
        <button className="btn btn-outline"
                onClick={() => navigate(`/admin/board/${boardType.toLowerCase()}`)}>
          취소
        </button>
      </div>
    </div>
  );
};

export default BoardWrite;