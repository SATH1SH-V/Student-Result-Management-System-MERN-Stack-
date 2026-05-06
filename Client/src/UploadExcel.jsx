import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadExcel = () => {
  const [formData, setFormData] = useState({
    year: '1',
    semester: '1',
    iae: 'IAE1',
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleSelectChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ type: 'error', message: 'Please select an Excel file' });
      return;
    }
    
    setLoading(true);
    setStatus({ type: '', message: '' });
    
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
    
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('year', formData.year);
    formDataToSend.append('semester', formData.semester);
    
    formDataToSend.append('iae', formData.iae);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };

      const { data } = await axios.post('http://localhost:5000/api/admin/upload', formDataToSend, config);
      setStatus({ type: 'success', message: `${data.message}. Uploaded ${data.records} records.` });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{paddingTop: '3rem', maxWidth: '800px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h1 style={{color: 'var(--primary-color)'}}>Upload Excel Results</h1>
        <button className="btn" onClick={() => navigate('/admin/dashboard')} style={{background: '#64748b', color: 'white'}}>
          &larr; Back
        </button>
      </div>

      {status.message && (
        <div className={`alert ${status.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
          {status.message}
        </div>
      )}

      <div className="glass-panel" style={{padding: '2rem'}}>
        <form onSubmit={submitHandler}>
          <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
            <div className="input-group" style={{flex: 1}}>
              <label>Academic Year</label>
              <select name="year" value={formData.year} onChange={handleSelectChange}>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            
            <div className="input-group" style={{flex: 1}}>
              <label>Semester</label>
              <select name="semester" value={formData.semester} onChange={handleSelectChange}>
                  {[...Array(7)].map((_, i) => (
                   <option key={i+1} value={i+1}>Semester {i+1}</option>
                 ))}
              </select>
            </div>
          </div>

            <div className="input-group" style={{marginBottom: '30px'}}>
              <label>Internal Assessment</label>
              <select name="iae" value={formData.iae} onChange={handleSelectChange}>
                <option value="IAE1">IAE 1</option>
                <option value="IAE2">IAE 2</option>
                <option value="IAE3">IAE 3</option>
              </select>
            </div>

          <div className="input-group">
             <label>Excel File (.xlsx)</label>
               <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
               <p style={{color: 'var(--text-main)', fontWeight: 'bold'}}>{file ? file.name : "Click to select or drag and drop Excel file here"}</p>
               <input 
                 type="file" 
                 ref={fileInputRef}
                 accept=".xlsx, .xls, .csv" 
                 onChange={handleFileChange} 
                 style={{display: 'none'}}
               />
             </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{marginTop: '20px', width: '100%'}} disabled={loading}>
            {loading ? <span className="loader"></span> : 'Process and Upload Results'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadExcel;
