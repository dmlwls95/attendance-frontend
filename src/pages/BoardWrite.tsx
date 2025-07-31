import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import APIConfig from '../configs/API.config';

const BoardWrite = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [writer, setWriter] = useState("");
  const navigate = useNavigate();

  const submit = () => {
    if (!title || !content || !writer) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
//111
    axios
      .post(`${APIConfig}/admin/board/write`, { title, content, writer })
      .then((res) => {
        alert(res.data.message); // "글이 등록되었습니다."
        navigate("/admin/board");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="write-container">
      <style>{`
        .write-container {
          max-width: 700px;
          margin: 40px auto;
          padding: 30px;
          background: #fdfdfd;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-family: 'Noto Sans KR', sans-serif;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
        }

        h2 {
          font-size: 1.6rem;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }

        input[type="text"],
        textarea {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
          box-sizing: border-box;
        }

        textarea {
          height: 180px;
          resize: vertical;
        }

        .submit-btn {
          display: block;
          margin-left: auto;
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .submit-btn:hover {
          background-color: #0056b3;
        }
      `}</style>

      <h2>✍ 글쓰기</h2>

      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="내용을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <input
        type="text"
        placeholder="작성자 이름을 입력하세요"
        value={writer}
        onChange={(e) => setWriter(e.target.value)}
      />

      <button className="submit-btn" onClick={submit}>등록</button>
    </div>
  );
};

export default BoardWrite;