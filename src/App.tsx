import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/AdminLayout';
import MonthlySummary from './pages/MonthlySummary';
import AttendanceHistory from './pages/AttendanceHistory';
import HomePage from './pages/HomePage';
import UserManagement from './pages/UserManagement';
import BoardList from './pages/BoardList';
import BoardDetail from './pages/BoardDetail';
import BoardWrite from './pages/BoardWrite';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 페이지 */}
        <Route path="/" element={<LoginPage />} />

        {/* 관리자 레이아웃 */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="home"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* 게시판 메뉴 및 기능 */}
          <Route path="board" element={<Navigate to="/admin/board/notice" replace />} />
          <Route
            path="board/:type"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <BoardList />
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
            path="board/detail/:id"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <BoardDetail />
              </ProtectedRoute>
            }
          />

          {/* 출결 및 관리 */}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
