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

  useEffect(() => {
    if (!id) return;

    // 게시글 상세 요청
    axios
      .get(`${APIConfig}/admin/board/detail/${id}`)
      .then((res) => {
        setBoard(res.data);
      })
      .catch((err) => {
        console.error("게시글 요청 실패:", err);
      });

    // 댓글 목록 요청
    axios
      .get(`${APIConfig}/api/comments/${id}`)
      .then((res) => {
        setComments(res.data);
      })
      .catch((err) => {
        console.error("댓글 요청 실패:", err);
      });
  }, [id]);

  const fetchComments = () => {
    axios
      .get(`${APIConfig}/admin/api/comments/${id}`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error(err));
  };

  const handleAddComment = () => {
    if (!writer.trim() || !newComment.trim()) {
      return alert("작성자와 내용을 입력해주세요.");
    }
    console.log("boardId:", id);
    axios
      .post(`${APIConfig}/admin/api/comments`, {
        writer,
        content: newComment,
        boardId: Number(id),
        boardType:board.boardType,
      })
      .then(() => {
        setWriter("");
        setNewComment("");
        fetchComments(); // 등록 후 목록 갱신
      })
      .catch((err) => console.error("댓글 등록 실패:", err));
  };

  const handleDeleteComment = (commentId: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    axios
      .delete(`${APIConfig}/api/comments/${commentId}`)
      .then(() => fetchComments())
      .catch((err) => console.error("댓글 삭제 실패:", err));
  };

  if (!id || !type) return <div>잘못된 접근입니다.</div>;
  if (!board) return <div>로딩중...</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2>{board.title}</h2>
      <p>작성자: {board.writer}</p>
      <p>{board.content}</p>

      <button onClick={() => navigate(`/admin/board/list/${type}`)}>← 목록으로</button>

      <hr />

      <h4>댓글 작성</h4>
      <input
        type="text"
        placeholder="작성자"
        value={writer}
        onChange={(e) => setWriter(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <input
        type="text"
        placeholder="댓글 내용"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        style={{ width: "300px", marginRight: "10px" }}
      />
      <button onClick={handleAddComment}>등록</button>

      <div style={{ marginTop: "20px" }}>
        <h4>댓글 목록</h4>
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} style={{ marginBottom: "0.5em" }}>
              <strong>{c.writer}</strong>: {c.content}
              <button
                onClick={() => handleDeleteComment(c.id)}
                style={{
                  marginLeft: "10px",
                  background: "none",
                  border: "none",
                  color: "red",
                  cursor: "pointer",
                }}
              >
                삭제
              </button>
            </div>
          ))
        ) : (
          <p>댓글이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default BoardDetail;