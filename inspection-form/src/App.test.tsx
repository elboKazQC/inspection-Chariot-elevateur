import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test("renders page title", () => {
  render(<App />);
  const titleElement = screen.getByText(/Fiche d'inspection des chariots élévateurs/i);
  expect(titleElement).toBeInTheDocument();
});
