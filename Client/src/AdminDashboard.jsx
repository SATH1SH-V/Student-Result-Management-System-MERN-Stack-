import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="container animate-fade-in" style={{paddingTop: '3rem'}}>
      <h1 style={{marginBottom: '2rem', color: 'var(--primary-color)'}}>Admin Dashboard</h1>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px'}}>
        
        <div className="glass-panel" style={{padding: '2rem'}}>
          <h2 style={{marginBottom: '1rem'}}>Upload Results</h2>
          <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>
            Upload exam results using Excel (.xlsx) files. Select year, semester, and IAE to automatically attach metadata.
          </p>
          <Link to="/admin/upload" className="btn btn-primary">
            Go to Upload
          </Link>
        </div>

        <div className="glass-panel" style={{padding: '2rem'}}>
          <h2 style={{marginBottom: '1rem'}}>Manage Results</h2>
          <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>
            View, edit or delete previously uploaded student results. Search results easily by student registration number.
          </p>
          <Link to="/admin/manage" className="btn btn-primary" style={{background: '#64748b', border: '1px solid var(--border-color)'}}>
            Manage Database
          </Link>
        </div>

        <div className="glass-panel" style={{padding: '2rem'}}>
          <h2 style={{marginBottom: '1rem'}}>Pass / Fail Report</h2>
          <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>
            View a detailed pass/fail breakdown filtered by Year, Semester, IAE, and Department. Includes pass rate analytics.
          </p>
          <Link to="/admin/report" className="btn btn-primary" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>
            View Report
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
