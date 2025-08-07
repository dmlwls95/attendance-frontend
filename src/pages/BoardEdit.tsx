import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import APIConfig from '../configs/API.config';

interface BoardDTO {
  id: number;
  title: string;
  content: string;
  writer: string;
  boardType: string;
}

const BoardEdit: React.FC = () => {
  /* ───── URL 파라미터 ───── */
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate     = useNavigate();

  /* ───── form 상태 ───── */
  const [form, setForm] = useState<BoardDTO>({
    id: 0,
    title: '',
    content: '',
    writer: '',
    boardType: (type ?? 'free').toUpperCase(),   // NOTICE · FREE · SUGGEST
  });

  /* ───── 글 로딩 ───── */
  useEffect(() => {
    if (!id || !type) return;

    axios
      .get(`${APIConfig}/admin/board/detail/${id}/${type}`)
      .then(res => setForm(res.data))
      .catch(console.error);
  }, [id, type]);

  /* ───── 저장(수정) ───── */
  const save = () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('제목과 내용을 모두 입력하세요.');
      return;
    }

    // 서버는 title, content 만 필요
    const payload = { title: form.title, content: form.content };

    axios
      .put(`${APIConfig}/admin/board/edit/${id}/${type}`, payload)
      .then(() => {
        alert('글이 수정되었습니다.');
        navigate(`/admin/board/detail/${id}/${type}`);
      })
      .catch(console.error);
  };

  /* ───── view ───── */
  return (
    <div className="max-w-xl mx-auto p-6 font-sans">
      <h2 className="text-2xl font-bold mb-6">글 수정</h2>

      <table className="table w-full border border-base-200">
        <tbody>
          {/* 제목 */}
          <tr className="border-b border-base-200">
            <th className="w-28 bg-base-200 text-right px-3 py-2">제목</th>
            <td className="px-3 py-2">
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="input input-sm input-bordered w-full
                           focus:outline-none focus:ring-0 focus:border-gray-400"
              />
            </td>
          </tr>

          {/* 작성자(읽기전용) */}
          <tr className="border-b border-base-200">
            <th className="w-28 bg-base-200 text-right px-3 py-2">작성자</th>
            <td className="px-3 py-2">
              <input
                type="text"
                value={form.writer}
                readOnly
                className="input input-sm input-bordered w-60 bg-gray-100 text-gray-500"
              />
            </td>
          </tr>

          {/* 내용 */}
          <tr>
            <th className="w-28 bg-base-200 text-right align-top px-3 py-2">내용</th>
            <td className="px-3 py-2">
              <textarea
                rows={10}
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                className="textarea textarea-bordered w-full
                           focus:outline-none focus:ring-0 focus:border-gray-400"
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* 버튼 영역 */}
      <div className="flex gap-2 mt-6">
        {/* 저장 */}
        <button
          className="btn border border-gray-400 text-gray-700
                     hover:bg-gray-200 hover:border-gray-500"
          onClick={save}
        >
          저장
        </button>

        {/* 취소 */}
        <button
          className="btn border border-gray-400 text-gray-700
                     hover:bg-gray-200 hover:border-gray-500"
          onClick={() => navigate(-1)}
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default BoardEdit;