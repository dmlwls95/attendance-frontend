import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import APIConfig from '../configs/API.config';

interface Comment {
  id: number;
  writer: string;
  content: string;
  createdAt: string;
  ownerId: string; // 댓글 작성자 ID
}

const BoardDetail: React.FC = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const apiBase = `${APIConfig}/${isAdmin ? 'admin/adminboard' : 'user/userboard'}`;
  const listBasePath = `/${isAdmin ? 'admin/adminboard' : 'user/userboard'}`;

  const [board, setBoard] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // 로그인된 사용자 ID (auth에서 가져옴, 예: localStorage)
  const loggedInUserId = localStorage.getItem('userId') || '';

  // 추천 수/로딩 상태
  const [likes, setLikes] = useState<number>(0);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    axios.get(`${apiBase}/detail/${id}`)
      .then(res => {
        setBoard(res.data);
        const cnt = res.data?.recommendCount ?? res.data?.likeCount ?? 0;
        setLikes(typeof cnt === 'number' ? cnt : 0);
      })
      .catch(console.error);

    fetchComments();
  }, [id, apiBase]);

  const fetchComments = () => {
    axios.get(`${APIConfig}/api/comments/${id}`)
      .then(res => setComments(res.data))
      .catch(console.error);
  };

  const handleRecommend = async () => {
    if (!id || likeLoading) return;
    setLikeLoading(true);
    try {
      const { data } = await axios.post(`${apiBase}/recommend/${id}`);
      const next = (data?.count ?? data?.recommendCount ?? data?.likeCount);
      setLikes(typeof next === 'number' ? next : likes + 1);
    } catch (e) {
      console.error(e);
      alert('추천 처리에 실패했습니다.');
    } finally {
      setLikeLoading(false);
    }
  };

  // 새 댓글 등록
  const handleAddComment = () => {
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    axios.post(`${APIConfig}/api/comments`, {
      writerId: loggedInUserId,
      content: newComment,
      boardId: Number(id),
    })
      .then(() => {
        setNewComment('');
        fetchComments();
      })
      .catch(error => {
        console.error('댓글 등록 실패:', error.response || error);
        alert('댓글 등록에 실패했습니다.');
      });
  };

  // 댓글 삭제
  const handleDeleteComment = (cid: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    axios.delete(`${APIConfig}/api/comments/${cid}`)
      .then(fetchComments)
      .catch(console.error);
  };

  // 댓글 수정 모드 시작
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  // 댓글 수정 완료
  const handleUpdateComment = () => {
    if (!editingContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    axios.put(`${APIConfig}/api/comments/${editingCommentId}`, {
      content: editingContent,
    })
      .then(() => {
        setEditingCommentId(null);
        setEditingContent('');
        fetchComments();
      })
      .catch(error => {
        console.error('댓글 수정 실패:', error.response || error);
        alert('댓글 수정에 실패했습니다.');
      });
  };

  // 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  if (!id || !type) return <div className="text-center py-10">잘못된 접근입니다.</div>;
  if (!board) return <div className="text-center py-10">로딩중...</div>;

  const boardTypeName = () => {
    switch ((board.boardType ?? '').toUpperCase()) {
      case 'NOTICE': return '공지사항';
      case 'FREE': return '자유게시판';
      case 'SUGGEST': return '건의사항';
      default: return '';
    }
  };
  const writeTime = (board.writeDate ?? board.createdAt ?? '').substring(0, 16).replace('T', ' ');

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

      {/* 댓글 입력 */}
      <div className="border-t-2 border-base-300 mt-10 pt-6 space-y-3">
        <h4 className="font-semibold">댓글 작성</h4>
        <textarea
          placeholder="댓글을 입력하세요..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          maxLength={200}
          className="textarea textarea-bordered w-full resize-none"
          rows={3}
          disabled={editingCommentId !== null}
        />
        <button
          onClick={handleAddComment}
          disabled={editingCommentId !== null || newComment.trim() === ''}
          className="btn btn-sm border border-gray-400 text-gray-700 hover:bg-gray-200 hover:border-gray-500 mt-2"
        >
          등록
        </button>
      </div>

      {/* 댓글 목록 */}
      <div className="mt-8">
        <h4 className="font-semibold mb-3">
          댓글 <span className="text-base-content/70">{comments.length}</span>
        </h4>

        {comments.length === 0 && (
          <div className="text-center text-gray-500 py-10">아직 댓글이 없습니다.</div>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex py-4 text-sm border-t border-base-200"
          >
            <div className="w-40 text-gray-700 font-semibold">
              {comment.writer}
              <span className="block text-xs text-gray-400 font-normal mt-1">
                {comment.createdAt?.substring(0, 16).replace('T', ' ')}
              </span>
            </div>
            <div className="flex-1 break-words leading-relaxed">
              {/* 수정 모드일 때 */}
              {editingCommentId === comment.id ? (
                <>
                  <textarea
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    maxLength={200}
                    className="textarea textarea-bordered w-full resize-none"
                    rows={3}
                  />
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={handleUpdateComment}
                      className="btn btn-xs border border-blue-500 text-blue-600 hover:bg-blue-100"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-xs border border-gray-400 text-gray-700 hover:bg-gray-200"
                    >
                      취소
                    </button>
                  </div>
                </>
              ) : (
                comment.content
              )}
            </div>

            {/* 내가 쓴 댓글만 수정/삭제 버튼 보임 */}
            {comment.ownerId === loggedInUserId && editingCommentId !== comment.id && (
              <div className="ml-3 flex flex-col space-y-1">
                <button
                  onClick={() => handleEditComment(comment)}
                  className="btn btn-xs border border-yellow-500 text-yellow-600 hover:bg-yellow-100"
                  title="수정"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="btn btn-xs border border-red-500 text-red-600 hover:bg-red-100"
                  title="삭제"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardDetail;
