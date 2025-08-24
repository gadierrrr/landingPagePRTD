import { render, screen, fireEvent } from '@testing-library/react';
import Landing from '../pages/landing';

describe('Landing page', () => {
  it('renders hero heading', () => {
    render(<Landing />);
    expect(screen.getByText('Puerto Rico travel deals, updated daily.')).toBeInTheDocument();
  });

  it('toggles waitlist join state', () => {
    render(<Landing />);
    const name = screen.getByPlaceholderText('Full name');
    const email = screen.getByPlaceholderText('Email');
    const checkbox = screen.getByRole('checkbox');
    const submit = screen.getByText('Sign me up');
    fireEvent.change(name, { target: { value: 'Test User' } });
    fireEvent.change(email, { target: { value: 'user@example.com' } });
    fireEvent.click(checkbox);
    fireEvent.click(submit);
    expect(screen.getByText(/You’re on the list/)).toBeInTheDocument();
  });

  it('toggles partner form state', () => {
    render(<Landing />);
    const company = screen.getByPlaceholderText('Business name');
    const contact = screen.getByPlaceholderText('Point of contact');
    const email = screen.getByPlaceholderText('Business email');
    const textarea = screen.getByPlaceholderText('Describe your launch deal…');
    const submit = screen.getByText('Contact me');
    fireEvent.change(company, { target: { value: 'Biz' } });
    fireEvent.change(contact, { target: { value: 'Owner' } });
    fireEvent.change(email, { target: { value: 'owner@example.com' } });
    fireEvent.change(textarea, { target: { value: 'Great deal' } });
    fireEvent.click(submit);
    expect(screen.getByText(/We’ll reach out/)).toBeInTheDocument();
  });
});
