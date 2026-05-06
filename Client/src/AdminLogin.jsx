import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/admin/login', { username, password });
      localStorage.setItem('adminInfo', JSON.stringify(data));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-panel auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="auth-title" style={{ fontSize: '1.5rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Staff Portal</h2>
          <p className="auth-subtitle" style={{ margin: 0, color: 'var(--text-muted)' }}>Secure result management access</p>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={submitHandler}>
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              required 
              placeholder="Enter admin username"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="Enter password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{showPassword ? "HIDE" : "SHOW"}</span>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '10px'}}>
            {loading ? <span className="loader"></span> : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
