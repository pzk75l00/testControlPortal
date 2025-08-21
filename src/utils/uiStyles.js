// Extracted UI styles used across components to keep files small
export const cardStyle = (view) => ({
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  padding: view === 'grid' ? 16 : 24,
  margin: view === 'grid' ? 16 : '32px auto',
  maxWidth: view === 'grid' ? '100%' : 420,
  fontFamily: 'system-ui, sans-serif',
});

export const inputStyle = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #ccc',
  fontSize: 16,
  marginBottom: 4,
  width: '100%',
  boxSizing: 'border-box',
};

export const labelStyle = { fontWeight: 500, marginBottom: 4, display: 'block' };

export const buttonStyle = {
  background: 'linear-gradient(90deg, #007cf0 0%, #00dfd8 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '10px 0',
  fontSize: 17,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 8,
  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  transition: 'background 0.2s',
};

export const radioGroupStyle = { display: 'flex', gap: 16, margin: '8px 0' };

export const listItemStyle = {
  background: '#f7fafd',
  borderRadius: 8,
  padding: 12,
  marginBottom: 10,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};
