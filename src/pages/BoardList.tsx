import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import APIConfig from '../configs/API.config';

interface BoardPost {
  id: number;
  title: string;
  writer: string;
  writeDate: string;
}

const BoardList: React.FC = () => {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0); // 수정됨: 0부터 시작
  const [totalPage, setTotalPage] = useState<number>(1);
  const { type } = useParams();
  const navigate = useNavigate();

  const upperType = type?.toUpperCase();

  useEffect(() => {
    if (!upperType) return;

    const url = `${APIConfig}/admin/board/list/byType?type=${upperType}&page=${currentPage}`;
    console.log("📡 요청 URL:", url);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('서버 응답 실패');
        return res.json();
      })
      .then((data) => {
        console.log("📥 응답 데이터:", data);
        setPosts(data.list);
        setTotalPage(data.totalPage);
      })
      .catch((err) => {
        console.error("게시글 불러오기 실패:", err);
      });
  }, [upperType, currentPage]);

  const handleDelete = (id: number) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      fetch(`${APIConfig}/admin/board/delete/${id}`, { method: 'DELETE' })
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
    navigate(`/admin/board/detail/${id}/${type}`);
  };

  const goWrite = () => {
    navigate(`/admin/board/write/${type}`);
  };

  const boardTypeName = () => {
    switch (upperType) {
      case 'NOTICE': return '공지사항';
      case 'FREE': return '자유게시판';
      case 'SUGGEST': return '건의사항';
      default: return '';
    }
  };

  return (
    <div className="board-container">
      <style>{`
        .board-container { max-width: 900px; margin: 20px auto; font-family: 'Noto Sans KR', sans-serif; }
        .board-menu { margin-bottom: 15px; text-align: center; }
        .board-menu button { margin: 0 10px; padding: 6px 14px; font-size: 0.9rem; cursor: pointer; background: #f0f0f0; border: 1px solid #ccc; }
        .board-menu .active { background: #3c8dbc; color: #fff; border-color: #3c8dbc; }
        .board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .board-header h2 { margin: 0; }
        .write-btn { background: #3c8dbc; color: #fff; border: none; padding: 6px 12px; cursor: pointer; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border-bottom: 1px solid #ddd; text-align: center; }
        .title-cell { text-align: left; cursor: pointer; }
        .title-cell:hover { text-decoration: underline; }
        .delete-btn { background: #e74c3c; color: white; border: none; padding: 4px 8px; cursor: pointer; }
        .pagination { margin-top: 15px; text-align: center; }
        .page-btn { margin: 0 4px; padding: 4px 8px; border: 1px solid #ccc; background: #fff; cursor: pointer; }
        .page-btn.active { background: #3c8dbc; color: #fff; border-color: #3c8dbc; }
      `}</style>

      <div className="board-menu">
        <button className={upperType === 'NOTICE' ? 'active' : ''} onClick={() => navigate('/admin/board/notice')}>공지사항</button>
        <button className={upperType === 'FREE' ? 'active' : ''} onClick={() => navigate('/admin/board/free')}>자유게시판</button>
        <button className={upperType === 'SUGGEST' ? 'active' : ''} onClick={() => navigate('/admin/board/suggest')}>건의사항</button>
      </div>

      <div className="board-header">
        <h2>{boardTypeName()}</h2>
        <button className="write-btn" onClick={goWrite}>✍ 글쓰기</button>
      </div>

      <table>
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
            posts.map((post, index) => (
              <tr key={post.id}>
                <td>{currentPage * 10 + index + 1}</td> {/* 수정됨 */}
                <td className="title-cell" onClick={() => goDetail(post.id)}>{post.title}</td>
                <td>{post.writer}</td>
                <td>{post.writeDate?.substring(0, 10)}</td>
                <td><button className="delete-btn" onClick={() => handleDelete(post.id)}>삭제</button></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>등록된 게시글이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPage }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i)}
            className={`page-btn ${currentPage === i ? 'active' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BoardList;