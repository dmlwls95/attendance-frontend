import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import APIConfig from "../configs/API.config";

interface Comment {
  id: number;
  writer: string;
  content: string;
  createdAt: string;
}

const BoardDetail = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [writer, setWriter] = useState("");
  const [newComment, setNewComment] = useState("");

  /* ───────────────────── 데이터 로딩 ───────────────────── */
  useEffect(() => {
    if (!id) return;

    // 게시글
    axios
      .get(`${APIConfig}/admin/board/detail/${id}`)
      .then((res) => setBoard(res.data))
      .catch((err) => console.error("게시글 요청 실패:", err));

    // 댓글
    axios
      .get(`${APIConfig}/api/comments/${id}`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error("댓글 요청 실패:", err));
  }, [id]);

  const fetchComments = () => {
    axios
      .get(`${APIConfig}/api/comments/${id}`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error(err));
  };

  /* ───────────────────── 댓글 등록 ───────────────────── */
  const handleAddComment = () => {
    if (!writer.trim() || !newComment.trim()) {
      alert("작성자와 내용을 입력해주세요.");
      return;
    }

    axios
      .post(`${APIConfig}/api/comments`, {
        writer,
        content: newComment,
        boardId: Number(id),
        boardType: board.boardType, // 백엔드에서 필요시 사용
      })
      .then(() => {
        setWriter("");
        setNewComment("");
        fetchComments();
      })
      .catch((err) => console.error("댓글 등록 실패:", err));
  };

  /* ───────────────────── 댓글 삭제 ───────────────────── */
  const handleDeleteComment = (commentId: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    axios
      .delete(`${APIConfig}/api/comments/${commentId}`)
      .then(() => fetchComments())
      .catch((err) => console.error("댓글 삭제 실패:", err));
  };

  /* ───────────────────── 렌더링 ───────────────────── */
  if (!id || !type) return <div>잘못된 접근입니다.</div>;
  if (!board) return <div>로딩중...</div>;

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Malgun Gothic, sans-serif",
      }}
    >
      {/* 게시글 본문 */}
      <h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        borderBottom: '2px solid #ddd',
        paddingBottom: '10px',
        marginBottom: '20px'
      }}>
        제목 : {board.title}
      </h2>
      <p style={{ color: "#555", margin: "4px 0 14px 0" }}>
        작성자: <strong>{board.writer}</strong>
      </p>
      <div
        style={{
          padding: "20px",
          border: "1px solid #e2e2e2",
          borderRadius: "4px",
          background: "#fafafa",
          lineHeight: 1.6,
          whiteSpace: "pre-line",
        }}
      >
        {board.content}
      </div>

      <button
        onClick={() => navigate(`/admin/board/${type}`)}
        style={{
          marginTop: "20px",
          padding: "6px 14px",
          background: "#5b97f2",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        ← 목록으로
      </button>

      {/* ─────────── 댓글 입력 ─────────── */}
      <div
        style={{
          borderTop: "2px solid #555",
          marginTop: "40px",
          paddingTop: "15px",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0" }}>댓글 작성</h4>

        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="닉네임"
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
            style={{
              width: "120px",
              padding: "6px 8px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="text"
            placeholder="여러분의 한마디 (최대 200자)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "6px 8px",
              border: "1px solid #ccc",
            }}
            maxLength={200}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddComment();
            }}
          />
          <button
            onClick={handleAddComment}
            style={{
              background: "#5b97f2",
              color: "#fff",
              border: "none",
              padding: "6px 14px",
              cursor: "pointer",
            }}
          >
            등록
          </button>
        </div>
      </div>

      {/* ─────────── 댓글 목록 ─────────── */}
      <div style={{ marginTop: "25px" }}>
        <h4 style={{ margin: "0 0 10px 0" }}>
          댓글{" "}
          <span style={{ color: "#5b97f2" }}>{comments.length}</span>
        </h4>

        {comments.length === 0 && (
          <div
            style={{
              color: "#888",
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            아직 댓글이 없습니다.
          </div>
        )}

        {comments.map((c, idx) => (
          <div
            key={c.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              padding: "10px 0",
              borderTop:
                idx === 0 ? "2px solid #d5d5d5" : "1px solid #eee",
              fontSize: "14px",
            }}
          >
            {/* 닉네임 · 시각 */}
            <div
              style={{
                width: "160px",
                color: "#1e90ff",
                fontWeight: 600,
              }}
            >
              {c.writer}
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "#999",
                  fontWeight: 400,
                  marginTop: "2px",
                }}
              >
                {c.createdAt?.substring(0, 16).replace("T", " ")}
              </span>
            </div>

            {/* 내용 */}
            <div
              style={{
                flex: 1,
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              {c.content}
            </div>

            {/* 삭제 */}
            <button
              onClick={() => handleDeleteComment(c.id)}
              style={{
                marginLeft: "12px",
                background: "none",
                border: "1px solid #ccc",
                color: "#666",
                fontSize: "12px",
                padding: "3px 8px",
                cursor: "pointer",
              }}
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