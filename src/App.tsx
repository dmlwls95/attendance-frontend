
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
<<<<<<< HEAD
import BoardList from './pages/BoardList';
=======
>>>>>>> 8932ae1c1ca3ff2e63b5dd105654243ac5a9002b

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
<<<<<<< HEAD
            <Route path="/admin/board" element={
            <ProtectedRoute requiredRole="ADMIN">
               <BoardList />
            </ProtectedRoute>
            }
/>
=======
            {/*<Route path="/admin/userdetail" element={
              <ProtectedRoute requiredRole="ADMIN">
              <UserDetail />
            </ProtectedRoute>
            }/>*/}
>>>>>>> 8932ae1c1ca3ff2e63b5dd105654243ac5a9002b
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
