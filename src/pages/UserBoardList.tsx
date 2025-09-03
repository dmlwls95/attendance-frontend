import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import APIConfig from '../configs/API.config';

interface BoardPost {
  id: number;
  title: string;
  writer: string;
  writeDate: string;
  recommendCount: number;   // 추가
  commentCount: number;     // 추가
}

const BoardList: React.FC = () => {

  const BOARD_ICON_SRC = "/boardicon.svg";

  /* ───────── state ───────── */
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [currentPage, setCurrent] = useState<number>(0);   // 0-base
  const [totalPage, setTotal] = useState<number>(1);

  /* ───────── route params ───────── */
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const upperType = type?.toUpperCase();                   // NOTICE | FREE | SUGGEST
  const isNotice = upperType === 'NOTICE';

  /* ───────── fetch list ───────── */
  useEffect(() => {
    if (!upperType) return;
    fetch(`${APIConfig}/user/userboard/list/byType?type=${upperType}&page=${currentPage}`)
      .then(res => { if (!res.ok) throw new Error('list fetch fail'); return res.json(); })
      .then(data => { 
        setPosts(data.list); 
        setTotal(data.totalPage); 
      })
      .catch(console.error);
  }, [upperType, currentPage]);

  /* ───────── handlers ───────── */
  const handleDelete = (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    fetch(`${APIConfig}/user/userboard/delete/${id}`, { method: 'DELETE' })
      .then(res => { 
        if (!res.ok) throw new Error('delete fail'); 
        setPosts(p => p.filter(v => v.id !== id)); 
      })
      .catch(console.error);
  };

  const goDetail = (id: number) => navigate(`/user/userboard/detail/${id}/${type}`);
  const goWrite = () => {
    if (isNotice) {
      alert("공지사항은 관리자만 작성할 수 있습니다");
      return;
    }
    navigate(`/user/userboard/write/${type}`);
  };
  const goEdit = (id: number) => navigate(`/user/userboard/edit/${id}/${type}`);

  const boardTypeName = () => {
    switch (upperType) {
      case 'NOTICE': return '공지사항';
      case 'FREE': return '자유게시판';
      case 'SUGGEST': return '건의사항';
      default: return '';
    }
  };

  /* ───────── view ───────── */
  return (
    <div className="mx-auto font-sans h-screen">

      {/* 탭 메뉴 */}
      <div className="tabs justify-center mb-8">
        <button className={`tab tab-bordered text-2xl ${upperType === 'NOTICE' && 'tab-active font-semibold'}`}
          onClick={() => navigate('/user/userboard/notice')}>공지사항</button>
        <button className={`tab tab-bordered text-2xl ${upperType === 'FREE' && 'tab-active font-semibold'}`}
          onClick={() => navigate('/user/userboard/free')}>자유게시판</button>
        <button className={`tab tab-bordered text-2xl ${upperType === 'SUGGEST' && 'tab-active font-semibold'}`}
          onClick={() => navigate('/user/userboard/suggest')}>건의사항</button>
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-between gap-2 pl-2">
          <img
            src={BOARD_ICON_SRC}
            className="w-7 h-7"
          />
          <h2 className="text-2xl font-bold">{boardTypeName()}</h2>
        </div>
        {/* ▶ 글쓰기 버튼 (무채색) */}
        <button
          className="btn btn-sm border border-gray-400 text-gray-700 hover:bg-gray-200 hover:border-gray-500"
          onClick={goWrite}
        >
          글쓰기
        </button>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-box shadow">
        <table className="table">
          <thead>
            <tr className="bg-gray-500 text-sm">
              <th className="w-1/12 text-center">번호</th>
              <th className="w-5/12 text-left">제목</th>
              <th className="w-1/12 text-center">작성자</th>
              <th className="w-1/12 text-center">👍</th>      {/* 추가 */}
              <th className="w-2/12 text-center">작성일</th>
              <th className="w-1/12 text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.length ? (
              posts.map((p, i) => (
                <tr key={p.id}>
                  <td className="text-center">{p.id}</td>
                  <td className="text-left cursor-pointer hover:underline" onClick={() => goDetail(p.id)}>
                  {p.title} ({p.commentCount})</td>
                  <td className="text-center">{p.writer}</td>
                  <td className="text-center">{p.recommendCount}</td>     {/* 추가 */}
                  <td className="text-center">{p.writeDate?.substring(0, 10)}</td>

                  {/* ▶ 수정 / 삭제 버튼 */}
                  <td className="px-2">
                    <div className="flex justify-center gap-2">
                      <button
                        className="btn btn-xs border border-gray-400 text-gray-700 hover:bg-gray-200 hover:border-gray-500"
                        onClick={() => goEdit(p.id)}
                      >
                        수정
                      </button>
                      <button
                        className="btn btn-xs border border-gray-400 text-gray-700 hover:bg-gray-200 hover:border-gray-500"
                        onClick={() => handleDelete(p.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  등록된 게시글이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="w-full flex justify-center mt-8">
        <div className="join">
          {Array.from({ length: totalPage }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`join-item btn btn-xs border border-gray-400 text-gray-700 px-3
                    hover:bg-gray-200 hover:border-gray-500
                    ${currentPage === i && '!bg-gray-300 !border-gray-500'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardList;
