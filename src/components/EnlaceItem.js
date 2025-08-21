import React from 'react';

function EnlaceItem({ link, onEditar, onBorrar, onCrearEntorno, editandoId, children, buttonStyle, radioGroupStyle, labelStyle, inputStyle, formEdicion, onEditChange, onEditTipoChange, onGuardarEdicion, onCancelarEdicion, loadingId, view = 'list' }) {
  if (editandoId === link.id) {
    return (
      <form onSubmit={onGuardarEdicion} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={labelStyle}>Email del cliente
          <input
            type="email"
            name="email"
            value={formEdicion.email}
            onChange={onEditChange}
            required
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>Nombre del cliente
          <input
            type="text"
            name="nombre"
            value={formEdicion.nombre}
            onChange={onEditChange}
            required
            style={inputStyle}
          />
        </label>
        <div style={radioGroupStyle}>
          <label>
            <input
              type="radio"
              name="tipo"
              value="libre"
              checked={formEdicion.tipo === 'libre'}
              onChange={onEditTipoChange}
            /> Uso libre
          </label>
          <label>
            <input
              type="radio"
              name="tipo"
              value="expira"
              checked={formEdicion.tipo === 'expira'}
              onChange={onEditTipoChange}
            /> Con expiración
          </label>
        </div>
        {formEdicion.tipo === 'expira' && (
          <label style={labelStyle}>Fecha y hora de expiración
            <input
              type="datetime-local"
              name="expiracion"
              value={formEdicion.expiracion}
              onChange={onEditChange}
              required
              style={inputStyle}
            />
          </label>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ ...buttonStyle, flex: 1 }}>Guardar</button>
          <button type="button" style={{ ...buttonStyle, background: '#eee', color: '#333', flex: 1 }} onClick={onCancelarEdicion}>Cancelar</button>
        </div>
      </form>
    );
  }

  return (
    <>
      {view === 'grid' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 15, textAlign: 'center' }}>{link.nombre}</div>
          <div style={{ color: '#666', fontSize: 13, textAlign: 'center' }}>{link.email}</div>
          <div style={{ fontSize: 13 }}><strong>Tipo:</strong> {link.tipo === 'libre' ? 'Uso libre' : `Expira: ${link.expiracion ? link.expiracion.replace('T', ' ') : '—'}`}</div>
          <div style={{ fontSize: 13 }}><strong>Estado:</strong> <span style={{ color: link.estado === 'Caducado' ? '#e00' : '#0a0' }}>{link.estado}</span></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button style={{ ...buttonStyle, fontSize: 13, padding: '6px 6px', flex: 1 }} onClick={() => onEditar(link)} type="button">Editar</button>
            <button style={{ ...buttonStyle, background: 'linear-gradient(90deg, #e53935 0%, #b71c1c 100%)', fontSize: 13, padding: '6px 6px', flex: 1 }} onClick={() => onBorrar(link.id)} type="button">Borrar</button>
          </div>
          {!link.entornoClienteCreado && (
            <button style={{ ...buttonStyle, marginTop: 6 }} onClick={() => onCrearEntorno(link.id)} disabled={loadingId === link.id}>{loadingId === link.id ? 'Creando...' : 'Crear entorno'}</button>
          )}
          {link.entornoClienteCreado && <div style={{ marginTop: 6, color: '#43a047', fontWeight: 600, textAlign: 'center' }}>Entorno creado</div>}
        </div>
      ) : (
        <>
          <div style={{ fontWeight: 600, fontSize: 17 }}>{link.nombre}</div>
          <div style={{ color: '#555', fontSize: 15 }}>{link.email}</div>
          <div style={{ marginTop: 4 }}>
            <span style={{ fontWeight: 500 }}>Tipo:</span> {link.tipo === 'libre' ? 'Uso libre' : `Expira: ${link.expiracion ? link.expiracion.replace('T', ' ') : '—'}`}
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>Estado:</span> <span style={{ color: link.estado === 'Caducado' ? '#e00' : '#0a0' }}>{link.estado}</span>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button
              style={{ ...buttonStyle, background: 'linear-gradient(90deg, #607d8b 0%, #90a4ae 100%)', fontSize: 14, padding: '7px 0', flex: 1 }}
              onClick={() => onEditar(link)}
              type="button"
            >
              Editar
            </button>
            <button
              style={{ ...buttonStyle, background: 'linear-gradient(90deg, #e53935 0%, #b71c1c 100%)', fontSize: 14, padding: '7px 0', flex: 1 }}
              onClick={() => onBorrar(link.id)}
              type="button"
            >
              Borrar
            </button>
          </div>
          {/* Acciones: permitir crear entorno manualmente (incluso para uso libre) */}
          {!link.entornoClienteCreado && (
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button
                style={{ ...buttonStyle, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', fontSize: 15, padding: '8px 0', flex: 1, opacity: loadingId === link.id ? 0.7 : 1 }}
                onClick={() => onCrearEntorno(link.id)}
                type="button"
                disabled={loadingId === link.id}
              >
                {loadingId === link.id ? 'Creando...' : 'Crear entorno'}
              </button>
            </div>
          )}
          {link.entornoClienteCreado && (
            <div style={{ marginTop: 10, color: '#43a047', fontWeight: 500 }}>
              Entorno del cliente creado correctamente.
            </div>
          )}
        </>
      )}
      
      {/* Mensajes de estado */}
      {link.migracionSolicitada && link.pagoPendiente && (
        <div style={{ marginTop: 10, color: '#ff9800', fontWeight: 500 }}>
          Debe realizar el pago para migrar el entorno.
        </div>
      )}
      {link.tiempoExtraSolicitado && (
        <div style={{ marginTop: 10, color: '#009688', fontWeight: 500 }}>
          Solicitud de tiempo extra enviada.
        </div>
      )}
      {children}
    </>
  );
}

export default EnlaceItem;
