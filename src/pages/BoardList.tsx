import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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

  const goDetail = (id: number) => {
    navigate(`/board/detail/${id}`);
  };

  const goWrite = () => {
    navigate(`/admin/board/write`);
  };

  return (
    <div className="dc-board-container">
      <style>{`
        .dc-board-container {
          max-width: 980px;
          margin: 20px auto;
          background: #ffffff;
          border: 1px solid #dcdcdc;
          font-family: 'Noto Sans KR', sans-serif;
        }

        .dc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #ccc;
          background: #f8f8f8;
        }

        .dc-header h2 {
          font-size: 1.4rem;
          margin: 0;
        }

        .dc-write-btn {
          background-color: #3c8dbc;
          border: none;
          color: white;
          padding: 7px 12px;
          border-radius: 3px;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .dc-write-btn:hover {
          background-color: #2c6fa5;
        }

        .dc-table {
          width: 100%;
          border-collapse: collapse;
        }
        .dc-table th {
          background: #efefef;
          padding: 10px;
          border-bottom: 2px solid #dcdcdc;
          font-size: 0.95rem;
        }
        .dc-table td {
          padding: 10px;
          border-bottom: 1px solid #eee;
          font-size: 0.9rem;
          text-align: center;
        }
        .dc-title-cell {
          text-align: left;
          cursor: pointer;
          color: #333;
        }
        .dc-title-cell:hover {
          text-decoration: underline;
          color: #3c8dbc;
        }
        .dc-delete-btn {
          background: #e74c3c;
          color: #fff;
          border: none;
          padding: 4px 7px;
          font-size: 0.8rem;
          border-radius: 3px;
          cursor: pointer;
        }
        .dc-delete-btn:hover {
          background: #c0392b;
        }

        .dc-pagination {
          text-align: center;
          padding: 12px 0;
          border-top: 1px solid #ddd;
        }
        .dc-page-btn {
          margin: 0 3px;
          padding: 5px 9px;
          font-size: 0.85rem;
          border: 1px solid #ccc;
          background: #fff;
          cursor: pointer;
        }
        .dc-page-btn.active {
          background: #3c8dbc;
          color: #fff;
          border-color: #3c8dbc;
        }
      `}</style>

      <div className="dc-header">
        <h2>자유게시판</h2>
        <button className="dc-write-btn" onClick={goWrite}>✍ 글쓰기</button>
      </div>

      <table className="dc-table">
        <thead>
          <tr>
            <th style={{ width: "8%" }}>번호</th>
            <th style={{ width: "50%" }}>제목</th>
            <th style={{ width: "15%" }}>작성자</th>
            <th style={{ width: "17%" }}>작성일</th>
            <th style={{ width: "10%" }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {posts.length > 0 ? (
            posts.map((post) => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td className="dc-title-cell" onClick={() => goDetail(post.id)}>
                  {post.title}
                </td>
                <td>{post.writer}</td>
                <td>{post.writeDate?.substring(0, 10)}</td>
                <td>
                  <button className="dc-delete-btn" onClick={() => handleDelete(post.id)}>삭제</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>등록된 게시글이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="dc-pagination">
        {Array.from({ length: totalPage }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`dc-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BoardList;