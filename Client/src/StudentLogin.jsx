import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    registerNumber: '',
    dob: '',
    year: '1',
    semester: '1',
    iae: 'IAE1',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData };
      const { data } = await axios.post('http://localhost:5000/api/student/login', payload);
      localStorage.setItem('studentResult', JSON.stringify(data));
      navigate('/student/result');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-panel auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="auth-title" style={{ fontSize: '1.5rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student Login</h2>
          <p className="auth-subtitle" style={{ margin: 0, color: 'var(--text-muted)' }}>Provisional Results Portal</p>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={submitHandler}>
          <div className="input-group">
            <label>Register Number</label>
            <input 
              type="text" 
              name="registerNumber" 
              required 
              placeholder="e.g. 310519104000"
              value={formData.registerNumber} 
              onChange={handleChange} 
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="input-group">
            <label>Date of Birth</label>
            <input 
              type="date" 
              name="dob" 
              required 
              value={formData.dob} 
              onChange={handleChange} 
            />
          </div>

          <div style={{display: 'flex', gap: '15px'}}>
            <div className="input-group" style={{flex: 1}}>
              <label>Year</label>
              <select name="year" value={formData.year} onChange={handleChange}>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            
            <div className="input-group" style={{flex: 1}}>
              <label>Semester</label>
              <select name="semester" value={formData.semester} onChange={handleChange}>
                {[...Array(7)].map((_, i) => (
                  <option key={i+1} value={i+1}>Semester {i+1}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Internal Assessment (IAE)</label>
            <select name="iae" value={formData.iae} onChange={handleChange}>
              <option value="IAE1">IAE 1</option>
              <option value="IAE2">IAE 2</option>
              <option value="IAE3">IAE 3</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '10px', padding: '12px', fontSize: '1.1rem'}}>
            {loading ? <span className="loader"></span> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
