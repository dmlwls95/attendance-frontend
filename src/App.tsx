
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
//import MonthlySummary from './pages/MonthlySummary'
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/AdminLayout';
import MonthlySummary from './pages/MonthlySummary';
import AttendanceHistory from './pages/AttendanceHistory';
import HomePage from './pages/HomePage';
//import UserDetail from './pages/UserDetail';
import UserManagement from './pages/UserManagement';
//import MonthlySummary from './pages/MonthlySummary'
import BoardList from './pages/BoardList';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
          
            <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
            }>
            <Route path="/admin/home" element={
            <ProtectedRoute requiredRole="ADMIN">
              <HomePage />
            </ProtectedRoute>
            }/>
            
{/* 커밋테스트 */}
            <Route path="/admin/monthlysummary" element={
              <ProtectedRoute requiredRole="ADMIN">
              <MonthlySummary />
            </ProtectedRoute>
            }/>
            <Route path="/admin/attendance" element={
              <ProtectedRoute requiredRole="ADMIN">
              <AttendanceHistory />
            </ProtectedRoute>
            }/>
            <Route path="/admin/board" element={
            <ProtectedRoute requiredRole="ADMIN">
               <BoardList />
            </ProtectedRoute>
            }
/>
            <Route path="/admin/usermanagement" element={
              <ProtectedRoute requiredRole="ADMIN">
              <UserManagement />
            </ProtectedRoute>
            }/>
          </Route>

            
      </Routes>
    </BrowserRouter>

    //<LoginPage />
    //<MonthlySummary /> 
  );
}

export default App
