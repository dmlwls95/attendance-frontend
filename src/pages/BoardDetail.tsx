import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import APIConfig from '../configs/API.config';

const BoardDetail = () => {
  const { id } = useParams(); // URL에서 id 추출
  const [board, setBoard] = useState<any>(null);

  useEffect(() => {
    axios
      .get(`${APIConfig}/admin/board/detail?id=${id}`)
      .then((res) => setBoard(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!board) return <div>로딩중...</div>;

  return (
    <div>
      <h2>{board.title}</h2>
      <p>작성자: {board.writer}</p>
      <p>{board.content}</p>
    </div>
  );
};

export default BoardDetail;