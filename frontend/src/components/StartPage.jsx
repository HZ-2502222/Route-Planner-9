import { useState } from 'react';

//Initial page where users upload shuttle and passenger data files
export default function StartPage({ onDataReady }) {
  //State for managing file uploads
  const [shuttleFiles, setShuttleFiles] = useState([]);
  const [passengerFiles, setPassengerFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  //Validate file has .txt extension and contains keyword
  const isValidFile = (file, keyword) => {
    const name = file.name.toLowerCase();
    return name.endsWith('.txt') && name.includes(keyword);
  };

  //Get the first column value from the first line of a file
  const getFirstColumnFromFile = async (file) => {
    const text = await file.text();
    const firstLine = text.split('\n')[0];
    const firstColumn = firstLine.split(',')[0].trim();
    return firstColumn;
  };

  //Handle file input change event
  const handleFileChange = (e, setter) => {
    setter(Array.from(e.target.files));
  };

  //Parse CSV files and extract ID destination and time data
  const parseCSV = async (files) => {
    const allRecords = [];
    for (let file of files) {
      const text = await file.text();
      //Split by newlines and filter empty lines
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      for (let line of lines) {
        //Parse CSV format to id,destination,time
        const [id, destination, time] = line.split(',');
        if (id && destination && time) {
          allRecords.push({ id: id.trim(), destination: destination.trim(), time: time.trim() });
        }
      }
    }
    return allRecords;
  };

  //Submit files to backend server
  const handleSubmit = async () => {
    //Validate file selection
    if (shuttleFiles.length === 0 || passengerFiles.length === 0) {
      setErrors(['Please select both shuttle and passenger files.']);
      return;
    }

    //Collect all validation errors
    const validationErrors = [];

    //Validate shuttle files by checking if first column starts with 's'
    for (let file of shuttleFiles) {
      if (!file.name.toLowerCase().endsWith('.txt')) {
        validationErrors.push(`Shuttle file "${file.name}" must be a .txt file.`);
        continue;
      }
      try {
        const firstColumn = await getFirstColumnFromFile(file);
        if (!firstColumn.toLowerCase().startsWith('s')) {
          validationErrors.push(`Shuttle file "${file.name}" - first column must start with 's', found: '${firstColumn}'`);
        }
      } catch (err) {
        validationErrors.push(`Error reading shuttle file "${file.name}": ${err.message}`);
      }
    }

    //Validate passenger files by checking if first column starts with 'p'
    for (let file of passengerFiles) {
      if (!file.name.toLowerCase().endsWith('.txt')) {
        validationErrors.push(`Passenger file "${file.name}" must be a .txt file.`);
        continue;
      }
      try {
        const firstColumn = await getFirstColumnFromFile(file);
        if (!firstColumn.toLowerCase().startsWith('p')) {
          validationErrors.push(`Passenger file "${file.name}" - first column must start with 'p', found: '${firstColumn}'`);
        }
      } catch (err) {
        validationErrors.push(`Error reading passenger file "${file.name}": ${err.message}`);
      }
    }

    //Display all errors if any
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    setLoading(true);

    try {
      //Parse both shuttle and passenger CSV files
      const shuttles = await parseCSV(shuttleFiles);
      const passengers = await parseCSV(passengerFiles);

      //Send data to backend
      const response = await fetch('http://localhost:8080/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shuttles, passengers })
      });

      if (!response.ok) throw new Error('Backend server error. Make sure server.exe is running.');

      //Navigate to dashboard with returned data
      const data = await response.json();
      onDataReady(data);
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '40px', maxWidth: '600px', width: '100%' }}>
        <h1 style={{ marginBottom: '10px', textAlign: 'center' }}>Route Planner Dashboard</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>Upload your hard drive data to begin.</p>
        
        {errors.length > 0 && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
            {errors.map((err, index) => (
              <div key={index}>{err}</div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Shuttle Files (txt)</label>
            <input type="file" multiple accept=".txt" onChange={(e) => handleFileChange(e, setShuttleFiles)} className="file-upload-zone" style={{ width: '100%' }} />
            <small style={{ color: 'var(--text-muted)' }}>{shuttleFiles.length} file(s) selected</small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Passenger Files (txt)</label>
            <input type="file" multiple accept=".txt" onChange={(e) => handleFileChange(e, setPassengerFiles)} className="file-upload-zone" style={{ width: '100%' }} />
            <small style={{ color: 'var(--text-muted)' }}>{passengerFiles.length} file(s) selected</small>
          </div>

          <button className="btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: '20px', padding: '15px', fontSize: '16px' }}>
            {loading ? 'Processing...' : 'Start Planning'}
          </button>
        </div>
      </div>
    </div>
  );
}