import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Input } from '../../../src/components/ui/Input';

describe('UI Component - Input', () => {
  it('renders input with placeholder and value', () => {
    render(<Input placeholder="Entrez un texte" value="test" onChange={() => {}} />);
    const input = screen.getByPlaceholderText('Entrez un texte');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('test');
  });

  it('handles user typing and triggers onChange', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Saisie..." onChange={handleChange} />);
    const input = screen.getByPlaceholderText('Saisie...');
    fireEvent.change(input, { target: { value: 'Nouvelle valeur' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders left and right elements when provided', () => {
    render(
      <Input
        placeholder="Avec icônes"
        leftIcon={<span data-testid="input-left">🔍</span>}
        rightElement={<span data-testid="input-right">❌</span>}
      />
    );
    expect(screen.getByTestId('input-left')).toBeInTheDocument();
    expect(screen.getByTestId('input-right')).toBeInTheDocument();
  });

  it('sets aria-invalid and error border styling when hasError is true', () => {
    render(<Input placeholder="Erreur" hasError />);
    const input = screen.getByPlaceholderText('Erreur');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('border-rose-300');
  });

  it('supports compact inputSize="sm"', () => {
    render(<Input placeholder="Compact" inputSize="sm" />);
    const input = screen.getByPlaceholderText('Compact');
    expect(input).toHaveClass('h-8');
  });
});
