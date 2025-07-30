import React, { useEffect, useState } from 'react';
import APIConfig from '../configs/API.config';

interface BoardPost {
  id: number;
  title: string;
  writer: string;
  writeDate: string;
}

const BoardList: React.FC = () => {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  useEffect(() => {
    fetch(`${APIConfig}/admin/board/list?page=${currentPage}`)
      .then((res) => {
        if (!res.ok) throw new Error('서버 응답 실패');
        return res.json();
      })
      .then((data) => {
        setPosts(data.list);
        setTotalPage(data.totalPage);
      })
      .catch((err) => {
        console.error("게시글 불러오기 실패:", err);
      });
  }, [currentPage]);

  const handleDelete = (id: number) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      fetch(`${APIConfig}/admin/board/delete/${id}`, {
        method: 'DELETE',
      })
        .then((res) => {
          if (!res.ok) throw new Error('삭제 실패');
          setPosts((prev) => prev.filter((post) => post.id !== id));
        })
        .catch((err) => {
          console.error("삭제 실패:", err);
        });
    }
  };

  return (
    <div>
      <h2>📋 게시판</h2>
      <a href="/admin/board/write">
        <button>글쓰기</button>
      </a>
      <table border={1}>
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td>{post.title}</td>
              <td>{post.writer}</td>
              <td>{post.writeDate?.substring(0, 10)}</td>
              <td>
                <button onClick={() => handleDelete(post.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지 네비게이션 */}
      <div>
        {Array.from({ length: totalPage }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            disabled={currentPage === i + 1}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BoardList;