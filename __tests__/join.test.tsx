import React from 'react';
import { render, screen } from '@testing-library/react';
import Join from '../pages/join';

describe('Join', () => {
  test('renders page title', () => {
    render(<Join />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Join');
  });

  test('renders Join Now link with correct href and target', () => {
    render(<Join />);
    const joinLinks = screen.getAllByRole('link', { name: 'Join Now ➜' });
    expect(joinLinks).toHaveLength(2); // Two Join Now buttons on the page
    
    joinLinks.forEach(link => {
      expect(link).toHaveAttribute('href', 'https://forms.example.com/prtd-waitlist');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });
});