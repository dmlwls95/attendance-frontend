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

  const BOARD_ICON_SRC = "/boardicon.svg";
  const COMMUNITY_ICON_SRC = "/Community.svg";

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
      .then(data => { setPosts(data.list); setTotal(data.totalPage); })
      .catch(console.error);
  }, [upperType, currentPage]);

  /* ───────── handlers ───────── */
  const handleDelete = (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    fetch(`${APIConfig}/user/userboard/delete/${id}`, { method: 'DELETE' })
      .then(res => { if (!res.ok) throw new Error('delete fail'); setPosts(p => p.filter(v => v.id !== id)); })
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
    <div className="flex flex-col gap-7">
      <div className="bg-gray-500 text-white flex justify-start items-center w-full h-16 rounded-xl gap-4">
        <img
          src={COMMUNITY_ICON_SRC}
          className="w-10 h-10 ml-6"
        />
        <p className="text-2xl font-bold">사내 커뮤니티</p>
      </div>

      <div className="flex flex-l h-full gap-4">

        {/* 탭 메뉴 */}
        <div className="w-1/5 border-2 border-gray-500 rounded-xl p-6">
          <div className="flex flex-col tabs gap-4">
            <div className="text-2xl font-semibold text-center">
              게시판
            </div>
            <hr className="border-1 border-gray-500" />
            <ul className="list-disc list-outside pl-6 space-y-3">
              <li>
                <button
                  className={`tab tab-bordered text-xl hover:border-transparent ${upperType === 'NOTICE' && 'tab-active font-semibold'}`}
                  onClick={() => navigate('/user/userboard/notice')}
                >
                  공지사항
                </button>
              </li>
              <li>
                <button
                  className={`tab tab-bordered text-xl hover:border-transparent ${upperType === 'FREE' && 'tab-active font-semibold'}`}
                  onClick={() => navigate('/user/userboard/free')}
                >
                  자유게시판
                </button>
              </li>
              <li>
                <button
                  className={`tab tab-bordered text-xl hover:border-transparent ${upperType === 'SUGGEST' && 'tab-active font-semibold'}`}
                  onClick={() => navigate('/user/userboard/suggest')}
                >
                  건의사항
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* 헤더 */}
        <div className="w-4/5 border-2 border-gray-500 rounded-xl p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center justify-between gap-2 pl-2">
              <img
                src={BOARD_ICON_SRC}
                className="w-7 h-7"
              />
              <p className="text-2xl font-bold">{boardTypeName()}</p>
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
          <div className="overflow-x-auto border-2 border-gray-500 rounded-box shadow min-h-[540px]">
            <table className="table">
              <thead>
                <tr className="bg-gray-500 text-white text-sm">
                  <th className="w-1/12 text-center">번호</th>
                  <th className="w-5/12 text-left">제목</th>
                  <th className="w-2/12 text-center">작성자</th>
                  <th className="w-2/12 text-center">작성일</th>
                  <th className="w-2/12 text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {posts.length ? (
                  posts.map((p) => (
                    <tr key={p.id}>
                      <td className="text-center">{p.id}</td>
                      <td className="text-left cursor-pointer hover:underline" onClick={() => goDetail(p.id)}>{p.title}</td>
                      <td className="text-center">{p.writer}</td>
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
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      등록된 게시글이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 기존*/}
          {/* <div className="w-full flex justify-center mt-8">
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
        </div> */}

          {/* 페이지네이션 수정*/}
          <div className="w-full flex justify-center items-center pt-5">
            <div className="join">
              {(() => {
                const pageBlock = 5;
                const blockIndex = Math.floor(currentPage / pageBlock);
                const startPage = blockIndex * pageBlock;
                const endPage = Math.min(startPage + pageBlock, totalPage);

                const buttons = [];

                // 맨 앞으로
                buttons.push(
                  <button
                    key="first"
                    onClick={() => setCurrent(0)}
                    className="join-item btn btn-xs border border-gray-400 text-gray-500 hover:border-transparent"
                  >
                    {'<<'}
                  </button>
                );

                // 이전 버튼
                if (startPage > 0) {
                  buttons.push(
                    <button
                      key="prev"
                      onClick={() => setCurrent(startPage - 1)}
                      className="join-item btn btn-xs border border-gray-400 text-gray-500 hover:border-gray-500"
                    >
                      {'<'}
                    </button>
                  );
                }

                // 현재 block의 페이지 번호 버튼들
                for (let i = startPage; i < endPage; i++) {
                  buttons.push(
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`join-item btn btn-xs border border-gray-400 text-gray-500 px-3 hover:bg-gray-200 hover:border-gray-500
                    ${currentPage === i ? '!bg-gray-300 !border-gray-500 font-semibold' : ''}`}
                    >
                      {i + 1}
                    </button>
                  );
                }

                // 다음 버튼
                if (endPage < totalPage) {
                  buttons.push(
                    <button
                      key="next"
                      onClick={() => setCurrent(endPage)}
                      className="join-item btn btn-xs border border-gray-400 text-gray-500 hover:border-gray-500"
                    >
                      {'>'}
                    </button>
                  );
                }

                //맨 뒤로
                buttons.push(
                  <button
                    key="last"
                    onClick={() => setCurrent(totalPage - 1)}
                    className="join-item btn btn-xs border border-gray-400 text-gray-500 hover:border-gray-500"
                  >
                    {'>>'}
                  </button>
                );
                return buttons;
              })()}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default BoardList;