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
  /* ───────── state ───────── */
  const [posts, setPosts]         = useState<BoardPost[]>([]);
  const [currentPage, setCurrent] = useState<number>(0);   // 0-base
  const [totalPage, setTotal]     = useState<number>(1);

  /* ───────── route params ───────── */
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const upperType = type?.toUpperCase();                   // NOTICE | FREE | SUGGEST

  /* ───────── fetch list ───────── */
  useEffect(() => {
    if (!upperType) return;
    const url = `${APIConfig}/admin/board/list/byType?type=${upperType}&page=${currentPage}`;
    fetch(url)
      .then(res => { if (!res.ok) throw new Error('list fetch fail'); return res.json(); })
      .then(data => { setPosts(data.list); setTotal(data.totalPage); })
      .catch(console.error);
  }, [upperType, currentPage]);

  /* ───────── handlers ───────── */
  const handleDelete = (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    fetch(`${APIConfig}/admin/board/delete/${id}`, { method: 'DELETE' })
      .then(res => { if (!res.ok) throw new Error('delete fail'); setPosts(p => p.filter(v => v.id !== id)); })
      .catch(console.error);
  };

  const goDetail = (id: number) => navigate(`/admin/board/detail/${id}/${type}`);
  const goWrite  = ()            => navigate(`/admin/board/write/${type}`);

  const boardTypeName = () => {
    switch (upperType) {
      case 'NOTICE':  return '공지사항';
      case 'FREE':    return '자유게시판';
      case 'SUGGEST': return '건의사항';
      default:        return '';
    }
  };

  /* ───────── view ───────── */
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-sans">

      {/* 탭 메뉴 (무채색) */}
      <div className="tabs justify-center mb-8">
        <button className={`tab tab-bordered ${upperType === 'NOTICE'  && 'tab-active font-semibold'}`}
                onClick={() => navigate('/admin/board/notice')}>공지사항</button>
        <button className={`tab tab-bordered ${upperType === 'FREE'    && 'tab-active font-semibold'}`}
                onClick={() => navigate('/admin/board/free')}>자유게시판</button>
        <button className={`tab tab-bordered ${upperType === 'SUGGEST' && 'tab-active font-semibold'}`}
                onClick={() => navigate('/admin/board/suggest')}>건의사항</button>
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{boardTypeName()}</h2>
        <button className="btn btn-sm btn-outline" onClick={goWrite}>글쓰기</button>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-box shadow">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200 text-sm">
              <th className="w-[8%]">번호</th>
              <th className="w-[50%]">제목</th>
              <th className="w-[15%]">작성자</th>
              <th className="w-[17%]">작성일</th>
              <th className="w-[10%]">관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.length ? (
              posts.map((p, i) => (
                <tr key={p.id}>
                  <td className="text-center">{currentPage * 10 + i + 1}</td>
                  <td className="cursor-pointer hover:underline" onClick={() => goDetail(p.id)}>{p.title}</td>
                  <td className="text-center">{p.writer}</td>
                  <td className="text-center">{p.writeDate?.substring(0, 10)}</td>
                  <td className="text-center">
                    <button className="btn btn-xs btn-outline" onClick={() => handleDelete(p.id)}>삭제</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="py-8 text-center text-gray-500">등록된 게시글이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="join flex justify-center mt-8">
        {Array.from({ length: totalPage }, (_, i) => (
          <button key={i}
                  onClick={() => setCurrent(i)}
                  className={`join-item btn btn-xs btn-outline px-3
                              ${currentPage === i && '!bg-gray-600 !text-white !border-gray-600'}`}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BoardList;