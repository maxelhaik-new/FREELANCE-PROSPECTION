import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Badge } from '../../../src/components/ui/Badge';

describe('UI Component - Badge', () => {
  it('renders badge text properly', () => {
    render(<Badge>Nouveau</Badge>);
    expect(screen.getByText('Nouveau')).toBeInTheDocument();
  });

  it('renders color variants with proper token classes', () => {
    const { rerender } = render(<Badge variant="amber">À contacter</Badge>);
    expect(screen.getByText('À contacter').parentElement).toHaveClass('text-amber-900');
    expect(screen.getByText('À contacter').parentElement).toHaveClass('bg-amber-50');

    rerender(<Badge variant="blue">Contacté</Badge>);
    expect(screen.getByText('Contacté').parentElement).toHaveClass('text-blue-800');

    rerender(<Badge variant="emerald">Intéressé</Badge>);
    expect(screen.getByText('Intéressé').parentElement).toHaveClass('text-emerald-800');

    rerender(<Badge variant="neutral">Sans suite</Badge>);
    expect(screen.getByText('Sans suite').parentElement).toHaveClass('text-secondary-fg');
  });

  it('renders glowing dot indicator when withDot is true', () => {
    const { container } = render(<Badge variant="emerald" withDot>Retenu</Badge>);
    const dot = container.querySelector('span.w-1\\.5.h-1\\.5');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('bg-emerald-500');
  });

  it('renders dark variant with high contrast', () => {
    render(<Badge variant="dark">Sélection</Badge>);
    expect(screen.getByText('Sélection').parentElement).toHaveClass('bg-primary');
  });
});
