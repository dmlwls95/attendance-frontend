import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import APIConfig from '../configs/API.config';

interface Comment {
  id: number;
  writer: string;
  content: string;
  createdAt: string;
}

const BoardDetail: React.FC = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate     = useNavigate();

  const [board,   setBoard]   = useState<any>(null);
  const [comments, setComm]   = useState<Comment[]>([]);
  const [writer,   setWriter] = useState('');
  const [newComment, setNew]  = useState('');

  /* ───── load ───── */
  useEffect(() => {
    if (!id) return;

    axios.get(`${APIConfig}/admin/board/detail/${id}`)
         .then(res => setBoard(res.data))
         .catch(console.error);

    fetchComments();
  }, [id]);

  const fetchComments = () =>
    axios.get(`${APIConfig}/api/comments/${id}`)
         .then(res => setComm(res.data))
         .catch(console.error);

  /* ───── add / delete ───── */
  const handleAdd = () => {
    if (!writer.trim() || !newComment.trim()) {
      alert('작성자와 내용을 입력해주세요.');
      return;
    }
    axios.post(`${APIConfig}/api/comments`, {
      writer,
      content: newComment,
      boardId: Number(id),
      boardType: board?.boardType,
    })
    .then(() => { setWriter(''); setNew(''); fetchComments(); })
    .catch(console.error);
  };

  const handleDel = (cid: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    axios.delete(`${APIConfig}/api/comments/${cid}`)
         .then(fetchComments)
         .catch(console.error);
  };

  /* ───── guard ───── */
  if (!id || !type) return <div className="text-center py-10">잘못된 접근입니다.</div>;
  if (!board)        return <div className="text-center py-10">로딩중...</div>;

  /* ───── utils ───── */
  const boardTypeName = () => {
    switch ((board.boardType ?? '').toUpperCase()) {
      case 'NOTICE':  return '공지사항';
      case 'FREE':    return '자유게시판';
      case 'SUGGEST': return '건의사항';
      default:        return '';
    }
  };
  const writeTime = (board.writeDate ?? board.createdAt ?? '')
                    .substring(0, 16).replace('T', ' ');

  /* ───── view ───── */
  return (
    <div className="max-w-2xl mx-auto p-6 font-sans">

      {/* 헤더 */}
      <h2 className="text-xl font-bold">
        ({boardTypeName()}) {board.title}
      </h2>
      <p className="text-xs text-gray-500 mt-1">{writeTime}</p>

      {/* 작성자 */}
      <p className="text-sm text-gray-600 mt-4 mb-4">
        작성자: <span className="font-semibold">{board.writer}</span>
      </p>

      {/* 본문 */}
      <div className="p-4 border rounded-box bg-base-100 leading-relaxed whitespace-pre-line">
        {board.content}
      </div>

      {/* 목록 버튼 */}
      <button
        onClick={() => navigate(`/admin/board/${type}`)}
        className="btn btn-outline btn-sm mt-6"
      >
        ← 목록으로
      </button>

      {/* 댓글 입력 */}
      <div className="border-t-2 border-base-300 mt-10 pt-6 space-y-3">
        <h4 className="font-semibold">댓글 작성</h4>
        <div className="flex flex-wrap gap-2">
          {/* ① 닉네임 입력 - 무채색 focus */}
          <input
            type="text"
            placeholder="닉네임"
            value={writer}
            onChange={e => setWriter(e.target.value)}
            className="input input-sm input-bordered input-neutral w-32
                       focus:outline-none focus:ring-0 focus:border-gray-400"
          />
          {/* ② 댓글 입력 - 무채색 focus */}
          <input
            type="text"
            placeholder="여러분의 한마디 (최대 200자)"
            value={newComment}
            onChange={e => setNew(e.target.value)}
            maxLength={200}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') handleAdd();
            }}
            className="input input-sm input-bordered input-neutral flex-1 min-w-[200px]
                       focus:outline-none focus:ring-0 focus:border-gray-400"
          />
          <button onClick={handleAdd} className="btn btn-outline btn-sm">
            등록
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="mt-8">
        <h4 className="font-semibold mb-3">
          댓글 <span className="text-base-content/70">{comments.length}</span>
        </h4>

        {comments.length === 0 && (
          <div className="text-center text-gray-500 py-10">아직 댓글이 없습니다.</div>
        )}

        {comments.map((c, idx) => (
          <div key={c.id}
               className={`flex py-4 text-sm ${idx === 0 ? 'border-t-2' : 'border-t'} border-base-200`}>
            <div className="w-40 text-gray-700 font-semibold">
              {c.writer}
              <span className="block text-xs text-gray-400 font-normal mt-1">
                {c.createdAt?.substring(0, 16).replace('T', ' ')}
              </span>
            </div>
            <div className="flex-1 break-words leading-relaxed">
              {c.content}
            </div>
            <button
              onClick={() => handleDel(c.id)}
              className="btn btn-xs btn-outline ml-3"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardDetail;