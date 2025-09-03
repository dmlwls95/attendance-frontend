import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import APIConfig from '../configs/API.config';
import BoardCategoryManage from '../components/BoardCategoryManage';


interface BoardPost {
  id: number;
  title: string;
  writer: string;
  writeDate: string;
}

const BoardList: React.FC = () => {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [currentPage, setCurrent] = useState<number>(0);
  const [totalPage, setTotal] = useState<number>(1);
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());
  const [showCategoryManage, setShowCategoryManage] = useState<boolean>(false);

  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const upperType = type?.toUpperCase();

  useEffect(() => {
    if (!upperType) return;
    fetch(`${APIConfig}/admin/adminboard/list/byType?type=${upperType}&page=${currentPage}`)
      .then(res => { if (!res.ok) throw new Error('list fetch fail'); return res.json(); })
      .then(data => {
        setPosts(data.list);
        setTotal(data.totalPage);
        setSelectedPosts(new Set());
      })
      .catch(console.error);
  }, [upperType, currentPage]);

  const boardTypeName = () => {
    switch (upperType) {
      case 'NOTICE': return '공지사항';
      case 'FREE': return '자유게시판';
      case 'SUGGEST': return '건의사항';
      default: return '';
    }
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    fetch(`${APIConfig}/admin/adminboard/delete/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('delete fail');
        setPosts(p => p.filter(v => v.id !== id));
        setSelectedPosts(prev => { const ns = new Set(prev); ns.delete(id); return ns; });
      })
      .catch(console.error);
  };

  const handleDeleteSelected = () => {
    if (selectedPosts.size === 0) { alert('삭제할 게시글을 선택하세요.'); return; }
    if (!window.confirm(`선택한 ${selectedPosts.size}개의 게시글을 정말 삭제하시겠습니까?`)) return;

    const ids = Array.from(selectedPosts).join(',');
    fetch(`${APIConfig}/admin/adminboard/delete/batch?ids=${ids}`, { method: 'DELETE' })
      .then(async res => {
        if (!res.ok) {
          const err = await res.text();
          alert(`삭제 실패: ${err}`);
          throw new Error('batch delete fail');
        }
        setPosts(p => p.filter(post => !selectedPosts.has(post.id)));
        setSelectedPosts(new Set());
      })
      .catch(console.error);
  };

  const toggleSelectPost = (id: number) => setSelectedPosts(prev => {
    const ns = new Set(prev);
    ns.has(id) ? ns.delete(id) : ns.add(id);
    return ns;
  });

  const toggleSelectAll = () => {
    setSelectedPosts(prev => prev.size === posts.length ? new Set() : new Set(posts.map(p => p.id)));
  };

  const goDetail = (id: number) => navigate(`/admin/adminboard/detail/${id}/${type}`);
  const goWrite = () => navigate(`/admin/adminboard/write/${type}`);
  const goEdit = (id: number) => navigate(`/admin/adminboard/edit/${id}/${type}`);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-sans">
      {/* 탭 + 펜 아이콘 (모달 연동) */}
      <div className="tabs justify-center mb-8">
        {['NOTICE','FREE','SUGGEST'].map(bt => (
          <button
            key={bt}
            className={`tab tab-bordered ${upperType === bt && 'tab-active font-semibold'}`}
            onClick={() => navigate(`/admin/adminboard/${bt.toLowerCase()}`)}
          >
            <span className="flex items-center">
              {bt === 'NOTICE' ? '공지사항' : bt === 'FREE' ? '자유게시판' : '건의사항'}
            </span>
          </button>
        ))}
      </div>

      {/* 헤더: 타이틀 + 펜 아이콘 + 글쓰기 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{boardTypeName()}</h2>
          <button
            onClick={() => setShowCategoryManage(true)}
            title="게시판 이름/권한 수정"
            className="p-1 rounded hover:bg-gray-200"
          >
            {/* 흰색 선 펜 SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-gray-600"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 013.022 2.913l-10.5 10.5a4.2 4.2 0 01-1.647 1.05l-3.457 1.153 1.153-3.457a4.2 4.2 0 011.05-1.647l10.5-10.5z" />
            </svg>
          </button>
        </div>
        <button
          onClick={goWrite}
          className="btn btn-sm border border-gray-400 text-gray-700 hover:bg-gray-200"
        >
          글쓰기
        </button>
      </div>

      {/* 선택삭제 버튼 */}
      <div className="mb-4">
        <button
          onClick={handleDeleteSelected}
          disabled={!selectedPosts.size}
          className="btn btn-sm btn-error"
        >
          선택 삭제
        </button>
      </div>

      {/* 게시글 리스트 테이블 */}
      <div className="overflow-x-auto rounded-box shadow">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200 text-sm">
              <th className="w-[8%] text-center">번호</th>
              <th className="w-[45%]">제목</th>
              <th className="w-[15%] text-center">작성자</th>
              <th className="w-[17%] text-center">작성일</th>
              <th className="w-[5%] text-center">
                <input
                  type="checkbox"
                  checked={selectedPosts.size === posts.length && posts.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="w-[10%]">관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.length ? posts.map(p => (
              <tr key={p.id}>
                <td className="text-center">{p.id}</td>
                <td className="cursor-pointer hover:underline" onClick={() => goDetail(p.id)}>{p.title}</td>
                <td className="text-center">{p.writer}</td>
                <td className="text-center">{p.writeDate?.substring(0, 10)}</td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={selectedPosts.has(p.id)}
                    onChange={() => toggleSelectPost(p.id)}
                  />
                </td>
                <td className="px-2">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => goEdit(p.id)}
                      className="btn btn-xs border border-gray-400 text-gray-700 hover:bg-gray-200"
                    >수정</button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="btn btn-xs border border-gray-400 text-gray-700 hover:bg-gray-200"
                    >삭제</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  등록된 게시글이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="join flex justify-center mt-8">
        {Array.from({ length: totalPage }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`join-item btn btn-xs border border-gray-400 text-gray-700 px-3 hover:bg-gray-200 ${currentPage === i && '!bg-gray-300 !border-gray-500'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* 모달 */}
      {showCategoryManage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 text-lg"
              onClick={() => setShowCategoryManage(false)}
            >&times;</button>
            <BoardCategoryManage />
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardList;
