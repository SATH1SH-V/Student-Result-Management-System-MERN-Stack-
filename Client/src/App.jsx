import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import StudentResult from './pages/StudentResult';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UploadExcel from './pages/UploadExcel';
import ManageResults from './pages/ManageResults';
import PassFailReport from './pages/PassFailReport';

// Simple guard for admin routes
const AdminRoute = ({ children }) => {
  const adminInfo = localStorage.getItem('adminInfo');
  return adminInfo ? children : <Navigate to="/admin" />;
};

function App() {
  return (
    <Router>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/student" element={<StudentLogin />} />
          <Route path="/student/result" element={<StudentResult />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/upload" element={
            <AdminRoute><UploadExcel /></AdminRoute>
          } />
          <Route path="/admin/manage" element={
            <AdminRoute><ManageResults /></AdminRoute>
          } />
          <Route path="/admin/report" element={
            <AdminRoute><PassFailReport /></AdminRoute>
          } />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
