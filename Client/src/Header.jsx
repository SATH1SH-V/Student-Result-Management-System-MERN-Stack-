import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const adminInfo = localStorage.getItem('adminInfo');

  const logoutHandler = () => {
    localStorage.removeItem('adminInfo');
    navigate('/admin');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" style={{ display: 'flex', flexDirection: 'column', gap: '2px', textDecoration: 'none' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.02em', color: '#ffffff' }}>Result Portal</span>
        <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Result Management System</span>
      </Link>
      <div className="nav-links">
        {adminInfo ? (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/upload">Upload</Link>
            <Link to="/admin/manage">Manage</Link>
            <a href="#" onClick={logoutHandler} style={{fontWeight: 'bold', color: '#fca5a5'}}>Logout</a>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/student">Student Login</Link>
            <Link to="/admin">Staff Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
