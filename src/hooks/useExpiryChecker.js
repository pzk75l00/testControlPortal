import { useEffect, useRef } from 'react';
import { actualizarEnlace } from '../utils/supabase';

// Hook that accepts links array and callbacks to update UI when expirations occur.
export default function useExpiryChecker(links, { onMarkCaducado, onAdminNotified }) {
  const linksRef = useRef(links);
  linksRef.current = links;

  useEffect(() => {
    let mounted = true;

    async function checkLoop() {
      if (!mounted) return;
      const current = linksRef.current || [];
      for (const link of current) {
        if (
          link.tipo === 'expira' &&
          link.estado === 'Activo' &&
          link.expiracion &&
          new Date(link.expiracion) < new Date()
        ) {
          try {
            if (!link.adminAvisado) {
              // mark as caducado and adminAvisado
              await actualizarEnlace(link.id, { estado: 'Caducado', adminAvisado: true });
              onMarkCaducado && onMarkCaducado(link, { adminAvisado: true });
              onAdminNotified && onAdminNotified(link);
            } else {
              await actualizarEnlace(link.id, { estado: 'Caducado' });
              onMarkCaducado && onMarkCaducado(link, { adminAvisado: false });
            }
          } catch (err) {
            // swallow errors; callers may implement UI message
            // console.error('useExpiryChecker error', err);
          }
        }
      }
    }

    // run immediately then every 30s
    checkLoop();
    const timer = setInterval(checkLoop, 30000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [onMarkCaducado, onAdminNotified]);
}
