import React from 'react';

export default function Modal({ isOpen, isAlert, message, onConfirm, onClose }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          padding: '30px',
          borderRadius: '12px',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ fontSize: '16px', marginBottom: '30px', lineHeight: '1.5', color: '#fff' }}>
          {message}
        </p>
        
        <div style={{display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {!isAlert && (
            <button 
              className="btn" 
              onClick={onClose}
              style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--glass-border)', flex: 1 }}
            >
              Cancel
            </button>
          )}
          <button 
            className="btn" 
            onClick={handleConfirm}
            style={{ 
              background: isAlert ? 'var(--primary)' : '#10b981',
              flex: 1
            }}
          >
            {isAlert ? 'OK' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
