import { BrowserRouter, Route, Routes} from 'react-router-dom';
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
import UserBoardList    from './pages/UserBoardList';
import UserLayout        from './pages/userpages/UserLayout';
import UserHomePage from './pages/userpages/UserHomePage';
import UserWeeklySummary from './pages/userpages/UserWeeklySummary';
import UserAttendanceHistory from './pages/userpages/UserAttendanceHistory';
import UserMonthlySummary from './pages/userpages/UserMonthlySummary';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ───────── 로그인 ───────── */}
        <Route path="/" element={<LoginPage />} />

        {/* ───────── 관리자 레이아웃 ───────── */}
        <Route
          path="admin"
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
          
          <Route
            path="adminboard/:type"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminBoardList />
              </ProtectedRoute>
            }
          />

          <Route
            path="adminboard/write/:type"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <BoardWrite />
              </ProtectedRoute>
            }
          />

          <Route
            path="adminboard/edit/:id/:type"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <BoardEdit />
              </ProtectedRoute>
            }
          />

          <Route
            path="adminboard/detail/:id/:type"
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
          }>
          <Route
            path='home'
            element={
              <ProtectedRoute requiredRole='USER'>
                <UserHomePage/>
              </ProtectedRoute>
            }
          >
          </Route>

          <Route
            path='weeklysummary'
            element={
              <ProtectedRoute requiredRole='USER'>
                <UserWeeklySummary/>
              </ProtectedRoute>
            }
          >
          </Route>

          <Route
            path='monthlysummary'
            element={
              <ProtectedRoute requiredRole='USER'>
                <UserMonthlySummary/>
              </ProtectedRoute>
            }
          >
          </Route>

          <Route
            path='attendancehistory'
            element={
              <ProtectedRoute requiredRole='USER'>
                <UserAttendanceHistory/>
              </ProtectedRoute>
            }
          >
          </Route>


          {/* 필요 시 유저용 하위 라우트 추가 */}
          {/* <Route path="board" element={<UserBoardList />} /> */}
          {/* ─ 게시판 ─ */}
          <Route
            path="userboard/:type"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserBoardList />
              </ProtectedRoute>
            }
          />
                    <Route
            path="userboard/write/:type"
            element={
              <ProtectedRoute requiredRole="USER">
                <BoardWrite />
              </ProtectedRoute>
            }
          />

          <Route
            path="userboard/edit/:id/:type"
            element={
              <ProtectedRoute requiredRole="USER">
                <BoardEdit />
              </ProtectedRoute>
            }
          />

          <Route
            path="userboard/detail/:id/:type"
            element={
              <ProtectedRoute requiredRole="USER">
                <BoardDetail />
              </ProtectedRoute>
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;