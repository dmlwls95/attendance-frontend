import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage        from './pages/LoginPage';
import ProtectedRoute    from './components/ProtectedRoute';
import AdminLayout       from './pages/AdminLayout';
import MonthlySummary    from './pages/MonthlySummary';
import AttendanceHistory from './pages/AttendanceHistory';
import HomePage          from './pages/HomePage';
import UserManagement    from './pages/UserManagement';
import AdminBoardList    from './pages/AdminBoardList';
import BoardDetail       from './pages/BoardDetail';
import BoardWrite        from './pages/BoardWrite';
import BoardEdit         from './pages/BoardEdit';
import UserLayout        from './pages/userpages/UserLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ───────── 로그인 ───────── */}
        <Route path="/" element={<LoginPage />} />

        {/* ───────── 관리자 레이아웃 ───────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* 대시보드(예시) */}
          <Route
            path="home"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* ─ 게시판 ─ */}
          <Route path="board" element={<Navigate to="/admin/board/notice" replace />} />

          <Route
            path="board/:type"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminBoardList />
              </ProtectedRoute>
            }
          />

          <Route
            path="board/write/:type"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <BoardWrite />
              </ProtectedRoute>
            }
          />

          <Route
            path="board/edit/:id/:type"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <BoardEdit />
              </ProtectedRoute>
            }
          />

          <Route
            path="board/detail/:id/:type"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <BoardDetail />
              </ProtectedRoute>
            }
          />

          {/* ─ 출결 및 관리 ─ */}
          <Route
            path="monthlysummary"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <MonthlySummary />
              </ProtectedRoute>
            }
          />

          <Route
            path="attendance"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AttendanceHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="usermanagement"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ───────── 유저 레이아웃 ───────── */}
        <Route
          path="/user"
          element={
            <ProtectedRoute requiredRole="USER">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          {/* 필요 시 유저용 하위 라우트 추가 */}
          {/* <Route path="board" element={<UserBoardList />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;