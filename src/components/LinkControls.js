import React from 'react';

// Reusable controls: view toggle, global search and column filter
export default function LinkControls({
  view,
  setView,
  busqueda,
  setBusqueda,
  filterColumn,
  setFilterColumn,
  filterValue,
  setFilterValue,
  inputStyle,
  buttonStyle,
  showFilters = false,
}) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#007cf0', marginBottom: 12 }}>Enlaces generados</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setView('list')}
            style={{ padding: '6px 10px', borderRadius: 6, border: view === 'list' ? '2px solid #007cf0' : '1px solid #ddd', background: view === 'list' ? '#e6f7ff' : '#fff' }}
            type="button"
          >Lista</button>
          <button
            onClick={() => setView('grid')}
            style={{ padding: '6px 10px', borderRadius: 6, border: view === 'grid' ? '2px solid #007cf0' : '1px solid #ddd', background: view === 'grid' ? '#e6f7ff' : '#fff' }}
            type="button"
          >Grilla</button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{
          ...inputStyle,
          marginBottom: 18,
          border: '1.5px solid #007cf0',
          fontSize: 15,
          background: '#f7fafd',
        }}
      />

      {showFilters && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <select value={filterColumn} onChange={(e) => setFilterColumn(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
            <option value="all">Filtrar: Ninguno (busqueda global)</option>
            <option value="nombre">Nombre</option>
            <option value="email">Email</option>
            <option value="tipo">Tipo</option>
            <option value="estado">Estado</option>
          </select>
          <input placeholder="Valor filtro" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: 220 }} />
          <button type="button" onClick={() => { setBusqueda(''); setFilterColumn('all'); setFilterValue(''); }} style={{ ...buttonStyle, padding: '8px 10px' }}>Limpiar búsqueda</button>
        </div>
      )}
    </>
  );
}
