import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza la UI principal', () => {
  render(<App />);
  // La UI está en español — comprobamos que el título principal esté presente
  const titulo = screen.getByText(/Generar enlace de entorno/i);
  expect(titulo).toBeInTheDocument();
});
