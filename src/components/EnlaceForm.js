import React from 'react';

function EnlaceForm({ form, onChange, onTipoChange, onSubmit, inputStyle, labelStyle, buttonStyle, loading }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={labelStyle}>Email del cliente
        <input
          type="email"
          name="email"
          placeholder="cliente@email.com"
          value={form.email}
          onChange={onChange}
          required
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>Nombre del cliente
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={form.nombre}
          onChange={onChange}
          required
          style={inputStyle}
        />
      </label>
      <div style={{ display: 'flex', gap: 16, margin: '8px 0' }}>
        <label>
          <input
            type="radio"
            name="tipo"
            value="libre"
            checked={form.tipo === 'libre'}
            onChange={onTipoChange}
          /> Uso libre
        </label>
        <label>
          <input
            type="radio"
            name="tipo"
            value="expira"
            checked={form.tipo === 'expira'}
            onChange={onTipoChange}
          /> Con expiración
        </label>
      </div>
      {form.tipo === 'expira' && (
        <label style={labelStyle}>Fecha y hora de expiración
          <input
            type="datetime-local"
            name="expiracion"
            value={form.expiracion}
            onChange={onChange}
            required
            style={inputStyle}
          />
        </label>
      )}
      <button type="submit" style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }} disabled={loading}>
        {loading ? 'Generando...' : 'Generar'}
      </button>
    </form>
  );
}

export default EnlaceForm;
