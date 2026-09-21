import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Button } from '../../../src/components/ui/Button';

describe('UI Component - Button', () => {
  it('renders with children text correctly', () => {
    render(<Button>Cliquez-ici</Button>);
    expect(screen.getByRole('button', { name: /cliquez-ici/i })).toBeInTheDocument();
  });

  it('handles click events when enabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Action</Button>);
    fireEvent.click(screen.getByRole('button', { name: /action/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click event when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Désactivé</Button>);
    const btn = screen.getByRole('button', { name: /désactivé/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders loading spinner and sets aria-busy when loading is true', () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Chargement</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
    // Verify SVG spinner exists
    expect(btn.querySelector('svg.animate-spin')).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies variant classes properly', () => {
    const { rerender } = render(<Button variant="primary">Principal</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button variant="secondary">Secondaire</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');

    rerender(<Button variant="danger">Supprimer</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-rose-700');

    rerender(<Button variant="success">Valider</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-emerald-700');
  });

  it('renders left and right icons correctly', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        Avec Icônes
      </Button>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});
