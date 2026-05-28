import { render, screen } from '@testing-library/react';
import App from './App';

test('renders BoletoClick landing', () => {
  render(<App />);
  const titleElement = screen.getByText(/BoletoClick/i);
  expect(titleElement).toBeInTheDocument();
});
