import React, { useState } from 'react';

//Main dashboard component 
export default function Dashboard({ data, setData, onReset }) {
  //View modes
  const [view, setView] = useState('map');
  //Admin mode for CRUD operations
  const [adminMode, setAdminMode] = useState(null);
  
  //Entity type for admin operations
  const [adminEntityType, setAdminEntityType] = useState('shuttle');
  //Form data for add/edit/delete 
  const [formData, setFormData] = useState({ id: '', destination: '', time: '' });
  
  //Table view options
  const [entityView, setEntityView] = useState('shuttles');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  //Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');

  //sliding window
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllSidebar, setShowAllSidebar] = useState(false);

  //Map tooltip display
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  //Define clickable hotspots on the map
  const mapHotspots = [
    { name: 'Central Station', left: 33, top: 47, width: 25, height: 22 },
    { name: 'Sport Centre',    left: 1,  top: 30, width: 16, height: 18 },
    { name: 'Mall',            left: 20, top: 30, width: 16, height: 18 },
    { name: 'Cinema',          left: 57, top: 30, width: 13, height: 17 },
    { name: 'Supermarket',     left: 57, top: 54, width: 14, height: 15 },
    { name: 'Post Office',     left: 70, top: 74, width: 15, height: 16 },
  ];

  //Get shuttles that are assigned to a specific destination
  const getShuttlesForDestination = (destName) => {
    //Map hotspot names to destination values used in data
    const nameMap = { 'Sport Centre': 'Sports centre', 'Post Office': 'Post office' };
    const dest = nameMap[destName] || destName;
    return (data.shuttles || [])
      .filter(s => s.destination === dest && s.passengers && s.passengers.length > 0)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  //Handle map hotspot clicks to show assigned shuttles
  const handleHotspotClick = (e, hotspot) => {
    //Dont show tooltip for central station
    if (hotspot.name === 'Central Station') return;
    //Calculate tooltip position
    const rect = e.currentTarget.closest('.map-container').getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltipPos({ x, y });
    //Toggle location selection
    setSelectedLocation(prev => prev === hotspot.name ? null : hotspot.name);
  };

  //Refresh state from backend
  const fetchState = async () => {
    const res = await fetch('http://localhost:8080/state');
    const newState = await res.json();
    setData(newState);
  };

  //Run matching algorithm to assign shuttles to passengers
  const handleAssignRoutes = async () => {
    const res = await fetch('http://localhost:8080/assign', { method: 'POST' });
    const newState = await res.json();
    setData(newState);
  };

  //Export matched data to file
  const handleExport = async () => {
    try {
      const res = await fetch('http://localhost:8080/export', { method: 'POST' });
      if (res.ok) {
        alert('Successfully exported matched list to data/matched.txt');
      } else {
        alert('Failed to export data.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  //Handle add/edit/delete form submission
  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    //Check if entity is currently assigned before deletion
    if (adminMode === 'delete') {
      let isAssigned = false;
      if (adminEntityType === 'shuttle') {
        const shuttle = (data.shuttles || []).find(s => s.id === formData.id);
        if (shuttle && shuttle.passengers && shuttle.passengers.length > 0) {
          isAssigned = true;
        }
      } else if (adminEntityType === 'passenger') {
        for (const s of (data.shuttles || [])) {
          if (s.passengers && s.passengers.some(p => p.id === formData.id)) {
            isAssigned = true;
            break;
          }
        }
      }
      
      //Show confirmation dialog
      let msg = "Are you sure you want to delete this?";
      if (isAssigned) {
        if (adminEntityType === 'shuttle') {
          msg = "Warning: This shuttle has assigned passengers. Are you sure you want to delete?";
        } else {
          msg = "Warning: This passenger is currently assigned to a shuttle. Are you sure you want to delete?";
        }
      }
      
      if (!window.confirm(msg)) {
        return;
      }
    }

    //Send request to backend
    const endpoint = `http://localhost:8080/${adminMode}`;
    const payload = { type: adminEntityType, ...formData };
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        //Update UI with new state
        const newState = await res.json();
        setData(newState);
        setFormData({ id: '', destination: '', time: '' });
        alert(`Successfully processed ${adminMode} for ${adminEntityType}`);
      } else if (res.status === 409) {
        alert('Error: ID already exists!');
      } else {
        alert('Action failed. Check ID.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  //Sort table by column
  const handleSort = (key) => {
    //Toggle sort direction if same column clicked
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // --- 1. FULL FUNCTION DEFINED FIRST ---
  //Get filtered and sorted table data
  const getTableData = () => {
    let list = [];
    //Filter by entity view (shuttles or passengers)
    if (entityView === 'shuttles') {
      if (statusFilter === 'all') {
        list = data.shuttles || [];
      } else if (statusFilter === 'matched') {
        list = (data.shuttles || []).filter(s => s.passengers && s.passengers.length > 0);
      } else if (statusFilter === 'unmatched') {
        list = (data.shuttles || []).filter(s => !s.passengers || s.passengers.length === 0);
      }
    } else if (entityView === 'passengers') {
      //Combine unassigned passengers with matched passengers
      const allPass = [...(data.unassigned_passengers || [])];
      const matchedPass = [];
      (data.shuttles || []).forEach(s => {
        if (s.passengers) matchedPass.push(...s.passengers);
      });
      allPass.push(...matchedPass);

      if (statusFilter === 'all') {
        list = allPass;
      } else if (statusFilter === 'matched') {
        list = matchedPass;
      } else if (statusFilter === 'unmatched') {
        list = data.unassigned_passengers || [];
      }
    }

    //Apply sorting
    if (sortConfig.key) {
      list.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  };

  // --- 2. SLIDING WINDOW LOGIC CALCULATED SECOND ---
  const rowsPerPage = 5; 
  let currentTableData = [];
  let totalItems = 0;
  let totalPages = 1;
  let startIndex = 0;
  let endIndex = 0;

  if (view === 'table') {
    const allTableItems = getTableData(); 
    totalItems = allTableItems.length;
    totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
    startIndex = (currentPage - 1) * rowsPerPage;
    endIndex = startIndex + rowsPerPage;
    currentTableData = allTableItems.slice(startIndex, endIndex);
  }
  
  const handlePrev = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  //Get search results based on query and filters
  const getSearchData = () => {
    if (!searchQuery) return [];
    
    const q = searchQuery.toLowerCase();
    
    //Combine all shuttles and passengers into single list
    let allData = [];
    (data.shuttles || []).forEach(s => allData.push({ type: 'Shuttle', ...s, isAssigned: s.passengers && s.passengers.length > 0 }));
    (data.unassigned_passengers || []).forEach(p => allData.push({ type: 'Passenger', ...p, isAssigned: false }));
    (data.shuttles || []).forEach(s => {
      if (s.passengers) {
        s.passengers.forEach(p => allData.push({ type: 'Passenger', ...p, isAssigned: true }));
      }
    });

    //Filter by search query and filters
    return allData.filter(item => {
      //Filter by entity type
      let matchesType = true;
      if (searchFilter === 'shuttle' && item.type !== 'Shuttle') matchesType = false;
      if (searchFilter === 'passenger' && item.type !== 'Passenger') matchesType = false;
      if (!matchesType) return false;

      //Filter by specific field or all fields
      if (searchFilter === 'id') return item.id.toLowerCase().includes(q);
      if (searchFilter === 'destination') return item.destination.toLowerCase().includes(q);
      if (searchFilter === 'time') return item.time.toLowerCase().includes(q);
      
      //Search across all fields
      return item.id.toLowerCase().includes(q) || 
             item.destination.toLowerCase().includes(q) || 
             item.time.toLowerCase().includes(q);
    });
  };

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Sidebar */}
      <div className="sidebar glass-panel" style={{ width: '350px' }}>
        {adminMode ? (
          <div>
            <h2 style={{ marginBottom: '15px', color: '#818cf8', textTransform: 'capitalize' }}>{adminMode} Mode</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button className="btn" style={{ flex: 1, background: adminEntityType === 'shuttle' ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }} onClick={() => setAdminEntityType('shuttle')}>Shuttle</button>
              <button className="btn" style={{ flex: 1, background: adminEntityType === 'passenger' ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }} onClick={() => setAdminEntityType('passenger')}>Passenger</button>
            </div>
            
            <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="ID (e.g. s01)" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} required style={{ padding: '10px', borderRadius: '5px' }} />
              {adminMode !== 'delete' && (
                <>
                  <select value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} required style={{ padding: '10px', borderRadius: '5px' }}>
                    <option value="" disabled>Select Destination</option>
                    <option value="Mall">Mall</option>
                    <option value="Cinema">Cinema</option>
                    <option value="Sports centre">Sports centre</option>
                    <option value="Post office">Post office</option>
                    <option value="Supermarket">Supermarket</option>
                  </select>
                  <input type="time" placeholder="Time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required style={{ padding: '10px', borderRadius: '5px' }} />
                </>
              )}
              <button type="submit" className="btn" style={{ background: adminMode === 'delete' ? '#ef4444' : '#10b981' }}>Confirm {adminMode}</button>
            </form>
            <button className="btn" style={{ width: '100%', marginTop: '20px', background: 'transparent', border: '1px solid var(--glass-border)' }} onClick={() => setAdminMode(null)}>Cancel</button>
          </div>
) : view === 'map' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingRight: '5px', overflow: 'hidden' }}>
            <h2 style={{ marginBottom: '20px', flexShrink: 0 }}>Assignments </h2>
            
            <h3 style={{ color: '#34d399', marginBottom: '15px', flexShrink: 0 }}>Shuttles ({data.shuttles?.length || 0})</h3>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px', minHeight: '100px' }}>
              {/* Sliding Window: Show all, or slice to only show the first 5 */}
              {(showAllSidebar ? data.shuttles : (data.shuttles || []).slice(0, 5))?.map((s, idx) => (
                <div key={idx} className="card">
                  <h3>{s.id} <span className="badge destination">{s.destination}</span> <span className="badge time">{s.time}</span></h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Passengers: {s.passengers && s.passengers.length > 0 ? s.passengers.map(p => p.id).join(', ') : 'Empty'}
                  </p>
                </div>
              ))}
            </div>

            
            {/* Show All / Show Less Toggle Button */}
            {((data.shuttles?.length > 5) || (data.unassigned_passengers?.length > 5)) && (
              <button 
                className="btn" 
                onClick={() => setShowAllSidebar(!showAllSidebar)} 
                style={{ 
                  width: '100%', 
                  marginTop: '15px', 
                  background: 'rgba(196, 31, 31, 0.05)', 
                  border: '1px solid var(--glass-border)', 
                  color: 'var(--text-main)',
                  flexShrink: 0
                }}
              >
                {showAllSidebar ? 'Show Less' : 'Show All Entries'}
              </button>
            )}

            
          </div>

        ) : view === 'table' ? (
          <div>
            <h2 style={{ marginBottom: '20px' }}>Table Options</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>View</label>
              <select 
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid var(--glass-border)', borderRadius: '5px' }}
                value={entityView}
                onChange={e => setEntityView(e.target.value)}
              >
                <option value="shuttles">All Shuttles</option>
                <option value="passengers">All Passengers</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Assigned Status</label>
              <select 
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid var(--glass-border)', borderRadius: '5px' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="matched">Matched</option>
                <option value="unmatched">Unmatched</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Sort By</label>
              <select 
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid var(--glass-border)', borderRadius: '5px', marginBottom: '10px' }}
                value={sortConfig.key || ''}
                onChange={e => setSortConfig({ ...sortConfig, key: e.target.value })}
              >
                <option value="" disabled>Select Column</option>
                <option value="id">ID</option>
                <option value="destination">Destination</option>
                <option value="time">Time</option>
              </select>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn" style={{ flex: 1, background: sortConfig.direction === 'asc' ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }} onClick={() => setSortConfig({ ...sortConfig, direction: 'asc' })}>Asc</button>
                <button className="btn" style={{ flex: 1, background: sortConfig.direction === 'desc' ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }} onClick={() => setSortConfig({ ...sortConfig, direction: 'desc' })}>Desc</button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: '20px' }}>Search Options</h2>
            <p style={{ color: 'var(--text-muted)' }}>Use the top bar to search for Shuttles and Passengers across the system.</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn" style={{ background: view === 'map' ? 'var(--primary)' : 'transparent' }} onClick={() => { setView('map'); setAdminMode(null); }}>Map View</button>
            <button className="btn" style={{ background: view === 'table' ? 'var(--primary)' : 'transparent' }} onClick={() => { setView('table'); setAdminMode(null); }}>Table View</button>
            <button className="btn" style={{ background: view === 'search' ? 'var(--primary)' : 'transparent' }} onClick={() => { setView('search'); setAdminMode(null); }}>Search</button>
            <button className="btn" style={{ background: '#f59e0b', color: '#fff' }} onClick={handleAssignRoutes}>Assign Routes</button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn" style={{ background: '#3b82f6' }} onClick={handleExport}>Export Data</button>
            <button className="btn" style={{ background: adminMode === 'add' ? '#10b981' : 'rgba(255,255,255,0.1)' }} onClick={() => setAdminMode('add')}>Add</button>
            <button className="btn" style={{ background: adminMode === 'edit' ? '#f59e0b' : 'rgba(255,255,255,0.1)' }} onClick={() => setAdminMode('edit')}>Edit</button>
            <button className="btn" style={{ background: adminMode === 'delete' ? '#ef4444' : 'rgba(255,255,255,0.1)' }} onClick={() => setAdminMode('delete')}>Delete</button>
            <button className="btn" onClick={onReset} style={{ background: '#ff0000', color: '#fff' }}>Start Over</button>
          </div>
        </div>

        {view === 'map' ? (
          <div className="map-display" onClick={() => setSelectedLocation(null)}>
            <div className="map-container" style={{ position: 'relative', display: 'inline-block' }}>
              <img src="/map.jpg" alt="City Map" className="map-image" style={{ display: 'block' }} />
              {mapHotspots.map((spot) => (
                <div
                  key={spot.name}
                  className="map-hotspot"
                  title={spot.name}
                  onClick={(e) => { e.stopPropagation(); handleHotspotClick(e, spot); }}
                  style={{
                    position: 'absolute',
                    left: `${spot.left}%`,
                    top: `${spot.top}%`,
                    width: `${spot.width}%`,
                    height: `${spot.height}%`,
                    border: '2px solid transparent',
                    borderRadius: '8px',
                    cursor: spot.name === 'Central Station' ? 'default' : 'pointer',
                    transition: 'all 0.25s ease',
                    zIndex: 2,
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.border = '2px solid white'; e.currentTarget.style.boxShadow = '0 0 12px rgba(255,255,255,0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = '2px solid transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              ))}

              {/* Tooltip table */}
              {selectedLocation && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    left: `${Math.min(tooltipPos.x, 500)}px`,
                    top: `${tooltipPos.y}px`,
                    transform: 'translate(-50%, 10px)',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid var(--primary)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    zIndex: 10,
                    minWidth: '220px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <h4 style={{ color: '#818cf8', marginBottom: '8px', fontSize: '14px' }}>{selectedLocation}</h4>
                  {getShuttlesForDestination(selectedLocation).length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                          <th style={{ padding: '4px 8px', textAlign: 'left', color: 'var(--text-muted)' }}>Shuttle</th>
                          <th style={{ padding: '4px 8px', textAlign: 'left', color: 'var(--text-muted)' }}>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getShuttlesForDestination(selectedLocation).map((s, i) => (
                          <tr key={i}>
                            <td style={{ padding: '4px 8px', fontWeight: 'bold' }}>{s.id}</td>
                            <td style={{ padding: '4px 8px' }}><span className="badge time">{s.time}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>No matched shuttles</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : view === 'table' ? (
          <div style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px', textTransform: 'capitalize' }}>
              {statusFilter !== 'all' ? statusFilter + ' ' : ''}
              {entityView}
            </h2>
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '15px', cursor: 'pointer' }} onClick={() => handleSort('id')}>ID {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th style={{ padding: '15px' }}>Destination</th>
                    <th style={{ padding: '15px', cursor: 'pointer' }} onClick={() => handleSort('time')}>Time {sortConfig.key === 'time' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    {entityView === 'shuttles' && <th style={{ padding: '15px' }}>Passengers</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentTableData.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '15px' }}>{item.id}</td>
                      <td style={{ padding: '15px' }}><span className="badge destination">{item.destination}</span></td>
                      <td style={{ padding: '15px' }}><span className="badge time">{item.time}</span></td>
                      {entityView === 'shuttles' && (
                        <td style={{ padding: '15px' }}>{item.passengers && item.passengers.length > 0 ? item.passengers.map(p => p.id).join(', ') : 'None'}</td>
                      )}
                    </tr>
                  ))}
                  {getTableData().length === 0 && (
                    <tr><td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: 'var(--text-muted)' }}>No records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div> {/* END OF TABLE GLASS PANEL */}

{/* Pagination Controls */}
            {totalItems > 0 && (
              <div 
                className="pagination-panel glass-panel"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap',
                  gap: '15px',
                  padding: '12px 20px',
                  marginTop: '20px',
                  borderRadius: '10px'
                }}
              >
                <div className="pagination-info" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Showing <strong style={{ color: 'white' }}>{startIndex + 1}</strong> to <strong style={{ color: 'white' }}>{Math.min(endIndex, totalItems)}</strong> of <strong style={{ color: 'white' }}>{totalItems}</strong> entries
                </div>
                
                <div 
                  className="pagination-actions"
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <button 
                    onClick={handlePrev} 
                    disabled={currentPage === 1}
                    className="btn pagination-btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Prev
                  </button>
                  
                  

                  <button 
                    onClick={handleNext} 
                    disabled={currentPage === totalPages}
                    className="btn pagination-btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    Next
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>

                  <div 
                    className="pagination-tracker"
                    style={{ 
                      fontSize: '13px', 
                      fontWeight: '500', 
                      color: 'var(--text-muted)', 
                      background: 'rgba(0,0,0,0.2)', 
                      padding: '6px 14px', 
                      borderRadius: '6px', 
                      border: '1px solid var(--glass-border)' 
                    }}
                  >
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', maxWidth: '800px', margin: '0 auto 30px' }}>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px' }} 
              />
              <select 
                value={searchFilter} 
                onChange={(e) => setSearchFilter(e.target.value)} 
                style={{ padding: '15px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', fontSize: '16px', minWidth: '150px' }}
              >
                <option value="all">All</option>
                <option value="shuttle">Shuttle Only</option>
                <option value="passenger">Passenger Only</option>
                <option value="id">By ID</option>
                <option value="destination">By Destination</option>
                <option value="time">By Time</option>
              </select>
            </div>

            {searchQuery && (
              <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '15px' }}>Type</th>
                      <th style={{ padding: '15px' }}>ID</th>
                      <th style={{ padding: '15px' }}>Destination</th>
                      <th style={{ padding: '15px' }}>Time</th>
                      <th style={{ padding: '15px' }}>Assigned Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSearchData().map((item, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '15px' }}><span className="badge" style={{ background: item.type === 'Shuttle' ? 'var(--primary)' : '#818cf8' }}>{item.type}</span></td>
                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{item.id}</td>
                        <td style={{ padding: '15px' }}><span className="badge destination">{item.destination}</span></td>
                        <td style={{ padding: '15px' }}><span className="badge time">{item.time}</span></td>
                        <td style={{ padding: '15px' }}>
                          <span className="badge" style={{ background: item.isAssigned ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)', color: item.isAssigned ? '#34d399' : '#fca5a5' }}>
                            {item.isAssigned ? 'Matched' : 'Unmatched'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {getSearchData().length === 0 && (
                      <tr><td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: 'var(--text-muted)' }}>No exact matches found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}