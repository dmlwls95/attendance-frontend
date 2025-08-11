import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  const location     = useLocation();
  const isAdmin      = location.pathname.startsWith('/admin');
  const apiBase      = `${APIConfig}/${isAdmin ? 'admin/adminboard' : 'user/userboard'}`;
  const listBasePath = `/${isAdmin ? 'admin/adminboard' : 'user/userboard'}`;

  const [board,      setBoard]   = useState<any>(null);
  const [comments,   setComm]    = useState<Comment[]>([]);
  const [writer,     setWriter]  = useState('');
  const [newComment, setNew]     = useState('');

  // 추천 수/로딩 상태
  const [likes, setLikes]           = useState<number>(0);
  const [likeLoading, setLikeLoad]  = useState<boolean>(false);

  /* ───── load ───── */
  useEffect(() => {
    if (!id) return;

    axios.get(`${apiBase}/detail/${id}`)
         .then(res => {
           setBoard(res.data);
           // 응답 필드명 케이스: recommendCount 또는 likeCount (정확한 정보 없음 → 둘 다 대응)
           const cnt = res.data?.recommendCount ?? res.data?.likeCount ?? 0;
           setLikes(typeof cnt === 'number' ? cnt : 0);
         })
         .catch(console.error);

    fetchComments();
  }, [id, apiBase]);

  const fetchComments = () =>
    axios.get(`${APIConfig}/api/comments/${id}`)
         .then(res => setComm(res.data))
         .catch(console.error);

  /* ───── recommend(+1) ───── */
  const handleRecommend = async () => {
    if (!id || likeLoading) return;
    setLikeLoad(true);
    try {
      // 서버에서 count를 돌려주면 그걸 사용, 아니면 로컬 +1
      const { data } = await axios.post(`${apiBase}/recommend/${id}`);
      const next = (data?.count ?? data?.recommendCount ?? data?.likeCount);
      setLikes(typeof next === 'number' ? next : likes + 1);
    } catch (e) {
      console.error(e);
      alert('추천 처리에 실패했습니다.');
    } finally {
      setLikeLoad(false);
    }
  };

  /* ───── add / delete comment ───── */
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            ({boardTypeName()}) {board.title}
          </h2>
          <p className="text-xs text-gray-500 mt-1">{writeTime}</p>
          <p className="text-sm text-gray-600 mt-4 mb-4">
            작성자: <span className="font-semibold">{board.writer}</span>
          </p>
        </div>

        {/* 추천 버튼 */}
        <button
          onClick={handleRecommend}
          disabled={likeLoading}
          className="btn btn-sm border border-gray-400 text-gray-700 hover:bg-gray-200 hover:border-gray-500"
          title="게시글 추천"
        >
          👍 추천 {likes}
        </button>
      </div>

      {/* 본문 */}
      <div className="p-4 border rounded-box bg-base-100 leading-relaxed whitespace-pre-line">
        {board.content}
      </div>

      {/* 목록 버튼 */}
      <button
        onClick={() => navigate(`${listBasePath}/${type}`)}
        className="btn btn-sm mt-6 border border-gray-400 text-gray-700 hover:bg-gray-200 hover:border-gray-500"
      >
        ← 목록으로
      </button>

      {/* ───── 댓글 입력 ───── */}
      <div className="border-t-2 border-base-300 mt-10 pt-6 space-y-3">
        <h4 className="font-semibold">댓글 작성</h4>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="닉네임"
            value={writer}
            onChange={e => setWriter(e.target.value)}
            className="input input-sm input-bordered input-neutral w-32 focus:outline-none focus:ring-0 focus:border-gray-400"
          />
          <input
            type="text"
            placeholder="여러분의 한마디 (최대 200자)"
            value={newComment}
            onChange={e => setNew(e.target.value)}
            maxLength={200}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            className="input input-sm input-bordered input-neutral flex-1 min-w-[200px] focus:outline-none focus:ring-0 focus:border-gray-400"
          />
          <button
            onClick={handleAdd}
            className="btn btn-sm border border-gray-400 text-gray-700 hover:bg-gray-200 hover:border-gray-500"
          >
            등록
          </button>
        </div>
      </div>

      {/* ───── 댓글 목록 ───── */}
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
              className="btn btn-xs ml-3 border border-gray-400 text-gray-700 hover:bg-gray-200 hover:border-gray-500"
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