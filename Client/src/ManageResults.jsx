import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const selectStyle = { padding: '12px', borderRadius: '8px', background: '#ffffff', color: 'var(--text-main)', border: '1px solid var(--border-color)' };

const ManageResults = () => {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchResults = async () => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/admin/results', config);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResults(); }, []);

  // Derive unique departments from loaded data
  const departments = [...new Set(results.map(r => r.department).filter(Boolean))].sort();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
        await axios.delete(`http://localhost:5000/api/admin/results/${id}`, config);
        fetchResults();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const editHandler = async (result) => {
    const newName = window.prompt('Enter new student name:', result.studentName);
    if (newName === null) return;
    const newDept = window.prompt('Enter new department:', result.department || '');
    if (newDept === null) return;
    const newDob = window.prompt('Enter new DOB (YYYY-MM-DD):', result.dob);
    if (newDob === null) return;
    const newTotal = window.prompt('Enter new total marks:', result.total);
    if (newTotal === null) return;
    const newPercentage = window.prompt('Enter new percentage:', result.percentage);
    if (newPercentage === null) return;
    const newGrade = window.prompt('Enter new grade:', result.grade);
    if (newGrade === null) return;

    try {
      const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      
      // Auto-calculate passed status based on grade/marks if possible, 
      // but for manual edit, we trust use input or forced 'F' logic.
      const isPass = newGrade.toUpperCase() !== 'F';

      await axios.put(`http://localhost:5000/api/admin/results/${result._id}`, {
        studentName: newName,
        department: newDept,
        dob: newDob,
        total: Number(newTotal),
        percentage: Number(newPercentage),
        grade: newGrade,
        passed: isPass
      }, config);
      fetchResults();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const [filters, setFilters] = useState({ year: 'all', semester: 'all', iae: 'all', department: 'all' });
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleBulkDelete = async () => {
    const { year, semester, iae } = filters;
    const activeFilters = [];
    if (year !== 'all') activeFilters.push(`Year ${year}`);
    if (semester !== 'all') activeFilters.push(`Semester ${semester}`);
    if (iae !== 'all') activeFilters.push(iae);
    if (!activeFilters.length) return alert('Select at least one filter for bulk delete.');

    if (window.confirm(`PERMANENTLY delete ALL results matching: ${activeFilters.join(', ')}?`)) {
      try {
        const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
        const config = { headers: { Authorization: `Bearer ${adminInfo.token}` }, params: { year, semester, iae } };
        const { data } = await axios.delete('http://localhost:5000/api/admin/results/bulk', config);
        alert(data.message);
        fetchResults();
      } catch (err) {
        alert(err.response?.data?.message || 'Bulk delete failed');
      }
    }
  };

  const filteredResults = results.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = r.registerNumber.toLowerCase().includes(q) ||
      r.studentName.toLowerCase().includes(q) ||
      (r.department || '').toLowerCase().includes(q);
    const matchesYear = filters.year === 'all' || r.year.toString() === filters.year;
    const matchesSem = filters.semester === 'all' || r.semester.toString() === filters.semester;
    const matchesIAE = filters.iae === 'all' || r.iae === filters.iae;
    const matchesDept = filters.department === 'all' || (r.department || '') === filters.department;
    return matchesSearch && matchesYear && matchesSem && matchesIAE && matchesDept;
  });

  const openModal = (result) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResult(null);
  };

  // Inline Modal Component
  const MarksModal = ({ result, onClose }) => {
    if (!result) return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px'
      }} onClick={onClose}>
        <div className="glass-panel animate-fade-in" style={{
          width: '100%', maxWidth: '600px', background: 'white', padding: '2rem',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          position: 'relative'
        }} onClick={e => e.stopPropagation()}>
          <button onClick={onClose} style={{
            position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none',
            fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)'
          }}>&times;</button>
          
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '10px', fontSize: '1.4rem' }}>Result Details</h2>
          <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
            <p><strong>Student:</strong> {result.studentName} ({result.registerNumber})</p>
            <p><strong>Exam:</strong> Academic Year {result.year} / Sem {result.semester} {result.iae ? `(${result.iae})` : ''}</p>
          </div>

          <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ padding: '10px' }}>Subject</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Mark</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {result.subjects.map((sub, i) => {
                  const isFail = sub.marks === 'AB' || Number(sub.marks) < 50;
                  return (
                    <tr key={i}>
                      <td style={{ padding: '10px' }}>{sub.name}</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: isFail ? 'var(--error)' : 'inherit' }}>
                        {sub.marks === 'AB' ? 'AB (Absent)' : sub.marks}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px',
                          background: isFail ? '#fee2e2' : '#dcfce7', color: isFail ? '#dc2626' : '#16a34a'
                        }}>
                          {isFail ? 'FAIL' : 'PASS'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button className="btn btn-primary" onClick={onClose} style={{ padding: '8px 25px' }}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>Manage Database</h1>
        <button className="btn" onClick={() => navigate('/admin/dashboard')} style={{ background: '#64748b', color: 'white' }}>
          &larr; Back
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {/* Search bar */}
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search by Register No, Name, or Department..."
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff', color: 'var(--text-main)', width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <select name="year" value={filters.year} onChange={handleFilterChange} style={selectStyle}>
            <option value="all">All Years</option>
            {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>

          <select name="semester" value={filters.semester} onChange={handleFilterChange} style={selectStyle}>
            <option value="all">All Semesters</option>
            {[...Array(7)].map((_, i) => <option key={i + 1} value={i + 1}>Sem {i + 1}</option>)}
          </select>

          <select name="iae" value={filters.iae} onChange={handleFilterChange} style={selectStyle}>
            <option value="all">All IAEs</option>
            <option value="IAE1">IAE 1</option>
            <option value="IAE2">IAE 2</option>
            <option value="IAE3">IAE 3</option>
          </select>

          <select name="department" value={filters.department} onChange={handleFilterChange} style={selectStyle}>
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {filters.year !== 'all' && filters.semester !== 'all' && filters.iae !== 'all' && (
            <button className="btn btn-danger" onClick={handleBulkDelete} style={{ padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
              Delete All Filtered
            </button>
          )}
        </div>

        {/* Count badge */}
        <div style={{ marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Showing <strong style={{ color: 'var(--text-main)' }}>{filteredResults.length}</strong> of {results.length} records
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><span className="loader"></span></div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>DOB</th>
                  <th>Year/Sem</th>
                  <th>IAE</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => (
                  <tr key={result._id}>
                    <td>{result.registerNumber}</td>
                    <td>{result.studentName}</td>
                    <td><span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 10px', borderRadius: '999px', fontSize: '0.8rem' }}>{result.department || '—'}</span></td>
                    <td>{result.dob}</td>
                    <td>{result.year} / {result.semester}</td>
                    <td>{result.iae}</td>
                    <td>{result.total}</td>
                    <td><span style={{ color: result.passed ? 'var(--success)' : 'var(--error)', fontWeight: 'bold' }}>{result.grade}</span></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          background: result.passed ? '#dcfce7' : '#fee2e2',
                          color: result.passed ? '#16a34a' : '#dc2626',
                          border: `1px solid ${result.passed ? '#86efac' : '#fca5a5'}`
                        }}>
                          {result.passed ? 'PASS' : 'FAIL'}
                        </span>
                        {!result.passed && (
                          <div style={{ fontSize: '0.65rem', color: '#dc2626', maxWidth: '120px', textAlign: 'center', lineHeight: '1.2' }}>
                            {result.subjects.filter(s => s.marks === 'AB' || Number(s.marks) < 50).map(s => s.marks === 'AB' ? `Absent: ${s.name}` : s.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <button onClick={() => openModal(result)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', marginRight: '5px', background: 'var(--accent)', border: 'none' }}>View</button>
                      <button onClick={() => editHandler(result)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', marginRight: '5px' }}>Edit</button>
                      <button onClick={() => deleteHandler(result._id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No results found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && <MarksModal result={selectedResult} onClose={closeModal} />}
    </div>
  );
};

export default ManageResults;
