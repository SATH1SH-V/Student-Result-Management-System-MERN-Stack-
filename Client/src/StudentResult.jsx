import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const StudentResult = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('studentResult');
    if (!stored) {
      navigate('/');
    } else {
      setData(JSON.parse(stored));
    }
  }, [navigate]);

  if (!data) return null;

  const { student, result } = data;
  const allPassed = result.passed;
  return (
    <div className="container animate-fade-in" style={{paddingTop: '3rem', maxWidth: '900px'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link to="/student" className="btn btn-primary" style={{ background: '#64748b' }}>
          &larr; Back
        </Link>
        <button onClick={() => window.print()} className="btn btn-primary">
          Print Result
        </button>
      </div>

      <div className="glass-panel" style={{padding: '2rem', marginBottom: '2rem'}}>
        <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--primary-color)', marginBottom: '5px', fontWeight: '800' }}>RESULT PORTAL :: OFFICIAL TRANSCRIPT</h1>
          <h2 style={{ fontSize: '1.2rem', color: '#475569', textTransform: 'uppercase' }}>Provisional Result</h2>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', color: 'var(--text-main)', marginBottom: '2rem'}}>
          <p><strong>Register Number:</strong> {student.registerNumber}</p>
          <p><strong>Name:</strong> {student.studentName}</p>
          {result.department && <p><strong>Branch:</strong> {result.department}</p>}
          <p><strong>Year / Semester:</strong> {result.year} / {result.semester}</p>
          {result.iae && <p><strong>Assessment:</strong> {result.iae}</p>}
        </div>

        <h3 style={{marginBottom: '1rem', color: 'var(--primary-color)', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px'}}>Marks Details</h3>
        <div className="table-container" style={{ marginBottom: '2rem', border: '1px solid #cbd5e1' }}>
          <table>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ color: 'var(--text-main)', background: '#e2e8f0', borderRight: '1px solid #cbd5e1' }}>Subject Name</th>
                <th style={{ color: 'var(--text-main)', background: '#e2e8f0', borderRight: '1px solid #cbd5e1', textAlign: 'center' }}>Marks</th>
                <th style={{ color: 'var(--text-main)', background: '#e2e8f0', textAlign: 'center' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((sub, idx) => {
                const passed = sub.marks !== 'AB' && Number(sub.marks) >= 50;
                return (
                  <tr key={idx}>
                    <td style={{ borderRight: '1px solid #cbd5e1' }}>{sub.name}</td>
                    <td style={{ fontWeight: '600', textAlign: 'center', borderRight: '1px solid #cbd5e1', color: sub.marks === 'AB' ? 'var(--error)' : 'inherit' }}>
                      {sub.marks === 'AB' ? 'AB (Absent)' : sub.marks}
                    </td>
                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: passed ? 'var(--success)' : 'var(--error)' }}>
                      {passed ? 'PASS' : 'FAIL'}
                    </td>
                  </tr>
                );
              })}
              <tr style={{background: '#f8fafc', borderTop: '2px solid #cbd5e1'}}>
                <td style={{fontWeight: 'bold', textAlign: 'right', borderRight: '1px solid #cbd5e1'}}>Total Marks:</td>
                <td style={{fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center', borderRight: '1px solid #cbd5e1'}}>{result.total}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{display: 'flex', gap: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', flexWrap: 'wrap', alignItems: 'center', border: '1px solid #cbd5e1', justifyContent: 'space-around'}}>
          <div style={{ textAlign: 'center' }}>
            <p style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 'bold'}}>Percentage</p>
            <h2 style={{color: 'var(--text-main)', margin: 0}}>{result.percentage}%</h2>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid #cbd5e1', paddingLeft: '30px' }}>
            <p style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 'bold'}}>Grade</p>
            <h2 style={{color: 'var(--text-main)', margin: 0}}>{result.grade}</h2>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid #cbd5e1', paddingLeft: '30px' }}>
            <p style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 'bold'}}>Overall Result</p>
            <h2 style={{
              margin: 0,
              color: allPassed ? 'var(--success)' : 'var(--error)',
              fontWeight: '800'
            }}>
              {allPassed ? 'PASS' : 'FAIL'}
            </h2>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          <p>Disclaimer: The provisional results given in the portal are only for immediate information to the examinees.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentResult;
