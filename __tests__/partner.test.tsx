import React from 'react';
import { render, screen } from '@testing-library/react';
import Partners from '../pages/partner';

describe('Partners', () => {
  test('renders page title', () => {
    render(<Partners />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Partners');
  });

  test('renders primary CTA', () => {
    render(<Partners />);
    expect(screen.getByRole('button', { name: 'Become a Partner' })).toBeInTheDocument();
  });
});