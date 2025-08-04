import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import APIConfig from '../configs/API.config';

const BoardDetail = () => {
  const { id, type } = useParams();
  const [board, setBoard] = useState<any>(null);
  const navigate = useNavigate();

useEffect(() => {
  if (!id) return;

  const detailUrl = `${APIConfig}/admin/board/detail/${id}`;

  axios
    .get(detailUrl)
    .then((res) => {
      setBoard(res.data);
    })
    .catch((err) => {
      console.error("게시글 요청 실패:", err);
    });
}, [id]);

  if (!id || !type) return <div>잘못된 접근입니다.</div>;
  if (!board) return <div>로딩중...</div>;

  return (
    <div>
      <h2>{board.title}</h2>
      <p>작성자: {board.writer}</p>
      <p>{board.content}</p>
      <button onClick={() => navigate(`/admin/board/list/${type}`)}>← 목록으로</button>
    </div>
  );
};

export default BoardDetail;
