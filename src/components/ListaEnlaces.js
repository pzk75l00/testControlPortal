import React from 'react';
import EnlaceItem from './EnlaceItem';

function ListaEnlaces({ links, view = 'list', ...props }) {
  if (links.length === 0) {
    return (
      <div style={{ color: '#888', textAlign: 'center', padding: 16 }}>
        No se encontraron usuarios o enlaces.
      </div>
    );
  }

  if (view === 'grid') {
    // Table-style grid: rows and columns for quick scanning
    const tableStyle = { width: '100%', borderCollapse: 'collapse' };
    const thStyle = { textAlign: 'left', padding: '10px 8px', borderBottom: '2px solid #e6e6e6', color: '#007cf0' };
    const tdStyle = { padding: '10px 8px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' };

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              props.editandoId === link.id ? (
                <tr key={link.id}>
                  <td style={tdStyle} colSpan={5}>
                    {/* Inline edit form (uses props passed from LinkManager) */}
                    <form onSubmit={props.onGuardarEdicion} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <input name="email" type="email" value={props.formEdicion.email} onChange={props.onEditChange} required style={{ padding: 8, flex: '1 1 220px', borderRadius: 6, border: '1px solid #ccc' }} />
                      <input name="nombre" type="text" value={props.formEdicion.nombre} onChange={props.onEditChange} required style={{ padding: 8, flex: '1 1 220px', borderRadius: 6, border: '1px solid #ccc' }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" style={{ ...props.buttonStyle }}>Guardar</button>
                        <button type="button" onClick={props.onCancelarEdicion} style={{ ...props.buttonStyle, background: '#eee', color: '#333' }}>Cancelar</button>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={link.id}>
                  <td style={tdStyle}>{link.nombre}</td>
                  <td style={tdStyle}>{link.email}</td>
                  <td style={tdStyle}>{link.tipo === 'libre' ? 'Uso libre' : (link.expiracion ? new Date(link.expiracion).toLocaleString() : '—')}</td>
                  <td style={tdStyle}><span style={{ color: link.estado === 'Caducado' ? '#e00' : '#0a0', fontWeight: 600 }}>{link.estado}</span></td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button type="button" onClick={() => props.onEditar(link)} style={{ ...props.buttonStyle, fontSize: 13, padding: '6px 8px' }}>Editar</button>
                      <button type="button" onClick={() => props.onBorrar(link.id)} style={{ ...props.buttonStyle, background: 'linear-gradient(90deg, #e53935 0%, #b71c1c 100%)', fontSize: 13, padding: '6px 8px' }}>Borrar</button>
                      {!link.entornoClienteCreado && (
                        <button type="button" onClick={() => props.onCrearEntorno(link.id)} disabled={props.loadingId === link.id} style={{ ...props.buttonStyle, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', fontSize: 13, padding: '6px 8px' }}>{props.loadingId === link.id ? 'Creando...' : 'Crear entorno'}</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // default: list
  return (
    <ul style={{ padding: 0, listStyle: 'none', minHeight: 40 }}>
      {links.map((link) => (
        <li key={link.id} style={props.listItemStyle}>
          <EnlaceItem
            link={link}
            onEditar={props.onEditar}
            onBorrar={props.onBorrar}
            onCrearEntorno={props.onCrearEntorno}
            
            editandoId={props.editandoId}
            buttonStyle={props.buttonStyle}
            radioGroupStyle={props.radioGroupStyle}
            labelStyle={props.labelStyle}
            inputStyle={props.inputStyle}
            formEdicion={props.formEdicion}
            onEditChange={props.onEditChange}
            onEditTipoChange={props.onEditTipoChange}
            onGuardarEdicion={props.onGuardarEdicion}
            onCancelarEdicion={props.onCancelarEdicion}
            loadingId={props.loadingId}
          />
        </li>
      ))}
    </ul>
  );
}

export default ListaEnlaces;
