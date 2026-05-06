import { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const selectStyle = {
  padding: '10px 14px', borderRadius: '8px',
  background: '#ffffff', color: 'var(--text-main)',
  border: '1px solid var(--border-color)', minWidth: '130px',
};

const PassFailReport = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ year: 'all', semester: 'all', iae: 'all', department: 'all' });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pass'); // 'pass' | 'fail'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (student) => { setSelectedStudent(student); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedStudent(null); };

  const handleFilterChange = (e) => setFilters(f => ({ ...f, [e.target.name]: e.target.value }));

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
      const config = {
        headers: { Authorization: `Bearer ${adminInfo.token}` },
        params: filters,
      };
      const { data } = await axios.get('http://localhost:5000/api/admin/results/report', config);
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const badgeStyle = (passed) => ({
    display: 'inline-block', padding: '3px 12px', borderRadius: '999px',
    fontWeight: 'bold', fontSize: '0.78rem',
    background: passed ? '#dcfce7' : '#fee2e2',
    color: passed ? '#16a34a' : '#dc2626',
    border: passed ? '1px solid #86efac' : '1px solid #fca5a5',
  });

  const deptBadge = { background: '#e0e7ff', color: '#4338ca', padding: '2px 10px', borderRadius: '999px', fontSize: '0.8rem' };

  const list = report ? (activeTab === 'pass' ? report.passedList : report.failedList) : [];

  // Inline Marks Modal
  const MarksModal = ({ student, onClose }) => {
    if (!student) return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px'
      }} onClick={onClose}>
        <div className="glass-panel" style={{
          width: '100%', maxWidth: '580px', background: 'white', padding: '2rem',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', position: 'relative', borderRadius: '12px'
        }} onClick={e => e.stopPropagation()}>
          <button onClick={onClose} style={{
            position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none',
            fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1
          }}>&times;</button>

          <h2 style={{ color: 'var(--primary-color)', marginBottom: '6px', fontSize: '1.3rem' }}>Subject Marks</h2>
          <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-main)' }}>{student.studentName}</strong> &nbsp;({student.registerNumber})
            &nbsp;&mdash;&nbsp; Academic Year {student.year} / Sem {student.semester} {student.iae ? `(${student.iae})` : ''}
          </div>

          <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ padding: '10px' }}>Subject</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Mark</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {(student.subjects || []).map((sub, i) => {
                  const isFail = sub.marks === 'AB' || Number(sub.marks) < 50;
                  return (
                    <tr key={i}>
                      <td style={{ padding: '10px' }}>{sub.name}</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: isFail ? '#dc2626' : 'inherit' }}>
                        {sub.marks === 'AB' ? 'AB (Absent)' : sub.marks}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 'bold', padding: '2px 10px', borderRadius: '4px',
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

          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button className="btn btn-primary" onClick={onClose} style={{ padding: '8px 24px' }}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  const generatePDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(5, 150, 105);
    doc.text('Pass / Fail Analytics Report', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    const filterText = `Year: ${filters.year} | Sem: ${filters.semester} | IAE: ${filters.iae} | Dept: ${filters.department}`;
    doc.text(filterText, 14, 30);
    
    const isPass = activeTab === 'pass';
    doc.text(`List: ${isPass ? 'Passed Students' : 'Failed Students'} (${list.length} records)`, 14, 36);

    const tableColumn = ["Reg No", "Student Name", "Department", "Percentage", "Grade", "Status"];
    if (!isPass) tableColumn.push("Failed Subjects");
    
    const tableRows = [];
    
    list.forEach(student => {
      const row = [
        student.registerNumber,
        student.studentName,
        student.department || '-',
        student.percentage + '%',
        student.grade,
        isPass ? 'PASS' : 'FAIL'
      ];
      if (!isPass) {
        const failedText = student.failedSubjects
          .map(sub => sub.marks === 'AB' ? `${sub.name} (AB)` : sub.name)
          .join(', ');
        row.push(failedText || '-');
      }
      tableRows.push(row);
    });

    doc.autoTable({
      startY: 42,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105] }, // Emerald Green
      styles: { fontSize: 9 },
    });

    doc.save(`Report_${activeTab}_Y${filters.year}_S${filters.semester}.pdf`);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary-color)', marginBottom: '4px' }}>Pass / Fail Report</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Filter students by category and view their result status</p>
        </div>
        <button className="btn" onClick={() => navigate('/admin/dashboard')} style={{ background: '#64748b', color: 'white' }}>
          &larr; Back
        </button>
      </div>

      {/* Filters Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '5px' }}>Academic Year</label>
            <select name="year" value={filters.year} onChange={handleFilterChange} style={selectStyle}>
              <option value="all">All Years</option>
              {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '5px' }}>Semester</label>
            <select name="semester" value={filters.semester} onChange={handleFilterChange} style={selectStyle}>
              <option value="all">All Semesters</option>
              {[...Array(7)].map((_, i) => <option key={i + 1} value={i + 1}>Sem {i + 1}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '5px' }}>IAE</label>
            <select name="iae" value={filters.iae} onChange={handleFilterChange} style={selectStyle}>
              <option value="all">All IAEs</option>
              <option value="IAE1">IAE 1</option>
              <option value="IAE2">IAE 2</option>
              <option value="IAE3">IAE 3</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '5px' }}>Department</label>
            <select name="department" value={filters.department} onChange={handleFilterChange} style={selectStyle}>
              <option value="all">All Departments</option>
              {report?.allDepts?.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={fetchReport} style={{ padding: '10px 28px', fontWeight: 'bold', alignSelf: 'flex-end' }}>
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Summary Cards */}
      {report && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center', border: '1px solid #86efac' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#16a34a' }}>{report.passedList.length}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Passed Students</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center', border: '1px solid #fca5a5' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#dc2626' }}>{report.failedList.length}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Failed Students</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{report.total}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Total Records</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                {report.total > 0 ? ((report.passedList.length / report.total) * 100).toFixed(1) : 0}%
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Pass Rate</div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setActiveTab('pass')}
                style={{ padding: '10px 28px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none',
                  background: activeTab === 'pass' ? '#dcfce7' : '#f1f5f9',
                  color: activeTab === 'pass' ? '#16a34a' : 'var(--text-muted)',
                  outline: activeTab === 'pass' ? '1px solid #86efac' : '1px solid transparent',
                }}>
                Passed ({report.passedList.length})
              </button>
              <button
                onClick={() => setActiveTab('fail')}
                style={{ padding: '10px 28px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none',
                  background: activeTab === 'fail' ? '#fee2e2' : '#f1f5f9',
                  color: activeTab === 'fail' ? '#dc2626' : 'var(--text-muted)',
                  outline: activeTab === 'fail' ? '1px solid #fca5a5' : '1px solid transparent',
                }}>
                Failed ({report.failedList.length})
              </button>
            </div>
            
            <button onClick={generatePDF} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download PDF
            </button>
          </div>

          {/* Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Reg No</th>
                    <th>Student Name</th>
                    <th>Department</th>
                    <th>Year / Sem</th>
                    <th>IAE</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                    <th>Status</th>
                    {activeTab === 'fail' && <th>Failed Subjects</th>}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((s, idx) => (
                    <tr key={s._id}>
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td>{s.registerNumber}</td>
                      <td style={{ fontWeight: '500' }}>{s.studentName}</td>
                      <td><span style={deptBadge}>{s.department || '—'}</span></td>
                      <td>{s.year} / {s.semester}</td>
                      <td>{s.iae}</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>{s.percentage}%</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{s.grade}</td>
                      <td><span style={badgeStyle(s.passed)}>{s.passed ? 'Pass' : 'Fail'}</span></td>
                      {activeTab === 'fail' && (
                        <td style={{ color: '#dc2626', fontSize: '0.85rem' }}>
                          {s.failedSubjects.map(sub => sub.marks === 'AB' ? `${sub.name} (Absent)` : sub.name).join(', ') || '—'}
                        </td>
                      )}
                      <td>
                        <button
                          onClick={() => openModal(s)}
                          className="btn btn-primary"
                          style={{ padding: '5px 14px', fontSize: '0.78rem', background: 'var(--accent)', border: 'none' }}
                        >View</button>
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={activeTab === 'fail' ? 10 : 9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No {activeTab === 'pass' ? 'passed' : 'failed'} students found for selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Select Filters</h2>
          <p>Select filters above and click <strong style={{ color: 'var(--text-main)' }}>Generate Report</strong> to view pass/fail student lists.</p>
        </div>
      )}
      {isModalOpen && <MarksModal student={selectedStudent} onClose={closeModal} />}
    </div>
  );
};

export default PassFailReport;
