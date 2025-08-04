import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import APIConfig from '../configs/API.config';

const BoardWrite = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [writer, setWriter] = useState("");
  const { type } = useParams();
  const navigate = useNavigate();

  // 기본값 FREE 처리
  const boardType = type?.toUpperCase() || "FREE";

  const submit = () => {
    axios
      .post(`${APIConfig}/admin/board/write`, {
        title,
        content,
        writer,
        boardType: boardType
      })
      .then(() => {
        alert("글이 등록되었습니다.");
        navigate(`/admin/board/${boardType}`);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h2>글쓰기</h2>
      <input
        type="text"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="작성자"
        value={writer}
        onChange={(e) => setWriter(e.target.value)}
      />
      <textarea
        placeholder="내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={submit}>등록</button>
    </div>
  );
};

export default BoardWrite;