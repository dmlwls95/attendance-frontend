import React, { useEffect, useState } from 'react';
import APIConfig from '../configs/API.config';

interface BoardCategory {
  boardType: string;
  name: string;
  writePermissionAdminOnly: boolean;
}

const BoardCategoryManage: React.FC = () => {
  const [categories, setCategories] = useState<BoardCategory[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPermission, setEditPermission] = useState(false);

  useEffect(() => {
    fetch(`${APIConfig}/admin/boardcategory/list`)
      .then(res => {
        if (!res.ok) throw new Error('카테고리 목록 불러오기 실패');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('응답이 배열이 아닙니다:', data);
          setCategories([]);
        }
      })
      .catch(err => {
        console.error('API 호출 에러:', err);
        setCategories([]);
      });
  }, []);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditName(categories[index].name);
    setEditPermission(categories[index].writePermissionAdminOnly);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditName('');
  };

  const saveEdit = async () => {
    if (editingIndex === null) return;
    const category = categories[editingIndex];

    try {
      const res = await fetch(`${APIConfig}/admin/boardcategory/${category.boardType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          writePermissionAdminOnly: editPermission,
        }),
      });

      if (!res.ok) throw new Error('수정 실패');

      const updatedCategory = await res.json();
      const newCategories = [...categories];
      newCategories[editingIndex] = updatedCategory;
      setCategories(newCategories);
      cancelEdit();
    } catch (e) {
      alert('수정 중 오류가 발생했습니다.');
      console.error(e);
    }
  };

  const PencilIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 inline-block"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.232 5.232l3.536 3.536M9 11l6 6m2.121-11.879a2.5 2.5 0 113.536 3.536l-10 10a2 2 0 01-.878.515l-4 1a1 1 0 01-1.213-1.212l1-4a2 2 0 01.515-.878l10-10z"
      />
    </svg>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-6">게시판 관리</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">게시판 종류</th>
            <th className="border border-gray-300 p-2">게시판 이름</th>
            <th className="border border-gray-300 p-2">글쓰기 권한 (관리자만)</th>
            <th className="border border-gray-300 p-2">관리</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((cat, idx) => (
              <tr key={cat.boardType}>
                <td className="border border-gray-300 p-2">{cat.boardType}</td>
                <td className="border border-gray-300 p-2">
                  {editingIndex === idx ? (
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="border border-gray-400 p-1 w-full text-black"
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {editingIndex === idx ? (
                    <input
                      type="checkbox"
                      checked={editPermission}
                      onChange={e => setEditPermission(e.target.checked)}
                    />
                  ) : (
                    cat.writePermissionAdminOnly ? '예' : '아니오'
                  )}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {editingIndex === idx ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="mr-2 px-2 py-1 bg-green-500 text-white rounded"
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2 py-1 bg-gray-400 text-white rounded"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(idx)}
                      className="text-blue-500 hover:text-blue-700"
                      title="수정"
                    >
                      {PencilIcon}
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center p-4">
                로딩 중이거나 게시판 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BoardCategoryManage;
