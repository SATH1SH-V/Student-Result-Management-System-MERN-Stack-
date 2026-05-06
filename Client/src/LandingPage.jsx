import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: '5rem', maxWidth: '1000px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', fontWeight: '800', marginBottom: '10px', letterSpacing: '-1px' }}>
          Student Result Portal
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
          College Examination System
        </p>
      </div>

      <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Student Card */}
        <Link to="/student" className="glass-panel card-hover" style={{ textDecoration: 'none', padding: '3rem 2rem', flex: '1 1 300px', maxWidth: '400px', textAlign: 'center', transition: 'all 0.3s ease', display: 'block', border: '2px solid transparent' }}>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.8rem', fontSize: '1.8rem' }}>Student Portal</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>View your provisional results, print academic transcripts, and track your performance.</p>
        </Link>

        {/* Admin Card */}
        <Link to="/admin" className="glass-panel card-hover" style={{ textDecoration: 'none', padding: '3rem 2rem', flex: '1 1 300px', maxWidth: '400px', textAlign: 'center', transition: 'all 0.3s ease', display: 'block', border: '2px solid transparent' }}>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.8rem', fontSize: '1.8rem' }}>Staff Access</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>Upload assessment marks, manage databases, and generate pass/fail analytical reports.</p>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
