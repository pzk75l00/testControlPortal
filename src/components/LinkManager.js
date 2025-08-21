import React, { useState, useEffect } from 'react';
import {
  supabase,
  crearEnlace,
  obtenerEnlaces,
  actualizarEnlace,
  borrarEnlace as borrarEnlaceSupabase,
} from '../utils/supabase';
import EnlaceForm from './EnlaceForm';
import ListaEnlaces from './ListaEnlaces';
import LinkControls from './LinkControls';
import useExpiryChecker from '../hooks/useExpiryChecker';
import { cardStyle as getCardStyle, inputStyle, labelStyle, buttonStyle, radioGroupStyle, listItemStyle } from '../utils/uiStyles';
import { initialForm } from '../utils/constants';


function LinkManager() {
  const [form, setForm] = useState(initialForm);
  const [links, setLinks] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [creating, setCreating] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'grid'
  const [busqueda, setBusqueda] = useState('');
  const [filterColumn, setFilterColumn] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [formEdicion, setFormEdicion] = useState(initialForm);
  // modal handled elsewhere if needed
  // Filtrar enlaces por búsqueda global o por columna
  const linksFiltrados = links.filter((link) => {
    const q = (busqueda || '').toLowerCase();
    const fv = (filterValue || '').toLowerCase();

    if (q) {
      if ((link.nombre || '').toLowerCase().includes(q) || (link.email || '').toLowerCase().includes(q)) return true;
      return false;
    }
    if (filterColumn && filterColumn !== 'all' && fv) {
      switch (filterColumn) {
        case 'nombre':
          return (link.nombre || '').toLowerCase().includes(fv);
        case 'email':
          return (link.email || '').toLowerCase().includes(fv);
        case 'tipo':
          return (link.tipo || '').toLowerCase().includes(fv);
        case 'estado':
          return (link.estado || '').toLowerCase().includes(fv);
        default:
          return true;
      }
    }
    return true;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleTipoChange = (e) => {
    setForm({ ...form, tipo: e.target.value, expiracion: '' });
  };

  // Alerta visual y aviso por email si hay enlaces caducados
  const [alertaCaducados, setAlertaCaducados] = useState(false);

  const avisarAdminCaducado = (link) => {
    setMensaje(`Aviso: El enlace de ${link.nombre} (${link.email}) ha caducado. Se notificó al administrador.`);
  };

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      try {
        const datos = await obtenerEnlaces();
        setLinks(datos);
      } catch (err) {
        console.error('Error cargando enlaces:', err);
        setMensaje((err && err.message) || JSON.stringify(err) || 'Error cargando enlaces');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // Suscripción Realtime para reflejar cambios en la tabla 'enlaces'
  useEffect(() => {
    const channel = supabase
      .channel('public:enlaces')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enlaces' }, (payload) => {
        const rec = payload.record;
        if (!rec) return;
        setLinks((prev) => {
          const exists = prev.find((p) => p.id === rec.id);
          if (exists) return prev.map((p) => (p.id === rec.id ? rec : p));
          return [rec, ...prev];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Offload expiry detection to a reusable hook
  useExpiryChecker(links, {
    onMarkCaducado: (link, { adminAvisado }) => {
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, estado: 'Caducado', adminAvisado: adminAvisado || l.adminAvisado } : l)));
      setAlertaCaducados(true);
      setMensaje(`El enlace de ${link.nombre} (${link.email}) ha caducado.`);
    },
    onAdminNotified: (link) => {
      avisarAdminCaducado(link);
    },
  });

  // expiry checking moved to `useExpiryChecker` hook above

  // Simulación de envío de email (integrar SendGrid aquí)
  const enviarEmailCliente = (link) => {
    setMensaje(`Email enviado a ${link.email} con el link de acceso y fecha de expiración.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.nombre) return;
    if (form.tipo === 'expira' && !form.expiracion) return;
    const nuevoLink = {
      ...form,
      estado: form.tipo === 'expira' && form.expiracion && new Date(form.expiracion) < new Date() ? 'Caducado' : 'Activo',
      // store expiracion as null when not applicable to avoid timestamp parse errors
      expiracion: form.tipo === 'expira' && form.expiracion ? new Date(form.expiracion).toISOString() : null,
      url: '',
      migracionSolicitada: false,
      tiempoExtraSolicitado: false,
      pagoPendiente: false,
      adminAvisado: false,
      entornoClienteCreado: false,
    };
    try {
      // make a copy without empty string fields (safety)
      const payload = { ...nuevoLink };
      if (payload.expiracion === '') payload.expiracion = null;

      setCreating(true);
      await crearEnlace(payload);
      // refresh list from DB to ensure we get proper ids and any DB defaults
      try {
        const datos = await obtenerEnlaces();
        setLinks(datos);
      } catch (err) {
        console.error('Error refrescando enlaces tras crear:', err);
      }

      // reset local form/edit state
  setForm(initialForm);
      setEditandoId(null);
      setFormEdicion(initialForm);
      enviarEmailCliente(payload);
      setMensaje('Enlace creado correctamente.');
  setCreating(false);
    } catch (err) {
      console.error('Error creando enlace:', err);
      setMensaje((err && err.message) || JSON.stringify(err) || 'Error creando enlace');
  setCreating(false);
    }
  };

  // Borrar enlace
  const borrarLink = async (id) => {
    try {
      await borrarEnlaceSupabase(id);
      setLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
      setMensaje('Enlace eliminado correctamente.');
    } catch (err) {
      console.error('Error borrando enlace:', err);
      setMensaje((err && err.message) || JSON.stringify(err) || 'Error borrando enlace');
    }
  };

  // Editar enlace
  const iniciarEdicion = (link) => {
    setEditandoId(link.id);
    setFormEdicion({ ...link });
    setMensaje('');
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormEdicion(initialForm);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormEdicion({ ...formEdicion, [name]: value });
  };

  const handleEditTipoChange = (e) => {
    setFormEdicion({ ...formEdicion, tipo: e.target.value, expiracion: '' });
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    if (!formEdicion.email || !formEdicion.nombre) return;
    if (formEdicion.tipo === 'expira' && !formEdicion.expiracion) return;
    // normalize expiracion to ISO or null
    const payload = { ...formEdicion };
    payload.expiracion = payload.tipo === 'expira' && payload.expiracion ? new Date(payload.expiracion).toISOString() : null;
    const nuevoEstado = payload.tipo === 'expira' && payload.expiracion && new Date(payload.expiracion) < new Date() ? 'Caducado' : 'Activo';
    // clear admin flags when admin edits expiry
    payload.adminAvisado = false;
    payload.tiempoExtraSolicitado = false;

    try {
      // If a server-side extend endpoint is configured, call it so it can re-enable editable app state
      const extendUrl = process.env.REACT_APP_EXTEND_EXPIRATION_URL;
      if (extendUrl) {
        try {
          await fetch(extendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editandoId, newExpirationISO: payload.expiracion }),
          });
          // optimistic local update
          setLinks((prevLinks) =>
            prevLinks.map((link) => (link.id === editandoId ? { ...link, ...payload, estado: nuevoEstado } : link))
          );
        } catch (e) {
          console.error('Error calling extend endpoint, falling back to direct DB update', e);
          await actualizarEnlace(editandoId, { ...payload, estado: nuevoEstado });
          setLinks((prevLinks) => prevLinks.map((link) => (link.id === editandoId ? { ...link, ...payload, estado: nuevoEstado } : link)));
        }
      } else {
        // direct DB update via Supabase
        await actualizarEnlace(editandoId, { ...payload, estado: nuevoEstado });
        setLinks((prevLinks) => prevLinks.map((link) => (link.id === editandoId ? { ...link, ...payload, estado: nuevoEstado } : link)));
      }

      setEditandoId(null);
      setFormEdicion(initialForm);
      setMensaje('Enlace editado correctamente.');
    } catch (err) {
      console.error('Error editando enlace:', err);
      setMensaje((err && err.message) || JSON.stringify(err) || 'Error editando enlace');
    }
  };


  // Simular creación automática del entorno del cliente
  const crearEntornoCliente = async (id) => {
    try {
      setLoadingId(id);
      // If a server-side provisioning endpoint is configured, call it
      const createUrl = process.env.REACT_APP_CREATE_ENV_URL;
      if (createUrl) {
        const resp = await fetch(createUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const payload = await resp.json();
        if (!resp.ok) {
          throw new Error(payload.error || 'Error provisioning environment');
        }
        // payload.link can contain updated fields (entornoClienteCreado, url, etc.)
        const updated = payload.link || {};
        setLinks((prevLinks) => prevLinks.map((link) => (link.id === id ? { ...link, ...updated } : link)));
        setMensaje('¡Entorno creado correctamente (server)!');
      } else {
        // fallback: perform local update using Supabase anon client
        await actualizarEnlace(id, { entornoClienteCreado: true });
        setLinks((prevLinks) => prevLinks.map((link) => (link.id === id ? { ...link, entornoClienteCreado: true } : link)));
        setMensaje('¡Entorno del cliente creado automáticamente! (Simulación)');
      }
    } catch (err) {
      console.error('Error creando entorno del cliente:', err);
      setMensaje((err && err.message) || JSON.stringify(err) || 'Error creando entorno');
    } finally {
      setLoadingId(null);
    }
  };

  // La acción de conceder tiempo extra la realiza el administrador desde el panel de Supabase.

  // Styles imported from utils
  const cardStyle = getCardStyle(view);

  return (
    <div style={cardStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: 18, color: '#007cf0' }}>Generar enlace de entorno</h2>
      <EnlaceForm
        form={form}
        onChange={handleChange}
        onTipoChange={handleTipoChange}
  onSubmit={handleSubmit}
        inputStyle={inputStyle}
        labelStyle={labelStyle}
        buttonStyle={buttonStyle}
  loading={creating}
      />
      <hr style={{ margin: '28px 0 18px 0', border: 0, borderTop: '1px solid #eaeaea' }} />
      {alertaCaducados && (
        <div style={{ background: '#fff3cd', color: '#856404', padding: 12, borderRadius: 6, marginBottom: 16, border: '1px solid #ffeeba', textAlign: 'center', fontWeight: 500 }}>
          ¡Atención! Hay enlaces caducados. Revisa la lista para gestionar migraciones o eliminar accesos.
        </div>
      )}
      <LinkControls
        view={view}
        setView={setView}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        filterColumn={filterColumn}
        setFilterColumn={setFilterColumn}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        inputStyle={inputStyle}
        buttonStyle={buttonStyle}
  showFilters={view === 'grid'}
      />
      {cargando && (
        <div style={{ color: '#007cf0', textAlign: 'center', margin: 20 }}>Cargando enlaces...</div>
      )}
      {mensaje && (
        <div style={{ background: '#e0f7fa', color: '#00796b', padding: 10, borderRadius: 6, marginBottom: 12, textAlign: 'center' }}>{mensaje}</div>
      )}
      <ListaEnlaces
        links={linksFiltrados}
        onEditar={iniciarEdicion}
        onBorrar={borrarLink}
        onCrearEntorno={crearEntornoCliente}
  loadingId={loadingId}
  view={view}
        
        editandoId={editandoId}
        buttonStyle={buttonStyle}
        radioGroupStyle={radioGroupStyle}
        labelStyle={labelStyle}
        inputStyle={inputStyle}
        formEdicion={formEdicion}
        onEditChange={handleEditChange}
        onEditTipoChange={handleEditTipoChange}
        onGuardarEdicion={guardarEdicion}
        onCancelarEdicion={cancelarEdicion}
        listItemStyle={listItemStyle}
      />
    </div>
  );
}

export default LinkManager;
